import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, ActivityIndicator } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

export default function SplashScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    // Transition to main flow after 2.5 seconds
    const timer = setTimeout(() => {
      if (user) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Surface elevation={4} style={[styles.iconSurface, { backgroundColor: theme.colors.primary + '15' }]}>
          <Icon name="rocket-launch-outline" size={80} color={theme.colors.primary} />
        </Surface>
        
        <Text variant="displaySmall" style={[styles.appName, { color: theme.colors.onSurface }]}>
          {t('navigation.app_title')}
        </Text>
        
        <Text variant="titleMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {t('navigation.app_subtitle')}
        </Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size={32} color={theme.colors.primary} />
          <Text variant="labelLarge" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.loading')}
          </Text>
        </View>
      </Animated.View>
      
      <Text variant="labelSmall" style={[styles.footer, { color: theme.colors.outline }]}>
        VERSION 2.0.0 • PREMIUM
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
  iconSurface: {
    width: 140,
    height: 140,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    transform: [{ rotate: '-8deg' }],
  },
  appName: {
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    fontWeight: '600',
    opacity: 0.7,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.5,
  },
});
