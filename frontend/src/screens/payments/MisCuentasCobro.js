import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listarCuentas } from '../../api/cuentasCobro';
import { colors } from '../../theme/colors';

export default function MisCuentasCobro({ navigation }) {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCuentas = async () => {
    try {
      const data = await listarCuentas();
      setCuentas(data);
    } catch (error) {
      if (error.response?.status === 401) {
        Alert.alert('Sesión expirada', 'Por favor, volvé a iniciar sesión.');
        navigation.replace('Welcome');
      } else {
        Alert.alert('Error', 'No se pudieron cargar las cuentas de cobro.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCuentas);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCuentas();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.banco}</Text>
        <Text style={styles.cardSubtitle}>{item.numeroCuenta}</Text>
        <Text style={styles.cardCountry}>{item.pais}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={cuentas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 15 }} />
              <Text style={styles.emptyTitle}>Sin cuentas de cobro</Text>
              <Text style={styles.emptySubtitle}>
                Necesitás declarar al menos una cuenta de cobro para poder consignar tus bienes.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('FormCuentaCobro')}>
          <Text style={styles.addButtonText}>+ Agregar cuenta</Text>
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
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#EAEAEA', elevation: 2,
  },
  iconContainer: { backgroundColor: '#F5F8FF', padding: 10, borderRadius: 10 },
  textContainer: { marginLeft: 12, flex: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  cardCountry: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  footer: { padding: 20 },
  addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
});
