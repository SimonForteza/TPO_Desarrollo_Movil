import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Image 
} from 'react-native';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Acá más adelante conectaremos con AuthService.java
    console.log("Intentando login con:", email, password);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Bienvenido a SubastaPro</Text>

        {/* Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Usuario, email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});