import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { getCompras } from '../../api/compras';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const CHIPS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'pagada', label: 'Pagadas' },
  { key: 'impaga', label: 'Impagas' },
];

const ESTADO_INFO = {
  pendiente: { label: 'Pendiente', color: colors.warning },
  pagada:    { label: 'Pagada',    color: colors.success },
  impaga:    { label: 'Impaga',    color: colors.danger },
};

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;

function formatFecha(iso) {
  if (!iso) return null;
  const partes = String(iso).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : iso;
}

export default function MisCompras({ navigation }) {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  const cargar = useCallback(async () => {
    try {
      const data = await getCompras();
      setCompras(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las compras.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargar();
    }, [cargar])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargar();
  }, [cargar]);

  const comprasFiltradas =
    filtro === 'todas' ? compras : compras.filter((c) => c.estado === filtro);

  const handleTap = (compra) => {
    if (compra.estado === 'pendiente') {
      navigation.navigate('ResumenCompra', { compraId: compra.id, titulo: compra.descripcionItem });
    } else {
      navigation.navigate('FacturaCompra', { compraId: compra.id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Compras</Text>
        </View>

        <View style={styles.chipsRow}>
          {CHIPS.map((chip) => {
            const active = filtro === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFiltro(chip.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : comprasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={56} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No hay compras para mostrar.</Text>
            <Text style={styles.emptySubtitle}>Cuando ganes una subasta, aparecerán acá.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {comprasFiltradas.map((compra) => (
              <CompraCard key={compra.id} compra={compra} onPress={() => handleTap(compra)} />
            ))}
          </ScrollView>
        )}

        <BottomNavBar navigation={navigation} active="perfil" />
      </View>
    </SafeAreaView>
  );
}

function CompraCard({ compra, onPress }) {
  const info = ESTADO_INFO[compra.estado] ?? { label: compra.estado, color: colors.textSecondary };
  const total =
    Number(compra.montoFinal ?? 0) +
    Number(compra.comision ?? 0) +
    Number(compra.costoEnvio ?? 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {compra.descripcionItem ?? `Compra #${compra.id}`}
          </Text>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: info.color }]} />
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
          </View>
        </View>
        <Text style={styles.monto}>{money(total)}</Text>
      </View>

      {compra.estado === 'pendiente' && compra.pagarAntesDe && (
        <Text style={styles.vence}>Pagar antes del {formatFecha(compra.pagarAntesDe)}</Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>{formatFecha(compra.creadaEn) ?? ''}</Text>
        <View style={styles.footerAction}>
          <Text style={styles.footerActionText}>
            {compra.estado === 'pendiente' ? 'Pagar' : 'Ver factura'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  container: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.textPrimary },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.surface },

  scrollContent: { padding: 20, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  badge: { flexDirection: 'row', alignItems: 'center' },
  badgeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  monto: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },

  vence: { fontSize: 12, color: colors.warning, marginTop: 8 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  footerDate: { fontSize: 12, color: colors.textSecondary },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerActionText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
