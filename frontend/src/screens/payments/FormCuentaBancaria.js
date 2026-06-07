import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';

export default function FormCuentaBancaria({ navigation }) {
  const [banco, setBanco] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('');
  const [cbuCvu, setCbuCvu] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!banco || !cbuCvu) {
      Alert.alert('Error', 'Completá los datos obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/medios-de-pago`, {
        tipo: 'CUENTA_BANCARIA', banco, tipoCuenta, cbuCvu, alias
      });
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <TextInput style={styles.input} placeholder="Banco" value={banco} onChangeText={setBanco} placeholderTextColor={colors.textSecondary} />
          <TextInput style={styles.input} placeholder="Tipo de cuenta (ej. Caja de Ahorro)" value={tipoCuenta} onChangeText={setTipoCuenta} placeholderTextColor={colors.textSecondary} />
          <TextInput style={styles.input} placeholder="CBU / CVU" value={cbuCvu} onChangeText={setCbuCvu} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />
          <TextInput style={styles.input} placeholder="Alias de la cuenta" value={alias} onChangeText={setAlias} placeholderTextColor={colors.textSecondary} />
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Agregar cuenta</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});