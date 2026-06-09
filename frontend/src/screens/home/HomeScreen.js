import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig'; 
import { clearPendingRegistration, getPendingRegistration } from '../../api/session';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const CATEGORIAS = ['Todos', 'Tecnología', 'Vehículos', 'Inmuebles', 'Arte', 'Joyas'];

export default function HomeScreen({ navigation, route }) {
  const usuario = route.params?.user;
  const nombreUsuario = usuario?.nombre || usuario?.email?.split('@')[0] || 'Usuario';

  const [kycAprobado, setKycAprobado] = useState(false);
  const [tokenActivacion, setTokenActivacion] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  
  const [subastas, setSubastas] = useState([]);
  const [loadingSubastas, setLoadingSubastas] = useState(true);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchSubastas = async () => {
      try {
        const response = await api.get('/subastas'); 
        const data = response.data.data || response.data;
        
        let listaSubastas = [];
        if (Array.isArray(data)) {
          listaSubastas = data;
        } else if (data && Array.isArray(data.content)) {
          listaSubastas = data.content; 
        } else if (data && Array.isArray(data.items)) {
          listaSubastas = data.items; 
        }

        console.log("Datos recibidos del backend:", data);
        setSubastas(listaSubastas);
      } catch (error) {
        console.error("Error al cargar subastas:", error);
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

  //const subastasFiltradas = categoriaActiva === 'Todos' 
  const subastasFiltradas = subastas;
    // ? subastas 
    // : subastas.filter(s => s.categoria && s.categoria.toLowerCase() === categoriaActiva.toLowerCase());

  // Función para formatear fechas (de '2026-06-25' a '25/06/2026')
  const formatearFecha = (fechaOriginal) => {
    if (!fechaOriginal) return 'Fecha a confirmar';
    const partes = fechaOriginal.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaOriginal;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.userName}>{nombreUsuario}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
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
            />
            <TouchableOpacity style={styles.filterIcon}>
              <Ionicons name="options-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {CATEGORIAS.map((cat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.chip, categoriaActiva === cat && styles.chipActive]}
                  onPress={() => setCategoriaActiva(cat)}
                >
                  <Text style={[styles.chipText, categoriaActiva === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

         <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Subastas Destacadas</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {loadingSubastas ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : subastasFiltradas.length === 0 ? (
              <Text style={styles.emptyText}>No hay eventos de subasta en esta categoría.</Text>
            ) : (
              subastasFiltradas.map((item, index) => {
                const isOpen = item.estado && item.estado.toLowerCase() === 'abierta';
                
                return (
                  <TouchableOpacity 
                    key={item.identificador || item.id || index} 
                    style={styles.cardVertical}
                  >
                    <View style={styles.imagePlaceholderLarge}>
                      <Ionicons name="calendar-outline" size={50} color={colors.textSecondary} />
                      
                      <View style={[styles.timeBadgeFloating, { backgroundColor: isOpen ? 'rgba(16, 185, 129, 0.9)' : 'rgba(0,0,0,0.6)' }]}>
                        <Ionicons name={isOpen ? "ellipse" : "time"} size={10} color={colors.surface} />
                        <Text style={styles.timeTextFloating}>
                          {item.estado ? item.estado.toUpperCase() : 'PROGRAMADA'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardDetailsVertical}>
                      <Text style={styles.cardCategory}>
                        {item.categoria ? item.categoria.toUpperCase() : 'SUBASTA GENERAL'}
                      </Text>
                      
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        Evento en {item.ubicacion || 'Sede Central'}
                      </Text>
                      
                      <View style={styles.cardFooter}>
                        <View>
                          <Text style={styles.priceLabel}>Fecha y Hora</Text>
                          <Text style={styles.priceValue}>
                            {formatearFecha(item.fecha)} • {item.hora ? item.hora.substring(0,5) : '00:00'} hs
                          </Text>
                        </View>
                        <TouchableOpacity style={styles.bidButton}>
                          <Text style={styles.bidButtonText}>Ver catálogo</Text>
                        </TouchableOpacity>
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
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  headerTextContainer: { justifyContent: 'center' },
  greeting: { fontSize: 13, color: colors.textSecondary },
  userName: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  
  iconButton: { backgroundColor: '#F3F3F3', padding: 10, borderRadius: 50, position: 'relative' },
  notificationDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, backgroundColor: colors.secondary, borderRadius: 4, borderWidth: 1, borderColor: '#FFF' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.textPrimary },
  filterIcon: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#E0E0E0' },
  
  section: { marginBottom: 25 },
  horizontalScroll: { paddingLeft: 20 },
  chip: { backgroundColor: '#F5F5F5', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 12 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: colors.surface },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  seeAllText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 20 },
  
  cardVertical: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  imagePlaceholderLarge: { width: '100%', height: 160, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  timeBadgeFloating: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  timeTextFloating: { color: colors.surface, fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  cardDetailsVertical: { padding: 16 },
  cardCategory: { fontSize: 12, color: colors.secondary, fontWeight: 'bold', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  priceLabel: { fontSize: 12, color: colors.textSecondary },
  priceValue: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginTop: 2 },
  bidButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bidButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 14 },
  
  kycBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 14, gap: 12 },
  kycBannerText: { flex: 1 },
  kycBannerTitle: { color: colors.surface, fontWeight: 'bold', fontSize: 15 },
  kycBannerSubtitle: { color: colors.surface, fontSize: 12, marginTop: 2 },
  
  scrollContent: { paddingBottom: 100 },
});