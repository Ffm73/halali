import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Calendar, Clock, Check, ChevronDown } from 'lucide-react-native';

export interface DateSelection {
  mode: 'manual' | 'duration';
  startDate: string;
  endDate?: string;
  durationMonths?: number;
  durationUnit: 'months' | 'years';
}

interface DateSelectorProps {
  value: DateSelection;
  onChange: (selection: DateSelection) => void;
  minStartDate?: string;
  maxDuration?: number;
  disabled?: boolean;
}

export function DateSelector({ 
  value, 
  onChange, 
  minStartDate,
  maxDuration = 60,
  disabled = false 
}: DateSelectorProps) {
  const { language, isRTL, formatDate, dateSystem, formatHijriDate, gregorianToHijri } = useLocalization();
  const { colors } = useTheme();
  
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when date system changes
  React.useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [dateSystem]);

  const durationOptions = [
    { months: 0.033, label: language === 'ar' ? '1 يوم' : '1 Day' },
    { months: 0.25, label: language === 'ar' ? '1 أسبوع' : '1 Week' },
    { months: 0.5, label: language === 'ar' ? ' أسبوعين' : '2 Weeks' },
    { months: 1, label: language === 'ar' ? '1 شهر' : '1 Month' },
    { months: 3, label: language === 'ar' ? '3 أشهر' : '3 Months' },
    { months: 6, label: language === 'ar' ? '6 أشهر' : '6 Months' },
    { months: 12, label: language === 'ar' ? '1 سنة' : '1 Year' },
    { months: 18, label: language === 'ar' ? '18 شهر' : '18 Months' },
    { months: 24, label: language === 'ar' ? '2 سنة' : '2 Years' },
    { months: 36, label: language === 'ar' ? '3 سنوات' : '3 Years' },
    { months: 48, label: language === 'ar' ? '4 سنوات' : '4 Years' },
    { months: 60, label: language === 'ar' ? '5 سنوات' : '5 Years' },
    // Add Hijri-specific durations
    ...(dateSystem === 'hijri' ? [
      { months: 11, label: language === 'ar' ? '1 سنة هجرية' : '1 Hijri Year' },
      { months: 22, label: language === 'ar' ? '2 سنة هجرية' : '2 Hijri Years' },
      { months: 33, label: language === 'ar' ? '3 سنوات هجرية' : '3 Hijri Years' },
    ] : []),
  ];

  const calculateEndDate = (startDate: string, months: number): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    if (months < 1) {
      // For periods less than a month, use days
      const days = Math.round(months * 30);
      end.setDate(end.getDate() + days);
    } else {
      end.setMonth(end.getMonth() + months);
    }
    return end.toISOString().split('T')[0];
  };

  const handleModeChange = (mode: 'manual' | 'duration') => {
    const newSelection: DateSelection = {
      ...value,
      mode,
    };

    if (mode === 'duration' && !value.durationMonths) {
      newSelection.durationMonths = 12;
      newSelection.durationUnit = 'months';
      if (value.startDate) {
        newSelection.endDate = calculateEndDate(value.startDate, 12);
      }
    }

    onChange(newSelection);
  };

  const handleStartDateChange = (startDate: string) => {
    const newSelection: DateSelection = {
      ...value,
      startDate,
    };

    if (value.mode === 'duration' && value.durationMonths) {
      newSelection.endDate = calculateEndDate(startDate, value.durationMonths);
    }

    onChange(newSelection);
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({
      ...value,
      endDate,
    });
  };

  const handleDurationChange = (months: number) => {
    const newSelection: DateSelection = {
      ...value,
      durationMonths: months,
      durationUnit: months >= 12 ? 'years' : 'months',
    };

    if (value.startDate) {
      newSelection.endDate = calculateEndDate(value.startDate, months);
    }

    onChange(newSelection);
    setShowDurationPicker(false);
  };

  const getDurationLabel = () => {
    if (!value.durationMonths) return language === 'ar' ? 'اختر المدة' : 'Select Duration';
    
    if (value.durationMonths < 1) {
      if (value.durationMonths === 0.033) {
        return language === 'ar' ? '1 يوم' : '1 Day';
      } else if (value.durationMonths === 0.25) {
        return language === 'ar' ? '1 أسبوع' : '1 Week';
      } else if (value.durationMonths === 0.5) {
        return language === 'ar' ? ' أسبوعين' : '2 Weeks';
      }
    }
    
    if (value.durationMonths >= 12) {
      const years = value.durationMonths / 12;
      return language === 'ar' 
        ? `${years} ${years === 1 ? 'سنة' : 'سنوات'}`
        : `${years} ${years === 1 ? 'Year' : 'Years'}`;
    }
    
    return language === 'ar' 
      ? `${value.durationMonths} ${value.durationMonths === 1 ? 'شهر' : 'أشهر'}`
      : `${value.durationMonths} ${value.durationMonths === 1 ? 'Month' : 'Months'}`;
  };

  return (
    <Card style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.textPrimary,
            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      >
        {language === 'ar' ? 'تواريخ العقد' : 'Contract Dates'}
      </Text>

      {/* Mode Selection */}
      <View style={styles.modeSelection}>
        <TouchableOpacity
          style={[
            styles.modeOption,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            value.mode === 'manual' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
          ]}
          onPress={() => handleModeChange('manual')}
          disabled={disabled}
        >
          <Calendar size={20} color={value.mode === 'manual' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.modeOptionText,
              {
                color: value.mode === 'manual' ? colors.primary : colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
              },
            ]}
          >
            {language === 'ar' ? 'تحديد التواريخ يدوياً' : 'Manual Date Selection'}
          </Text>
          {value.mode === 'manual' && <Check size={16} color={colors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeOption,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            value.mode === 'duration' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
          ]}
          onPress={() => handleModeChange('duration')}
          disabled={disabled}
        >
          <Clock size={20} color={value.mode === 'duration' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.modeOptionText,
              {
                color: value.mode === 'duration' ? colors.primary : colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
              },
            ]}
          >
            {language === 'ar' ? 'تحديد المدة' : 'Duration Selection'}
          </Text>
          {value.mode === 'duration' && <Check size={16} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      {/* Start Date Input */}
      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'تاريخ البداية *' : 'Start Date *'}
        </Text>
        <DatePicker
          value={value.startDate}
          onDateChange={handleStartDateChange}
          placeholder={language === 'ar' ? 'اختر تاريخ البداية' : 'Select start date'}
          disabled={disabled}
          minDate={minStartDate}
        />
      </View>

      {/* Duration Selection (Duration Mode) */}
      {value.mode === 'duration' && (
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'مدة العقد *' : 'Contract Duration *'}
          </Text>
          <TouchableOpacity
            style={[
              styles.durationSelector,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            onPress={() => setShowDurationPicker(!showDurationPicker)}
            disabled={disabled}
          >
            <View style={[styles.durationContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Clock size={20} color={colors.textSecondary} />
              <Text
                style={[
                  styles.durationText,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {getDurationLabel()}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {showDurationPicker && (
            <View style={[styles.durationDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.months}
                  style={[
                    styles.durationOption,
                    value.durationMonths === option.months && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => handleDurationChange(option.months)}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value.durationMonths === option.months && (
                    <Check size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* End Date Input (Manual Mode) */}
      {value.mode === 'manual' && (
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تاريخ النهاية *' : 'End Date *'}
          </Text>
          <View style={styles.inputWrapper}>
            <View style={[styles.inputIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Calendar size={20} color={colors.textSecondary} />
            </View>
            <DatePicker
              value={value.endDate || ''}
              onDateChange={handleEndDateChange}
              placeholder={language === 'ar' ? 'اختر تاريخ النهاية' : 'Select end date'}
              disabled={disabled}
              minDate={value.startDate}
              style={styles.datePickerOverride}
            />
          </View>
        </View>
      )}

      {/* Calculated End Date Display (Duration Mode) */}
      {value.mode === 'duration' && value.endDate && (
        <View style={[styles.calculatedEndDate, { 
          backgroundColor: colors.surfaceSecondary, 
          borderColor: colors.success 
        }]}>
          <Text
            style={[
              styles.calculatedEndDateText,
              {
                color: colors.success,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تاريخ انتهاء العقد: ' : 'Contract end date: '}
            {(() => {
              const endDate = new Date(value.endDate);
              if (dateSystem === 'hijri') {
                const hijriResult = gregorianToHijri(endDate);
                return hijriResult.success && hijriResult.date 
                  ? formatHijriDate(hijriResult.date, 'full', language)
                  : formatDate(endDate);
              }
              return formatDate(endDate);
            })()}
          </Text>
          
          {/* Show both calendars for important dates */}
          {dateSystem === 'hijri' && (
            <Text
              style={[
                styles.alternateCalendarText,
                {
                  color: colors.textMuted,
                  fontFamily: 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {`(${formatDate(new Date(value.endDate))} ${language === 'ar' ? 'ميلادي' : 'Gregorian'})`}
            </Text>
          )}
          
          {/* Ramadan warning for contract dates */}
          {isCurrentlyRamadan && (
            <Text
              style={[
                styles.ramadanWarning,
                {
                  color: colors.warning,
                  fontFamily: 'Tajawal-Medium',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              🌙 {language === 'ar' ? 'ملاحظة: نحن في شهر رمضان المبارك' : 'Note: We are in the holy month of Ramadan'}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  modeSelection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  modeOptionText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    paddingLeft: 60,
    paddingRight: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: fontSize.md,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  durationSelector: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  durationContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  durationText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  durationDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    zIndex: 99999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 300,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  durationOptionText: {
    fontSize: fontSize.md,
  },
  calculatedEndDate: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  calculatedEndDateText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  alternateCalendarText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ramadanWarning: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  datePickerOverride: {
    flex: 1,
    marginBottom: 0,
  },
});