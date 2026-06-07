import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar cuenta bancaria</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.formSection}>
          <TextInput style={styles.input} placeholder="Banco" value={banco} onChangeText={setBanco} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Tipo de cuenta (ej. caja de ahorro)" value={tipoCuenta} onChangeText={setTipoCuenta} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="CBU / CVU" value={cbuCvu} onChangeText={setCbuCvu} keyboardType="numeric" placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Alias" value={alias} onChangeText={setAlias} placeholderTextColor="#999" />
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Agregar cuenta</Text>}
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
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});