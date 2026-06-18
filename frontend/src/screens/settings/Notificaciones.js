import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const OPCIONES = [
  { key: 'notif_pujas', label: 'Alerta de Pujas' },
  { key: 'notif_subastas', label: 'Subastas Programadas' },
  { key: 'notif_pagos', label: 'Alertas de Pago' },
];

export default function Notificaciones() {
  const [valores, setValores] = useState({
    notif_pujas: false,
    notif_subastas: false,
    notif_pagos: false,
  });

  useEffect(() => {
    const cargar = async () => {
      const entries = await AsyncStorage.multiGet(OPCIONES.map((o) => o.key));
      const cargados = {};
      entries.forEach(([key, value]) => {
        cargados[key] = value === 'true';
      });
      setValores((prev) => ({ ...prev, ...cargados }));
    };
    cargar();
  }, []);

  const toggle = async (key) => {
    const nuevo = !valores[key];
    setValores((prev) => ({ ...prev, [key]: nuevo }));
    await AsyncStorage.setItem(key, String(nuevo));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {OPCIONES.map((opcion) => (
        <View key={opcion.key} style={styles.row}>
          <Text style={styles.label}>{opcion.label}</Text>
          <Switch
            value={valores[opcion.key]}
            onValueChange={() => toggle(opcion.key)}
            trackColor={{ false: '#CCCCCC', true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 30 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
});
