import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function RegistroCompleto({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={100} color={colors.secondary} style={styles.icon} />
        <Text style={styles.title}>¡Registro completo!</Text>
        <Text style={styles.subtitle}>
          Tu cuenta de SubastaPro está lista. Ya podés iniciar sesión y comenzar a participar en subastas.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.primaryButtonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  icon: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', width: '100%' },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
