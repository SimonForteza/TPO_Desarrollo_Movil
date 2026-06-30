// Hace funcionar Alert.alert en Expo Web.
//
// react-native-web define Alert.alert como una función VACÍA (no-op): en web no se
// muestra ningún diálogo y, peor, los onPress de los botones (cerrar sesión,
// confirmaciones, navegación, etc.) nunca se ejecutan. Este shim reemplaza Alert.alert
// SOLO en web por una versión basada en window.alert / window.confirm que sí dispara
// los callbacks. En nativo (iOS/Android) no cambia nada.
import { Alert, Platform } from 'react-native';

if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const texto = [title, message].filter(Boolean).join('\n\n');

    // Sin botones (o uno solo) → mensaje informativo simple.
    if (!buttons || buttons.length === 0) {
      window.alert(texto);
      return;
    }
    if (buttons.length === 1) {
      window.alert(texto);
      buttons[0]?.onPress?.();
      return;
    }

    // 2+ botones → confirmación. El botón 'cancel' mapea a Cancelar; el primer
    // botón no-cancel (acción principal) mapea a Aceptar.
    const cancelBtn = buttons.find((b) => b?.style === 'cancel');
    const confirmBtn = buttons.find((b) => b?.style !== 'cancel') ?? buttons[buttons.length - 1];

    if (window.confirm(texto)) {
      confirmBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
  };
}
