import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

// active: 'subastas' | 'productos' | 'perfil'
export default function BottomNavBar({ navigation, active }) {
  const tabs = [
    {
      key: 'subastas',
      label: 'Subastas',
      icon: 'hammer-outline',
      onPress: () => navigation.navigate('Home'),
    },
    {
      key: 'productos',
      label: 'Mis Productos',
      icon: 'cube-outline',
      onPress: () => navigation.navigate('MisProductos'),
    },
    {
      key: 'perfil',
      label: 'Perfil',
      icon: 'person-circle-outline',
      onPress: () => navigation.navigate('Perfil'),
    },
  ];

  return (
    <View style={styles.bottomBar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={tab.onPress}>
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? colors.secondary : colors.surface}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: colors.surface,
    fontSize: 11,
    marginTop: 3,
    opacity: 0.7,
  },
  tabLabelActive: {
    color: colors.secondary,
    opacity: 1,
    fontWeight: 'bold',
  },
});
