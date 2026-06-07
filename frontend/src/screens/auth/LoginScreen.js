import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Validación básica para no hacer peticiones vacías
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Por favor, ingresá tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // 2. Le pegamos al backend (Asegurate de usar 10.0.2.2 en el emulador)
      const response = await axios.post('http://10.0.2.2:8080/auth/login', {
        email: email.trim().toLowerCase(), // Limpiamos espacios y mayúsculas
        password: password
      });

      console.log("¡Login exitoso!", response.data.message);

      // (En el futuro acá guardaríamos el token JWT en AsyncStorage para mantener la sesión abierta)

      // 3. Vamos al Home y borramos el Login del historial para que no pueda volver atrás con el botón de "Atrás"
      navigation.replace('Home');

    } catch (error) {
      console.error("Error en login:", error);
      
      // 4. Manejo de errores basado en lo que devuelve Spring Boot
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          Alert.alert("Error", "Credenciales incorrectas o la cuenta aún no fue activada.");
        } else {
          Alert.alert("Error", `Problema en el servidor: ${error.response.data.message || 'Inténtalo más tarde.'}`);
        }
      } else {
        Alert.alert("Error de conexión", "No se pudo contactar al servidor. Revisá que esté encendido.");
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

          <TouchableOpacity style={styles.forgotPassword}>
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