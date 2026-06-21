import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getSubastaDetalle, getCatalogoSubasta, unirseASubasta } from '../../api/subastas';
import { getMediosPago, elegirMedioParaSubasta } from '../../api/mediosPago';
import { requireLogin, getUserData } from '../../api/session';
import { colors } from '../../theme/colors';

function formatFecha(fecha) {
  if (!fecha) return null;
  const partes = String(fecha).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
}

function formatMoneda(valor) {
  if (valor === null || valor === undefined) return null;
  const num = Number(valor);
  return Number.isNaN(num) ? String(valor) : `$${num.toLocaleString('es-AR')}`;
}

function iniciales(nombre) {
  if (!nombre) return '?';
  return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function DetalleSubasta({ route, navigation }) {
  const { id } = route.params || {};
  const [subasta, setSubasta] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [medio, setMedio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniendo, setUniendo] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [detalle, items] = await Promise.all([
          getSubastaDetalle(id),
          getCatalogoSubasta(id),
        ]);
        setSubasta(detalle);
        setCatalogo(items);
        if (getUserData()) {
          const medios = await getMediosPago().catch(() => []);
          setMedio(elegirMedioParaSubasta(medios, detalle?.moneda));
        }
      } catch (error) {
        const msg = error.response?.data?.message || 'No se pudo cargar la subasta.';
        Alert.alert('Error', msg);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const handleUnirse = async () => {
    if (!requireLogin(navigation, 'Debés iniciar sesión para unirte a una subasta.')) return;
    if (!medio) {
      Alert.alert(
        'Medio de pago requerido',
        `Necesitás un medio de pago verificado en ${subasta?.moneda || 'la moneda de la subasta'} para unirte. Agregalo desde Medios de Pago.`
      );
      return;
    }
    setUniendo(true);
    try {
      await unirseASubasta(id, medio.id);
      Alert.alert('Te uniste a la subasta', 'Ya podés seguir esta subasta desde la app.');
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo unir a la subasta.';
      Alert.alert('No se pudo unir', msg);
    } finally {
      setUniendo(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!subasta) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header navigation={navigation} />
        <Text style={styles.errorText}>No se encontró la subasta.</Text>
      </SafeAreaView>
    );
  }

  const sub = subasta.subastador;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Placeholder de streaming */}
        <View style={styles.videoBox}>
          <Ionicons name="videocam-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.videoText}>video de subasta en vivo</Text>
        </View>

        <Text style={styles.title}>Subasta #{subasta.id}</Text>

        <View style={styles.chipsRow}>
          {subasta.estado ? <Chip text={subasta.estado} /> : null}
          {subasta.categoria ? <Chip text={subasta.categoria} /> : null}
          {subasta.moneda ? <Chip text={subasta.moneda} /> : null}
        </View>

        <View style={styles.infoBlock}>
          {(subasta.fecha || subasta.hora) && (
            <InfoRow
              label="Fecha"
              value={`${formatFecha(subasta.fecha) || ''}${subasta.hora ? ` · ${String(subasta.hora).substring(0, 5)} hs` : ''}`}
            />
          )}
          {subasta.ubicacion && <InfoRow label="Ubicación" value={subasta.ubicacion} />}
          {subasta.capacidadAsistentes != null && (
            <InfoRow label="Capacidad" value={`${subasta.capacidadAsistentes} personas`} />
          )}
        </View>

        {sub ? (
          <View style={styles.rematadorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciales(sub.nombre)}</Text>
            </View>
            <View>
              <Text style={styles.rematadorLabel}>Rematador</Text>
              <Text style={styles.rematadorName}>
                {sub.nombre || 'Sin asignar'}{sub.matricula ? ` · Mat. ${sub.matricula}` : ''}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Catálogo */}
        <Text style={styles.sectionTitle}>Catálogo — {catalogo.length} lotes</Text>
        {catalogo.length === 0 ? (
          <Text style={styles.emptyCatalogo}>Esta subasta todavía no tiene lotes cargados.</Text>
        ) : (
          catalogo.map((item, idx) => {
            const prod = item.producto || {};
            const base = formatMoneda(item.precioBase);
            return (
              <View key={item.id || idx} style={styles.loteCard}>
                <View style={styles.loteThumb}>
                  {prod.primeraFotoBase64 ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${prod.primeraFotoBase64}` }}
                      style={styles.loteThumbImage}
                    />
                  ) : (
                    <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
                  )}
                </View>
                <View style={styles.loteInfo}>
                  <Text style={styles.loteNumero}>Lote {idx + 1}</Text>
                  <Text style={styles.loteNombre} numberOfLines={2}>
                    {prod.descripcionCatalogo || 'Lote sin descripción'}
                  </Text>
                  {base ? <Text style={styles.loteBase}>Base: {base}</Text> : null}
                </View>
              </View>
            );
          })
        )}

        {/* Medio de pago seleccionado */}
        {medio ? (
          <View style={styles.pagoRow}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pagoLabel}>Pagás con</Text>
              <Text style={styles.pagoValue}>{medio.datosEnmascarados || medio.tipo}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.unirseBtn, uniendo && styles.unirseBtnDisabled]}
          onPress={handleUnirse}
          disabled={uniendo}
        >
          {uniendo ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.unirseBtnText}>Unirse a la subasta</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detalle de subasta</Text>
    </View>
  );
}

function Chip({ text }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  content: { padding: 20, paddingBottom: 20 },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },

  videoBox: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  videoText: { color: colors.textSecondary, fontSize: 13, marginTop: 6 },

  title: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: '#EFEFEF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize' },

  infoBlock: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flexShrink: 1, textAlign: 'right', marginLeft: 12 },

  rematadorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 14 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.surface, fontWeight: 'bold' },
  rematadorLabel: { fontSize: 12, color: colors.textSecondary },
  rematadorName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 14 },
  emptyCatalogo: { color: colors.textSecondary, fontSize: 14, marginBottom: 10 },

  loteCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: '#ECECEC', padding: 10, marginBottom: 10 },
  loteThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginRight: 12 },
  loteThumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  loteInfo: { flex: 1, justifyContent: 'center' },
  loteNumero: { fontSize: 12, color: colors.textSecondary },
  loteNombre: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  loteBase: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },

  pagoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 14 },
  pagoLabel: { fontSize: 12, color: colors.textSecondary },
  pagoValue: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: colors.surface },
  unirseBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center' },
  unirseBtnDisabled: { opacity: 0.6 },
  unirseBtnText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
