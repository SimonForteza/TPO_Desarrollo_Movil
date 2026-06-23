import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from '../../api/notificaciones';
import { colors } from '../../theme/colors';

const TIPO_CONFIG = {
  KYC_APROBADO:   { icon: 'checkmark-circle',    color: colors.success },
  LOTE_GANADO:    { icon: 'trophy',               color: colors.secondary },
  PUJA_SUPERADA:  { icon: 'trending-up',          color: colors.warning },
  MULTA_GENERADA: { icon: 'warning',              color: colors.danger },
  MULTA_JUDICIAL: { icon: 'hammer',               color: colors.danger },
  BIEN_ACEPTADO:  { icon: 'checkmark-done-circle',color: colors.success },
  BIEN_RECHAZADO: { icon: 'close-circle',         color: colors.danger },
};

function iconForTipo(tipo) {
  return TIPO_CONFIG[tipo] ?? { icon: 'notifications', color: colors.primary };
}

function formatFecha(fechaStr) {
  const d = new Date(fechaStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export default function NotificacionesInbox({ navigation }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificaciones();
      setNotificaciones(data?.content ?? []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(cargar);

  const handleMarcarLeida = async (id) => {
    try {
      await marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch {
      // silencioso — la lista se refresca en el próximo foco
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar las notificaciones.');
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const renderItem = ({ item }) => {
    const { icon, color } = iconForTipo(item.tipo);
    return (
      <TouchableOpacity
        style={[styles.item, !item.leida && styles.itemNoLeido]}
        onPress={() => handleMarcarLeida(item.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.itemBody}>
          <View style={styles.itemHeader}>
            <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
            <Text style={styles.fecha}>{formatFecha(item.fecha)}</Text>
          </View>
          <Text style={styles.mensaje} numberOfLines={3}>{item.mensaje}</Text>
        </View>
        {!item.leida && <View style={styles.puntoBadge} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {noLeidas > 0 && (
        <TouchableOpacity style={styles.marcarTodasBtn} onPress={handleMarcarTodas}>
          <Text style={styles.marcarTodasText}>Marcar todas como leídas</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notificaciones}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onRefresh={cargar}
        refreshing={loading}
        contentContainerStyle={notificaciones.length === 0 ? styles.emptyContainer : styles.lista}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No tenés notificaciones</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  lista: { padding: 16, paddingBottom: 32 },
  emptyContainer: { flexGrow: 1 },

  marcarTodasBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'flex-end',
  },
  marcarTodasText: { color: colors.primary, fontSize: 14, fontWeight: '600' },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemNoLeido: {
    borderColor: colors.primary + '40',
    backgroundColor: '#EFF6FF',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  itemBody: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 8 },
  fecha: { fontSize: 11, color: colors.textSecondary, flexShrink: 0 },
  mensaje: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  puntoBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
    marginTop: 4,
    flexShrink: 0,
  },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyText: { fontSize: 15, color: colors.textSecondary, marginTop: 12 },
});
