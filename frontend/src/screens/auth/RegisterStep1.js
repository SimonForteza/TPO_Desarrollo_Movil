import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';

export default function RegisterStep1({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (!nombre.trim() || !apellido.trim() || !documento.trim() || !direccion.trim() || !email.trim()) {
      Alert.alert('Error', 'Por favor, completá todos los campos.');
      return;
    }
    if (!/^\d{7,8}$/.test(documento.trim())) {
      Alert.alert('Error', 'El DNI debe tener entre 7 y 8 dígitos numéricos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Ingresá un correo electrónico válido.');
      return;
    }

    const userData = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      documento: documento.trim(),
      direccion: direccion.trim(),
      email: email.trim(),
      paisId: 32,
    };

    navigation.navigate('DniFront', { userData });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>Datos personales</Text>

        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="DNI / Pasaporte" value={documento} onChangeText={setDocumento} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Dirección completa" value={direccion} onChangeText={setDireccion} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textSecondary} />

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Siguiente</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 30 },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  spacer: { flex: 1, minHeight: 40 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});