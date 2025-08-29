import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '@/constants/theme';
import { useLocalization } from '@/hooks/useLocalization';
import { UpcomingCharge } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface UpcomingChargesProps {
  charges: UpcomingCharge[];
  isCollapsed: boolean;
  onToggle: () => void;
}

export function UpcomingCharges({ charges, isCollapsed, onToggle }: UpcomingChargesProps) {
  const { t, language, isRTL } = useLocalization();

  const getCurrencySymbol = (currency: string = 'SAR') => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'AED':
        return 'د.إ';
      case 'SAR':
      default:
        return '﷼'; // Saudi Riyal symbol
    }
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString()} ${symbol}`;
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text
          style={[
            styles.title,
            {
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'المستحقات القادمة' : 'Upcoming Charges'}
        </Text>
        {isCollapsed ? (
          <ChevronDown size={20} color={colors.light.textSecondary} />
        ) : (
          <ChevronUp size={20} color={colors.light.textSecondary} />
        )}
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.content}>
          {charges.slice(0, 3).map((charge) => (
            <TouchableOpacity key={charge.id} style={styles.chargeRow}>
              <View style={[styles.chargeInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.chargeDetails}>
                  <Text
                    style={[
                      styles.residentName,
                      {
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {charge.residentName}
                  </Text>
                  <Text
                    style={[
                      styles.unitLabel,
                      {
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {charge.unitLabel}
                  </Text>
                </View>
                <View style={styles.chargeAmount}>
                  <Text
                    style={[
                      styles.amount,
                      {
                        fontFamily: 'monospace',
                        textAlign: isRTL ? 'left' : 'right',
                      },
                    ]}
                  >
                    {formatCurrency(charge.amount)}
                  </Text>
                  <StatusChip status={charge.status} size="sm" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    borderRadius: borderRadius.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  chargeRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chargeInfo: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargeDetails: {
    flex: 1,
  },
  residentName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  unitLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chargeAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});