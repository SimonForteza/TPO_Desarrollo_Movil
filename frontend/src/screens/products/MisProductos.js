import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMisBienes } from '../../api/bienes';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const CHIPS = [
  { key: 'todas', label: 'Todas' },
  { key: 'aprobado', label: 'Aprobadas' },
  { key: 'esperando_subasta', label: 'Esperando subasta' },
  { key: 'pendiente_revision', label: 'Pendientes' },
  { key: 'rechazado', label: 'Rechazadas' },
];

// Mapeo estado del backend -> etiqueta + color de estado
const ESTADO_INFO = {
  pendiente_revision: { label: 'En Revisión', color: colors.warning },
  aprobado: { label: 'Aprobado', color: colors.success },
  esperando_subasta: { label: 'Esperando subasta', color: colors.warning },
  rechazado: { label: 'Rechazado', color: colors.danger },
  asignado: { label: 'En Subasta', color: colors.info },
  vendido: { label: 'Vendido', color: colors.info },
  devuelto: { label: 'Devuelto', color: colors.textSecondary },
};

function estadoInfo(estado) {
  return ESTADO_INFO[estado] || { label: estado || '—', color: colors.textSecondary };
}

function formatMoneda(valor) {
  if (valor === null || valor === undefined) return null;
  const num = Number(valor);
  if (Number.isNaN(num)) return String(valor);
  return `$${num.toLocaleString('es-AR')}`;
}

export default function MisProductos({ navigation }) {
  const [bienes, setBienes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  const cargar = useCallback(async () => {
    try {
      const data = await getMisBienes();
      setBienes(data);
    } catch (error) {
      console.error('Error al cargar bienes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargar();
  }, [cargar]);

  // Refresca al entrar/volver a la pantalla (ej. tras crear o tras aprobación admin)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargar();
    }, [cargar])
  );

  const bienesFiltrados =
    filtro === 'todas' ? bienes : bienes.filter((b) => b.estado === filtro);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Productos</Text>
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={[styles.headerBtn, styles.headerBtnPrimary]}
              onPress={() => navigation.navigate('SolicitarSubastaInfo')}
            >
              <Ionicons name="add" size={16} color={colors.surface} />
              <Text style={styles.headerBtnPrimaryText}>Solicitar Subasta</Text>
            </TouchableOpacity>
          </View>
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
        ) : bienesFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={56} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Todavía no cargaste productos.</Text>
            <Text style={styles.emptySubtitle}>Usá el botón "Agregar Producto" para consignar un bien.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {bienesFiltrados.map((bien) => (
              <ProductoCard key={bien.id} bien={bien} navigation={navigation} />
            ))}
          </ScrollView>
        )}

        <BottomNavBar navigation={navigation} active="productos" />
      </View>
    </SafeAreaView>
  );
}

function ProductoCard({ bien, navigation }) {
  const info = estadoInfo(bien.estado);
  const precio = formatMoneda(bien.precioBasePropuesto);
  const comision = formatMoneda(bien.comisionPropuesta);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.thumb}>
          {bien.primeraFotoBase64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${bien.primeraFotoBase64}` }}
              style={styles.thumbImage}
            />
          ) : (
            <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {bien.descripcionCatalogo || 'Producto sin nombre'}
          </Text>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: info.color }]} />
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
          </View>
        </View>
      </View>

      {/* Contenido según estado (solo datos reales del backend) */}
      {bien.estado === 'aprobado' && precio && (
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Precio base</Text>
            <Text style={styles.rowValue}>{precio}</Text>
          </View>
          {comision && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Comisión</Text>
              <Text style={styles.rowValue}>{comision}</Text>
            </View>
          )}
        </View>
      )}

      {bien.estado === 'vendido' && precio && (
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Precio</Text>
            <Text style={styles.rowValue}>{precio}</Text>
          </View>
        </View>
      )}

      {bien.estado === 'rechazado' && bien.motivoRechazo && (
        <Text style={styles.helperText}>{bien.motivoRechazo}</Text>
      )}

      {bien.estado === 'pendiente_revision' && (
        <Text style={styles.helperText}>
          Tu artículo está siendo revisado por nuestro equipo. Recibirás una respuesta en 3-5 días hábiles.
        </Text>
      )}

      <View style={styles.cardActions}>
        {bien.ubicacionDeposito ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => navigation.navigate('DetalleProducto', { id: bien.id })}
          >
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.actionBtnSecondaryText}>Ubicación</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => navigation.navigate('DetalleProducto', { id: bien.id })}
        >
          <Text style={styles.actionBtnPrimaryText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  headerBtnPrimary: { backgroundColor: colors.primary },
  headerBtnPrimaryText: { color: colors.surface, fontWeight: 'bold', fontSize: 13 },

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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row' },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  badge: { flexDirection: 'row', alignItems: 'center' },
  badgeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },

  cardBody: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
  rowValue: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },

  helperText: { marginTop: 10, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8, gap: 6 },
  actionBtnPrimary: { backgroundColor: colors.primary },
  actionBtnPrimaryText: { color: colors.surface, fontWeight: 'bold', fontSize: 13 },
  actionBtnSecondary: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  actionBtnSecondaryText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
