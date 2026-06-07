import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { clearPendingRegistration } from '../../api/session';
import { colors } from '../../theme/colors';

export default function CompleteRegistration({ route, navigation }) {
  // Recibimos el token que nos pasó VerificationPending
  const { tokenActivacion } = route.params || {};
  
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!tokenActivacion) {
      Alert.alert("Error", "Falta el token de activación. Volvé a iniciar el proceso.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== passwordConfirmacion) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Le pegamos al endpoint final de tu backend
      await axios.post(`${API_URL}/auth/completar-registro`, {
        tokenActivacion,
        password,
        passwordConfirmacion
      });

      await clearPendingRegistration();
      navigation.replace('RegistroCompleto');
      
    } catch (error) {
      console.error("Error al completar registro:", error);
      Alert.alert("Error", "No se pudo activar la cuenta. Verificá que el token no haya expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Último paso!</Text>
        <Text style={styles.subtitle}>
          Tu identidad fue verificada. Creá una contraseña segura para tu cuenta de SubastaPro.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Contraseña (Mín. 8 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textSecondary}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña"
          value={passwordConfirmacion}
          onChangeText={setPasswordConfirmacion}
          secureTextEntry
          placeholderTextColor={colors.textSecondary}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleFinish} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Finalizar y Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 40, textAlign: 'center', lineHeight: 24 },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});