import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function VerificationPending() {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Ionicons name="time-outline" size={80} color={colors.secondary} style={styles.icon} />
        
        <Text style={styles.title}>Estamos verificando tus datos</Text>
        
        <Text style={styles.subtitle}>
          Este proceso suele demorar unas horas. Te notificaremos por mail cuando tu cuenta esté activa.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  }
});