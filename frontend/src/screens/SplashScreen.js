import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { API_URL } from '../api/config';
import {
  getAccessToken, getRefreshToken, setTokens, clearTokens,
  getPendingRegistration, clearPendingRegistration,
  setUserData,
} from '../api/session';
import { colors } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const resolveNavigation = async () => {
      // 1. Si hay token guardado, intentar ir directo al Home
      const accessToken = await getAccessToken();
      if (accessToken) {
        try {
          const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUserData(meRes.data.data);
          return () => navigation.replace('Home');
        } catch (error) {
          if (error.response?.status === 401) {
            // Token expirado: intentar renovar
            const refreshToken = await getRefreshToken();
            if (refreshToken) {
              try {
                const refreshRes = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                const { accessToken: newAccess, refreshToken: newRefresh } = refreshRes.data.data;
                await setTokens(newAccess, newRefresh);

                const meRes2 = await axios.get(`${API_URL}/auth/me`, {
                  headers: { Authorization: `Bearer ${newAccess}` },
                });
                setUserData(meRes2.data.data);
                return () => navigation.replace('Home');
              } catch (_) {
                await clearTokens();
              }
            } else {
              await clearTokens();
            }
          }
          // Error de red u otro: no borrar el token, ir a Welcome
        }
      }

      // 2. Sin sesión activa: chequear registro pendiente (KYC)
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
          await clearPendingRegistration();
        }
        return () => navigation.replace('Welcome');
      }
    };

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
  version: { fontSize: 14, color: colors.textSecondary },
});
