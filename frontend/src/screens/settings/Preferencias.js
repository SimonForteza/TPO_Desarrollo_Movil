import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

const IDIOMAS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
];

export default function Preferencias() {
  const [idioma, setIdioma] = useState('es');
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const [[, idiomaGuardado], [, modoGuardado]] = await AsyncStorage.multiGet([
        'pref_idioma',
        'pref_modo_oscuro',
      ]);
      if (idiomaGuardado) setIdioma(idiomaGuardado);
      if (modoGuardado) setModoOscuro(modoGuardado === 'true');
    };
    cargar();
  }, []);

  const cambiarIdioma = async (value) => {
    setIdioma(value);
    await AsyncStorage.setItem('pref_idioma', value);
  };

  const toggleModoOscuro = async () => {
    const nuevo = !modoOscuro;
    setModoOscuro(nuevo);
    await AsyncStorage.setItem('pref_modo_oscuro', String(nuevo));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Idioma</Text>
        <View style={styles.idiomaContainer}>
          {IDIOMAS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.idiomaButton, idioma === item.value && styles.idiomaButtonActive]}
              onPress={() => cambiarIdioma(item.value)}
            >
              <Text style={[styles.idiomaText, idioma === item.value && styles.idiomaTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Modo Oscuro</Text>
        <Switch
          value={modoOscuro}
          onValueChange={toggleModoOscuro}
          trackColor={{ false: '#CCCCCC', true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 30 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  idiomaContainer: { flexDirection: 'row', marginTop: 12, gap: 8 },
  idiomaButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  idiomaButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  idiomaText: { color: colors.textSecondary, fontWeight: 'bold' },
  idiomaTextActive: { color: colors.surface },
});
