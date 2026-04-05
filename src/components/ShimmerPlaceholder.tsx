import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ShimmerPlaceholderProps {
  width?: any;
  height?: any;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function ShimmerPlaceholder({ width = '100%', height = 20, borderRadius = 4, style }: ShimmerPlaceholderProps) {
  const theme = useTheme();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          opacity: theme.dark ? shimmerValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0.4],
          }) : shimmerValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
          shadowColor: theme.dark ? 'transparent' : '#000',
          shadowOffset: theme.dark ? { width: 0, height: 0 } : { width: 0, height: 1 },
          shadowOpacity: theme.dark ? 0 : 0.05,
          shadowRadius: theme.dark ? 0 : 2,
          elevation: theme.dark ? 0 : 1,
        },
        style,
      ]}
    />
  );
}
