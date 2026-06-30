import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getItemCatalogo } from '../../api/subastas';
import { colors } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

function formatMoneda(valor) {
  if (valor == null) return '-';
  const num = Number(valor);
  return Number.isNaN(num) ? String(valor) : `$${num.toLocaleString('es-AR')}`;
}

export default function DetalleLote({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { subastaId, itemId, moneda, categoria, medioPagoId } = route.params || {};

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoIdx, setFotoIdx] = useState(0);

  useEffect(() => {
    getItemCatalogo(subastaId, itemId)
      .then(setItem)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el lote.'))
      .finally(() => setLoading(false));
  }, [subastaId, itemId]);

  const irASala = () => {
    navigation.navigate('PujasEnVivo', {
      subastaId,
      medioPagoId,
      moneda,
      categoria,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header navigation={navigation} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header navigation={navigation} />
        <Text style={styles.errorText}>No se encontró el lote.</Text>
      </SafeAreaView>
    );
  }

  const fotos = item.producto?.fotosBase64 ?? [];
  const vendido = item.subastado === 'si';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Galería de fotos */}
        {fotos.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                setFotoIdx(idx);
              }}
            >
              {fotos.map((b64, i) => (
                <Image
                  key={i}
                  source={{ uri: `data:image/jpeg;base64,${b64}` }}
                  style={styles.foto}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {fotos.length > 1 && (
              <View style={styles.dotRow}>
                {fotos.map((_, i) => (
                  <View key={i} style={[styles.dot, i === fotoIdx && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.fotoPlaceholderText}>Sin fotos disponibles</Text>
          </View>
        )}

        <View style={styles.body}>
          {vendido && (
            <View style={styles.vendidoBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.surface} />
              <Text style={styles.vendidoText}>Vendido</Text>
            </View>
          )}

          <Text style={styles.descripcion}>
            {item.producto?.descripcionCatalogo || 'Sin descripción'}
          </Text>

          <View style={styles.preciosRow}>
            <View style={styles.precioCard}>
              <Text style={styles.precioLabel}>Precio base</Text>
              <Text style={styles.precioValor}>{formatMoneda(item.precioBase)}</Text>
              {moneda && <Text style={styles.monedaTag}>{moneda}</Text>}
            </View>
            <View style={styles.precioCard}>
              <Text style={styles.precioLabel}>Comisión</Text>
              <Text style={styles.precioValor}>{formatMoneda(item.comision)}</Text>
            </View>
          </View>

          {item.producto?.descripcionCompletaUrl ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.producto.descripcionCompletaUrl}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {!vendido && (
        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <TouchableOpacity style={styles.salaBtn} onPress={irASala}>
            <Ionicons name="hammer-outline" size={18} color={colors.surface} />
            <Text style={styles.salaBtnText}>Ir a sala de pujas</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detalle del lote</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },

  scroll: { paddingBottom: 90 },

  foto: { width: SCREEN_W, height: 260 },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DDD' },
  dotActive: { backgroundColor: colors.primary, width: 18 },
  fotoPlaceholder: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F2', gap: 8 },
  fotoPlaceholderText: { color: colors.textSecondary, fontSize: 14 },

  body: { padding: 20 },
  vendidoBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 12 },
  vendidoText: { color: colors.surface, fontWeight: 'bold', fontSize: 12 },
  descripcion: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, lineHeight: 26, marginBottom: 20 },

  preciosRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  precioCard: { flex: 1, backgroundColor: '#F7F9FC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E8EEF5' },
  precioLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  precioValor: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  monedaTag: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: colors.surface },
  salaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 12, padding: 16 },
  salaBtnText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
