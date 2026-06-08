import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig'; // Usamos la instancia con Token
import { colors } from '../../theme/colors';

export default function FormCheque({ navigation }) {
  const [numeroCheque, setNumeroCheque] = useState('');
  const [moneda, setMoneda] = useState('ARS');
  const [frente, setFrente] = useState(null);
  const [dorso, setDorso] = useState(null);
  const [loading, setLoading] = useState(false);

  const cleanBase64 = (str) => {
    if (!str) return "";
    let cleaned = str.includes(',') ? str.split(',')[1] : str;
    return cleaned.replace(/[^A-Za-z0-9+/=]/g, ""); 
  };

  const pickImage = async (lado) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      quality: 0.2, 
      base64: true,
    });

    if (!result.canceled) {
      const base64Clean = cleanBase64(result.assets[0].base64);
      if (lado === 'frente') {
        setFrente({ uri: result.assets[0].uri, base64: base64Clean });
      } else {
        setDorso({ uri: result.assets[0].uri, base64: base64Clean });
      }
    }
  };

  const handleEnviar = async () => {
    if (!numeroCheque.trim()) {
      Alert.alert('Atención', 'Tenés que ingresar el número del cheque.');
      return;
    }
    if (!frente || !dorso) {
      Alert.alert('Atención', 'Necesitás subir ambas fotos del cheque.');
      return;
    }

    setLoading(true);
    try {
      const datosPago = {
        tipo: 'cheque', // Minúsculas para pasar el @Pattern
        moneda: moneda,
        numero: numeroCheque.trim(),
        fotoChequeFrenteBase64: frente.base64, 
        fotoChequeDorsoBase64: dorso.base64
      };

      await api.post('/medios-pago', datosPago);
      
      Alert.alert('Éxito', 'Cheque enviado para verificación.');
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo enviar el cheque. Asegurate de que el formato sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  const ImageBox = ({ lado, label, state }) => (
    <TouchableOpacity style={styles.imageBox} onPress={() => pickImage(lado)}>
      {state ? (
        <Image source={{ uri: state.uri }} style={styles.previewImage} />
      ) : (
        <>
          <Ionicons name="camera-outline" size={30} color={colors.primary} />
          <Text style={styles.imageBoxText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.infoText}>
            Por favor, ingresá los datos y subí una foto del frente y dorso de tu cheque.
          </Text>

          <Text style={styles.label}>Moneda del cheque:</Text>
          <View style={styles.currencyContainer}>
            <TouchableOpacity style={[styles.currencyButton, moneda === 'ARS' && styles.currencyButtonActive]} onPress={() => setMoneda('ARS')}>
              <Text style={[styles.currencyText, moneda === 'ARS' && styles.currencyTextActive]}>Pesos (ARS)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.currencyButton, moneda === 'USD' && styles.currencyButtonActive]} onPress={() => setMoneda('USD')}>
              <Text style={[styles.currencyText, moneda === 'USD' && styles.currencyTextActive]}>Dólares (USD)</Text>
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.input} 
            placeholder="Número de cheque" 
            value={numeroCheque} 
            onChangeText={setNumeroCheque} 
            keyboardType="numeric" 
            placeholderTextColor={colors.textSecondary} 
          />

          <View style={styles.row}>
            <ImageBox lado="frente" label="Frente" state={frente} />
            <ImageBox lado="dorso" label="Dorso" state={dorso} />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleEnviar} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Enviar cheque</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, justifyContent: 'space-between' },
  infoText: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, lineHeight: 22 },
  label: { fontSize: 14, color: colors.textPrimary, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 16, color: colors.textPrimary },
  currencyContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  currencyButton: { flex: 1, padding: 14, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 8, alignItems: 'center', marginHorizontal: 4, backgroundColor: '#FFFFFF' },
  currencyButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencyText: { color: colors.textSecondary, fontWeight: 'bold' },
  currencyTextActive: { color: colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, height: 140, marginBottom: 30 },
  imageBox: { flex: 1, backgroundColor: '#F3F3F3', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBoxText: { marginTop: 8, color: colors.primary, fontWeight: '600', fontSize: 14 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});