import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig';
import { getSubastas } from '../../api/subastas';
import { clearPendingRegistration, getPendingRegistration, getUserData, setUserData } from '../../api/session';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const CHIPS = ['Todas', 'En vivo', 'Programadas', 'ARS', 'USD'];

const esEnVivo = (s) => s.estado && s.estado.toLowerCase() === 'abierta';

function capitalizar(txt) {
  if (!txt) return '';
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function formatearFecha(fechaOriginal) {
  if (!fechaOriginal) return 'Fecha a confirmar';
  const partes = String(fechaOriginal).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaOriginal;
}

export default function HomeScreen({ navigation, route }) {
  const [usuario, setUsuario] = useState(route.params?.user || getUserData());
  const [kycAprobado, setKycAprobado] = useState(false);
  const [tokenActivacion, setTokenActivacion] = useState(null);
  const [chipActivo, setChipActivo] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [subastas, setSubastas] = useState([]);
  const [loadingSubastas, setLoadingSubastas] = useState(true);

  const intervalRef = useRef(null);

  // Cargar datos del usuario si no están en memoria (ej: reinicio de la app)
  useEffect(() => {
    if (usuario) return;
    api.get('/auth/me')
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUserData(data);
        setUsuario(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchSubastas = async () => {
      try {
        const data = await getSubastas();
        setSubastas(data);
      } catch (error) {
        console.error('Error al cargar subastas:', error);
      } finally {
        setLoadingSubastas(false);
      }
    };
    fetchSubastas();
  }, []);

  useEffect(() => {
    const startKycPolling = async () => {
      const usuarioId = await getPendingRegistration();
      if (!usuarioId) return;

      intervalRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/auth/kyc-estado/${usuarioId}`);
          const data = res.data.data;
          if (data?.aprobado === true) {
            clearInterval(intervalRef.current);
            setTokenActivacion(data.tokenActivacion);
            setKycAprobado(true);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            clearInterval(intervalRef.current);
            await clearPendingRegistration();
          }
        }
      }, 5000);
    };

    startKycPolling();
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleCompletarRegistro = () => {
    navigation.navigate('CompleteRegistration', { tokenActivacion });
  };

  let base = subastas;
  if (busqueda.trim()) {
    const q = busqueda.trim().toLowerCase();
    base = base.filter(
      (s) =>
        (s.ubicacion && s.ubicacion.toLowerCase().includes(q)) ||
        (s.categoria && s.categoria.toLowerCase().includes(q))
    );
  }
  if (chipActivo === 'ARS') base = base.filter((s) => s.moneda === 'ARS');
  if (chipActivo === 'USD') base = base.filter((s) => s.moneda === 'USD');

  const enVivo = base.filter(esEnVivo);
  const proximas = base.filter((s) => !esEnVivo(s));

  const mostrarEnVivo = chipActivo !== 'Programadas';
  const mostrarProximas = chipActivo !== 'En vivo';

  const totalVisible =
    (mostrarEnVivo ? enVivo.length : 0) + (mostrarProximas ? proximas.length : 0);

  const nombreUsuario = usuario?.nombre || 'Invitado';
  const categoriaUsuario = usuario?.categoria;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Hola, {nombreUsuario}</Text>
            <Text style={styles.userName}>Subastas</Text>
          </View>
          <View style={styles.headerRight}>
            {categoriaUsuario ? (
              <View style={styles.categoriaChip}>
                <Text style={styles.categoriaChipText}>Categoría: {capitalizar(categoriaUsuario)}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (!usuario) {
                  navigation.navigate('Login');
                } else {
                  navigation.navigate('NotificacionesInbox');
                }
              }}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {kycAprobado && (
          <TouchableOpacity style={styles.kycBanner} onPress={handleCompletarRegistro}>
            <Ionicons name="shield-checkmark" size={24} color={colors.surface} />
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>Identidad verificada</Text>
              <Text style={styles.kycBannerSubtitle}>Tocá aquí para activar tu cuenta.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar subastas..."
              placeholderTextColor={colors.textSecondary}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          <View style={styles.chipsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {CHIPS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, chipActivo === cat && styles.chipActive]}
                  onPress={() => setChipActivo(cat)}
                >
                  <Text style={[styles.chipText, chipActivo === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loadingSubastas ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : totalVisible === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={52} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No hay subastas disponibles por el momento.</Text>
              <Text style={styles.emptySubtitle}>
                Cuando la casa de subastas publique una nueva, aparecerá acá.
              </Text>
            </View>
          ) : (
            <>
              {mostrarEnVivo && enVivo.length > 0 && (
                <Seccion titulo="En vivo" subtitulo={`${enVivo.length} activas`} live>
                  {enVivo.map((item) => (
                    <SubastaCard key={item.id} item={item} navigation={navigation} live />
                  ))}
                </Seccion>
              )}

              {mostrarProximas && proximas.length > 0 && (
                <Seccion titulo="Próximas subastas">
                  {proximas.map((item) => (
                    <SubastaCard key={item.id} item={item} navigation={navigation} />
                  ))}
                </Seccion>
              )}
            </>
          )}
        </ScrollView>

        <BottomNavBar navigation={navigation} active="subastas" />
      </View>
    </SafeAreaView>
  );
}

function Seccion({ titulo, subtitulo, live, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {live ? <View style={styles.liveDot} /> : null}
          <Text style={styles.sectionTitle}>{titulo}</Text>
        </View>
        {subtitulo ? <Text style={styles.sectionSubtitle}>{subtitulo}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SubastaCard({ item, navigation, live }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetalleSubasta', { id: item.id })}
    >
      <View style={styles.cardThumb}>
        {item.primeraFotoBase64 ? (
          <Image source={{ uri: `data:image/jpeg;base64,${item.primeraFotoBase64}` }} style={styles.cardThumbImage} />
        ) : (
          <Ionicons name="image-outline" size={26} color={colors.textSecondary} />
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>Subasta #{item.id}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {(item.ubicacion || 'Sede a confirmar')} · {item.moneda || ''}
        </Text>
        <View style={styles.cardBadges}>
          <View style={[styles.statusBadge, { backgroundColor: live ? colors.success : '#9CA3AF' }]}>
            <Text style={styles.statusBadgeText}>{live ? 'en vivo' : (item.estado || 'programada')}</Text>
          </View>
          {item.categoria ? (
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>{capitalizar(item.categoria)}</Text>
            </View>
          ) : null}
        </View>
        {!live ? (
          <Text style={styles.cardFecha}>
            {formatearFecha(item.fecha)}{item.hora ? ` · ${String(item.hora).substring(0, 5)} hs` : ''}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  container: { flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  headerTextContainer: { justifyContent: 'center' },
  greeting: { fontSize: 13, color: colors.textSecondary },
  userName: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoriaChip: { backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  categoriaChipText: { color: colors.surface, fontWeight: 'bold', fontSize: 12 },

  iconButton: { backgroundColor: '#F3F3F3', padding: 9, borderRadius: 50, position: 'relative' },
  notificationDot: { position: 'absolute', top: 9, right: 11, width: 8, height: 8, backgroundColor: colors.secondary, borderRadius: 4, borderWidth: 1, borderColor: '#FFF' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 15, marginBottom: 18, borderWidth: 1, borderColor: '#EAEAEA' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.textPrimary },

  chipsSection: { marginBottom: 22 },
  horizontalScroll: { paddingLeft: 20 },
  chip: { backgroundColor: '#F5F5F5', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginRight: 10 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: colors.surface },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 13, color: colors.textSecondary },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: 20, marginBottom: 14, borderRadius: 14, borderWidth: 1, borderColor: '#ECECEC', padding: 12 },
  cardThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginRight: 12 },
  cardThumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: 6 },
  cardBadges: { flexDirection: 'row', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { color: colors.surface, fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
  catBadge: { backgroundColor: '#EEE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
  cardFecha: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },

  kycBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success, marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 14, gap: 12 },
  kycBannerText: { flex: 1 },
  kycBannerTitle: { color: colors.surface, fontWeight: 'bold', fontSize: 15 },
  kycBannerSubtitle: { color: colors.surface, fontSize: 12, marginTop: 2 },

  scrollContent: { paddingBottom: 100 },
});
