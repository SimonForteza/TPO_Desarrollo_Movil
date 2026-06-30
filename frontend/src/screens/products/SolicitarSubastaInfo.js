import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const BULLETS = [
  'Ofrecé un bien propio para que sea evaluado por nuestra casa de subastas e incluido en una futura subasta.',
  'Vas a necesitar completar sus datos, subir al menos 6 fotos claras y aceptar las declaraciones obligatorias.',
  'Después de enviarlo, podrás seguir el estado de la solicitud desde Mis Productos.',
];

export default function SolicitarSubastaInfo({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Solicitar Subasta</Text>

        <View style={styles.centerArea}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Antes de Comenzar</Text>
            <View style={styles.divider} />
            {BULLETS.map((texto, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{texto}</Text>
              </View>
            ))}

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.btnSecondaryText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => navigation.navigate('SolicitarSubastaForm')}
              >
                <Text style={styles.btnPrimaryText}>Comenzar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <BottomNavBar navigation={navigation} active="productos" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, paddingHorizontal: 20, paddingTop: 10 },

  centerArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 65 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 16 },
  bulletRow: { flexDirection: 'row', marginBottom: 16 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.secondary, marginTop: 6, marginRight: 12 },
  bulletText: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 21 },

  buttonsRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: colors.surface, fontWeight: 'bold' },
  btnSecondary: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  btnSecondaryText: { color: colors.primary, fontWeight: 'bold' },
});
