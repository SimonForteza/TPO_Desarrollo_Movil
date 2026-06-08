import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../api/config';
import { clearPendingRegistration, getPendingRegistration } from '../../api/session';
import { colors } from '../../theme/colors';
import BottomNavBar from '../../components/BottomNavBar';

// Datos de prueba para simular lo que devolverá el backend
const SUBASTAS_MOCK = [
  { id: '1', titulo: 'Pintura al óleo S.XIX', precioBase: '$15,000.00', tiempo: '15d 04h', categoria: 'Arte' },
  { id: '2', titulo: 'Reloj Patek Philippe', precioBase: '$25,000.00', tiempo: '02d 12h', categoria: 'Relojes' },
  { id: '3', titulo: 'Escultura modernista', precioBase: '$80,000.00', tiempo: '20d 01h', categoria: 'Arte' },
];

const CATEGORIAS = ['Tecnología', 'Vehículos', 'Inmuebles', 'Arte', 'Joyas'];

export default function HomeScreen({ navigation }) {
  const [kycAprobado, setKycAprobado] = useState(false);
  const [tokenActivacion, setTokenActivacion] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const startKycPolling = async () => {
      const usuarioId = await getPendingRegistration();
      if (!usuarioId) return;

      intervalRef.current = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/auth/kyc-estado/${usuarioId}`);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido a</Text>
            <Text style={styles.brand}>SubastaPro</Text>
          </View>
          
          {/* Botón de login genérico para usuarios invitados */}
          <TouchableOpacity style={styles.loginIcon} onPress={() => navigation.navigate('Welcome')}>
            <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {kycAprobado && (
          <TouchableOpacity style={styles.kycBanner} onPress={handleCompletarRegistro}>
            <Ionicons name="checkmark-circle" size={22} color={colors.surface} />
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>¡Tu identidad fue verificada!</Text>
              <Text style={styles.kycBannerSubtitle}>Tocá aquí para crear tu contraseña y activar tu cuenta.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{ marginBottom: 65 }}>
          
          {/* BARRA DE BÚSQUEDA */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar productos, categorías..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* LO MÁS BUSCADO (Scroll Horizontal) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lo más buscado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {CATEGORIAS.map((cat, index) => (
                <TouchableOpacity key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SUBASTAS ACTIVAS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Subastas activas</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {SUBASTAS_MOCK.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                {/* Cuadro simulando la imagen del producto */}
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                </View>
                
                <View style={styles.cardDetails}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardCategory}>{item.categoria}</Text>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={12} color={colors.secondary} />
                      <Text style={styles.timeText}>{item.tiempo}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Precio base</Text>
                    <Text style={styles.priceValue}>{item.precioBase}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>

        {/* BARRA DE NAVEGACIÓN INFERIOR */}
        <BottomNavBar navigation={navigation} active="subastas" />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0, // Evita que se superponga con la barra de estado en Android
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  brand: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  loginIcon: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  chip: {
    backgroundColor: '#F5F8FF',
    borderWidth: 1,
    borderColor: '#DCE5FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipText: {
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  kycBannerText: {
    flex: 1,
  },
  kycBannerTitle: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  kycBannerSubtitle: {
    color: colors.surface,
    fontSize: 12,
    opacity: 0.85,
    marginTop: 2,
  },
});