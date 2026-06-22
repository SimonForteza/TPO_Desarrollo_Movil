import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig';
import { colors } from '../../theme/colors';

export default function CambiarPassword({ navigation }) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!passwordActual || !passwordNueva || !passwordConfirmacion) {
      Alert.alert('Error', 'Completá todos los campos.');
      return;
    }
    if (passwordNueva.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passwordNueva !== passwordConfirmacion) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/cambiar-password', {
        passwordActual,
        passwordNueva,
        passwordConfirmacion,
      });

      Alert.alert('Éxito', 'Contraseña cambiada correctamente.');
      navigation.goBack();
    } catch (error) {
      const status = error.response?.status;
      if (status === 400 || status === 422) {
        Alert.alert('Error', 'La contraseña actual es incorrecta.');
      } else if (status === 401) {
        Alert.alert('Sesión expirada', 'Por favor, volvé a iniciar sesión.');
        navigation.replace('Home');
      } else {
        Alert.alert('Error', 'No se pudo cambiar la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={passwordActual}
            onChangeText={setPasswordActual}
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            value={passwordNueva}
            onChangeText={setPasswordNueva}
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repetí la nueva contraseña"
            value={passwordConfirmacion}
            onChangeText={setPasswordConfirmacion}
            secureTextEntry
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
