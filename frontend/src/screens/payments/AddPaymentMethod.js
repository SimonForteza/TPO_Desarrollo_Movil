import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function AddPaymentMethod({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medios de pago</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Agrega un medio de pago para poder pujar.</Text>

          <TouchableOpacity onPress={() => navigation.navigate('FormCuentaBancaria')}>
            <View>
              <Text style={styles.optionTitle}>Cuenta bancaria</Text>
              <Text style={styles.optionSubtitle}>Local o del exterior</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('FormTarjetaCredito')}>
            <View>
              <Text style={styles.optionTitle}>Tarjeta de crédito</Text>
              <Text style={styles.optionSubtitle}>Visa, MasterCard, Amex</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('FormCheque')}>
            <View>
              <Text style={styles.optionTitle}>Cheque certificado</Text>
              <Text style={styles.optionSubtitle}>Garantía para subastas especiales</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Los medios de pago se verifican antes de habilitarse.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 30 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  optionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  optionSubtitle: { fontSize: 12, color: colors.textSecondary },
  arrowContainer: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 4 },
  footerText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 20 }
});