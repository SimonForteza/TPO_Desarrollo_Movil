import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import api from '../../api/axiosConfig';
import { colors } from '../../theme/colors';

export default function SubastaDetalle({ route, navigation }) {
  const { subastaId } = route.params;
  const [subasta, setSubasta] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [detRes, catRes] = await Promise.all([
          api.get(`/subastas/${subastaId}`),
          api.get(`/subastas/${subastaId}/catalogo`),
        ]);
        setSubasta(detRes.data.data);
        setCatalogo(catRes.data.data?.content ?? []);
      } catch (error) {
        console.error('Error al cargar subasta:', error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [subastaId]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!subasta) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>No se pudo cargar la subasta.</Text>
      </SafeAreaView>
    );
  }

  const abierta = subasta.estado?.toLowerCase() === 'abierta';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <Ionicons name="hammer-outline" size={60} color={colors.textSecondary} />
          <View style={[styles.estadoBadge, { backgroundColor: abierta ? '#10B981' : '#6B7280' }]}>
            <Text style={styles.estadoBadgeText}>{subasta.estado?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Info general */}
          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagText}>{subasta.categoria?.toUpperCase()}</Text></View>
            <View style={[styles.tag, styles.tagMoneda]}><Text style={styles.tagText}>{subasta.moneda}</Text></View>
          </View>

          <Text style={styles.titulo}>{subasta.ubicacion ?? 'Sede Central'}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formatearFecha(subasta.fecha)} · {subasta.hora?.substring(0, 5)} hs</Text>
          </View>

          {subasta.subastador && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>Subastador: {subasta.subastador.nombre} — {subasta.subastador.region}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Capacidad: {subasta.capacidadAsistentes ?? '—'} asistentes</Text>
          </View>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Ionicons name={subasta.tieneDeposito === 'si' ? 'checkmark-circle' : 'close-circle'} size={14} color={subasta.tieneDeposito === 'si' ? '#10B981' : '#EF4444'} />
              <Text style={styles.pillText}>Depósito propio</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name={subasta.seguridadPropia === 'si' ? 'checkmark-circle' : 'close-circle'} size={14} color={subasta.seguridadPropia === 'si' ? '#10B981' : '#EF4444'} />
              <Text style={styles.pillText}>Seguridad propia</Text>
            </View>
          </View>

          {/* Catálogo */}
          <Text style={styles.seccionTitulo}>Catálogo ({catalogo.length} ítems)</Text>

          {catalogo.length === 0 ? (
            <Text style={styles.emptyText}>Sin ítems publicados aún.</Text>
          ) : (
            catalogo.map((item) => (
              <View key={item.identificador} style={styles.itemCard}>
                <View style={styles.itemIconBox}>
                  <Ionicons name="cube-outline" size={28} color={colors.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.producto?.descripcionCatalogo ?? 'Sin descripción'}
                  </Text>
                  {item.precioBase != null && (
                    <Text style={styles.itemPrecio}>Base: ${item.precioBase.toLocaleString()}</Text>
                  )}
                </View>
                <View style={[styles.subastadoBadge, { backgroundColor: item.subastado === 'si' ? '#EF4444' : '#10B981' }]}>
                  <Text style={styles.subastadoText}>{item.subastado === 'si' ? 'Vendido' : 'Disponible'}</Text>
                </View>
              </View>
            ))
          )}

          {/* Botón inscribirse */}
          {abierta && (
            <TouchableOpacity
              style={styles.inscribirseBtn}
              onPress={() => navigation.navigate('Inscripcion', { subastaId: subasta.identificador, moneda: subasta.moneda })}
            >
              <Text style={styles.inscribirseBtnText}>Inscribirme a esta subasta</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  scroll: { paddingBottom: 40 },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },

  hero: { width: '100%', height: 180, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  estadoBadge: { position: 'absolute', top: 14, left: 14, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  estadoBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  body: { padding: 20 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tag: { backgroundColor: '#FFF0E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagMoneda: { backgroundColor: '#E8F0FE' },
  tagText: { fontSize: 11, fontWeight: 'bold', color: colors.textSecondary },

  titulo: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 14, color: colors.textSecondary },

  pillRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 24 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillText: { fontSize: 13, color: colors.textSecondary },

  seccionTitulo: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 20 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', paddingVertical: 20 },

  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 1, borderColor: '#EEEEEE', padding: 14, marginBottom: 12, gap: 12 },
  itemIconBox: { width: 48, height: 48, backgroundColor: '#EEF2FF', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemDesc: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  itemPrecio: { fontSize: 13, color: colors.primary, fontWeight: 'bold', marginTop: 3 },
  subastadoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  subastadoText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  inscribirseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 12, padding: 16, marginTop: 24, gap: 8 },
  inscribirseBtnText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
});
