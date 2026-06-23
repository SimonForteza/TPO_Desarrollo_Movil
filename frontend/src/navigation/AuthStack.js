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
import MisCuentasCobro from '../screens/payments/MisCuentasCobro';
import FormCuentaCobro from '../screens/payments/FormCuentaCobro';
import Configuracion from '../screens/settings/Configuracion';
import CuentaSeguridad from '../screens/settings/CuentaSeguridad';
import EditarPerfil from '../screens/settings/EditarPerfil';
import CambiarPassword from '../screens/settings/CambiarPassword';
import Notificaciones from '../screens/settings/Notificaciones';
import NotificacionesInbox from '../screens/settings/NotificacionesInbox';
import Preferencias from '../screens/settings/Preferencias';
import MisProductos from '../screens/products/MisProductos';
import DetalleProducto from '../screens/products/DetalleProducto';
import SolicitarSubastaInfo from '../screens/products/SolicitarSubastaInfo';
import SolicitarSubastaForm from '../screens/products/SolicitarSubastaForm';
import DetalleSubasta from '../screens/subastas/DetalleSubasta';
import DetalleLote from '../screens/subastas/DetalleLote';
import PujasEnVivo from '../screens/subastas/PujasEnVivo';
import MiHistorial from '../screens/profile/MiHistorial';
import ResumenCompra from '../screens/subastas/ResumenCompra';
import PagoCompra from '../screens/subastas/PagoCompra';
import FacturaCompra from '../screens/subastas/FacturaCompra';
import AccesoRestringido from '../screens/subastas/AccesoRestringido';
import DetalleMulta from '../screens/subastas/DetalleMulta';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />

      {/* --- FLUJO DE REGISTRO --- */}
      <Stack.Screen name="RegisterStep1" component={RegisterStep1} options={{ title: 'Datos Personales' }} />
      <Stack.Screen name="DniFront" component={DniFront} options={{ title: 'DNI Frente' }} />
      <Stack.Screen name="DniBack" component={DniBack} options={{ title: 'DNI Dorso' }} />
      <Stack.Screen name="VerificationPending" component={VerificationPending} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CompleteRegistration" component={CompleteRegistration} options={{ title: 'Crear Contraseña', headerBackVisible: false }} />
      <Stack.Screen name="RegistroCompleto" component={RegistroCompleto} options={{ headerShown: false }} />

      {/* --- FLUJO DE RECUPERACIÓN DE CONTRASEÑA --- */}
      <Stack.Screen name="RecuperarPassword" component={RecuperarPassword} options={{ title: 'Recuperar Contraseña' }} />
      <Stack.Screen name="LinkEnviado" component={LinkEnviado} options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: 'Nueva Contraseña', headerBackVisible: false }} />

      {/* --- PERFIL --- */}
      <Stack.Screen name="Perfil" component={ProfileScreen} options={{ headerShown: false }} />

      {/* --- MEDIOS DE PAGO --- */}
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethod} options={{ title: 'Medios de pago' }} />
      <Stack.Screen name="FormCuentaBancaria" component={FormCuentaBancaria} options={{ title: 'Agregar cuenta bancaria' }} />
      <Stack.Screen name="FormTarjetaCredito" component={FormTarjetaCredito} options={{ title: 'Agregar tarjeta' }} />
      <Stack.Screen name="FormCheque" component={FormCheque} options={{ title: 'Agregar cheque' }} />
      <Stack.Screen name="MisCuentasCobro" component={MisCuentasCobro} options={{ title: 'Mis cuentas de cobro' }} />
      <Stack.Screen name="FormCuentaCobro" component={FormCuentaCobro} options={{ title: 'Agregar cuenta de cobro' }} />

      {/* --- FLUJO DE CONFIGURACIÓN --- */}
      <Stack.Screen name="Configuracion" component={Configuracion} options={{ title: 'Configuración' }} />
      <Stack.Screen name="CuentaSeguridad" component={CuentaSeguridad} options={{ title: 'Cuenta y Seguridad' }} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="CambiarPassword" component={CambiarPassword} options={{ title: 'Cambiar Contraseña' }} />
      <Stack.Screen name="Notificaciones" component={Notificaciones} options={{ title: 'Preferencias de notificaciones' }} />
      <Stack.Screen name="NotificacionesInbox" component={NotificacionesInbox} options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="Preferencias" component={Preferencias} options={{ title: 'Preferencias' }} />

      {/* --- FLUJO DE PRODUCTOS / BIENES --- */}
      <Stack.Screen name="MisProductos" component={MisProductos} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleProducto" component={DetalleProducto} options={{ headerShown: false }} />
      <Stack.Screen name="SolicitarSubastaInfo" component={SolicitarSubastaInfo} options={{ headerShown: false }} />
      <Stack.Screen
        name="SolicitarSubastaForm"
        component={SolicitarSubastaForm}
        options={{
          title: 'Solicitar Subasta',
          headerTintColor: colors.secondary,
          headerTitleStyle: { fontWeight: 'bold', color: colors.surface },
        }}
      />

      {/* --- DETALLE DE SUBASTA --- */}
      <Stack.Screen name="DetalleSubasta" component={DetalleSubasta} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleLote" component={DetalleLote} options={{ headerShown: false }} />
      <Stack.Screen name="PujasEnVivo" component={PujasEnVivo} options={{ headerShown: false }} />

      {/* --- HISTORIAL Y CICLO ECONÓMICO --- */}
      <Stack.Screen name="MiHistorial" component={MiHistorial} options={{ title: 'Mi historial' }} />
      <Stack.Screen name="ResumenCompra" component={ResumenCompra} options={{ title: 'Resumen de compra' }} />
      <Stack.Screen name="PagoCompra" component={PagoCompra} options={{ title: 'Pago' }} />
      <Stack.Screen name="FacturaCompra" component={FacturaCompra} options={{ title: 'Factura' }} />
      <Stack.Screen name="AccesoRestringido" component={AccesoRestringido} options={{ title: 'Acceso restringido' }} />
      <Stack.Screen name="DetalleMulta" component={DetalleMulta} options={{ title: 'Detalle de multa' }} />
    </Stack.Navigator>
  );
}
