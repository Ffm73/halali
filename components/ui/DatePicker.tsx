import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Calendar, ChevronLeft, ChevronRight, X, Check } from 'lucide-react-native';
import { 
  convertSystemDate,
  convertDateBetweenSystems,
  getCurrentDates,
  formatHijriDate, 
  formatGregorianDate,
  dateToHijri,
  hijriToDate,
  isHijriLeapYear,
  HijriDate,
  GregorianDate
} from '@/utils/dateConversion';

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  style?: any;
}

export function DatePicker({
  value,
  onDateChange,
  placeholder,
  label,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  style,
}: DatePickerProps) {
  const { language, isRTL, formatDate, dateSystem } = useLocalization();
  const { colors } = useTheme();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const [calendarMode, setCalendarMode] = useState<'gregorian' | 'hijri'>(dateSystem);
  const [displayDate, setDisplayDate] = useState(
    value ? new Date(value) : new Date()
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // Update calendar mode when date system changes
  React.useEffect(() => {
    setCalendarMode(dateSystem);
    setRefreshKey(prev => prev + 1);
  }, [dateSystem]);

  const gregorianMonths = language === 'ar' ? [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ] : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  const weekDays = language === 'ar' ? 
    ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] : 
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDisplayMonths = () => {
    return calendarMode === 'hijri' ? hijriMonths : gregorianMonths;
  };

  const getCurrentDisplayDate = () => {
    if (calendarMode === 'hijri') {
      try {
        const hijriResult = dateToHijri(displayDate);
        if (hijriResult.success && hijriResult.date) {
          const hijriDate = hijriResult.date as HijriDate;
          return formatHijriDate(hijriDate, 'monthYear', language);
        }
      } catch (error) {
        console.warn('Hijri date display error:', error);
      }
    } else {
      const months = getDisplayMonths();
      return `${months[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
    }
    
    // Fallback
    return displayDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Handle calendar mode toggle with proper date conversion
  const toggleCalendarMode = () => {
    const newMode = calendarMode === 'gregorian' ? 'hijri' : 'gregorian';
    
    try {
      if (newMode === 'hijri') {
        // Converting to Hijri - keep the same Gregorian date but show Hijri equivalent
        const hijriResult = dateToHijri(displayDate);
        if (hijriResult.success && hijriResult.date) {
          console.log('✅ Switched to Hijri calendar mode');
        }
      } else {
        // Converting to Gregorian - keep the same date
        console.log('✅ Switched to Gregorian calendar mode');
      }
    } catch (error) {
      console.warn('⚠️ Calendar mode switch error:', error);
    }
    
    setCalendarMode(newMode);
  };
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const isoString = date.toISOString().split('T')[0];
    onDateChange(isoString);
    setShowCalendar(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (calendarMode === 'hijri') {
      try {
        const currentHijriResult = dateToHijri(displayDate);
        
        if (currentHijriResult.success && currentHijriResult.date) {
          const currentHijri = currentHijriResult.date as HijriDate;
          let newMonth = currentHijri.month + (direction === 'next' ? 1 : -1);
          let newYear = currentHijri.year;
          
          if (newMonth > 12) {
            newMonth = 1;
            newYear++;
          } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
          }
          
          // Convert back to Gregorian for internal storage
          const gregorianResult = hijriToGregorian(newYear, newMonth, 1);
          
          if (gregorianResult.success && gregorianResult.date) {
            const gregorianDate = gregorianResult.date as GregorianDate;
            const newDisplayDate = new Date(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day);
            setDisplayDate(newDisplayDate);
            setCurrentMonth(newDisplayDate);
          }
        }
      } catch (error) {
        console.warn('Hijri month navigation error:', error);
      }
    } else {
      // Navigate Gregorian months
      const newMonth = new Date(displayDate);
      newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
      setDisplayDate(newMonth);
      setCurrentMonth(newMonth);
    }
  };

  const getDaysInMonth = (date: Date) => {
    if (calendarMode === 'hijri') {
      try {
        // Generate Hijri calendar days
        const hijriResult = dateToHijri(new Date(date.getFullYear(), date.getMonth(), 1));
        
        if (!hijriResult.success || !hijriResult.date) return [];
        
        const hijriDate = hijriResult.date as HijriDate;
        const monthDays = getHijriMonthDays(hijriDate.year, hijriDate.month);
        
        // Get the first day of the Hijri month in Gregorian
        const firstDayResult = hijriToGregorian(hijriDate.year, hijriDate.month, 1);
        
        if (!firstDayResult.success || !firstDayResult.date) return [];
        
        const firstDayGregorian = firstDayResult.date as GregorianDate;
        const firstDayDate = new Date(firstDayGregorian.year, firstDayGregorian.month - 1, firstDayGregorian.day);
        const startingDayOfWeek = firstDayDate.getDay();
        
        const days: (Date | null)[] = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
          days.push(null);
        }
        
        // Add all days of the Hijri month
        for (let day = 1; day <= monthDays; day++) {
          const dayResult = hijriToGregorian(hijriDate.year, hijriDate.month, day);
          
          if (dayResult.success && dayResult.date) {
            const dayGregorian = dayResult.date as GregorianDate;
            days.push(new Date(dayGregorian.year, dayGregorian.month - 1, dayGregorian.day));
          }
        }
        
        return days;
      } catch (error) {
        console.warn('Hijri calendar generation error:', error);
        return [];
      }
    } else {
      // Generate Gregorian calendar days (existing logic)
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days: (Date | null)[] = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    }
  };

  // Helper function to get days in Hijri month
  const getHijriMonthDays = (year: number, month: number): number => {
    const hijriMonths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]; // Standard month lengths
    let days = hijriMonths[month - 1];
    
    // Dhu al-Hijjah (month 12) has 30 days in leap years
    if (month === 12 && isHijriLeapYear(year)) {
      days = 30;
    }
    
    return days;
  };

  const renderCalendar = () => (
    <Modal
      visible={showCalendar}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.calendarCard, { backgroundColor: colors.surface }]}>
            {/* Calendar Header */}
            <View style={[styles.calendarHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => navigateMonth('prev')}
                activeOpacity={0.7}
              >
                {isRTL ? (
                  <ChevronRight size={20} color={colors.textPrimary} />
                ) : (
                  <ChevronLeft size={20} color={colors.textPrimary} />
                )}
              </TouchableOpacity>
              
              <View style={styles.monthYearContainer}>
                <Text
                  style={[
                    styles.monthYearText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                      textAlign: 'center',
                    },
                  ]}
                >
                  {getCurrentDisplayDate()}
                </Text>
                
                {/* Calendar Mode Toggle */}
                <TouchableOpacity
                  style={[styles.calendarModeToggle, { backgroundColor: colors.primaryLight }]}
                  onPress={toggleCalendarMode}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.calendarModeText,
                      {
                        color: colors.primary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      },
                    ]}
                  >
                    {calendarMode === 'hijri' 
                      ? (language === 'ar' ? 'هجري' : 'Hijri')
                      : (language === 'ar' ? 'ميلادي' : 'Gregorian')
                    }
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => navigateMonth('next')}
                activeOpacity={0.7}
              >
                {isRTL ? (
                  <ChevronLeft size={20} color={colors.textPrimary} />
                ) : (
                  <ChevronRight size={20} color={colors.textPrimary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.dangerLight }]}
                onPress={() => setShowCalendar(false)}
                activeOpacity={0.7}
              >
                <X size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View style={[styles.weekDaysHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text
                    style={[
                      styles.weekDayText,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <ScrollView style={styles.calendarGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.calendarRows}>
                {Array.from({ length: Math.ceil(getDaysInMonth(currentMonth).length / 7) }, (_, weekIndex) => (
                  <View key={weekIndex} style={[styles.calendarRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {getDaysInMonth(currentMonth)
                      .slice(weekIndex * 7, (weekIndex + 1) * 7)
                      .map((date, dayIndex) => {
                        if (!date) {
                          return <View key={dayIndex} style={styles.emptyDayCell} />;
                        }

                        const isSelected = selectedDate && 
                          date.getDate() === selectedDate.getDate() &&
                          date.getMonth() === selectedDate.getMonth() &&
                          date.getFullYear() === selectedDate.getFullYear();
                        
                        const isToday = 
                          date.getDate() === new Date().getDate() &&
                          date.getMonth() === new Date().getMonth() &&
                          date.getFullYear() === new Date().getFullYear();
                        
                        const isDisabled = isDateDisabled(date);

                        return (
                          <TouchableOpacity
                            key={dayIndex}
                            style={[
                              styles.dayCell,
                              isSelected && { backgroundColor: colors.primary },
                              isToday && !isSelected && { backgroundColor: colors.primaryLight },
                              isDisabled && { opacity: 0.3 },
                            ]}
                            onPress={() => !isDisabled && handleDateSelect(date)}
                            disabled={isDisabled}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                {
                                  color: isSelected ? colors.surface : 
                                         isToday ? colors.primary : colors.textPrimary,
                                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                                },
                              ]}
                            >
                              {date.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Quick Date Options */}
            <View style={styles.quickDateOptions}>
              <TouchableOpacity
                style={[styles.quickDateButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => handleDateSelect(new Date())}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    {
                      color: colors.primary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {language === 'ar' ? 'اليوم' : 'Today'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickDateButton, { backgroundColor: colors.successLight }]}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleDateSelect(tomorrow);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    {
                      color: colors.success,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {language === 'ar' ? 'غداً' : 'Tomorrow'}
                </Text>
              </TouchableOpacity>
              
              {/* Hijri Today Button */}
              {calendarMode === 'hijri' && (
                <TouchableOpacity
                  style={[styles.quickDateButton, { backgroundColor: colors.warningLight }]}
                  onPress={() => handleDateSelect(new Date())}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickDateText,
                      {
                        color: colors.warning,
                        fontFamily: 'Tajawal-Medium',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'اليوم هجري' : 'Today Hijri'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

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
      
      <TouchableOpacity
        style={[
          styles.dateInput,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          disabled && { opacity: 0.5 },
        ]}
        onPress={() => !disabled && setShowCalendar(true)}
        activeOpacity={0.7}
      >
        <View style={[styles.dateInputContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.dateIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Calendar size={20} color={colors.textSecondary} />
          </View>
          <Text
            style={[
              styles.dateText,
              {
                color: value ? colors.textPrimary : colors.textMuted,
                fontFamily: value ? 'monospace' : (language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular'),
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {value ? formatDate(value) : (placeholder || (language === 'ar' ? 'اختر التاريخ' : 'Select Date'))}
          </Text>
        </View>
      </TouchableOpacity>

      {renderCalendar()}
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
  dateInput: {
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
  dateInputContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  calendarCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  calendarHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: fontSize.lg,
  },
  calendarModeToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  calendarModeText: {
    fontSize: fontSize.xs,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysHeader: {
    marginBottom: spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  calendarGrid: {
    maxHeight: 300,
  },
  calendarRows: {
    gap: spacing.xs,
  },
  calendarRow: {
    gap: spacing.xs,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 44,
  },
  emptyDayCell: {
    flex: 1,
    aspectRatio: 1,
  },
  dayText: {
    fontSize: fontSize.md,
  },
  quickDateOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quickDateButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: fontSize.sm,
  },
});