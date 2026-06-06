import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterStep1 from '../screens/auth/RegisterStep1';
import DniFront from '../screens/auth/DniFront';
import DniBack from '../screens/auth/DniBack';
import VerificationPending from '../screens/auth/VerificationPending';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary }, // Barra azul
        headerTintColor: colors.surface,                  // Texto blanco
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }} 
      />
      
      {/* --- FLUJO DE REGISTRO --- */}
      <Stack.Screen 
        name="RegisterStep1" 
        component={RegisterStep1} 
        options={{ title: 'Datos Personales' }} 
      />
      <Stack.Screen 
        name="DniFront" 
        component={DniFront} 
        options={{ title: 'DNI Frente' }} 
      />
      <Stack.Screen 
        name="DniBack" 
        component={DniBack} 
        options={{ title: 'DNI Dorso' }} 
      />
      <Stack.Screen 
        name="VerificationPending" 
        component={VerificationPending} 
        options={{ headerShown: false }} // Acá ocultamos la barra porque es una pantalla final
      />
    </Stack.Navigator>
  );
}