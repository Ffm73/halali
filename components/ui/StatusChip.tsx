import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { ChargeStatus, UnitStatus } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface StatusChipProps {
  status: ChargeStatus | UnitStatus;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const { t, language } = useLocalization();
  const { colors } = useTheme();

  const getStatusConfig = (status: ChargeStatus | UnitStatus) => {
    switch (status) {
      case 'paid':
        return {
          backgroundColor: colors.successLight,
          textColor: colors.success,
          label: language === 'ar' ? 'مدفوع' : 'Paid',
        };
      case 'due':
        return {
          backgroundColor: colors.primaryLight,
          textColor: colors.primary,
          label: language === 'ar' ? 'مستحق' : 'Due',
        };
      case 'overdue':
        return {
          backgroundColor: colors.dangerLight,
          textColor: colors.danger,
          label: language === 'ar' ? 'متأخر' : 'Overdue',
        };
      case 'partiallyPaid':
        return {
          backgroundColor: colors.warningLight,
          textColor: colors.warning,
          label: language === 'ar' ? 'مدفوع جزئياً' : 'Partial',
        };
      case 'pending':
        return {
          backgroundColor: colors.warningLight,
          textColor: colors.warning,
          label: language === 'ar' ? 'في الانتظار' : 'Pending',
        };
      case 'occupied':
        return {
          backgroundColor: colors.successLight,
          textColor: colors.success,
          label: language === 'ar' ? 'مؤجر' : 'Occupied',
        };
      case 'vacant':
        return {
          backgroundColor: colors.primaryLight,
          textColor: colors.primary,
          label: language === 'ar' ? 'شاغر' : 'Vacant',
        };
      default:
        return {
          backgroundColor: colors.surfaceSecondary,
          textColor: colors.textSecondary,
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        { backgroundColor: config.backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { 
            color: config.textColor,
            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  chipSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  textSm: {
    fontSize: fontSize.xs,
  },
});