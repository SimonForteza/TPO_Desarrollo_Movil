import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function LinkEnviado({ route, navigation }) {
  const { tokenRecuperacion, email } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail-outline" size={80} color={colors.secondary} style={styles.icon} />
        <Text style={styles.title}>Revisá tu correo</Text>
        <Text style={styles.subtitle}>
          Si el correo <Text style={styles.email}>{email}</Text> está registrado, recibirás las instrucciones para restablecer tu contraseña.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ResetPassword', { tokenRecuperacion })}
        >
          <Text style={styles.primaryButtonText}>Ya tengo mi código</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  icon: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  email: { fontWeight: 'bold', color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', width: '100%', marginBottom: 16 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  backButton: { alignItems: 'center', padding: 12 },
  backButtonText: { color: colors.primary, fontSize: 15 },
});
