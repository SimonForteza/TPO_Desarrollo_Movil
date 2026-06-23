import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { crearCuenta } from '../../api/cuentasCobro';
import { colors } from '../../theme/colors';

export default function FormCuentaCobro({ navigation }) {
  const [banco, setBanco] = useState('');
  const [pais, setPais] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!banco.trim()) return Alert.alert('Error', 'Ingresá el banco.');
    if (!pais.trim()) return Alert.alert('Error', 'Ingresá el país.');
    if (!numeroCuenta.trim()) return Alert.alert('Error', 'Ingresá el número de cuenta.');

    setLoading(true);
    try {
      await crearCuenta({
        banco: banco.trim(),
        pais: pais.trim(),
        numeroCuenta: numeroCuenta.trim(),
      });
      Alert.alert('Éxito', 'Cuenta de cobro agregada correctamente.');
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo guardar la cuenta de cobro.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>Banco</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Banco Galicia"
            value={banco}
            onChangeText={setBanco}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>País</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Argentina"
            value={pais}
            onChangeText={setPais}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Número de cuenta</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 0001234567"
            value={numeroCuenta}
            onChangeText={setNumeroCuenta}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Agregar cuenta</Text>
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
    marginBottom: 24,
    fontSize: 16,
    color: colors.textPrimary,
  },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
