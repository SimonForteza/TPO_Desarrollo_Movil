import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { setPendingRegistration } from '../../api/session';
import { colors } from '../../theme/colors';

export default function VerificationPending({ route, navigation }) {
  const { usuarioId } = route.params || {};
  // Usamos un ref para guardar el ID del intervalo y poder apagarlo cuando queramos
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!usuarioId) return;

    setPendingRegistration(usuarioId);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/kyc-estado/${usuarioId}`);
        
        if (res.data.data && res.data.data.aprobado === true) {
          clearInterval(intervalRef.current);
          
          navigation.replace('CompleteRegistration', { 
            tokenActivacion: res.data.data.tokenActivacion 
          });
        }
      } catch (error) {
        console.log("Esperando validación KYC...");
      }
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [usuarioId]);

  const handleGuestNavigation = () => {
    // 1. Frenamos las consultas al servidor para ahorrar batería y recursos
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // 2. Lo mandamos a la pantalla de Home/Catálogo (tendrás que crearla)
    navigation.navigate('Home'); 
    console.log("Navegando al Home como invitado...");
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Ionicons name="time-outline" size={80} color={colors.secondary} style={styles.icon} />
        <Text style={styles.title}>Estamos verificando tus datos</Text>
        <Text style={styles.subtitle}>
          Este proceso suele demorar unos minutos. La pantalla avanzará sola cuando tu cuenta esté lista.
        </Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30, marginBottom: 40 }} />

        {/* Botón secundario para irse al catálogo */}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleGuestNavigation}>
          <Text style={styles.secondaryButtonText}>Explorar catálogo como invitado</Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          Te enviaremos un correo electrónico cuando tu cuenta esté activa para que puedas crear tu contraseña.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 30 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  secondaryButtonText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  infoText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 }
});