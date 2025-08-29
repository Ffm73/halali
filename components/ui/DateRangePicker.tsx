import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DatePicker } from './DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Calendar, ArrowRight } from 'lucide-react-native';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onRangeChange: (range: DateRange) => void;
  label?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  style?: any;
}

export function DateRangePicker({
  value,
  onRangeChange,
  label,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  style,
}: DateRangePickerProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();

  const handleStartDateChange = (date: string) => {
    const newRange = { ...value, startDate: date };
    
    // If end date is before start date, clear it
    if (value.endDate && new Date(value.endDate) < new Date(date)) {
      newRange.endDate = undefined;
    }
    
    onRangeChange(newRange);
  };

  const handleEndDateChange = (date: string) => {
    onRangeChange({ ...value, endDate: date });
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {label}{required && ' *'}
        </Text>
      )}
      
      <View style={[styles.rangeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.datePickerContainer}>
          <DatePicker
            value={value.startDate}
            onDateChange={handleStartDateChange}
            placeholder={language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
            disabled={disabled}
            minDate={minDate}
            maxDate={value.endDate || maxDate}
            style={styles.rangeDatePicker}
          />
        </View>
        
        <View style={[styles.arrowContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <ArrowRight size={16} color={colors.textSecondary} />
        </View>
        
        <View style={styles.datePickerContainer}>
          <DatePicker
            value={value.endDate}
            onDateChange={handleEndDateChange}
            placeholder={language === 'ar' ? 'تاريخ النهاية' : 'End Date'}
            disabled={disabled}
            minDate={value.startDate || minDate}
            maxDate={maxDate}
            style={styles.rangeDatePicker}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  rangeContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  datePickerContainer: {
    flex: 1,
  },
  rangeDatePicker: {
    marginBottom: 0,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg, // Align with date picker inputs
  },
});