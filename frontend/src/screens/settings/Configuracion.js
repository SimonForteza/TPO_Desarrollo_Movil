import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function Configuracion({ navigation }) {
  const Item = ({ label, target }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(target)}>
      <Text style={styles.menuItemText}>{label}</Text>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={18} color={colors.surface} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Item label="Cuenta y Seguridad" target="CuentaSeguridad" />
      <Item label="Notificaciones" target="Notificaciones" />
      <Item label="Preferencias" target="Preferencias" />
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
});
