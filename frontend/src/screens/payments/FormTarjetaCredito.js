import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';

export default function FormTarjetaCredito({ navigation }) {
  const [nombreTitular, setNombreTitular] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [codigoSeguridad, setCodigoSeguridad] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/medios-de-pago`, {
        tipo: 'TARJETA_CREDITO', nombreTitular, numeroTarjeta, fechaVencimiento, codigoSeguridad
      });
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la tarjeta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar tarjeta</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.formSection}>
          <TextInput style={styles.input} placeholder="Nombre del titular" value={nombreTitular} onChangeText={setNombreTitular} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Número de tarjeta" value={numeroTarjeta} onChangeText={setNumeroTarjeta} keyboardType="numeric" placeholderTextColor="#999" />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 15 }]} placeholder="MM/AA" value={fechaVencimiento} onChangeText={setFechaVencimiento} keyboardType="numeric" placeholderTextColor="#999" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Código de seguridad" value={codigoSeguridad} onChangeText={setCodigoSeguridad} keyboardType="numeric" secureTextEntry placeholderTextColor="#999" />
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Agregar tarjeta</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 40 : 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 30, justifyContent: 'space-between' },
  formSection: { marginTop: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingVertical: 15, fontSize: 16, color: '#000', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});