import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearTokens, clearUserData, getUserData } from '../../api/session';
import { colors } from '../../theme/colors';
import BottomNavBar from '../../components/BottomNavBar';

export default function ProfileScreen({ navigation }) {
  const user = getUserData();
  const nombre = user?.nombre ?? '';
  const apellido = user?.apellido ?? '';
  const email = user?.email ?? '';
  const categoria = user?.categoria ?? '';
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          clearTokens();
          clearUserData();
          navigation.replace('Welcome');
        },
      },
    ]);
  };

  const proximamente = (titulo) =>
    Alert.alert(titulo, 'Esta funcionalidad estará disponible próximamente.');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + datos */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales || '?'}</Text>
          </View>
          <Text style={styles.nombre}>{`${nombre} ${apellido}`.trim() || 'Usuario'}</Text>
          <Text style={styles.email}>{email}</Text>
          {!!categoria && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoria}</Text>
            </View>
          )}
        </View>

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          {[['0', 'Participaciones'], ['0', 'Ganadas'], ['0', 'Vendidas']].map(([val, label]) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statValue}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Gestión de la cuenta */}
        <Text style={styles.sectionTitle}>Gestión de la Cuenta</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AddPaymentMethod')}>
          <Text style={styles.menuItemText}>Medios de Pago</Text>
          <View style={styles.menuArrow}>
            <Ionicons name="chevron-forward" size={16} color={colors.surface} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => proximamente('Historial de Participaciones')}>
          <Text style={styles.menuItemText}>Historial de Participaciones</Text>
          <View style={styles.menuArrow}>
            <Ionicons name="chevron-forward" size={16} color={colors.surface} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => proximamente('Configuración')}>
          <Text style={styles.menuItemText}>Configuración</Text>
          <View style={styles.menuArrow}>
            <Ionicons name="chevron-forward" size={16} color={colors.surface} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleCerrarSesion}>
          <Text style={styles.menuItemText}>Cerrar Sesión</Text>
          <View style={styles.menuArrow}>
            <Ionicons name="chevron-forward" size={16} color={colors.surface} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} active="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: { paddingBottom: 85 },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { color: colors.surface, fontSize: 32, fontWeight: 'bold' },
  nombre: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  badge: {
    marginTop: 8,
    backgroundColor: '#E8F0FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    padding: 16,
  },
  menuItemText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
  menuArrow: {
    backgroundColor: colors.secondary,
    borderRadius: 6,
    padding: 4,
  },
});
