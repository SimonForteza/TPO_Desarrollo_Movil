import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme/colors';
import { API_URL } from '../../api/config';
import { validateUserData } from '../../utils/validation'; // Tu archivo de utilidades

export default function RegisterStep1({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    // 1. Validaciones locales (formato)
    const userData = { nombre, apellido, documento, direccion, email };
    const error = validateUserData(userData);
    
    if (error) {
      Alert.alert('Error de validación', error);
      return;
    }

    setLoading(true);

    try {
      await axios.get(`${API_URL}/auth/verificar-disponibilidad`, { 
        params: { email: email.trim(), documento: documento.trim() } 
      });

      // 3. Si todo está ok, navegamos
      navigation.navigate('DniFront', { 
        userData: { ...userData, paisId: 32 } 
      });

    } catch (error) {
      const msg = error.response?.data?.message || 
                  (typeof error.response?.data === 'string' ? error.response.data : null) || 
                  error.message || 
                  "Error al verificar disponibilidad.";

      Alert.alert('Error', String(msg)); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Datos personales</Text>

        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="DNI" value={documento} onChangeText={setDocumento} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Dirección completa" value={direccion} onChangeText={setDireccion} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textSecondary} />

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Siguiente</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 30 },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  spacer: { flex: 1, minHeight: 40 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', height: 50, justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});