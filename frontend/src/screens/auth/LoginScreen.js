import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../api/config';
import { setTokens } from '../../api/session';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Por favor, ingresá tu correo y contraseña.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Ingresá un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      // Usamos la variable global API_URL en lugar de la IP hardcodeada
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password: password
      });

      console.log("¡Login exitoso!");

      // Guardamos los tokens usando la nueva función de sesión
      const { accessToken, refreshToken } = response.data.data;
      await setTokens(accessToken, refreshToken);

      // Inyectamos el token en la instancia global de axios para las peticiones inmediatas
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Leemos si existe la bandera de "primerLogin"
      const esPrimerLogin = await AsyncStorage.getItem('primerLogin');

      if (esPrimerLogin === 'true') {
        // Como es su primera vez, borramos la bandera para que no lo vuelva a mandar acá en el futuro
        await AsyncStorage.removeItem('primerLogin');
        
        // Lo mandamos a los métodos de pago (con el Token ya guardado en el sistema)
        navigation.replace('AddPaymentMethod');
      } else {
        // Es un login normal de un usuario viejo, va al Home
        navigation.replace('Home', { 
          user: response.data.data.usuario,
          token: accessToken
        });
      }

    } catch (error) {
      console.error("Error en login:", error.message);
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          Alert.alert("Error", "Credenciales incorrectas o la cuenta aún no fue activada.");
        } else {
          Alert.alert("Error", `Problema en el servidor: ${error.response.data.message || 'Inténtalo más tarde.'}`);
        }
      } else {
        // Este es el error si no hay conexión
        Alert.alert("Error de conexión", "No se pudo contactar al servidor. Revisá la IP en config.js y que el backend esté encendido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>¡Hola de nuevo!</Text>
          <Text style={styles.subtitle}>Iniciá sesión para continuar pujando en SubastaPro.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('RecuperarPassword')}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tenés cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterStep1')}>
            <Text style={styles.registerText}>Registrate</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  form: { marginBottom: 30 },
  input: { 
    backgroundColor: '#F3F3F3', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16, 
    color: colors.textPrimary 
  },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 30 },
  forgotText: { color: colors.primary, fontWeight: '600' },
  primaryButton: { 
    backgroundColor: colors.primary, 
    borderRadius: 8, 
    padding: 16, 
    alignItems: 'center' 
  },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.textSecondary, fontSize: 16 },
  registerText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' }
});