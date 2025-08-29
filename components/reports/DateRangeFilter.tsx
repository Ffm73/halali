import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Calendar, Clock, TrendingUp, Filter } from 'lucide-react-native';

interface DateRangeFilterProps {
  onRangeChange: (range: { startDate?: string; endDate?: string }) => void;
  onPresetSelect: (preset: string) => void;
}

export function DateRangeFilter({ onRangeChange, onPresetSelect }: DateRangeFilterProps) {
  const { language, isRTL, dateSystem, formatDate, isRamadan, getDaysUntilRamadan } = useLocalization();
  const { colors } = useTheme();
  const [customRange, setCustomRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('thisMonth');

  const presets = [
    {
      id: 'today',
      label: language === 'ar' ? 'اليوم' : 'Today',
      icon: Clock,
    },
    {
      id: 'thisWeek',
      label: language === 'ar' ? 'هذا الأسبوع' : 'This Week',
      icon: Calendar,
    },
    {
      id: 'thisMonth',
      label: language === 'ar' ? 'هذا الشهر' : 'This Month',
      icon: Calendar,
    },
    {
      id: 'thisHijriMonth',
      label: language === 'ar' ? 'هذا الشهر الهجري' : 'This Hijri Month',
      icon: Calendar,
      hijriOnly: true,
    },
    {
      id: 'thisQuarter',
      label: language === 'ar' ? 'هذا الربع' : 'This Quarter',
      icon: TrendingUp,
    },
    {
      id: 'thisYear',
      label: language === 'ar' ? 'هذا العام' : 'This Year',
      icon: TrendingUp,
    },
    {
      id: 'thisHijriYear',
      label: language === 'ar' ? 'هذا العام الهجري' : 'This Hijri Year',
      icon: TrendingUp,
      hijriOnly: true,
    },
    {
      id: 'custom',
      label: language === 'ar' ? 'نطاق مخصص' : 'Custom Range',
      icon: Filter,
    },
  ].filter(preset => !preset.hijriOnly || dateSystem === 'hijri');

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    onPresetSelect(presetId);
    
    if (presetId !== 'custom') {
      // Calculate date range for preset
      const today = new Date();
      let startDate: Date;
      let endDate: Date = today;
      
      switch (presetId) {
        case 'today':
          startDate = today;
          break;
        case 'thisWeek':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'thisQuarter':
          const quarter = Math.floor(today.getMonth() / 3);
          startDate = new Date(today.getFullYear(), quarter * 3, 1);
          break;
        case 'thisYear':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        case 'thisHijriMonth':
          // Approximate Hijri month calculation
          startDate = new Date(today);
          startDate.setDate(1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'thisHijriYear':
          // Approximate Hijri year calculation
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31);
          break;
        default:
          return;
      }
      
      const range = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
      
      setCustomRange(range);
      onRangeChange(range);
    }
  };

  // Add Ramadan indicator if relevant
  const showRamadanInfo = dateSystem === 'hijri' && language === 'ar';
  const isCurrentlyRamadan = isRamadan;
  const daysUntilRamadan = getDaysUntilRamadan();
  const handleCustomRangeChange = (range: { startDate?: string; endDate?: string }) => {
    setCustomRange(range);
    onRangeChange(range);
  };

  return (
    <Card style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
          <Calendar size={20} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'فترة التقرير' : 'Report Period'}
        </Text>
      </View>

      {/* Preset Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
        <View style={[styles.presets, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetButton,
                {
                  backgroundColor: selectedPreset === preset.id ? colors.primary : colors.surfaceSecondary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => handlePresetSelect(preset.id)}
              activeOpacity={0.8}
            >
              <preset.icon 
                size={16} 
                color={selectedPreset === preset.id ? colors.surface : colors.primary} 
              />
              <Text
                style={[
                  styles.presetText,
                  {
                    color: selectedPreset === preset.id ? colors.surface : colors.primary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  },
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Custom Date Range */}
      {selectedPreset === 'custom' && (
        <View style={styles.customRangeSection}>
          <DateRangePicker
            value={customRange}
            onRangeChange={handleCustomRangeChange}
            label={language === 'ar' ? 'النطاق المخصص' : 'Custom Range'}
          />
        </View>
      )}

      {/* Ramadan Information */}
      {showRamadanInfo && (
        <View style={[styles.ramadanInfo, { 
          backgroundColor: isCurrentlyRamadan ? colors.successLight : colors.primaryLight 
        }]}>
          <Text
            style={[
              styles.ramadanText,
              {
                color: isCurrentlyRamadan ? colors.success : colors.primary,
                fontFamily: 'Tajawal-Medium',
                textAlign: 'center',
              },
            ]}
          >
            {isCurrentlyRamadan 
              ? '🌙 رمضان مبارك'
              : `🌙 ${daysUntilRamadan} يوم حتى رمضان`
            }
          </Text>
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
  header: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  presetsScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  presets: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  presetText: {
    fontSize: fontSize.sm,
  },
  customRangeSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  ramadanInfo: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  ramadanText: {
    fontSize: fontSize.sm,
  },
});