import React from 'react';
import { Image, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Logo({ size = 'md', style }: LogoProps) {
  const logoSize = {
    sm: 32,
    md: 48,
    lg: 64,
  }[size];

  return (
    <Image
      source={require('@/assets/images/image.png')}
      style={[
        styles.logo,
        {
          width: logoSize,
          height: logoSize,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
  },
});