import { registerRootComponent } from 'expo';

import './src/utils/webAlert'; // hace funcionar Alert.alert en Expo Web (no-op en react-native-web)
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
