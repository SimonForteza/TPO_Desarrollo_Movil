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
import { getMultas } from '../../api/multas';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const CHIPS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'judicial', label: 'Judiciales' },
  { key: 'pagada', label: 'Pagadas' },
];

const ESTADO_INFO = {
  pendiente: { label: 'Pendiente', color: colors.warning,       icon: 'warning-outline' },
  judicial:  { label: 'Judicial',  color: colors.danger,        icon: 'alert-circle-outline' },
  pagada:    { label: 'Pagada',    color: colors.success,       icon: 'checkmark-circle-outline' },
};

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;

function formatFecha(iso) {
  if (!iso) return null;
  const partes = String(iso).split('T')[0].split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : iso;
}

export default function MisMultas({ navigation }) {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  const cargar = useCallback(async () => {
    try {
      const [pendientes, judiciales, pagadas] = await Promise.all([
        getMultas('pendiente'),
        getMultas('judicial'),
        getMultas('pagada'),
      ]);
      setMultas([...pendientes, ...judiciales, ...pagadas]);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las multas.');
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

  const multasFiltradas =
    filtro === 'todas' ? multas : multas.filter((m) => m.estado === filtro);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Multas</Text>
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
        ) : multasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={56} color={colors.success} />
            <Text style={styles.emptyTitle}>No hay multas para mostrar.</Text>
            <Text style={styles.emptySubtitle}>¡Todo en orden!</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {multasFiltradas.map((multa) => (
              <MultaCard
                key={multa.id}
                multa={multa}
                onPress={() => navigation.navigate('DetalleMulta', { multaId: multa.id })}
              />
            ))}
          </ScrollView>
        )}

        <BottomNavBar navigation={navigation} active="perfil" />
      </View>
    </SafeAreaView>
  );
}

function MultaCard({ multa, onPress }) {
  const info = ESTADO_INFO[multa.estado] ?? { label: multa.estado, color: colors.textSecondary, icon: 'ellipse-outline' };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: info.color + '18' }]}>
          <Ionicons name={info.icon} size={22} color={info.color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Multa #{multa.id}</Text>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: info.color }]} />
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
          </View>
        </View>
        <Text style={[styles.monto, { color: multa.estado === 'pagada' ? colors.textSecondary : colors.danger }]}>
          {money(multa.importe)}
        </Text>
      </View>

      {multa.estado === 'pendiente' && multa.venceEn && (
        <Text style={styles.vence}>Vence el {formatFecha(multa.venceEn)}</Text>
      )}
      {multa.estado === 'judicial' && (
        <Text style={styles.judicial}>Caso derivado a la justicia</Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>{formatFecha(multa.creadaEn) ?? ''}</Text>
        {multa.estado === 'pendiente' && (
          <View style={styles.footerAction}>
            <Text style={styles.footerActionText}>Pagar multa</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        )}
        {multa.estado !== 'pendiente' && (
          <View style={styles.footerAction}>
            <Text style={styles.footerActionText}>Ver detalle</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        )}
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
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  badge: { flexDirection: 'row', alignItems: 'center' },
  badgeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  monto: { fontSize: 16, fontWeight: 'bold' },

  vence: { fontSize: 12, color: colors.warning, marginTop: 8 },
  judicial: { fontSize: 12, color: colors.danger, marginTop: 8 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  footerDate: { fontSize: 12, color: colors.textSecondary },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerActionText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
