import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig'; // ¡Usamos la instancia que inyecta el Token!
import { colors } from '../../theme/colors';

export default function FormCuentaBancaria({ navigation }) {
  const [cbuCvu, setCbuCvu] = useState('');
  const [moneda, setMoneda] = useState('ARS'); // Estado por defecto en ARS
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    // Validaciones de front basadas en el @NotBlank y @Size del backend
    if (!cbuCvu.trim()) {
      Alert.alert('Error', 'Completá tu número de CBU o CVU.');
      return;
    }
    
    if (cbuCvu.trim().length < 4 || cbuCvu.trim().length > 30) {
      Alert.alert('Error', 'El número debe tener entre 4 y 30 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Armamos el payload EXACTAMENTE como lo pide el DTO en Java
      const datosPago = {
        tipo: 'cuenta', // Debe ser 'cuenta' (minúsculas)
        moneda: moneda, // 'ARS' o 'USD'
        numero: cbuCvu.trim() // Lo que el usuario puso en cbuCvu va a 'numero'
      };

      await api.post('/medios-pago', datosPago);
      
      Alert.alert('Éxito', 'Medio de pago agregado correctamente.');
      navigation.replace('Home'); 
    } catch (error) {
      console.error(error);
      // Atajamos el error 409 si el CBU ya existe (suponiendo que tenés un UniqueConstraint en la DB)
      if (error.response && error.response.status === 409) {
        Alert.alert('Error', 'Este medio de pago ya se encuentra registrado.');
      } else {
        Alert.alert('Error', 'No se pudo guardar la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>Seleccioná la moneda de la cuenta:</Text>
          <View style={styles.currencyContainer}>
            <TouchableOpacity
              style={[styles.currencyButton, moneda === 'ARS' && styles.currencyButtonActive]}
              onPress={() => setMoneda('ARS')}
            >
              <Text style={[styles.currencyText, moneda === 'ARS' && styles.currencyTextActive]}>Pesos (ARS)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.currencyButton, moneda === 'USD' && styles.currencyButtonActive]}
              onPress={() => setMoneda('USD')}
            >
              <Text style={[styles.currencyText, moneda === 'USD' && styles.currencyTextActive]}>Dólares (USD)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ingresá tu CBU o CVU:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: 00000031000..." 
            value={cbuCvu} 
            onChangeText={setCbuCvu} 
            keyboardType="numeric" 
            placeholderTextColor={colors.textSecondary} 
          />
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Agregar cuenta</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  label: { fontSize: 14, color: colors.textPrimary, marginBottom: 8, fontWeight: '600' },
  input: { 
    backgroundColor: '#F3F3F3', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 24, 
    fontSize: 16, 
    color: colors.textPrimary 
  },
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  currencyButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF'
  },
  currencyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  currencyTextActive: {
    color: colors.surface,
  },
  primaryButton: { 
    backgroundColor: colors.primary, 
    borderRadius: 8, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});