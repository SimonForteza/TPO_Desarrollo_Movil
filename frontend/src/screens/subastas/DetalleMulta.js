import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMulta, pagarMulta } from '../../api/multas';
import { getMediosPago } from '../../api/mediosPago';
import { colors } from '../../theme/colors';

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;
const fechaCorta = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (isNaN(d)) return String(f);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export default function DetalleMulta({ navigation, route }) {
  const { multaId } = route.params ?? {};
  const [multa, setMulta] = useState(null);
  const [medios, setMedios] = useState([]);
  const [medioId, setMedioId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [m, ms] = await Promise.all([getMulta(multaId), getMediosPago()]);
          if (active) {
            setMulta(m);
            const verificados = ms.filter((x) => x.estado === 'verificado');
            setMedios(verificados);
            if (verificados.length > 0) setMedioId(verificados[0].id);
          }
        } catch {
          Alert.alert('Error', 'No se pudo cargar el detalle de la multa.');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [multaId])
  );

  const handlePagar = async () => {
    if (!medioId || !multa?.id) return;
    setPaying(true);
    try {
      await pagarMulta(multa.id, medioId);
      Alert.alert('¡Listo!', 'Multa pagada. Ya podés participar en subastas.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'No se pudo pagar la multa.';
      Alert.alert('Error', msg);
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

  if (!multa) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar la multa.</Text>
      </View>
    );
  }

  const esJudicial = multa.estado === 'judicial';
  const esPagada = multa.estado === 'pagada';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Multa #{multa.id}</Text>
        {!!multa.subastaTitulo && <Row label="Subasta" value={multa.subastaTitulo} />}
        <Row label="Motivo" value={multa.motivo ?? 'No pago de lote ganado'} />
        <Row label="Importe" value={money(multa.importe)} />
        <Row label="Estado" value={multa.estado?.toUpperCase() ?? '—'} />
        <Row label="Vencimiento" value={fechaCorta(multa.venceEn)} />
        {multa.horasRestantes != null && !esPagada && !esJudicial && (
          <Row label="Horas restantes" value={`${multa.horasRestantes} h`} />
        )}
      </View>

      {!esPagada && !esJudicial && medios.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medio de pago</Text>
          {medios.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.opcion, medioId === m.id && styles.opcionSelected]}
              onPress={() => setMedioId(m.id)}
            >
              <View style={[styles.radio, medioId === m.id && styles.radioSelected]} />
              <Text style={[styles.opcionText, medioId === m.id && styles.opcionTextSelected]}>
                {m.alias ?? m.tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!esPagada && !esJudicial && (
        <TouchableOpacity
          style={[styles.btnPrimary, (paying || medios.length === 0) && styles.btnDisabled]}
          onPress={handlePagar}
          disabled={paying || medios.length === 0}
        >
          {paying ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.btnPrimaryText}>Pagar multa</Text>
          )}
        </TouchableOpacity>
      )}

      {esPagada && (
        <View style={styles.pagadaBanner}>
          <Text style={styles.pagadaText}>Esta multa ya fue pagada.</Text>
        </View>
      )}
    </ScrollView>
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: colors.danger },

  card: {
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, flex: 1, textAlign: 'right', flexWrap: 'wrap' },

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

  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.5 },
  pagadaBanner: {
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#6EE7B7', alignItems: 'center',
  },
  pagadaText: { fontSize: 15, color: colors.success, fontWeight: '600' },
});
