import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearTokens, clearUserData, getUserData } from '../../api/session';
import { getParticipaciones } from '../../api/me';
import { colors } from '../../theme/colors';
import BottomNavBar from '../../components/BottomNavBar';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(getUserData());
  const [stats, setStats] = useState({ participadas: 0, ganadas: 0, gastado: 0 });

  useFocusEffect(
    useCallback(() => {
      setUser(getUserData());
      const u = getUserData();
      if (u) {
        getParticipaciones('todas').then((d) => setStats(d.stats)).catch(() => {});
      }
    }, [])
  );

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          clearUserData();
          navigation.replace('Home');
        },
      },
    ]);
  };

  // Vista invitado
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={48} color={colors.surface} />
          </View>
          <Text style={styles.guestTitle}>Invitado</Text>
          <Text style={styles.guestSubtitle}>
            Iniciá sesión para acceder a tu perfil, historial de participaciones, medios de pago y más.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('RegisterStep1')}>
            <Text style={styles.registerBtnText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
        <BottomNavBar navigation={navigation} active="perfil" />
      </SafeAreaView>
    );
  }

  const nombre = user?.nombre ?? '';
  const apellido = user?.apellido ?? '';
  const email = user?.email ?? '';
  const categoria = user?.categoria ?? '';
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  const MenuItem = ({ icon, label, onPress, destructive }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color={destructive ? '#EF4444' : colors.primary} />
        <Text style={[styles.menuItemText, destructive && { color: '#EF4444' }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales || '?'}</Text>
          </View>
          <Text style={styles.nombre}>{`${nombre} ${apellido}`.trim() || 'Usuario'}</Text>
          <Text style={styles.email}>{email}</Text>
          {!!categoria && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoria.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          {[
            [stats.participadas, 'Subastas'],
            [stats.ganadas, 'Ganadas'],
            [`$ ${Number(stats.gastado ?? 0).toLocaleString('es-AR')}`, 'Gastado'],
          ].map(([val, label]) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statValue}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Gestión de la Cuenta</Text>
          <MenuItem icon="notifications-outline" label="Notificaciones" onPress={() => navigation.navigate('NotificacionesInbox')} />
          <MenuItem icon="card-outline" label="Medios de Pago" onPress={() => navigation.navigate('AddPaymentMethod')} />
          <MenuItem icon="wallet-outline" label="Cuentas de Cobro" onPress={() => navigation.navigate('MisCuentasCobro')} />
          <MenuItem icon="time-outline" label="Historial de Participaciones" onPress={() => navigation.navigate('MiHistorial')} />
          <MenuItem icon="settings-outline" label="Configuración" onPress={() => navigation.navigate('Configuracion')} />
          <MenuItem icon="log-out-outline" label="Cerrar Sesión" onPress={handleCerrarSesion} destructive />
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} active="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  header: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  scroll: { paddingBottom: 100 },

  // Vista invitado
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  guestTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16, marginBottom: 10 },
  guestSubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  loginBtnText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  registerBtn: { width: '100%', borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  registerBtnText: { color: colors.primary, fontSize: 16, fontWeight: '600' },

  // Vista usuario logueado
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: colors.surface, fontSize: 36, fontWeight: 'bold' },
  nombre: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  badge: { marginTop: 10, backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  badgeText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 30 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  sectionContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 16, marginLeft: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
});
