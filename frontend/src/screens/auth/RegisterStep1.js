import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  ActivityIndicator, Modal, FlatList
} from 'react-native';
import axios from 'axios';
import { colors } from '../../theme/colors';
import { API_URL } from '../../api/config';
import { validateUserData } from '../../utils/validation';

const ARGENTINA_ID = 32;

export default function RegisterStep1({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [paises, setPaises] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [loadingPaises, setLoadingPaises] = useState(true);

  useEffect(() => {
    const cargarPaises = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/paises`);
        const lista = res.data?.data ?? [];
        setPaises(lista);
        const argentina = lista.find(p => p.id === ARGENTINA_ID);
        if (argentina) setPaisSeleccionado(argentina);
      } catch (err) {
        const msg =
          err.response?.data?.message ??
          err.message ??
          'No se pudo cargar la lista de países.';
        Alert.alert('Error al cargar países', msg);
      } finally {
        setLoadingPaises(false);
      }
    };
    cargarPaises();
  }, []);

  const paisesFiltrados = paises.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleNext = async () => {
    if (!paisSeleccionado) {
      Alert.alert('Error', 'Seleccioná un país.');
      return;
    }

    const userData = { nombre, apellido, documento, direccion, email };
    const error = validateUserData(userData);
    if (error) {
      Alert.alert('Error de validación', error);
      return;
    }

    setLoading(true);
    try {
      await axios.get(`${API_URL}/auth/verificar-disponibilidad`, {
        params: { email: email.trim(), documento: documento.trim() }
      });

      navigation.navigate('DniFront', {
        userData: { ...userData, paisId: paisSeleccionado.id }
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        (typeof err.response?.data === 'string' ? err.response.data : null) ??
        err.message ??
        'Error al verificar disponibilidad.';
      Alert.alert('Error', String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Datos personales</Text>

        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="DNI" value={documento} onChangeText={setDocumento} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Dirección completa" value={direccion} onChangeText={setDireccion} placeholderTextColor={colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textSecondary} />

        <Text style={styles.label}>País</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => { setBusqueda(''); setModalVisible(true); }}
          disabled={loadingPaises}
        >
          {loadingPaises ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={paisSeleccionado ? styles.pickerText : styles.pickerPlaceholder}>
              {paisSeleccionado ? paisSeleccionado.nombre : 'Seleccioná un país'}
            </Text>
          )}
          <Text style={styles.pickerChevron}>▼</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} disabled={loading || loadingPaises}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>Siguiente</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccioná un país</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar país..."
              value={busqueda}
              onChangeText={setBusqueda}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <FlatList
              data={paisesFiltrados}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.paisItem, paisSeleccionado?.id === item.id && styles.paisItemSelected]}
                  onPress={() => { setPaisSeleccionado(item); setModalVisible(false); }}
                >
                  <Text style={[styles.paisNombre, paisSeleccionado?.id === item.id && styles.paisNombreSelected]}>
                    {item.nombre}
                  </Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 30 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  picker: { backgroundColor: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: 16, color: colors.textPrimary, flex: 1 },
  pickerPlaceholder: { fontSize: 16, color: colors.textSecondary, flex: 1 },
  pickerChevron: { fontSize: 12, color: colors.textSecondary },
  spacer: { flex: 1, minHeight: 40 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', height: 50, justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  modalClose: { fontSize: 18, color: colors.textSecondary, paddingHorizontal: 8 },
  searchInput: { margin: 12, backgroundColor: '#F3F3F3', borderRadius: 8, padding: 12, fontSize: 15, color: colors.textPrimary },
  paisItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  paisItemSelected: { backgroundColor: '#EEF5FF' },
  paisNombre: { fontSize: 16, color: colors.textPrimary },
  paisNombreSelected: { color: colors.primary, fontWeight: '600' },
});
