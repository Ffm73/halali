import { Language } from '@/types';

export const colors = {
  light: {
    primary: '#4CA771',
    primaryLight: '#EAF9E2',
    primaryDark: '#013237',
    success: '#4CA771',
    successLight: '#EAF9E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    surface: '#FFFFFF',
    surfaceSecondary: '#EAF9E2',
    background: '#F8FDF9',
    textPrimary: '#013237',
    textSecondary: '#4CA771',
    textMuted: '#6B7280',
    border: '#C0E6BA',
    borderLight: '#EAF9E2',
    accent: '#4CA771',
    accentLight: '#EAF9E2',
  },
  dark: {
    primary: '#4ADE80',
    primaryLight: '#1F2937',
    primaryDark: '#22C55E',
    success: '#4ADE80',
    successLight: '#1F2937',
    warning: '#FBBF24',
    warningLight: '#1F2937',
    danger: '#F87171',
    dangerLight: '#1F2937',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    background: '#111827',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#4B5563',
    borderLight: '#374151',
    accent: '#4ADE80',
    accentLight: '#22C55E',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 16, // Standard card radius
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 15,
  lg: 17,
  xl: 19,
  xxl: 21,
  xxxl: 23,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const numberFont = 'Courier New, monospace';

export function getFontFamily(language: Language, weight: keyof typeof fontWeight = 'normal') {
  if (language === 'ar') {
    switch (weight) {
      case 'bold':
        return 'Tajawal-Bold';
      case 'semibold':
        return 'Tajawal-Medium';
      case 'medium':
        return 'Tajawal-Medium';
      default:
        return 'Tajawal-Regular';
    }
  } else {
    switch (weight) {
      case 'bold':
        return 'Nunito-Bold';
      case 'semibold':
        return 'Nunito-SemiBold';
      case 'medium':
        return 'Nunito-Medium';
      default:
        return 'Nunito-Regular';
    }
  }
}

export function getThemedColors(isDark: boolean) {
  return isDark ? colors.dark : colors.light;
}