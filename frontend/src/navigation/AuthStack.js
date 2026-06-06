import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Splash">
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
    </Stack.Navigator>
  );
}