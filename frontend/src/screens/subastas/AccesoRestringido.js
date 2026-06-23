import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMulta, getMultas, pagarMulta } from '../../api/multas';
import { getMediosPago } from '../../api/mediosPago';
import { colors } from '../../theme/colors';

const money = (v) => `$ ${Number(v ?? 0).toLocaleString('es-AR')}`;

async function fetchActiveMulta(multaId) {
  if (multaId) return getMulta(multaId);
  for (const estado of ['judicial', 'pendiente']) {
    const list = await getMultas(estado);
    if (list.length > 0) return getMulta(list[0].id);
  }
  return null;
}

export default function AccesoRestringido({ navigation, route }) {
  const { multaId: paramMultaId } = route.params ?? {};
  const [multa, setMulta] = useState(null);
  const [medios, setMedios] = useState([]);
  const [medioId, setMedioId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showMedios, setShowMedios] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [m, ms] = await Promise.all([
            fetchActiveMulta(paramMultaId),
            getMediosPago(),
          ]);
          if (active) {
            setMulta(m);
            const verificados = ms.filter((x) => x.estado === 'verificado');
            setMedios(verificados);
            if (verificados.length > 0) setMedioId(verificados[0].id);
          }
        } catch {
          // show whatever loaded
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [paramMultaId])
  );

  const handlePagar = async () => {
    if (!medioId) {
      Alert.alert('Sin medio de pago', 'Seleccioná un medio de pago verificado.');
      return;
    }
    if (!multa?.id) return;
    setPaying(true);
    try {
      await pagarMulta(multa.id, medioId);
      Alert.alert('¡Multa pagada!', 'Ya podés participar en subastas.', [
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

  const esJudicial = multa?.estado === 'judicial';
  const hayHoras = multa?.horasRestantes != null && multa.horasRestantes > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.alertBanner}>
        <Ionicons name="ban-outline" size={44} color={colors.danger} style={{ marginBottom: 10 }} />
        <Text style={styles.alertTitle}>Acceso restringido</Text>
        <Text style={styles.alertText}>
          No podés participar en subastas hasta regularizar el pago de tu multa pendiente.
        </Text>
      </View>

      {multa ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalle de la multa</Text>
          {!!multa.subastaTitulo && <Row label="Subasta" value={multa.subastaTitulo} />}
          <Row label="Motivo" value={multa.motivo ?? 'No pago de lote ganado'} />
          <Row label="Importe" value={`${money(multa.importe)} (10% del lote)`} />
          <Row label="Estado" value={multa.estado?.toUpperCase() ?? '—'} />
          {hayHoras && (
            <View style={styles.countdownBox}>
              <Ionicons name="time-outline" size={16} color={colors.warning} />
              <Text style={styles.countdownText}>
                Quedan {multa.horasRestantes} h para pagar antes del vencimiento
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.emptyText}>No se encontraron multas activas.</Text>
        </View>
      )}

      {esJudicial ? (
        <View style={styles.judicialBanner}>
          <Text style={styles.judicialTitle}>Estado judicial</Text>
          <Text style={styles.judicialText}>
            Esta multa fue derivada a instancia judicial. Debés regularizar la situación para recuperar el acceso a la plataforma.
          </Text>
        </View>
      ) : (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Si no pagás antes del vencimiento, la multa pasará a estado judicial y perderás el acceso a la aplicación.
          </Text>
        </View>
      )}

      {!esJudicial && multa && (
        <>
          {showMedios && medios.length > 0 && (
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

          <TouchableOpacity
            style={[styles.btnPrimary, paying && styles.btnDisabled]}
            onPress={() => {
              if (!showMedios) { setShowMedios(true); return; }
              handlePagar();
            }}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.btnPrimaryText}>Pagar multa ahora</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('DetalleMulta', { multaId: multa.id })}
          >
            <Text style={styles.btnSecondaryText}>Ver detalle completo</Text>
          </TouchableOpacity>
        </>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  alertBanner: {
    alignItems: 'center', backgroundColor: '#FEF2F2',
    borderRadius: 12, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  alertTitle: { fontSize: 20, fontWeight: 'bold', color: colors.danger, marginBottom: 8 },
  alertText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: colors.textPrimary, flex: 1, textAlign: 'right', flexWrap: 'wrap' },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  countdownBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, backgroundColor: '#FFF7ED', borderRadius: 8,
    padding: 12, borderWidth: 1, borderColor: '#FED7AA',
  },
  countdownText: { fontSize: 13, color: colors.warning, fontWeight: '600', flex: 1 },

  warningBanner: {
    backgroundColor: '#FFF7ED', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA',
  },
  warningText: { fontSize: 13, color: colors.warning, lineHeight: 20 },

  judicialBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#FECACA',
  },
  judicialTitle: { fontSize: 15, fontWeight: 'bold', color: colors.danger, marginBottom: 6 },
  judicialText: { fontSize: 13, color: colors.danger, lineHeight: 20 },

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
    alignItems: 'center', marginBottom: 12,
  },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.5 },
  btnSecondary: { alignItems: 'center', padding: 12 },
  btnSecondaryText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
