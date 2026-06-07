import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Platform, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../api/config';
import { colors } from '../../theme/colors';
import { getPendingRegistration } from '../../api/session';

export default function HomeScreen({ navigation }) {
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubastas = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/subastas`); // Asegurate que esta ruta exista en tu SubastaController
      setSubastas(response.data.data || []);
    } catch (error) {
      console.error("Error cargando subastas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubastas();
  }, [fetchSubastas]);

  const renderSubastaItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('SubastaDetail', { id: item.id })} // Requiere crear esta pantalla
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardCategory}>{item.categoria}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>${item.precioBase}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={subastas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSubastaItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSubastas} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.brand}>Subastas Activas</Text>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput style={styles.searchInput} placeholder="Buscar..." />
            </View>
          </>
        }
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color={colors.primary} /> : <Text style={styles.emptyText}>No hay subastas disponibles</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20 },
  brand: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  searchContainer: { flexDirection: 'row', backgroundColor: '#F3F3F3', marginHorizontal: 20, borderRadius: 12, padding: 15, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EEE' },
  imagePlaceholder: { width: 90, height: 90, backgroundColor: '#F3F3F3', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardDetails: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  cardCategory: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  priceValue: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.textSecondary }
});