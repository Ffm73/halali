import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { useLocalization } from '@/hooks/useLocalization';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  style 
}: ButtonProps) {
  const { language } = useLocalization();
  const { colors } = useTheme();

  const buttonStyle = [
    styles.base,
    getVariantStyle(variant, colors),
    styles[size],
    disabled && { opacity: 0.5, elevation: 0, shadowOpacity: 0 },
    style,
  ];

  const textStyle: TextStyle = [
    styles.text,
    getVariantTextStyle(variant, colors),
    {
      fontFamily: variant === 'primary' ? 
        (language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold') :
        (language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Medium'),
    },
    disabled && { opacity: 0.7 },
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

function getVariantStyle(variant: string, colors: any) {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.primary };
    case 'secondary':
      return { 
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: colors.border,
      };
    case 'danger':
      return { backgroundColor: colors.danger };
    default:
      return { backgroundColor: colors.primary };
  }
}

function getVariantTextStyle(variant: string, colors: any) {
  switch (variant) {
    case 'primary':
      return { color: colors.surface };
    case 'secondary':
      return { color: colors.textPrimary };
    case 'danger':
      return { color: colors.surface };
    default:
      return { color: colors.surface };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 40,
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});