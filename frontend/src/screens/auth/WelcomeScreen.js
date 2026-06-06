import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { colors } from '../../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Bienvenido a SubastaPro</Text>
      <View style={styles.buttonContainer}>
        <Button title="Iniciar Sesión" color={colors.primary} onPress={() => navigation.navigate('Login')} />
        <View style={{ height: 15 }} />
        <Button title="Crear Cuenta" color={colors.secondary} onPress={() => navigation.navigate('RegisterStep1')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 20 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 40 },
  buttonContainer: { width: '100%', paddingHorizontal: 20 }
});