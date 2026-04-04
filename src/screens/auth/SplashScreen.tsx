import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SplashScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Transition to main flow after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('MainFlow');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="robot" size={80} color={theme.colors.primary} />
        </View>
        
        <Text variant="displayMedium" style={[styles.appName, { color: theme.colors.primary }]}>
          Sales Bot
        </Text>
        
        <Text variant="titleMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          बिक्री र स्टक प्रबन्धको लागि स्मार्ट डिजिटल सहायक।
        </Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="labelLarge" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            लोड हुँदैछ...
          </Text>
        </View>
      </Animated.View>
      
      <Text variant="labelSmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
        Version 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '80%',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#18181b', // surface color from theme
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  appName: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    opacity: 0.5,
  },
});
