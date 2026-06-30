import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getCompra, pagarCompra } from '../../api/compras';
import { getMediosPago } from '../../api/mediosPago';
import { colors } from '../../theme/colors';

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;

const TIPO_LABEL = {
  cuenta_bancaria: 'Cuenta bancaria',
  tarjeta: 'Tarjeta',
  cheque: 'Cheque certificado',
};

export default function PagoCompra({ navigation, route }) {
  const { compraId, retiraPersonalmente } = route.params ?? {};
  const [compra, setCompra] = useState(null);
  const [medios, setMedios] = useState([]);
  const [medioId, setMedioId] = useState(null);
  const [conSeguro, setConSeguro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [c, ms] = await Promise.all([getCompra(compraId), getMediosPago()]);
          if (active) {
            setCompra(c);
            const verificados = ms.filter((m) => m.estado === 'verificado');
            setMedios(verificados);
            if (verificados.length > 0) setMedioId(verificados[0].id);
          }
        } catch {
          Alert.alert('Error', 'No se pudo cargar la pantalla de pago.');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [compraId])
  );

  const handlePagar = async () => {
    if (!medioId) {
      Alert.alert('Sin medio de pago', 'Seleccioná un medio de pago verificado.');
      return;
    }
    setPaying(true);
    try {
      await pagarCompra(compraId, {
        medioPagoId: medioId,
        retiraPersonalmente: !!retiraPersonalmente,
        conSeguroEnvio: !retiraPersonalmente && conSeguro,
      });
      navigation.replace('FacturaCompra', { compraId });
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message ?? '';
      const sinSaldo = status === 422 && /insufficient (funds|balance)/i.test(backendMsg);

      if (status === 403) {
        Alert.alert('Acceso restringido', backendMsg || 'No podés pagar en este momento.', [
          { text: 'Ver multa', onPress: () => navigation.navigate('AccesoRestringido', {}) },
          { text: 'Cancelar', style: 'cancel' },
        ]);
      } else if (sinSaldo) {
        Alert.alert(
          'Saldo insuficiente',
          'El medio de pago elegido no tiene saldo suficiente para pagar esta compra. Se generó una multa del 10% de tu oferta, que deberás pagar antes de volver a participar. Probá con otro medio de pago o agregá uno nuevo.',
          [
            { text: 'Agregar medio de pago', onPress: () => navigation.navigate('AddPaymentMethod') },
            { text: 'Entendido', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'No se pudo completar el pago',
          backendMsg || 'Ocurrió un problema al procesar el pago. Intentá nuevamente en unos minutos.'
        );
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const costoEnvio = retiraPersonalmente ? 0 : (compra?.costoEnvio ?? 0);
  const multa = Number(compra?.multaPendiente ?? 0);
  const total = Number(compra?.montoFinal ?? 0) + Number(compra?.comision ?? 0) + costoEnvio + multa;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Método de pago</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seleccioná un medio</Text>
        {medios.length === 0 ? (
          <Text style={styles.emptyText}>
            No tenés medios de pago verificados. Agregá uno desde Perfil → Medios de Pago.
          </Text>
        ) : (
          medios.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.opcion, medioId === m.id && styles.opcionSelected]}
              onPress={() => setMedioId(m.id)}
            >
              <View style={[styles.radio, medioId === m.id && styles.radioSelected]} />
              <View style={styles.opcionInfo}>
                <Text style={[styles.opcionLabel, medioId === m.id && styles.opcionLabelSelected]}>
                  {m.alias ?? TIPO_LABEL[m.tipo] ?? m.tipo}
                </Text>
                <Text style={styles.opcionSub}>{TIPO_LABEL[m.tipo] ?? ''}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {!retiraPersonalmente && (
        <View style={styles.card}>
          <View style={styles.seguroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Seguro de envío</Text>
              <Text style={styles.seguroSub}>Cobertura ante pérdida o daño durante el traslado.</Text>
            </View>
            <Switch
              value={conSeguro}
              onValueChange={setConSeguro}
              trackColor={{ false: '#CCCCCC', true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Desglose</Text>
        <Row label="Precio subasta" value={money(compra?.montoFinal)} />
        <Row label="Comisión (10%)" value={money(compra?.comision)} />
        <Row
          label="Envío"
          value={retiraPersonalmente ? 'Retiro en persona' : money(costoEnvio)}
        />
        {!retiraPersonalmente && (
          <Row label="Seguro" value={conSeguro ? 'Incluido' : 'Sin seguro'} />
        )}
        {multa > 0 && (
          <Row label="Multa por impago (10% oferta)" value={money(multa)} />
        )}
        <View style={styles.divider} />
        <Row label="Total" value={money(total)} bold />
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, (paying || medios.length === 0) && styles.btnDisabled]}
        onPress={handlePagar}
        disabled={paying || medios.length === 0}
      >
        {paying ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.btnPrimaryText}>Pagar {money(total)}</Text>
        )}
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
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },

  card: {
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  emptyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  seguroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  seguroSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  opcion: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#DDD',
    backgroundColor: '#FFF', marginBottom: 10,
  },
  opcionSelected: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  radio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    borderColor: '#CCC', marginRight: 12, flexShrink: 0,
  },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  opcionInfo: { flex: 1 },
  opcionLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  opcionLabelSelected: { color: colors.primary },
  opcionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.textPrimary },
  bold: { fontWeight: 'bold', fontSize: 15, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 10 },

  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.5 },
});
