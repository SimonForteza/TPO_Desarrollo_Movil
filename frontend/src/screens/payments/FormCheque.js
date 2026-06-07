import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
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
    if (!frente || !dorso) {
      Alert.alert('Atención', 'Necesitás subir ambas fotos del cheque.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/medios-de-pago`, {
        tipo: 'CHEQUE', 
        fotoChequeFrenteBase64: frente.base64, 
        fotoChequeDorsoBase64: dorso.base64
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
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar cheque</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  infoText: { fontSize: 15, color: colors.textSecondary, marginBottom: 30, lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, height: 140 },
  imageBox: { 
    flex: 1, 
    backgroundColor: '#F3F3F3', 
    borderWidth: 2, 
    borderColor: colors.primary, 
    borderStyle: 'dashed', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden' 
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBoxText: { marginTop: 8, color: colors.primary, fontWeight: '600', fontSize: 14 },
  primaryButton: { 
    backgroundColor: colors.primary, 
    borderRadius: 8, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});