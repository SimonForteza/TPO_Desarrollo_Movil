import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';

export default function ResetPassword({ route, navigation }) {
  const { tokenRecuperacion } = route.params || {};
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!tokenRecuperacion) {
      Alert.alert('Error', 'Falta el token de recuperación. Volvé a solicitar el link.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== passwordConfirmacion) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/resetear-password`, {
        tokenRecuperacion,
        password,
        passwordConfirmacion,
      });
      Alert.alert('¡Listo!', 'Tu contraseña fue restablecida. Ya podés iniciar sesión.', [
        { text: 'Ir al login', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>Elegí una contraseña segura de al menos 8 caracteres.</Text>
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña (Mín. 8 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nueva contraseña"
          value={passwordConfirmacion}
          onChangeText={setPasswordConfirmacion}
          secureTextEntry
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleReset} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Restablecer contraseña</Text>
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
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
