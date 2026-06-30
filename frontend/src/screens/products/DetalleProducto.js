import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { aceptarCondiciones, getBienDetalle, rechazarCondiciones } from '../../api/bienes';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ESTADO_INFO = {
  pendiente_revision: { label: 'En Revisión', color: colors.warning, icon: 'time-outline' },
  aprobado:           { label: 'Aprobado',    color: colors.success, icon: 'checkmark-circle-outline' },
  rechazado:          { label: 'Rechazado',   color: colors.danger,  icon: 'close-circle-outline' },
  asignado:           { label: 'En Subasta',  color: colors.info,    icon: 'hammer-outline' },
  vendido:            { label: 'Vendido',     color: colors.info,    icon: 'bag-check-outline' },
  devuelto:           { label: 'Devuelto',    color: colors.textSecondary, icon: 'return-down-back-outline' },
};

function estadoInfo(estado) {
  return ESTADO_INFO[estado] || { label: estado || '—', color: colors.textSecondary, icon: 'ellipse-outline' };
}

function formatMoneda(valor) {
  if (valor === null || valor === undefined) return null;
  const num = Number(valor);
  return Number.isNaN(num) ? String(valor) : `$${num.toLocaleString('es-AR')}`;
}

export default function DetalleProducto({ route, navigation }) {
  const { id } = route.params || {};
  const [bien, setBien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fotoActual, setFotoActual] = useState(0);
  const scrollRef = useRef(null);

  const cargarDetalle = useCallback(() => {
    setLoading(true);
    getBienDetalle(id)
      .then(setBien)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el detalle del producto.'))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(cargarDetalle);

  const handleAceptar = async () => {
    setActionLoading(true);
    try {
      await aceptarCondiciones(id);
      Alert.alert('Condiciones aceptadas', 'Tu bien quedará asignado a una subasta.');
      cargarDetalle();
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'No se pudieron aceptar las condiciones.';
      Alert.alert('Error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = () => {
    Alert.alert(
      'Rechazar condiciones',
      'Al rechazar, se procederá a la devolución del bien con gastos a tu cargo (5% del precio base).',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await rechazarCondiciones(id);
              Alert.alert('Condiciones rechazadas', 'Se iniciará la devolución con los gastos informados.');
              cargarDetalle();
            } catch (err) {
              const msg = err?.response?.data?.message ?? 'No se pudieron rechazar las condiciones.';
              Alert.alert('Error', msg);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Header navigation={navigation} title="Detalle" />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!bien) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Header navigation={navigation} title="Detalle" />
        <Text style={styles.errorText}>No se encontró el producto.</Text>
      </SafeAreaView>
    );
  }

  const info = estadoInfo(bien.estado);
  const fotos = bien.fotosBase64 || [];
  const precio = formatMoneda(bien.precioBasePropuesto);
  const comision = formatMoneda(bien.comisionPropuesta);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header navigation={navigation} title={bien.descripcionCatalogo || 'Producto'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Galería */}
        {fotos.length > 0 ? (
          <View>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setFotoActual(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
              }
            >
              {fotos.map((f, i) => (
                <Image
                  key={i}
                  source={{ uri: `data:image/jpeg;base64,${f}` }}
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>
            {fotos.length > 1 && (
              <View style={styles.dotsRow}>
                {fotos.map((_, i) => (
                  <View key={i} style={[styles.dot, i === fotoActual && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.galleryPlaceholder}>
            <Ionicons name="image-outline" size={52} color={colors.textSecondary} />
            <Text style={styles.galleryPlaceholderText}>Sin fotos</Text>
          </View>
        )}

        <View style={styles.body}>

          {/* Título + badge */}
          <Text style={styles.title}>{bien.descripcionCatalogo || 'Producto'}</Text>
          <View style={styles.badgeRow}>
            <Ionicons name={info.icon} size={16} color={info.color} />
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
          </View>

          {/* Descripción */}
          {bien.descripcionCompleta ? (
            <Text style={styles.descripcion}>{bien.descripcionCompleta}</Text>
          ) : null}

          {/* Alerta de rechazo */}
          {bien.estado === 'rechazado' && bien.motivoRechazo ? (
            <View style={styles.alertBox}>
              <Ionicons name="warning-outline" size={18} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Motivo del rechazo</Text>
                <Text style={styles.alertText}>{bien.motivoRechazo}</Text>
              </View>
            </View>
          ) : null}

          {/* Revisión pendiente */}
          {bien.estado === 'pendiente_revision' ? (
            <View style={[styles.alertBox, styles.alertBoxInfo]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.info} />
              <Text style={[styles.alertText, { flex: 1 }]}>
                Tu artículo está siendo revisado. Recibirás una respuesta en 3-5 días hábiles.
              </Text>
            </View>
          ) : null}

          {/* Datos económicos */}
          {(precio || comision) ? (
            <Section title="Datos económicos">
              {precio   && <Row label="Precio base" value={precio} />}
              {comision && <Row label="Comisión"    value={comision} />}
            </Section>
          ) : null}

          {/* Aceptar / rechazar condiciones (solo cuando está aprobado con precio y comisión) */}
          {bien.estado === 'aprobado' && bien.precioBasePropuesto && bien.comisionPropuesta ? (
            <View style={styles.condicionesBox}>
              <Text style={styles.condicionesTitle}>¿Aceptás las condiciones propuestas?</Text>
              <View style={styles.condicionesRow}>
                <TouchableOpacity
                  style={[styles.btnAceptar, actionLoading && styles.btnDisabled]}
                  onPress={handleAceptar}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.btnAceptarText}>Aceptar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnRechazar, actionLoading && styles.btnDisabled]}
                  onPress={handleRechazar}
                  disabled={actionLoading}
                >
                  <Text style={styles.btnRechazarText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Aviso de gastos de devolución (cuando fue devuelto por rechazo del usuario) */}
          {bien.estado === 'devuelto' && bien.gastosDevolucion ? (
            <View style={[styles.alertBox, styles.alertBoxWarning]}>
              <Ionicons name="warning-outline" size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: colors.warning }]}>Gastos de devolución</Text>
                <Text style={styles.alertText}>
                  Se cobrarán gastos a tu cargo por {formatMoneda(bien.gastosDevolucion)}.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Depósito */}
          {bien.ubicacionDeposito ? (
            <Section title="Depósito">
              <Row label="Ubicación" value={bien.ubicacionDeposito} />
            </Section>
          ) : null}

          {/* Seguro */}
          {bien.seguro ? (
            <Section title="Póliza de seguro">
              <Row label="N° póliza"  value={bien.seguro.nroPoliza} />
              {bien.seguro.compania && <Row label="Compañía" value={bien.seguro.compania} />}
              {bien.seguro.importe != null && <Row label="Importe" value={formatMoneda(bien.seguro.importe)} />}
            </Section>
          ) : null}

          {/* Subasta asignada */}
          {bien.subastaId ? (
            <Section title="Subasta asignada">
              <Row label="Subasta" value={`#${bien.subastaAsignada?.id ?? bien.subastaId}`} />
              {bien.subastaAsignada?.fecha     && <Row label="Fecha"     value={bien.subastaAsignada.fecha} />}
              {bien.subastaAsignada?.estado    && <Row label="Estado"    value={bien.subastaAsignada.estado} />}
              {bien.subastaAsignada?.ubicacion && <Row label="Ubicación" value={bien.subastaAsignada.ubicacion} />}
            </Section>
          ) : null}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ navigation, title }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },

  galleryImage: { width: SCREEN_WIDTH, height: 260, resizeMode: 'cover', backgroundColor: '#F2F2F2' },
  galleryPlaceholder: { height: 200, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center', gap: 8 },
  galleryPlaceholderText: { fontSize: 13, color: colors.textSecondary },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: colors.background },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DDD' },
  dotActive: { backgroundColor: colors.primary, width: 18 },

  body: { padding: 20 },

  title: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  badgeText: { fontSize: 14, fontWeight: '600' },

  descripcion: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 16 },

  alertBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, padding: 14, marginBottom: 16, backgroundColor: '#FFF5F5' },
  alertBoxInfo: { borderColor: colors.info, backgroundColor: '#F0F6FF' },
  alertBoxWarning: { borderColor: colors.warning, backgroundColor: '#FFFBEA' },
  alertTitle: { fontSize: 13, fontWeight: 'bold', color: colors.danger, marginBottom: 4 },
  alertText: { fontSize: 13, color: colors.textPrimary, lineHeight: 19 },

  condicionesBox: { borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#F0F6FF' },
  condicionesTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  condicionesRow: { flexDirection: 'row', gap: 10 },
  btnAceptar: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
  btnAceptarText: { color: colors.surface, fontWeight: 'bold', fontSize: 14 },
  btnRechazar: { flex: 1, borderWidth: 1.5, borderColor: colors.danger, borderRadius: 8, padding: 12, alignItems: 'center', backgroundColor: colors.surface },
  btnRechazarText: { color: colors.danger, fontWeight: 'bold', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },

  section: { marginTop: 8, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },
});
