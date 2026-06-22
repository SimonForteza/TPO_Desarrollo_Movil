import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCatalogoSubasta, getPujas, realizarPuja } from '../../api/subastas';
import { colors } from '../../theme/colors';

function formatMoneda(valor) {
  if (valor === null || valor === undefined) return '-';
  const num = Number(valor);
  return Number.isNaN(num) ? String(valor) : `$${num.toLocaleString('es-AR')}`;
}

export default function PujasEnVivo({ route, navigation }) {
  const { subastaId, medioPagoId, moneda } = route.params || {};

  const [catalogo, setCatalogo] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [importe, setImporte] = useState('');
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [pujando, setPujando] = useState(false);

  useEffect(() => {
    getCatalogoSubasta(subastaId)
      .then((items) => {
        setCatalogo(items);
        const primero = items.find((i) => i.subastado !== 'si') || items[0] || null;
        setSelectedItem(primero);
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el catálogo.'))
      .finally(() => setLoadingCatalogo(false));
  }, [subastaId]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getPujas(subastaId);
        setHistorial(data);
      } catch (_) {}
    };
    cargar();
    const timer = setInterval(cargar, 4000);
    return () => clearInterval(timer);
  }, [subastaId]);

  const pujasDelItem = historial
    .filter((p) => p.itemId === selectedItem?.id)
    .sort((a, b) => b.orden - a.orden);

  const maxPuja = pujasDelItem.length > 0 ? pujasDelItem[0].importe : null;

  const handlePujar = async () => {
    const monto = parseFloat(String(importe).replace(',', '.'));
    if (!importe || isNaN(monto) || monto <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto válido para pujar.');
      return;
    }
    setPujando(true);
    try {
      await realizarPuja(subastaId, { itemId: selectedItem.id, importe: monto, medioPagoId });
      setImporte('');
      const data = await getPujas(subastaId);
      setHistorial(data);
      Alert.alert('¡Puja registrada!', `Tu oferta de ${formatMoneda(monto)} fue aceptada.`);
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo registrar la puja.';
      Alert.alert('No se pudo pujar', msg);
    } finally {
      setPujando(false);
    }
  };

  if (loadingCatalogo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header navigation={navigation} subastaId={subastaId} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} subastaId={subastaId} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.loteScroll}
        contentContainerStyle={styles.loteScrollContent}
      >
        {catalogo.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.loteChip, selectedItem?.id === item.id && styles.loteChipActive]}
            onPress={() => setSelectedItem(item)}
          >
            <Text style={[styles.loteChipText, selectedItem?.id === item.id && styles.loteChipTextActive]}>
              Lote {idx + 1}
            </Text>
            {item.subastado === 'si' && (
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={selectedItem?.id === item.id ? colors.surface : colors.success}
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedItem ? (
        <View style={styles.itemCard}>
          <Text style={styles.itemNombre} numberOfLines={2}>
            {selectedItem.producto?.descripcionCatalogo || 'Lote sin descripción'}
          </Text>
          {selectedItem.subastado === 'si' && (
            <View style={styles.vendidoBadge}>
              <Text style={styles.vendidoText}>Vendido</Text>
            </View>
          )}
          <View style={styles.pricesRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Base</Text>
              <Text style={styles.priceValue}>{formatMoneda(selectedItem.precioBase)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Mejor oferta</Text>
              <Text style={[styles.priceValue, maxPuja != null && { color: colors.success }]}>
                {maxPuja != null ? formatMoneda(maxPuja) : 'Sin ofertas'}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.historialHeader}>
        <Text style={styles.historialTitle}>Historial de pujas</Text>
        <Ionicons name="sync-outline" size={16} color={colors.textSecondary} />
      </View>

      <ScrollView style={styles.historialList} showsVerticalScrollIndicator={false}>
        {pujasDelItem.length === 0 ? (
          <Text style={styles.emptyText}>Sin pujas para este lote todavía.</Text>
        ) : (
          pujasDelItem.map((p, idx) => (
            <View key={p.pujaId} style={[styles.pujaRow, idx === 0 && styles.pujaRowTop]}>
              <View style={styles.pujaLeft}>
                {idx === 0 && (
                  <Ionicons
                    name="trophy-outline"
                    size={14}
                    color={colors.success}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={[styles.pujaPostor, idx === 0 && styles.pujaPostorTop]}>
                  Postor #{p.numeroPostor}
                </Text>
              </View>
              <Text style={[styles.pujaImporte, idx === 0 && styles.pujaImporteTop]}>
                {formatMoneda(p.importe)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>{moneda === 'USD' ? 'U$S' : '$'}</Text>
          <TextInput
            style={styles.input}
            value={importe}
            onChangeText={setImporte}
            placeholder="Tu oferta"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[
              styles.pujarBtn,
              (pujando || selectedItem?.subastado === 'si') && styles.pujarBtnDisabled,
            ]}
            onPress={handlePujar}
            disabled={pujando || selectedItem?.subastado === 'si'}
          >
            {pujando ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.pujarBtnText}>Pujar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Header({ navigation, subastaId }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Sala de Pujas</Text>
        <Text style={styles.headerSub}>Subasta #{subastaId}</Text>
      </View>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>EN VIVO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF0F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { fontSize: 11, fontWeight: 'bold', color: colors.danger },

  loteScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  loteScrollContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  loteChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#DDD', backgroundColor: colors.background },
  loteChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  loteChipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  loteChipTextActive: { color: colors.surface },

  itemCard: { margin: 16, padding: 14, backgroundColor: '#F7F9FC', borderRadius: 12, borderWidth: 1, borderColor: '#E8EEF5' },
  itemNombre: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 },
  vendidoBadge: { alignSelf: 'flex-start', backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 8 },
  vendidoText: { fontSize: 11, color: colors.surface, fontWeight: 'bold' },
  pricesRow: { flexDirection: 'row', alignItems: 'center' },
  priceBlock: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, height: 32, backgroundColor: '#DDD' },
  priceLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  priceValue: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },

  historialHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  historialTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

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
});
