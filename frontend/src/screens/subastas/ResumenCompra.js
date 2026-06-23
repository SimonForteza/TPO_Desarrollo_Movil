import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCompra } from '../../api/compras';
import { colors } from '../../theme/colors';

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;

export default function ResumenCompra({ navigation, route }) {
  const { compraId, titulo } = route.params ?? {};
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retiraPersonalmente, setRetiraPersonalmente] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const data = await getCompra(compraId);
          if (active) setCompra(data);
        } catch {
          Alert.alert('Error', 'No se pudo cargar el resumen de la compra.');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [compraId])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!compra) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar la compra.</Text>
      </View>
    );
  }

  const costoEnvio = retiraPersonalmente ? 0 : (compra?.costoEnvio ?? 0);
  const total = Number(compra.montoFinal ?? 0) + Number(compra.comision ?? 0) + costoEnvio;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Resumen de compra</Text>
      {!!titulo && <Text style={styles.subtitulo}>{titulo}</Text>}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Desglose</Text>
        <Row label="Precio subasta" value={money(compra.montoFinal)} />
        <Row label="Comisión (10%)" value={money(compra.comision)} />
        <Row label="Envío estimado" value={retiraPersonalmente ? '—' : money(costoEnvio)} />
        <View style={styles.divider} />
        <Row label="Total a pagar" value={money(total)} bold />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrega</Text>
        <Opcion
          label="Envío a domicilio"
          selected={!retiraPersonalmente}
          onPress={() => setRetiraPersonalmente(false)}
        />
        <Opcion
          label="Retiro en persona"
          selected={retiraPersonalmente}
          onPress={() => setRetiraPersonalmente(true)}
        />
        {retiraPersonalmente && (
          <View style={styles.avisoRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.avisoText}>
              Al retirar en persona el artículo no contará con cobertura de seguro.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => navigation.navigate('PagoCompra', { compraId, retiraPersonalmente })}
      >
        <Text style={styles.btnPrimaryText}>Confirmar y pagar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLink} onPress={() => navigation.goBack()}>
        <Text style={styles.btnLinkText}>Pagar más tarde (max 72 hs)</Text>
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

function Opcion({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.opcion, selected && styles.opcionSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <Text style={[styles.opcionText, selected && styles.opcionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  subtitulo: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  errorText: { fontSize: 16, color: colors.danger },

  card: {
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.textPrimary },
  bold: { fontWeight: 'bold', fontSize: 15, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 10 },

  opcion: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#DDD',
    backgroundColor: '#FFF', marginBottom: 10,
  },
  opcionSelected: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  radio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    borderColor: '#CCC', marginRight: 12,
  },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  opcionText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  opcionTextSelected: { color: colors.primary },
  avisoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  avisoText: { fontSize: 12, color: colors.warning, flex: 1, lineHeight: 18 },

  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  btnLink: { alignItems: 'center', padding: 12 },
  btnLinkText: { color: colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
});
