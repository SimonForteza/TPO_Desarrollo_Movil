import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../api/axiosConfig';
import { colors } from '../../theme/colors';

export default function AddPaymentMethod({ navigation }) {
  const [medios, setMedios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medios-pago');
      const data = response.data?.data?.content || [];
      setMedios(data);
    } catch (error) {
      console.error("Error al cargar medios de pago:", error);
      if (error.response?.status === 401) {
        Alert.alert("Sesión expirada", "Por favor, volvé a iniciar sesión.");
        navigation.replace('Welcome');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id) => {
    Alert.alert(
      "Eliminar medio",
      "¿Estás seguro de que querés eliminar este medio de pago?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/medios-pago/${id}`);
              fetchMedios(); // Recargamos la lista tras eliminar
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el medio de pago.");
            }
          } 
        }
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchMedios);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.tipo === 'tarjeta' ? 'card-outline' : 'document-text-outline'} 
            size={24} 
            color={colors.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.tipo.toUpperCase()}</Text>
          <Text style={styles.cardSubtitle}>{item.datosEnmascarados}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.moneda}</Text>
        </View>
        <TouchableOpacity onPress={() => handleEliminar(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={medios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No tenés medios de pago asociados.</Text>}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            Alert.alert('Nuevo Medio', 'Elegí el tipo de medio a agregar:', [
              { text: 'Tarjeta', onPress: () => navigation.navigate('FormTarjetaCredito') },
              { text: 'Cuenta Bancaria', onPress: () => navigation.navigate('FormCuentaBancaria') },
              { text: 'Cheque', onPress: () => navigation.navigate('FormCheque') },
              { text: 'Cancelar', style: 'cancel' }
            ]);
          }}
        >
          <Text style={styles.addButtonText}>+ Agregar nuevo medio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20 },
  card: { 
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#EAEAEA', elevation: 2 
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { backgroundColor: '#F5F8FF', padding: 10, borderRadius: 10 },
  textContainer: { marginLeft: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: colors.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
  deleteButton: { padding: 8 },
  footer: { padding: 20 },
  addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 }
});