import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { API_URL } from '../api/config';
import { getPendingRegistration, clearPendingRegistration } from '../api/session';
import { colors } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const resolveNavigation = async () => {
      const usuarioId = await getPendingRegistration();

      if (!usuarioId) return () => navigation.replace('Welcome');

      try {
        const res = await axios.get(`${API_URL}/auth/kyc-estado/${usuarioId}`);
        const data = res.data.data;

        if (data?.aprobado === true) {
          return () => navigation.replace('CompleteRegistration', { tokenActivacion: data.tokenActivacion });
        }
        return () => navigation.replace('VerificationPending', { usuarioId: Number(usuarioId) });
      } catch (error) {
        if (error.response?.status === 404) {
          // El backend se reinició (H2 in-memory): el usuario ya no existe, limpiar estado
          await clearPendingRegistration();
        }
        // Error de red transitorio: ir a Welcome sin borrar la clave
        return () => navigation.replace('Welcome');
      }
    };

    // Ambas deben completarse antes de navegar: la red Y el mínimo de branding
    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
    Promise.all([resolveNavigation(), minDelay]).then(([navigate]) => navigate());
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SubastaPro</Text>
      </View>
      <Text style={styles.version}>v 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 180, height: 180, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.secondary },
  version: { fontSize: 14, color: colors.textSecondary }
});