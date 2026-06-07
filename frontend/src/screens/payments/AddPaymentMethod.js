import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { colors } from '../../theme/colors';

export default function AddPaymentMethod({ navigation }) {
  const [banco, setBanco] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSavePayment = async () => {
    setLoading(true);
    try {
      // Endpoint que espera tu backend (revisar según el controller)
      await axios.post('http://10.0.2.2:8080/medios-de-pago', {
        tipo: 'cuenta',
        banco: banco,
        numeroCuenta: numeroCuenta
      });

      Alert.alert("¡Todo listo!", "Método de pago agregado correctamente.");
      navigation.replace('Home'); // Al Home logueado
    } catch (error) {
      Alert.alert("Error", "No pudimos guardar tu método de pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Método de Pago</Text>
      <Text style={styles.subtitle}>Agregá una cuenta para empezar a pujar.</Text>
      
      <TextInput style={styles.input} placeholder="Banco" value={banco} onChangeText={setBanco} />
      <TextInput style={styles.input} placeholder="Número de cuenta" value={numeroCuenta} onChangeText={setNumeroCuenta} keyboardType="numeric" />

      <TouchableOpacity style={styles.primaryButton} onPress={handleSavePayment}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar y Continuar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ /* Mismos estilos que CompleteRegistration */ });