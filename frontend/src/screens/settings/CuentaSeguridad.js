import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getUserData } from '../../api/session';
import { colors } from '../../theme/colors';

export default function CuentaSeguridad({ navigation }) {
  const user = getUserData();
  const verificado = user?.estadoKyc === 'activo';

  const MenuItem = ({ label, target }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(target)}>
      <Text style={styles.menuItemText}>{label}</Text>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={18} color={colors.surface} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MenuItem label="Editar Perfil" target="EditarPerfil" />
      <MenuItem label="Cambiar Contraseña" target="CambiarPassword" />

      <View style={styles.statusItem}>
        <Text style={styles.menuItemText}>Estado de Validación</Text>
        <View style={[styles.badge, verificado ? styles.badgeOk : styles.badgePending]}>
          <Text style={styles.badgeText}>{verificado ? 'Verificado' : 'Pendiente'}</Text>
          <Ionicons
            name={verificado ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={colors.surface}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 30 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItemText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  arrowContainer: { backgroundColor: colors.primary, borderRadius: 8, padding: 6 },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeOk: { backgroundColor: '#22A06B' },
  badgePending: { backgroundColor: colors.secondary },
  badgeText: { color: colors.surface, fontWeight: '700', fontSize: 13 },
});
