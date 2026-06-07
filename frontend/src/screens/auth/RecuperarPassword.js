import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';

export default function RecuperarPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresá tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/recuperar-password`, { email: email.trim() });
      const tokenRecuperacion = res.data.data?.tokenRecuperacion;
      navigation.navigate('LinkEnviado', { tokenRecuperacion, email: email.trim() });
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la solicitud. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresá el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleEnviar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar instrucciones</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  backButton: { alignItems: 'center', padding: 12 },
  backButtonText: { color: colors.primary, fontSize: 15 },
});
