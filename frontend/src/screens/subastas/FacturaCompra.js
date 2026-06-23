import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getFactura } from '../../api/compras';
import { colors } from '../../theme/colors';

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;
const fechaHora = (f) => {
  if (!f) return '';
  const d = new Date(f);
  if (isNaN(d)) return String(f);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
};

export default function FacturaCompra({ navigation, route }) {
  const { compraId } = route.params ?? {};
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const data = await getFactura(compraId, 'json');
          if (active) setFactura(data);
        } catch {
          Alert.alert('Error', 'No se pudo cargar la factura.');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [compraId])
  );

  const handleDescargar = () => {
    const url = factura?.pdfUrl;
    if (!url) {
      Alert.alert('Sin PDF', 'La factura PDF aún no está disponible.');
      return;
    }
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir el enlace de descarga.')
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!factura) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar la factura.</Text>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnSecondaryText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successBadge}>
        <Ionicons name="checkmark-circle" size={56} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>¡Pago realizado!</Text>
      <Text style={styles.heading}>Factura #{factura.numeroFactura}</Text>
      <Text style={styles.fecha}>{fechaHora(factura.fecha)}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalle</Text>
        <Row label="Concepto" value={factura.descripcionProducto} />
        <Row label="N° de compra" value={`#${factura.compraId}`} />
        <View style={styles.divider} />
        <Row label="Precio subasta" value={money(factura.montoFinal)} />
        <Row label="Comisión (10%)" value={money(factura.comision)} />
        <Row
          label="Envío"
          value={Number(factura.costoEnvio ?? 0) === 0 ? 'Retiro en persona' : money(factura.costoEnvio)}
        />
        <View style={styles.divider} />
        <Row label="Total pagado" value={money(factura.total)} bold />
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleDescargar}>
        <Ionicons name="download-outline" size={18} color={colors.surface} style={{ marginRight: 8 }} />
        <Text style={styles.btnPrimaryText}>Descargar factura PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.btnSecondaryText}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, alignItems: 'stretch' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  successBadge: { alignSelf: 'center', marginBottom: 8 },
  successTitle: {
    fontSize: 20, fontWeight: 'bold', color: colors.success,
    textAlign: 'center', marginBottom: 8,
  },
  heading: {
    fontSize: 20, fontWeight: 'bold', color: colors.textPrimary,
    textAlign: 'center', marginBottom: 4,
  },
  fecha: {
    fontSize: 13, color: colors.textSecondary,
    textAlign: 'center', marginBottom: 24,
  },

  card: {
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, flex: 1, textAlign: 'right' },
  bold: { fontWeight: 'bold', fontSize: 15, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 10 },

  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  btnSecondary: { alignItems: 'center', padding: 12 },
  btnSecondaryText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 16, color: colors.danger, marginBottom: 20 },
});
