import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig';
import { colors } from '../../theme/colors';

export default function FormTarjetaCredito({ navigation }) {
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [moneda, setMoneda] = useState('ARS');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!numeroTarjeta.trim() || !nombreTitular.trim() || !vencimiento.trim() || !cvv.trim()) {
      Alert.alert('Error', 'Por favor, completá todos los datos de la tarjeta.');
      return;
    }

    setLoading(true);
    try {
      // Ajustado estrictamente al DTO del backend
      const datosPago = {
        tipo: 'tarjeta', 
        moneda: moneda, 
        numero: numeroTarjeta.replace(/\s/g, '') // Mandamos el número sin espacios
      };

      // Si el backend en el futuro acepta más campos (titular, vencimiento, cvv), los agregás al objeto de arriba.
      await api.post('/medios-pago', datosPago);
      
      Alert.alert('Éxito', 'Tarjeta agregada correctamente.');
      navigation.replace('Home'); 
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        Alert.alert('Error', 'Esta tarjeta ya se encuentra registrada.');
      } else {
        Alert.alert('Error', 'No se pudo guardar la tarjeta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>Moneda de facturación:</Text>
          <View style={styles.currencyContainer}>
            <TouchableOpacity style={[styles.currencyButton, moneda === 'ARS' && styles.currencyButtonActive]} onPress={() => setMoneda('ARS')}>
              <Text style={[styles.currencyText, moneda === 'ARS' && styles.currencyTextActive]}>Pesos (ARS)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.currencyButton, moneda === 'USD' && styles.currencyButtonActive]} onPress={() => setMoneda('USD')}>
              <Text style={[styles.currencyText, moneda === 'USD' && styles.currencyTextActive]}>Dólares (USD)</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Número de tarjeta" value={numeroTarjeta} onChangeText={setNumeroTarjeta} keyboardType="numeric" maxLength={19} placeholderTextColor={colors.textSecondary} />
          <TextInput style={styles.input} placeholder="Nombre del titular" value={nombreTitular} onChangeText={setNombreTitular} autoCapitalize="words" placeholderTextColor={colors.textSecondary} />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="MM/AA" value={vencimiento} onChangeText={setVencimiento} keyboardType="numeric" maxLength={5} placeholderTextColor={colors.textSecondary} />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="numeric" maxLength={4} secureTextEntry placeholderTextColor={colors.textSecondary} />
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Agregar tarjeta</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  label: { fontSize: 14, color: colors.textPrimary, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  currencyContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  currencyButton: { flex: 1, padding: 14, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 8, alignItems: 'center', marginHorizontal: 4, backgroundColor: '#FFFFFF' },
  currencyButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencyText: { color: colors.textSecondary, fontWeight: 'bold' },
  currencyTextActive: { color: colors.surface },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});