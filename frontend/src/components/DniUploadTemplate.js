import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';

export default function DniUploadTemplate({ step, buttonText, onNext }) {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.2, // Máxima compresión para evitar el error 500
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Guardamos el string puro, sin el prefijo de data:image
      setImageBase64(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, 
      quality: 0.2, // Máxima compresión para evitar el error 500
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Guardamos el string puro, sin el prefijo de data:image
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleNext = () => {
    if (!imageBase64) {
      Alert.alert("Foto requerida", "Tenés que subir o tomar una imagen para continuar.");
      return;
    }
    onNext(imageBase64);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Paso {step} de 2</Text>
      <Text style={styles.title}>Subí tu DNI o pasaporte</Text>
      <Text style={styles.subtitle}>Asegurate de que tus datos se lean bien, sin reflejos ni sombras.</Text>

      {imageUri ? (
        <TouchableOpacity style={styles.uploadBox} onPress={() => setImageUri(null)}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Text style={styles.retakeText}>Tocar para cambiar foto</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.uploadBox, { flex: 1, marginRight: 10 }]} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={40} color={colors.primary} />
            <Text style={styles.uploadText}>Usar Cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.uploadBox, { flex: 1, marginLeft: 10 }]} onPress={pickFromGallery}>
            <Ionicons name="images-outline" size={40} color={colors.primary} />
            <Text style={styles.uploadText}>Abrir Galería</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  stepText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 30, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', height: 180 },
  uploadBox: { borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F8FF', overflow: 'hidden' },
  uploadText: { marginTop: 12, fontSize: 14, color: colors.primary, fontWeight: '600', textAlign: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  retakeText: { backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: 8, borderRadius: 8, fontWeight: 'bold', zIndex: 10 },
  spacer: { flex: 1 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' }
});