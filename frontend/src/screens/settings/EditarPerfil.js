import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig';
import { getUserData, setTokens, setUserData } from '../../api/session';
import { colors } from '../../theme/colors';

export default function EditarPerfil({ navigation }) {
  const user = getUserData();
  const nombreCompleto = `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim();

  const [nombre, setNombre] = useState(nombreCompleto);
  const [email, setEmail] = useState(user?.email ?? '');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Completá tu nombre.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Ingresá un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/perfil', {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        direccion: direccion.trim(),
      });

      const { usuario, accessToken, refreshToken } = response.data.data;
      await setTokens(accessToken, refreshToken);
      setUserData(usuario);

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('Error', 'Ese email ya está registrado por otro usuario.');
      } else if (error.response?.status === 401) {
        Alert.alert('Sesión expirada', 'Por favor, volvé a iniciar sesión.');
        navigation.replace('Welcome');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>E-Mail</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Av. Corrientes 1234"
            value={direccion}
            onChangeText={setDireccion}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  label: { fontSize: 14, color: colors.textPrimary, marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    color: colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
