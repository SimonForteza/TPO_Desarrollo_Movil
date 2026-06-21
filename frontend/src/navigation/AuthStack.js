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
import HomeScreen from '../screens/home/HomeScreen';
import CompleteRegistration from '../screens/auth/CompleteRegistration';
import RegistroCompleto from '../screens/auth/RegistroCompleto';
import RecuperarPassword from '../screens/auth/RecuperarPassword';
import LinkEnviado from '../screens/auth/LinkEnviado';
import ResetPassword from '../screens/auth/ResetPassword';
import AddPaymentMethod from '../screens/payments/AddPaymentMethod';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FormCuentaBancaria from '../screens/payments/FormCuentaBancaria';
import FormTarjetaCredito from '../screens/payments/FormTarjetaCredito';
import FormCheque from '../screens/payments/FormCheque';
import SubastaDetalle from '../screens/subastas/SubastaDetalle';

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
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="CompleteRegistration"
        component={CompleteRegistration}
        options={{ title: 'Crear Contraseña', headerBackVisible: false }}
      />
      <Stack.Screen
        name="RegistroCompleto"
        component={RegistroCompleto}
        options={{ headerShown: false }}
      />

      {/* --- FLUJO DE RECUPERACIÓN DE CONTRASEÑA --- */}
      <Stack.Screen
        name="RecuperarPassword"
        component={RecuperarPassword}
        options={{ title: 'Recuperar Contraseña' }}
      />
      <Stack.Screen
        name="LinkEnviado"
        component={LinkEnviado}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ title: 'Nueva Contraseña', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPaymentMethod"
        component={AddPaymentMethod}
        options={{ title: 'Medios de pago' }}
      />
      <Stack.Screen 
        name="FormCuentaBancaria" 
        component={FormCuentaBancaria} 
        options={{ title: 'Agregar cuenta bancaria' }} 
      />
      <Stack.Screen 
        name="FormTarjetaCredito" 
        component={FormTarjetaCredito} 
        options={{ title: 'Agregar tarjeta' }} 
      />
      <Stack.Screen
        name="FormCheque"
        component={FormCheque}
        options={{ title: 'Agregar cheque' }}
      />
      <Stack.Screen
        name="SubastaDetalle"
        component={SubastaDetalle}
        options={{ title: 'Detalle de Subasta' }}
      />
    </Stack.Navigator>
  );
}