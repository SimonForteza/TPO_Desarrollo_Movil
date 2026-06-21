import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { crearBien } from '../../api/bienes';
import BottomNavBar from '../../components/BottomNavBar';
import { colors } from '../../theme/colors';

const CATEGORIAS = ['Arte', 'Joyas', 'Relojes', 'Antigüedades', 'Vehículos', 'Otros'];
const MIN_FOTOS = 6;
// El backend limita descripcionCompleta a 300 chars; acotamos los inputs para no excederlo.
const MAX_DESC = 150;
const MAX_HISTORIA = 100;

// Devuelve base64 limpio (sin prefijo data:image). SIN regex.
const limpiarBase64 = (v) => (v && v.includes(',') ? v.split(',').pop() : v);

export default function SolicitarSubastaForm({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [historia, setHistoria] = useState('');
  const [imagenes, setImagenes] = useState([]); // [{ uri, base64 }]
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const agregarImagenes = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.2, // compresión para evitar 500 por tamaño
        base64: true,
      });
      if (!result.canceled) {
        const nuevas = result.assets.map((a) => ({ uri: a.uri, base64: a.base64 }));
        setImagenes((prev) => [...prev, ...nuevas]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes.');
    }
  };

  const quitarImagen = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnviar = async () => {
    if (!nombre.trim()) return Alert.alert('Falta el nombre', 'Ingresá el nombre del producto.');
    if (!descripcion.trim()) return Alert.alert('Falta la descripción', 'Ingresá la descripción del producto.');
    if (imagenes.length < MIN_FOTOS)
      return Alert.alert('Faltan imágenes', `Subí al menos ${MIN_FOTOS} fotos (tenés ${imagenes.length}).`);
    if (!acepta)
      return Alert.alert('Declaración requerida', 'Tenés que aceptar la declaración de propiedad y origen lícito.');

    const descripcionCompleta =
      `Descripción: ${descripcion.trim()}\nCategoría: ${categoria || '-'}\nHistoria: ${historia.trim() || '-'}`;

    if (descripcionCompleta.length > 300) {
      return Alert.alert('Texto demasiado largo', 'Acortá la descripción o la historia (máximo 300 caracteres combinados).');
    }

    const payload = {
      descripcion: nombre.trim(),
      descripcionCompleta,
      fotos: imagenes.map((img) => limpiarBase64(img.base64)),
      declaracionPropiedad: acepta,
      origenLicitoAcreditado: acepta,
    };

    setEnviando(true);
    try {
      await crearBien(payload);
      Alert.alert('Solicitud enviada', 'Tu producto quedó pendiente de revisión.');
      navigation.navigate('MisProductos');
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo enviar la solicitud. Intentá de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nombre Producto</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre Producto..."
          placeholderTextColor={colors.textSecondary}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Descripción del Producto</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Descripción del producto..."
          placeholderTextColor={colors.textSecondary}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          maxLength={MAX_DESC}
        />

        <Text style={styles.label}>Seleccionar Categoría</Text>
        <View style={styles.chipsWrap}>
          {CATEGORIAS.map((cat) => {
            const active = categoria === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setCategoria(active ? '' : cat)}
              >
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Historia del Producto</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Historia del producto..."
          placeholderTextColor={colors.textSecondary}
          value={historia}
          onChangeText={setHistoria}
          multiline
          maxLength={MAX_HISTORIA}
        />

        <Text style={styles.label}>Cargar Imágenes ({imagenes.length}/{MIN_FOTOS})</Text>
        <View style={styles.imagesGrid}>
          {imagenes.map((img, i) => (
            <View key={i} style={styles.imageSlot}>
              <Image source={{ uri: img.uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => quitarImagen(i)}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.imageSlot, styles.addSlot]} onPress={agregarImagenes}>
            <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcepta((v) => !v)}>
          <Ionicons
            name={acepta ? 'checkbox' : 'square-outline'}
            size={22}
            color={acepta ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.checkboxText}>Aceptar Declaración de Propiedad y Origen Lícito</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, enviando && styles.submitBtnDisabled]}
          onPress={handleEnviar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitBtnText}>Aceptar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} active="productos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 100 },

  label: { fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textarea: { height: 100, textAlignVertical: 'top' },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: colors.surface },

  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageSlot: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  addSlot: { borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', backgroundColor: '#F5F8FF' },
  imageThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: colors.surface, borderRadius: 10 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 10 },
  checkboxText: { flex: 1, fontSize: 14, color: colors.textPrimary },

  submitBtn: { backgroundColor: colors.secondary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
