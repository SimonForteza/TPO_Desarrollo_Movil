import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { API_URL } from '../api/config';
import {
  getAccessToken, getRefreshToken, setTokens, clearTokens,
  setUserData,
} from '../api/session';
import { colors } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const resolveSession = async () => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        try {
          const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUserData(meRes.data.data);
        } catch (error) {
          if (error.response?.status === 401) {
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
              } catch (_) {
                await clearTokens();
              }
            } else {
              await clearTokens();
            }
          }
        }
      }
      // Siempre va al Home — con o sin sesión (efecto vidriera)
    };

    const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
    Promise.all([resolveSession(), minDelay]).then(() => navigation.replace('Home'));
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
