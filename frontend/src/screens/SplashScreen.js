import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SubastaPro</Text>
      </View>
      <Text style={styles.version}>v 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 180, height: 180, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.secondary },
  version: { fontSize: 14, color: colors.textSecondary }
});