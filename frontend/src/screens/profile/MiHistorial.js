import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getParticipaciones } from '../../api/me';
import { colors } from '../../theme/colors';

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'ganada', label: 'Ganadas' },
  { key: 'perdida', label: 'Perdidas' },
  { key: 'pujas', label: 'Pujas' },
];

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;
const fechaCorta = (f) => {
  if (!f) return '';
  const [y, m, d] = String(f).split('-');
  return d && m && y ? `${d}/${m}/${y}` : String(f);
};

export default function MiHistorial({ navigation }) {
  const [stats, setStats] = useState({ participadas: 0, ganadas: 0, gastado: 0 });
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (resultado) => {
    try {
      const data = await getParticipaciones(resultado);
      setStats(data.stats);
      setItems(data.items);
    } catch (error) {
      // El interceptor de axios maneja el 401; acá solo evitamos romper la UI.
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData(filtro);
    }, [filtro, fetchData])
  );

  const onSelectFiltro = (key) => {
    if (key === filtro) return;
    setFiltro(key);
    setLoading(true);
    fetchData(key);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(filtro);
  };

  const renderItem = ({ item }) => {
    const ganada = item.estado === 'ganada';
    const clickable = item.pagoPendiente && item.compraId != null;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={clickable ? 0.7 : 1}
        onPress={clickable ? () => navigation.navigate('ResumenCompra', { compraId: item.compraId }) : undefined}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          {ganada && item.importe != null
            ? <Text style={styles.cardImporte}>{money(item.importe)}</Text>
            : <Text style={styles.cardDash}>—</Text>}
        </View>
        <Text style={styles.cardFecha}>{fechaCorta(item.fecha)}</Text>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, ganada ? styles.badgeWin : styles.badgeLose]}>
            <Text style={[styles.badgeText, ganada ? styles.badgeTextWin : styles.badgeTextLose]}>
              {ganada ? 'Ganada' : 'Perdida'}
            </Text>
          </View>
          {item.pagoPendiente && (
            <View style={[styles.badge, styles.badgePago]}>
              <Text style={[styles.badgeText, styles.badgeTextPago]}>
                Pendiente de pago{item.horasRestantesPago != null ? ` | ${item.horasRestantesPago} hs` : ''}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const Header = (
    <View>
      <View style={styles.statsRow}>
        {[
          [stats.participadas, 'Participadas'],
          [stats.ganadas, 'Ganadas'],
          [money(stats.gastado), 'Gastado'],
        ].map(([val, label]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statValue}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chipsRow}>
        {FILTROS.map((f) => {
          const active = f.key === filtro;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelectFiltro(f.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, idx) => `${item.subastaId}-${idx}`}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin participaciones</Text>
              <Text style={styles.emptySubtitle}>
                Cuando te inscribas y pujes en subastas, vas a verlas acá.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1, backgroundColor: '#F5F8FF', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA',
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.surface },

  card: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#EAEAEA', elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, flex: 1, paddingRight: 8 },
  cardImporte: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  cardDash: { fontSize: 16, color: colors.textSecondary },
  cardFecha: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginBottom: 10 },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeWin: { backgroundColor: '#ECFDF5', borderColor: colors.success },
  badgeTextWin: { color: colors.success },
  badgeLose: { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' },
  badgeTextLose: { color: '#6B7280' },
  badgePago: { backgroundColor: '#FFF7ED', borderColor: colors.warning },
  badgeTextPago: { color: colors.warning },

  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
