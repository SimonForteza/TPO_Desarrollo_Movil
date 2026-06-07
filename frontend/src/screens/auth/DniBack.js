import React, { useState } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../api/config';
import DniUploadTemplate from '../../components/DniUploadTemplate';
import { colors } from '../../theme/colors';

export default function DniBack({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const { userData } = route.params;

  const handleFinalSubmit = async (fotoDorsoBase64) => {
    
    // Función blindada: borra TODO lo que no sea estrictamente un caracter Base64 válido
    const cleanBase64 = (str) => {
      if (!str) return "";
      let cleaned = str.includes(',') ? str.split(',')[1] : str;
      return cleaned.replace(/[^A-Za-z0-9+/=]/g, ""); 
    };

    const payload = {
      ...userData,
      fotoDniFrente: cleanBase64(userData.fotoDniFrente),
      fotoDniDorso: cleanBase64(fotoDorsoBase64)
    };

    setLoading(true);

    try {
      // Usamos 10.0.2.2 para el Emulador de Android
      const response = await axios.post(`${API_URL}/auth/registro`, payload);
      
      console.log("Respuesta del backend:", response.data);
      navigation.replace('VerificationPending', { usuarioId: response.data.data.usuarioId });

    } catch (error) {
      console.error("Error al registrar:", error);
      Alert.alert(
        "Error", 
        "No se pudo completar el registro. Revisá que el servidor esté encendido y que el Base64 no sea muy pesado."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <DniUploadTemplate 
      step="2" 
      buttonText="Enviar y Finalizar" 
      onNext={handleFinalSubmit} 
    />
  );
}