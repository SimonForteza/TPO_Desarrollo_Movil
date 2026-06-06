import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function RegisterStep1({ navigation }) {
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>Datos personales</Text>

        <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Apellido" placeholderTextColor={colors.textSecondary} />
        
        {/* Input con ícono para la fecha simulado */}
        <View style={styles.inputWithIcon}>
          <TextInput 
            style={styles.inputField} 
            placeholder="Fecha de nacimiento (DD/MM/AAAA)" 
            placeholderTextColor={colors.textSecondary} 
          />
          <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Teléfono" 
          placeholderTextColor={colors.textSecondary} 
          keyboardType="phone-pad"
        />

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('DniFront')}>
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
    backgroundColor: '#F3F3F3', // Gris claro del diseño
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputField: { flex: 1, paddingVertical: 16, fontSize: 16, color: colors.textPrimary },
  spacer: { flex: 1, minHeight: 40 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});