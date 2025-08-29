import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius } from '@/constants/theme';
import { spacing, fontSize, numberFont } from '@/constants/theme';

interface MetricCardProps {
  title: string;
  value: number;
  currency?: string;
  onPress?: () => void;
}

export function MetricCard({ title, value, currency, onPress }: MetricCardProps) {
  const { language, isRTL, formatCurrency } = useLocalization();
  const { colors } = useTheme();

  const formatValue = (val: number) => {
    if (currency) {
      return formatCurrency(val, 'SAR'); // Convert from SAR base to user's currency
    }
    return val.toLocaleString();
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { borderRadius: borderRadius.card }]}>
        <Text
          style={[
            styles.value,
            {
              color: colors.textPrimary,
              fontFamily: numberFont,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {formatValue(value)}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {title}
        </Text>
      </Card>
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
  },
  value: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
  },
});