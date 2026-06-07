import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';
import { getAccessToken } from '../../api/session';

export default function FormTarjetaCredito({ navigation }) {
  const [nombreTitular, setNombreTitular] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [codigoSeguridad, setCodigoSeguridad] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombreTitular || !numeroTarjeta || !fechaVencimiento || !codigoSeguridad) {
      Alert.alert('Error', 'Por favor, completá todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(`${API_URL}/medios-de-pago`, {
        tipo: 'TARJETA_CREDITO',
        nombreTitular,
        numeroTarjeta,
        fechaVencimiento,
        codigoSeguridad
      }, config);
      navigation.replace('Home');
    } catch (error) {
      console.error("Error del backend:", error.response?.data || error.message);
      Alert.alert('Error', `No se pudo guardar la tarjeta: ${error.response?.data?.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <TextInput 
            style={styles.input} 
            placeholder="Nombre del titular" 
            value={nombreTitular} 
            onChangeText={setNombreTitular} 
            placeholderTextColor={colors.textSecondary} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Número de tarjeta" 
            value={numeroTarjeta} 
            onChangeText={setNumeroTarjeta} 
            keyboardType="numeric" 
            placeholderTextColor={colors.textSecondary} 
          />
          
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 8 }]} 
              placeholder="MM/AA" 
              value={fechaVencimiento} 
              onChangeText={setFechaVencimiento} 
              keyboardType="numeric" 
              placeholderTextColor={colors.textSecondary} 
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginLeft: 8 }]} 
              placeholder="Cód. seguridad" 
              value={codigoSeguridad} 
              onChangeText={setCodigoSeguridad} 
              keyboardType="numeric" 
              secureTextEntry 
              placeholderTextColor={colors.textSecondary} 
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Agregar tarjeta</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  input: { 
    backgroundColor: '#F3F3F3', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16, 
    color: colors.textPrimary 
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryButton: { 
    backgroundColor: colors.primary, 
    borderRadius: 8, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});