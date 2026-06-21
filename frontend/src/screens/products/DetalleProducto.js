import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getBienDetalle } from '../../api/bienes';
import { colors } from '../../theme/colors';

const ESTADO_INFO = {
  pendiente_revision: { label: 'En Revisión', color: colors.warning },
  aprobado: { label: 'Aprobado', color: colors.success },
  rechazado: { label: 'Rechazado', color: colors.danger },
  asignado: { label: 'En Subasta', color: colors.info },
  vendido: { label: 'Vendido', color: colors.info },
  devuelto: { label: 'Devuelto', color: colors.textSecondary },
};

function estadoInfo(estado) {
  return ESTADO_INFO[estado] || { label: estado || '—', color: colors.textSecondary };
}

function formatMoneda(valor) {
  if (valor === null || valor === undefined) return null;
  const num = Number(valor);
  if (Number.isNaN(num)) return String(valor);
  return `$${num.toLocaleString('es-AR')}`;
}

export default function DetalleProducto({ route }) {
  const { id } = route.params || {};
  const [bien, setBien] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getBienDetalle(id);
        setBien(data);
      } catch (error) {
        console.error('Error al cargar detalle del bien:', error);
        Alert.alert('Error', 'No se pudo cargar el detalle del producto.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!bien) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>No se encontró el producto.</Text>
      </SafeAreaView>
    );
  }

  const info = estadoInfo(bien.estado);
  const fotos = bien.fotosBase64 || [];
  const precio = formatMoneda(bien.precioBasePropuesto);
  const comision = formatMoneda(bien.comisionPropuesta);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Galería de imágenes */}
        {fotos.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {fotos.map((f, i) => (
              <Image
                key={i}
                source={{ uri: `data:image/jpeg;base64,${f}` }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.galleryImage, styles.galleryPlaceholder]}>
            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{bien.descripcionCatalogo || 'Producto'}</Text>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: info.color }]} />
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
          </View>

          {bien.descripcionCompleta ? (
            <Text style={styles.descripcion}>{bien.descripcionCompleta}</Text>
          ) : null}

          {/* Rechazado: motivo destacado */}
          {bien.estado === 'rechazado' && bien.motivoRechazo ? (
            <View style={[styles.alertBox, { borderColor: colors.danger }]}>
              <Text style={[styles.alertTitle, { color: colors.danger }]}>Motivo del rechazo</Text>
              <Text style={styles.alertText}>{bien.motivoRechazo}</Text>
            </View>
          ) : null}

          {/* Datos económicos / ubicación */}
          {(precio || comision || bien.ubicacionDeposito) ? (
            <View style={styles.section}>
              {precio && <Row label="Precio base propuesto" value={precio} />}
              {comision && <Row label="Comisión propuesta" value={comision} />}
              {bien.ubicacionDeposito && <Row label="Ubicación de depósito" value={bien.ubicacionDeposito} />}
            </View>
          ) : null}

          {/* Subasta asignada */}
          {bien.subastaId ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subasta asignada</Text>
              {bien.subastaAsignada ? (
                <>
                  <Row label="Subasta" value={`#${bien.subastaAsignada.id}`} />
                  {bien.subastaAsignada.fecha && <Row label="Fecha" value={bien.subastaAsignada.fecha} />}
                  {bien.subastaAsignada.estado && <Row label="Estado" value={bien.subastaAsignada.estado} />}
                  {bien.subastaAsignada.ubicacion && <Row label="Ubicación" value={bien.subastaAsignada.ubicacion} />}
                </>
              ) : (
                <Row label="Subasta" value={`#${bien.subastaId}`} />
              )}
            </View>
          ) : null}

          {/* Seguro / póliza */}
          {bien.seguro ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seguro / Póliza</Text>
              <Row label="Póliza" value={bien.seguro.nroPoliza} />
              {bien.seguro.compania && <Row label="Compañía" value={bien.seguro.compania} />}
              {bien.seguro.importe != null && <Row label="Importe" value={formatMoneda(bien.seguro.importe)} />}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },

  gallery: { height: 240 },
  galleryImage: { width: 390, height: 240, resizeMode: 'cover', backgroundColor: '#F2F2F2' },
  galleryPlaceholder: { justifyContent: 'center', alignItems: 'center', width: '100%' },

  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  badgeDot: { width: 9, height: 9, borderRadius: 5, marginRight: 6 },
  badgeText: { fontSize: 14, fontWeight: '600' },
  descripcion: { fontSize: 14, color: colors.textPrimary, lineHeight: 21, marginBottom: 16 },

  alertBox: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 16, backgroundColor: '#FFF5F5' },
  alertTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  alertText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

  section: { marginTop: 8, marginBottom: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },
});
