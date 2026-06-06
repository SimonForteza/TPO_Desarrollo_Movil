import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function DniUploadTemplate({ step, buttonText, onNext }) {
  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Paso {step} de 2</Text>
      <Text style={styles.title}>Subí tu DNI o pasaporte</Text>
      <Text style={styles.subtitle}>
        Asegurate de que tus datos se lean bien, sin reflejos ni sombras.
      </Text>

      {/* Caja de subida con borde punteado */}
      <TouchableOpacity style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={50} color={colors.primary} />
        <Text style={styles.uploadText}>Subir archivo</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 30,
    lineHeight: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F5F8FF', // Un fondo celestito muy claro
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  spacer: {
    flex: 1, // Empuja el botón hacia abajo
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  }
});