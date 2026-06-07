import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';

export default function FormCheque({ navigation }) {
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
      allowsEditing: true, quality: 0.2, base64: true,
    });

    if (!result.canceled) {
      const base64Clean = cleanBase64(result.assets[0].base64);
      if (lado === 'frente') setFrente({ uri: result.assets[0].uri, base64: base64Clean });
      else setDorso({ uri: result.assets[0].uri, base64: base64Clean });
    }
  };

  const handleEnviar = async () => {
    if (!frente || !dorso) {
      Alert.alert('Atención', 'Necesitás subir ambas fotos.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/medios-de-pago`, {
        tipo: 'CHEQUE', fotoChequeFrenteBase64: frente.base64, fotoChequeDorsoBase64: dorso.base64
      });
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el cheque.');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar cheque</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.infoText}>
            Por favor, subí una foto del frente y dorso de tu cheque. Una vez enviado, un administrador verificará su validez.
          </Text>
          <View style={styles.row}>
            <ImageBox lado="frente" label="Frente" state={frente} />
            <ImageBox lado="dorso" label="Dorso" state={dorso} />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleEnviar} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Enviar cheque</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 40 : 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 30, justifyContent: 'space-between' },
  infoText: { fontSize: 14, color: '#666', marginBottom: 30, lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, height: 120 },
  imageBox: { flex: 1, backgroundColor: '#F5F8FF', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBoxText: { marginTop: 8, color: colors.primary, fontWeight: '600', fontSize: 14 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});