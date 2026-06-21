import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import api from '../../api/axiosConfig';
import { getUserData, setUserData } from '../../api/session';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const FILTROS_MONEDA = [
  { label: 'Todas', value: null },
  { label: 'ARS', value: 'ARS' },
  { label: 'USD', value: 'USD' },
];

export default function HomeScreen({ navigation }) {
  const [usuario, setUsuario] = useState(getUserData());
  const [monedaActiva, setMonedaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario si no están en memoria (ej: después de un reinicio)
  useEffect(() => {
    if (usuario) return;
    api.get('/auth/me')
      .then(res => {
        setUserData(res.data.data);
        setUsuario(res.data.data);
      })
      .catch(() => {});
  }, []);

  const cargarSubastas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (monedaActiva) params.moneda = monedaActiva;
      const res = await api.get('/subastas', { params });
      const data = res.data.data;
      setSubastas(data?.content ?? []);
    } catch (error) {
      console.error('Error al cargar subastas:', error);
    } finally {
      setLoading(false);
    }
  }, [monedaActiva]);

  useEffect(() => {
    cargarSubastas();
  }, [cargarSubastas]);

  const subastasFiltradas = subastas.filter(s => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      s.ubicacion?.toLowerCase().includes(q) ||
      s.categoria?.toLowerCase().includes(q) ||
      s.estado?.toLowerCase().includes(q)
    );
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'A confirmar';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  };

  const nombreUsuario = usuario?.nombre || 'Invitado';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.userName}>{nombreUsuario}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Perfil')}>
            <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Búsqueda */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por ubicación o categoría..."
              placeholderTextColor={colors.textSecondary}
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtro por moneda */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {FILTROS_MONEDA.map((f) => (
              <TouchableOpacity
                key={f.label}
                style={[styles.chip, monedaActiva === f.value && styles.chipActive]}
                onPress={() => setMonedaActiva(f.value)}
              >
                <Text style={[styles.chipText, monedaActiva === f.value && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de subastas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Subastas disponibles</Text>
              <Text style={styles.sectionCount}>{subastasFiltradas.length} encontradas</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
            ) : subastasFiltradas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No hay subastas disponibles</Text>
                <Text style={styles.emptySubtext}>Probá con otros filtros</Text>
              </View>
            ) : (
              subastasFiltradas.map((item) => {
                const abierta = item.estado?.toLowerCase() === 'abierta';
                return (
                  <TouchableOpacity
                    key={item.identificador}
                    style={styles.card}
                    onPress={() => navigation.navigate('SubastaDetalle', { subastaId: item.identificador })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="hammer-outline" size={40} color={colors.textSecondary} />
                      <View style={[styles.estadoBadge, { backgroundColor: abierta ? '#10B981' : '#6B7280' }]}>
                        <Text style={styles.estadoBadgeText}>{item.estado?.toUpperCase() ?? 'PROGRAMADA'}</Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardTags}>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{item.categoria?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.tag, styles.tagMoneda]}>
                          <Text style={styles.tagText}>{item.moneda ?? '—'}</Text>
                        </View>
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.ubicacion ?? 'Sede Central'}
                      </Text>

                      <View style={styles.cardFooter}>
                        <View style={styles.fechaRow}>
                          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.fechaText}>
                            {formatearFecha(item.fecha)} · {item.hora?.substring(0, 5) ?? '00:00'} hs
                          </Text>
                        </View>
                        <View style={styles.verBtn}>
                          <Text style={styles.verBtnText}>Ver catálogo</Text>
                          <Ionicons name="chevron-forward" size={14} color={colors.surface} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        <BottomNavBar navigation={navigation} active="subastas" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4 },
  greeting: { fontSize: 13, color: colors.textSecondary },
  userName: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  iconButton: { padding: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 15, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.textPrimary },

  chipsScroll: { paddingLeft: 20, marginBottom: 20 },
  chip: { backgroundColor: '#F5F5F5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: colors.surface },

  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  sectionCount: { fontSize: 13, color: colors.textSecondary },

  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 12, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  cardImagePlaceholder: { width: '100%', height: 130, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  estadoBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  estadoBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  cardBody: { padding: 16 },
  cardTags: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tag: { backgroundColor: '#FFF0E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagMoneda: { backgroundColor: '#E8F0FE' },
  tagText: { fontSize: 11, fontWeight: 'bold', color: colors.textSecondary },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  fechaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  fechaText: { fontSize: 13, color: colors.textSecondary },
  verBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
  verBtnText: { color: colors.surface, fontWeight: 'bold', fontSize: 13 },
});
