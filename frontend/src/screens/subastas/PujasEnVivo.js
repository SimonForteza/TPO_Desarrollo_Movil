import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getInscripcion, getPujas, getRemate, realizarPuja } from '../../api/subastas';
import { subscribeRemate } from '../../api/remateSocket';
import { colors } from '../../theme/colors';

function formatMoneda(valor) {
  if (valor === null || valor === undefined) return '-';
  const num = Number(valor);
  return Number.isNaN(num) ? String(valor) : `$${num.toLocaleString('es-AR')}`;
}

function formatTimer(seg) {
  const s = Math.max(0, seg);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function colorTimer(seg) {
  if (seg <= 10) return colors.danger;
  if (seg <= 20) return '#F59E0B';
  return colors.success;
}

// Nombre del postor con fallback al número de postor (ambos pueden venir del backend).
function nombrePostor(nombre, numero) {
  if (nombre) return nombre;
  return numero != null ? `Postor #${numero}` : 'Postor';
}

export default function PujasEnVivo({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { subastaId, medioPagoId, moneda, categoria } = route.params || {};
  const sinLimites = categoria === 'oro' || categoria === 'platino';

  const [remate, setRemate] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [importe, setImporte] = useState('');
  const [loading, setLoading] = useState(true);
  const [pujando, setPujando] = useState(false);
  const [seg, setSeg] = useState(0);
  const [isInscripto, setIsInscripto] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  const pollingRef = useRef(null);
  const tickRef = useRef(null);
  const prevLoteIdRef = useRef(undefined);

  useEffect(() => {
    getInscripcion(subastaId)
      .then(setIsInscripto)
      .catch(() => setIsInscripto(true)); // si falla el check, el backend valida igual
  }, [subastaId]);

  // Polling del estado autoritativo del remate (lote actual + reloj + ventas).
  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const [estado, pujas] = await Promise.all([
          getRemate(subastaId),
          getPujas(subastaId).catch(() => []),
        ]);
        if (!activo) return;

        // Anuncio "Vendido a $X" cuando el lote actual cambió (cayó el martillo).
        const nuevoLoteId = estado.loteActualId ?? null;
        const prev = prevLoteIdRef.current;
        if (prev !== undefined && prev !== null && prev !== nuevoLoteId) {
          anunciarVenta(estado.lotes, prev);
        }
        prevLoteIdRef.current = nuevoLoteId;

        setRemate(estado);
        setHistorial(pujas);
        setSeg(estado.segundosRestantes ?? 0);
      } catch (_) {
        // Reintenta en el próximo ciclo de polling.
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();
    pollingRef.current = setInterval(cargar, 2000);
    return () => {
      activo = false;
      clearInterval(pollingRef.current);
    };
  }, [subastaId]);

  // Push en tiempo real vía WebSocket/STOMP. El estado pusheado trae la mejor oferta/líder y el
  // reloj al instante; refrescamos el historial detallado con ese mismo evento (no por segundo).
  // El anuncio "¡Martillo!" queda en el polling para evitar alertas duplicadas.
  useEffect(() => {
    let activo = true;
    const unsubscribe = subscribeRemate(
      subastaId,
      (estado) => {
        if (!activo) return;
        // No tocar prevLoteIdRef: el anuncio "¡Martillo!" lo maneja el polling para no duplicar.
        setRemate(estado);
        setSeg(estado.segundosRestantes ?? 0);
        getPujas(subastaId).then((pujas) => activo && setHistorial(pujas)).catch(() => {});
      },
      (connected) => activo && setWsConnected(connected)
    );
    return () => {
      activo = false;
      unsubscribe();
    };
  }, [subastaId]);

  // Cuenta regresiva local entre polls (se resincroniza con el servidor en cada ciclo).
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setSeg((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  const anunciarVenta = (lotes, loteId) => {
    const lote = (lotes || []).find((l) => l.itemId === loteId);
    if (!lote) return;
    if (lote.estado === 'vendido') {
      Alert.alert(
        '¡Martillo!',
        `Lote ${lote.numeroLote} vendido a ${formatMoneda(lote.montoActual)}${
          lote.nombrePostorLider || lote.numeroPostorLider != null
            ? ` — ${nombrePostor(lote.nombrePostorLider, lote.numeroPostorLider)}`
            : ''
        }.`
      );
    } else if (lote.estado === 'sin_ofertas') {
      Alert.alert('Lote sin ofertas', `El lote ${lote.numeroLote} no recibió pujas.`);
    }
  };

  const lotes = remate?.lotes || [];
  const loteActualId = remate?.loteActualId ?? null;
  const loteActual = lotes.find((l) => l.itemId === loteActualId) || null;
  const finalizado = !loading && loteActualId === null;

  const pujasDelLote = historial
    .filter((p) => p.itemId === loteActualId)
    .sort((a, b) => b.orden - a.orden);

  const mejorOferta = loteActual?.montoActual != null
    ? Number(loteActual.montoActual)
    : Number(loteActual?.precioBase || 0);
  const precioBase = Number(loteActual?.precioBase || 0);
  const minBid = mejorOferta + precioBase * 0.01;
  const maxBid = mejorOferta + precioBase * 0.20;

  const tiempoAgotado = seg <= 0;

  const handlePujar = async () => {
    const monto = parseFloat(String(importe).replace(',', '.'));
    if (!importe || isNaN(monto) || monto <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto válido para pujar.');
      return;
    }
    if (!sinLimites && precioBase > 0 && (monto < minBid || monto > maxBid)) {
      Alert.alert(
        'Monto fuera de rango',
        `Tu oferta debe estar entre ${formatMoneda(minBid)} y ${formatMoneda(maxBid)}.`
      );
      return;
    }
    setPujando(true);
    try {
      await realizarPuja(subastaId, { itemId: loteActualId, importe: monto, medioPagoId });
      setImporte('');
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || '';
      if (status === 403 && msg.includes('inscribed')) {
        Alert.alert('No estás inscripto', 'Debés inscribirte en la subasta antes de pujar. Volvé atrás y presioná "Unirse a la subasta".');
      } else if (status === 403 && msg.includes('fines')) {
        Alert.alert('Multa pendiente', 'Tenés una multa pendiente. Resolvela para poder pujar.');
      } else if (msg.includes('not currently on the block')) {
        Alert.alert('Lote cerrado', 'Este lote ya no está en remate. Esperá al siguiente.');
      } else if (status === 422 || msg.includes('between')) {
        Alert.alert('Monto fuera de rango', `La puja debe estar entre ${formatMoneda(minBid)} y ${formatMoneda(maxBid)}.`);
      } else {
        Alert.alert('No se pudo pujar', msg || 'Intentá de nuevo.');
      }
      setPujando(false);
      return;
    }
    // Refresh después de puja exitosa — errores aquí no deben mostrarse al usuario
    // (el polling de 2 s los recupera automáticamente).
    try {
      const [estado, pujas] = await Promise.all([
        getRemate(subastaId),
        getPujas(subastaId).catch(() => historial),
      ]);
      setRemate(estado);
      setHistorial(pujas);
      setSeg(estado.segundosRestantes ?? 0);
    } catch (_) {
      // silenciar: el polling periódico actualizará el estado
    } finally {
      setPujando(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header navigation={navigation} subastaId={subastaId} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        navigation={navigation}
        subastaId={subastaId}
        seg={seg}
        mostrarTimer={!finalizado}
      />

      {/* Progreso de lotes (solo lectura; se puja únicamente el lote en remate) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.loteScroll}
        contentContainerStyle={styles.loteScrollContent}
      >
        {lotes.map((l) => {
          const activo = l.itemId === loteActualId;
          const vendido = l.estado === 'vendido' || l.estado === 'sin_ofertas';
          return (
            <TouchableOpacity
              key={l.itemId}
              style={[styles.loteChip, activo && styles.loteChipActive, vendido && styles.loteChipDone]}
              onPress={() => {
                if (!activo) {
                  navigation.navigate('DetalleLote', {
                    subastaId, itemId: l.itemId, moneda, categoria, medioPagoId,
                  });
                }
              }}
            >
              <Text style={[styles.loteChipText, activo && styles.loteChipTextActive]}>
                Lote {l.numeroLote}
              </Text>
              {l.estado === 'vendido' && (
                <Ionicons name="checkmark-circle" size={12} color={colors.success} style={{ marginLeft: 4 }} />
              )}
              {l.estado === 'sin_ofertas' && (
                <Ionicons name="remove-circle" size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              )}
              {activo && <View style={styles.liveDotChip} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {finalizado ? (
        <Finalizado lotes={lotes} />
      ) : (
        <>
          {loteActual && (
            <View style={styles.itemCard}>
              <View style={styles.loteHeaderRow}>
                <Text style={styles.loteActualLabel}>
                  En remate · Lote {loteActual.numeroLote} de {lotes.length}
                </Text>
                <View style={styles.liveBadge}>
                  <View style={[styles.liveDot, { backgroundColor: wsConnected ? colors.success : '#F59E0B' }]} />
                  <Text style={[styles.liveText, { color: wsConnected ? colors.success : '#F59E0B' }]}>
                    {wsConnected ? 'EN VIVO' : 'CONECTANDO'}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemNombre} numberOfLines={2}>
                {loteActual.descripcion || 'Lote sin descripción'}
              </Text>
              <View style={styles.pricesRow}>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceLabel}>Base</Text>
                  <Text style={styles.priceValue}>{formatMoneda(loteActual.precioBase)}</Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceBlock}>
                  <Text style={styles.priceLabel}>Mejor oferta</Text>
                  <Text style={[styles.priceValue, loteActual.montoActual != null && { color: colors.success }]}>
                    {loteActual.montoActual != null ? formatMoneda(loteActual.montoActual) : 'Sin ofertas'}
                  </Text>
                  {(loteActual.nombrePostorLider || loteActual.numeroPostorLider != null) && (
                    <Text style={styles.liderText}>
                      {nombrePostor(loteActual.nombrePostorLider, loteActual.numeroPostorLider)}
                    </Text>
                  )}
                </View>
              </View>
              {!sinLimites && !tiempoAgotado && (
                <View style={styles.rangoRow}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.rangoText}>
                    Rango válido: {formatMoneda(minBid)} — {formatMoneda(maxBid)}
                  </Text>
                </View>
              )}
              {sinLimites && !tiempoAgotado && (
                <View style={styles.rangoRow}>
                  <Ionicons name="star-outline" size={14} color={colors.primary} />
                  <Text style={[styles.rangoText, { color: colors.primary }]}>Sin límite de puja</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.historialHeader}>
            <Text style={styles.historialTitle}>Historial de pujas</Text>
          </View>

          <ScrollView style={styles.historialList} showsVerticalScrollIndicator={false}>
            {pujasDelLote.length === 0 ? (
              <Text style={styles.emptyText}>Sin pujas para este lote todavía.</Text>
            ) : (
              pujasDelLote.map((p, idx) => (
                <View key={p.pujaId} style={[styles.pujaRow, idx === 0 && styles.pujaRowTop]}>
                  <View style={styles.pujaLeft}>
                    {idx === 0 && (
                      <Ionicons name="trophy-outline" size={14} color={colors.success} style={{ marginRight: 6 }} />
                    )}
                    <Text style={[styles.pujaPostor, idx === 0 && styles.pujaPostorTop]}>
                      {nombrePostor(p.nombrePostor, p.numeroPostor)}
                    </Text>
                  </View>
                  <Text style={[styles.pujaImporte, idx === 0 && styles.pujaImporteTop]}>
                    {formatMoneda(p.importe)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
            {isInscripto === false ? (
              <View style={styles.noInscriptoRow}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.noInscriptoText}>Para pujar debés unirte a la subasta</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.noInscriptoLink}>Volver</Text>
                </TouchableOpacity>
              </View>
            ) : tiempoAgotado ? (
              <View style={styles.cerradoRow}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={styles.cerradoText}>Cerrando lote…</Text>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <Text style={styles.currency}>{moneda === 'USD' ? 'U$S' : '$'}</Text>
                <TextInput
                  style={styles.input}
                  value={importe}
                  onChangeText={setImporte}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.pujarBtn, pujando && styles.pujarBtnDisabled]}
                  onPress={handlePujar}
                  disabled={pujando}
                >
                  {pujando ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.pujarBtnText}>Pujar</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function Finalizado({ lotes }) {
  const vendidos = lotes.filter((l) => l.estado === 'vendido');
  return (
    <ScrollView contentContainerStyle={styles.finalizadoWrap}>
      <Ionicons name="trophy" size={48} color={colors.success} />
      <Text style={styles.finalizadoTitle}>Subasta finalizada</Text>
      <Text style={styles.finalizadoSub}>
        {vendidos.length} de {lotes.length} lotes vendidos
      </Text>
      <View style={styles.resumenList}>
        {lotes.map((l) => (
          <View key={l.itemId} style={styles.resumenRow}>
            <Text style={styles.resumenLote}>Lote {l.numeroLote}</Text>
            <Text style={styles.resumenDesc} numberOfLines={1}>{l.descripcion}</Text>
            {l.estado === 'vendido' ? (
              <Text style={styles.resumenVendido}>{formatMoneda(l.montoActual)}</Text>
            ) : (
              <Text style={styles.resumenSinOfertas}>Sin ofertas</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Header({ navigation, subastaId, seg, mostrarTimer }) {
  const tc = colorTimer(seg ?? 60);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Sala de Pujas</Text>
        <Text style={styles.headerSub}>Subasta #{subastaId}</Text>
      </View>
      {mostrarTimer && (
        <View style={[styles.timerBadge, { borderColor: tc }]}>
          <Ionicons name="timer-outline" size={14} color={tc} />
          <Text style={[styles.timerText, { color: tc }]}>{formatTimer(seg ?? 0)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  timerText: { fontSize: 15, fontWeight: 'bold', fontVariant: ['tabular-nums'] },

  loteScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  loteScrollContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  loteChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#DDD', backgroundColor: colors.background },
  loteChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  loteChipDone: { opacity: 0.6 },
  loteChipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  loteChipTextActive: { color: colors.surface },
  liveDotChip: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface, marginLeft: 5 },

  itemCard: { margin: 16, padding: 14, backgroundColor: '#F7F9FC', borderRadius: 12, borderWidth: 1, borderColor: '#E8EEF5' },
  loteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  loteActualLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemNombre: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  liderText: { fontSize: 11, color: colors.success, marginTop: 2, fontWeight: '600' },
  pricesRow: { flexDirection: 'row', alignItems: 'center' },
  priceBlock: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, height: 36, backgroundColor: '#DDD' },
  priceLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  priceValue: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
  rangoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E8EEF5' },
  rangoText: { fontSize: 12, color: colors.textSecondary },

  historialHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  historialTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { fontSize: 11, fontWeight: 'bold', color: colors.danger },

  historialList: { flex: 1, paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 24, fontSize: 14 },

  pujaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  pujaRowTop: { backgroundColor: '#F0FAF5', marginHorizontal: -16, paddingHorizontal: 16 },
  pujaLeft: { flexDirection: 'row', alignItems: 'center' },
  pujaPostor: { fontSize: 14, color: colors.textPrimary },
  pujaPostorTop: { color: colors.success, fontWeight: '600' },
  pujaImporte: { fontSize: 14, color: colors.textPrimary },
  pujaImporteTop: { color: colors.success, fontWeight: 'bold', fontSize: 15 },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: colors.surface },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, minWidth: 24 },
  input: { flex: 1, height: 48, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: colors.textPrimary, backgroundColor: '#FAFAFA' },
  pujarBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pujarBtnDisabled: { opacity: 0.5 },
  pujarBtnText: { color: colors.surface, fontSize: 15, fontWeight: 'bold' },

  cerradoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  cerradoText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },

  noInscriptoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  noInscriptoText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  noInscriptoLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },

  finalizadoWrap: { alignItems: 'center', padding: 24, paddingTop: 40 },
  finalizadoTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginTop: 12 },
  finalizadoSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 20 },
  resumenList: { width: '100%', gap: 8 },
  resumenRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: '#ECECEC' },
  resumenLote: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, minWidth: 52 },
  resumenDesc: { flex: 1, fontSize: 13, color: colors.textPrimary },
  resumenVendido: { fontSize: 14, fontWeight: 'bold', color: colors.success },
  resumenSinOfertas: { fontSize: 12, color: colors.textSecondary },
});
