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
    if (!nombre || !apellido || !documento || !direccion || !email) {
      Alert.alert('Error', 'Por favor, completá todos los campos.');
      return;
    }

    // Usamos el ID 32 que corresponde a Argentina en tu DevDataSeeder
    const userData = {
      nombre,
      apellido,
      documento,
      direccion,
      email,
      paisId: 32 
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