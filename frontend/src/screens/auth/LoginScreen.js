import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { setTokens } from '../../api/session';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Completá el email y la contraseña.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Ingresá un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password,
      });
      const { accessToken, refreshToken } = res.data.data;
      setTokens({ accessToken, refreshToken });
      navigation.replace('Home');
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 400) {
        Alert.alert('Error', 'Email o contraseña incorrectos.');
      } else if (status === 422) {
        Alert.alert('Cuenta inactiva', 'Tu cuenta aún no está activa. Completá el proceso de registro.');
      } else {
        Alert.alert('Error', 'No se pudo conectar. Verificá tu conexión e intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Bienvenido a SubastaPro</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => navigation.navigate('RecuperarPassword')}
        >
          <Text style={styles.forgotButtonText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 100, height: 100 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#E8E8E8', borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 16, color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  forgotButton: { alignItems: 'center', marginTop: 20, padding: 8 },
  forgotButtonText: { color: colors.primary, fontSize: 15 },
});
