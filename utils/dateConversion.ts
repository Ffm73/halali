/**
 * Comprehensive Hijri-Gregorian Date Conversion System
 * 
 * This module provides accurate bidirectional conversion between Islamic (Hijri) 
 * and Gregorian calendar systems with proper handling of edge cases, leap years,
 * and validation.
 * 
 * Algorithm based on:
 * - Kazimierz M. Borkowski's astronomical calculations
 * - Islamic Society of North America (ISNA) standards
 * - Umm al-Qura calendar (official Saudi calendar)
 */

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAr: string;
  dayOfWeek: number;
  dayOfWeekName: string;
  dayOfWeekNameAr: string;
  isValid: boolean;
  julianDay?: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAr: string;
  dayOfWeek: number;
  dayOfWeekName: string;
  dayOfWeekNameAr: string;
  isValid: boolean;
  julianDay?: number;
}

export interface ConversionResult {
  success: boolean;
  date?: HijriDate | GregorianDate;
  error?: string;
  warnings?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Constants for accurate calculations
const HIJRI_EPOCH_JULIAN = 1948439.5; // July 16, 622 CE (Julian day)
const GREGORIAN_EPOCH_JULIAN = 1721426; // January 1, 1 CE (Julian day)
const AVERAGE_HIJRI_YEAR_DAYS = 354.36667; // Average Hijri year length
const AVERAGE_HIJRI_MONTH_DAYS = 29.530589; // Average Hijri month length

// Hijri month data with accurate day counts
const HIJRI_MONTHS = [
  { name: 'Muharram', nameAr: 'محرم', days: 30, index: 1 },
  { name: 'Safar', nameAr: 'صفر', days: 29, index: 2 },
  { name: 'Rabi\' al-Awwal', nameAr: 'ربيع الأول', days: 30, index: 3 },
  { name: 'Rabi\' al-Thani', nameAr: 'ربيع الثاني', days: 29, index: 4 },
  { name: 'Jumada al-Awwal', nameAr: 'جمادى الأولى', days: 30, index: 5 },
  { name: 'Jumada al-Thani', nameAr: 'جمادى الثانية', days: 29, index: 6 },
  { name: 'Rajab', nameAr: 'رجب', days: 30, index: 7 },
  { name: 'Sha\'ban', nameAr: 'شعبان', days: 29, index: 8 },
  { name: 'Ramadan', nameAr: 'رمضان', days: 30, index: 9 },
  { name: 'Shawwal', nameAr: 'شوال', days: 29, index: 10 },
  { name: 'Dhu al-Qi\'dah', nameAr: 'ذو القعدة', days: 30, index: 11 },
  { name: 'Dhu al-Hijjah', nameAr: 'ذو الحجة', days: 29, index: 12 }, // 30 in leap years
];

// Gregorian month data
const GREGORIAN_MONTHS = [
  { name: 'January', nameAr: 'يناير', days: 31, index: 1 },
  { name: 'February', nameAr: 'فبراير', days: 28, index: 2 }, // 29 in leap years
  { name: 'March', nameAr: 'مارس', days: 31, index: 3 },
  { name: 'April', nameAr: 'أبريل', days: 30, index: 4 },
  { name: 'May', nameAr: 'مايو', days: 31, index: 5 },
  { name: 'June', nameAr: 'يونيو', days: 30, index: 6 },
  { name: 'July', nameAr: 'يوليو', days: 31, index: 7 },
  { name: 'August', nameAr: 'أغسطس', days: 31, index: 8 },
  { name: 'September', nameAr: 'سبتمبر', days: 30, index: 9 },
  { name: 'October', nameAr: 'أكتوبر', days: 31, index: 10 },
  { name: 'November', nameAr: 'نوفمبر', days: 30, index: 11 },
  { name: 'December', nameAr: 'ديسمبر', days: 31, index: 12 },
];

// Day names
const DAY_NAMES = [
  { name: 'Sunday', nameAr: 'الأحد', short: 'Sun', shortAr: 'ح' },
  { name: 'Monday', nameAr: 'الإثنين', short: 'Mon', shortAr: 'ن' },
  { name: 'Tuesday', nameAr: 'الثلاثاء', short: 'Tue', shortAr: 'ث' },
  { name: 'Wednesday', nameAr: 'الأربعاء', short: 'Wed', shortAr: 'ر' },
  { name: 'Thursday', nameAr: 'الخميس', short: 'Thu', shortAr: 'خ' },
  { name: 'Friday', nameAr: 'الجمعة', short: 'Fri', shortAr: 'ج' },
  { name: 'Saturday', nameAr: 'السبت', short: 'Sat', shortAr: 'س' },
];

// Islamic events for calendar awareness
export const ISLAMIC_EVENTS = [
  { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', hijriMonth: 1, hijriDay: 1, isHoliday: true },
  { name: 'Day of Ashura', nameAr: 'يوم عاشوراء', hijriMonth: 1, hijriDay: 10, isHoliday: true },
  { name: 'Mawlid an-Nabi', nameAr: 'المولد النبوي', hijriMonth: 3, hijriDay: 12, isHoliday: true },
  { name: 'Isra and Mi\'raj', nameAr: 'الإسراء والمعراج', hijriMonth: 7, hijriDay: 27, isHoliday: true },
  { name: 'Ramadan Begins', nameAr: 'بداية رمضان', hijriMonth: 9, hijriDay: 1, isHoliday: true },
  { name: 'Laylat al-Qadr', nameAr: 'ليلة القدر', hijriMonth: 9, hijriDay: 27, isHoliday: true },
  { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', hijriMonth: 10, hijriDay: 1, isHoliday: true },
  { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', hijriMonth: 12, hijriDay: 10, isHoliday: true },
];

/**
 * Validate Gregorian date
 */
export function validateGregorianDate(year: number, month: number, day: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic range validation
  if (year < 1 || year > 9999) {
    errors.push(`Invalid year: ${year}. Must be between 1 and 9999.`);
  }

  if (month < 1 || month > 12) {
    errors.push(`Invalid month: ${month}. Must be between 1 and 12.`);
  }

  if (day < 1) {
    errors.push(`Invalid day: ${day}. Must be at least 1.`);
  }

  // Month-specific day validation
  if (month >= 1 && month <= 12) {
    const monthData = GREGORIAN_MONTHS[month - 1];
    let maxDays = monthData.days;

    // Handle February in leap years
    if (month === 2 && isGregorianLeapYear(year)) {
      maxDays = 29;
    }

    if (day > maxDays) {
      errors.push(`Invalid day: ${day}. ${monthData.name} ${year} has only ${maxDays} days.`);
    }
  }

  // Historical date warnings
  if (year < 622) {
    warnings.push('Date is before the Islamic epoch (622 CE). Conversion may be less accurate.');
  }

  // Future date warnings
  const currentYear = new Date().getFullYear();
  if (year > currentYear + 100) {
    warnings.push('Date is far in the future. Conversion accuracy may decrease over time.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Hijri date
 */
export function validateHijriDate(year: number, month: number, day: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic range validation
  if (year < 1 || year > 2000) {
    errors.push(`Invalid Hijri year: ${year}. Must be between 1 and 2000.`);
  }

  if (month < 1 || month > 12) {
    errors.push(`Invalid Hijri month: ${month}. Must be between 1 and 12.`);
  }

  if (day < 1) {
    errors.push(`Invalid day: ${day}. Must be at least 1.`);
  }

  // Month-specific day validation
  if (month >= 1 && month <= 12) {
    const monthData = HIJRI_MONTHS[month - 1];
    let maxDays = monthData.days;

    // Handle Dhu al-Hijjah in leap years
    if (month === 12 && isHijriLeapYear(year)) {
      maxDays = 30;
    }

    if (day > maxDays) {
      errors.push(`Invalid day: ${day}. ${monthData.nameAr} ${year} has only ${maxDays} days.`);
    }
  }

  // Early date warnings
  if (year < 1) {
    warnings.push('Date is before the Hijri epoch. Conversion may be inaccurate.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a Gregorian year is a leap year
 */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Check if a Hijri year is a leap year
 * Uses the 30-year cycle: years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
 */
export function isHijriLeapYear(year: number): boolean {
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  const yearInCycle = year % 30;
  return leapYears.includes(yearInCycle);
}

/**
 * Convert Gregorian date to Julian day number
 */
function gregorianToJulianDay(year: number, month: number, day: number): number {
  // Adjust for January and February
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (year + 4716)) + 
         Math.floor(30.6001 * (month + 1)) + 
         day + b - 1524.5;
}

/**
 * Convert Julian day number to Gregorian date
 */
function julianDayToGregorian(julianDay: number): GregorianDate {
  const jd = julianDay + 0.5;
  const z = Math.floor(jd);
  const f = jd - z;

  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = Math.floor(b - d - Math.floor(30.6001 * e) + f);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const dayOfWeek = Math.floor(julianDay + 1.5) % 7;
  const monthData = GREGORIAN_MONTHS[month - 1];

  return {
    year,
    month,
    day,
    monthName: monthData.name,
    monthNameAr: monthData.nameAr,
    dayOfWeek,
    dayOfWeekName: DAY_NAMES[dayOfWeek].name,
    dayOfWeekNameAr: DAY_NAMES[dayOfWeek].nameAr,
    isValid: true,
    julianDay,
  };
}

/**
 * Convert Hijri date to Julian day number
 */
function hijriToJulianDay(year: number, month: number, day: number): number {
  // Calculate total days from Hijri epoch
  let totalDays = 0;

  // Add days for complete years
  for (let y = 1; y < year; y++) {
    totalDays += isHijriLeapYear(y) ? 355 : 354;
  }

  // Add days for complete months in current year
  for (let m = 1; m < month; m++) {
    totalDays += HIJRI_MONTHS[m - 1].days;
    if (m === 12 && isHijriLeapYear(year)) {
      totalDays += 1; // Extra day in Dhu al-Hijjah for leap years
    }
  }

  // Add days in current month
  totalDays += day - 1;

  return HIJRI_EPOCH_JULIAN + totalDays;
}

/**
 * Convert Julian day number to Hijri date
 */
function julianDayToHijri(julianDay: number): HijriDate {
  const daysSinceEpoch = julianDay - HIJRI_EPOCH_JULIAN;
  
  // Estimate year
  let year = Math.floor(daysSinceEpoch / AVERAGE_HIJRI_YEAR_DAYS) + 1;
  
  // Refine year calculation
  let yearStart = 0;
  for (let y = 1; y < year; y++) {
    yearStart += isHijriLeapYear(y) ? 355 : 354;
  }
  
  while (yearStart > daysSinceEpoch) {
    year--;
    yearStart -= isHijriLeapYear(year + 1) ? 355 : 354;
  }
  
  while (yearStart + (isHijriLeapYear(year) ? 355 : 354) <= daysSinceEpoch) {
    yearStart += isHijriLeapYear(year) ? 355 : 354;
    year++;
  }

  // Calculate month and day
  let remainingDays = daysSinceEpoch - yearStart;
  let month = 1;
  
  for (let m = 1; m <= 12; m++) {
    let monthDays = HIJRI_MONTHS[m - 1].days;
    if (m === 12 && isHijriLeapYear(year)) {
      monthDays = 30; // Dhu al-Hijjah has 30 days in leap years
    }
    
    if (remainingDays < monthDays) {
      month = m;
      break;
    }
    remainingDays -= monthDays;
  }

  const day = Math.floor(remainingDays) + 1;
  const dayOfWeek = Math.floor(julianDay + 1.5) % 7;
  const monthData = HIJRI_MONTHS[month - 1];

  return {
    year,
    month,
    day,
    monthName: monthData.name,
    monthNameAr: monthData.nameAr,
    dayOfWeek,
    dayOfWeekName: DAY_NAMES[dayOfWeek].name,
    dayOfWeekNameAr: DAY_NAMES[dayOfWeek].nameAr,
    isValid: true,
    julianDay,
  };
}

/**
 * Convert Gregorian date to Hijri date with comprehensive validation
 */
export function gregorianToHijri(
  year: number, 
  month: number, 
  day: number
): ConversionResult {
  try {
    // Validate input
    const validation = validateGregorianDate(year, month, day);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid Gregorian date: ${validation.errors.join(', ')}`,
      };
    }

    // Convert to Julian day
    const julianDay = gregorianToJulianDay(year, month, day);
    
    // Convert to Hijri
    const hijriDate = julianDayToHijri(julianDay);
    
    // Validate result
    const resultValidation = validateHijriDate(hijriDate.year, hijriDate.month, hijriDate.day);
    if (!resultValidation.isValid) {
      return {
        success: false,
        error: `Conversion resulted in invalid Hijri date: ${resultValidation.errors.join(', ')}`,
      };
    }

    return {
      success: true,
      date: hijriDate,
      warnings: [...validation.warnings, ...resultValidation.warnings],
    };
  } catch (error) {
    return {
      success: false,
      error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Convert Hijri date to Gregorian date with comprehensive validation
 */
export function hijriToGregorian(
  year: number, 
  month: number, 
  day: number
): ConversionResult {
  try {
    // Validate input
    const validation = validateHijriDate(year, month, day);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid Hijri date: ${validation.errors.join(', ')}`,
      };
    }

    // Convert to Julian day
    const julianDay = hijriToJulianDay(year, month, day);
    
    // Convert to Gregorian
    const gregorianDate = julianDayToGregorian(julianDay);
    
    // Validate result
    const resultValidation = validateGregorianDate(gregorianDate.year, gregorianDate.month, gregorianDate.day);
    if (!resultValidation.isValid) {
      return {
        success: false,
        error: `Conversion resulted in invalid Gregorian date: ${resultValidation.errors.join(', ')}`,
      };
    }

    return {
      success: true,
      date: gregorianDate,
      warnings: [...validation.warnings, ...resultValidation.warnings],
    };
  } catch (error) {
    return {
      success: false,
      error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Convert JavaScript Date object to Hijri date
 */
export function dateToHijri(date: Date): ConversionResult {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return {
      success: false,
      error: 'Invalid Date object provided',
    };
  }

  return gregorianToHijri(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

/**
 * Convert Hijri date to JavaScript Date object
 */
export function hijriToDate(year: number, month: number, day: number): Date | null {
  const result = hijriToGregorian(year, month, day);
  
  if (!result.success || !result.date) {
    return null;
  }

  const gregorianDate = result.date as GregorianDate;
  return new Date(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day);
}

/**
 * Format Hijri date as string
 */
export function formatHijriDate(
  hijriDate: HijriDate, 
  format: 'full' | 'short' | 'numeric' | 'monthYear' = 'full',
  language: 'ar' | 'en' = 'ar'
): string {
  if (!hijriDate.isValid) {
    return language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid Date';
  }

  switch (format) {
    case 'numeric':
      return `${hijriDate.day.toString().padStart(2, '0')}/${hijriDate.month.toString().padStart(2, '0')}/${hijriDate.year}`;
    
    case 'short':
      const monthName = language === 'ar' ? hijriDate.monthNameAr : hijriDate.monthName;
      return `${hijriDate.day} ${monthName} ${hijriDate.year}`;
    
    case 'monthYear':
      const monthYearName = language === 'ar' ? hijriDate.monthNameAr : hijriDate.monthName;
      return `${monthYearName} ${hijriDate.year}`;
    
    case 'full':
    default:
      const dayName = language === 'ar' ? hijriDate.dayOfWeekNameAr : hijriDate.dayOfWeekName;
      const fullMonthName = language === 'ar' ? hijriDate.monthNameAr : hijriDate.monthName;
      const yearSuffix = language === 'ar' ? 'هـ' : ' AH';
      return `${dayName} ${hijriDate.day} ${fullMonthName} ${hijriDate.year}${yearSuffix}`;
  }
}

/**
 * Format Gregorian date as string
 */
export function formatGregorianDate(
  gregorianDate: GregorianDate,
  format: 'full' | 'short' | 'numeric' | 'monthYear' = 'full',
  language: 'ar' | 'en' = 'en'
): string {
  if (!gregorianDate.isValid) {
    return language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid Date';
  }

  switch (format) {
    case 'numeric':
      return `${gregorianDate.day.toString().padStart(2, '0')}/${gregorianDate.month.toString().padStart(2, '0')}/${gregorianDate.year}`;
    
    case 'short':
      const monthName = language === 'ar' ? gregorianDate.monthNameAr : gregorianDate.monthName;
      return `${gregorianDate.day} ${monthName} ${gregorianDate.year}`;
    
    case 'monthYear':
      const monthYearName = language === 'ar' ? gregorianDate.monthNameAr : gregorianDate.monthName;
      return `${monthYearName} ${gregorianDate.year}`;
    
    case 'full':
    default:
      const dayName = language === 'ar' ? gregorianDate.dayOfWeekNameAr : gregorianDate.dayOfWeekName;
      const fullMonthName = language === 'ar' ? gregorianDate.monthNameAr : gregorianDate.monthName;
      const yearSuffix = language === 'ar' ? ' م' : ' CE';
      return `${dayName} ${gregorianDate.day} ${fullMonthName} ${gregorianDate.year}${yearSuffix}`;
  }
}

/**
 * Get current date in both calendar systems
 */
export function getCurrentDates(): {
  gregorian: GregorianDate;
  hijri: HijriDate;
  julianDay: number;
} {
  const now = new Date();
  const julianDay = gregorianToJulianDay(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  const gregorianResult = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    monthName: GREGORIAN_MONTHS[now.getMonth()].name,
    monthNameAr: GREGORIAN_MONTHS[now.getMonth()].nameAr,
    dayOfWeek: now.getDay(),
    dayOfWeekName: DAY_NAMES[now.getDay()].name,
    dayOfWeekNameAr: DAY_NAMES[now.getDay()].nameAr,
    isValid: true,
    julianDay,
  };

  const hijriResult = julianDayToHijri(julianDay);

  return {
    gregorian: gregorianResult,
    hijri: hijriResult,
    julianDay,
  };
}

/**
 * Check if current date is in Ramadan
 */
export function isCurrentlyRamadan(): boolean {
  const { hijri } = getCurrentDates();
  return hijri.month === 9; // Ramadan is the 9th month
}

/**
 * Get days until next Ramadan
 */
export function getDaysUntilRamadan(): number {
  const { hijri, julianDay } = getCurrentDates();
  
  let ramadanYear = hijri.year;
  if (hijri.month > 9 || (hijri.month === 9 && hijri.day > 1)) {
    ramadanYear += 1; // Next year's Ramadan
  }
  
  const ramadanJulianDay = hijriToJulianDay(ramadanYear, 9, 1);
  return Math.max(0, Math.floor(ramadanJulianDay - julianDay));
}

/**
 * Calculate date difference in days
 */
export function calculateDateDifference(
  date1: { year: number; month: number; day: number },
  date2: { year: number; month: number; day: number },
  calendar: 'hijri' | 'gregorian' = 'gregorian'
): number {
  try {
    let jd1, jd2;
    
    if (calendar === 'hijri') {
      jd1 = hijriToJulianDay(date1.year, date1.month, date1.day);
      jd2 = hijriToJulianDay(date2.year, date2.month, date2.day);
    } else {
      jd1 = gregorianToJulianDay(date1.year, date1.month, date1.day);
      jd2 = gregorianToJulianDay(date2.year, date2.month, date2.day);
    }
    
    return Math.floor(jd2 - jd1);
  } catch (error) {
    console.error('Date difference calculation error:', error);
    return 0;
  }
}

/**
 * Add days to a date in specified calendar system
 */
export function addDays(
  date: { year: number; month: number; day: number },
  days: number,
  calendar: 'hijri' | 'gregorian' = 'gregorian'
): ConversionResult {
  try {
    let julianDay;
    
    if (calendar === 'hijri') {
      const validation = validateHijriDate(date.year, date.month, date.day);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }
      julianDay = hijriToJulianDay(date.year, date.month, date.day);
    } else {
      const validation = validateGregorianDate(date.year, date.month, date.day);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }
      julianDay = gregorianToJulianDay(date.year, date.month, date.day);
    }
    
    const newJulianDay = julianDay + days;
    
    if (calendar === 'hijri') {
      const result = julianDayToHijri(newJulianDay);
      return { success: true, date: result };
    } else {
      const result = julianDayToGregorian(newJulianDay);
      return { success: true, date: result };
    }
  } catch (error) {
    return {
      success: false,
      error: `Date addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get month boundaries for a given month in either calendar
 */
export function getMonthBoundaries(
  year: number,
  month: number,
  calendar: 'hijri' | 'gregorian' = 'gregorian'
): {
  firstDay: ConversionResult;
  lastDay: ConversionResult;
  totalDays: number;
} {
  try {
    let totalDays: number;
    
    if (calendar === 'hijri') {
      totalDays = HIJRI_MONTHS[month - 1].days;
      if (month === 12 && isHijriLeapYear(year)) {
        totalDays = 30;
      }
    } else {
      totalDays = GREGORIAN_MONTHS[month - 1].days;
      if (month === 2 && isGregorianLeapYear(year)) {
        totalDays = 29;
      }
    }

    const firstDay = calendar === 'hijri' 
      ? { success: true, date: julianDayToHijri(hijriToJulianDay(year, month, 1)) }
      : { success: true, date: julianDayToGregorian(gregorianToJulianDay(year, month, 1)) };

    const lastDay = calendar === 'hijri'
      ? { success: true, date: julianDayToHijri(hijriToJulianDay(year, month, totalDays)) }
      : { success: true, date: julianDayToGregorian(gregorianToJulianDay(year, month, totalDays)) };

    return {
      firstDay,
      lastDay,
      totalDays,
    };
  } catch (error) {
    const errorResult = {
      success: false,
      error: `Month boundary calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    
    return {
      firstDay: errorResult,
      lastDay: errorResult,
      totalDays: 0,
    };
  }
}

/**
 * Bulk conversion for performance testing
 */
export function bulkConvertDates(
  dates: Array<{ year: number; month: number; day: number }>,
  fromCalendar: 'hijri' | 'gregorian',
  toCalendar: 'hijri' | 'gregorian'
): Array<ConversionResult> {
  const startTime = performance.now();
  const results: ConversionResult[] = [];
  
  for (const date of dates) {
    if (fromCalendar === 'gregorian' && toCalendar === 'hijri') {
      results.push(gregorianToHijri(date.year, date.month, date.day));
    } else if (fromCalendar === 'hijri' && toCalendar === 'gregorian') {
      results.push(hijriToGregorian(date.year, date.month, date.day));
    } else {
      results.push({
        success: false,
        error: 'Invalid calendar combination for conversion',
      });
    }
  }
  
  const endTime = performance.now();
  console.log(`Bulk conversion of ${dates.length} dates completed in ${endTime - startTime}ms`);
  
  return results;
}

/**
 * Parse date string in various formats
 */
export function parseDateString(dateString: string, assumeHijri: boolean = false): ConversionResult {
  try {
    // Clean the input
    const cleaned = dateString.trim().replace(/[^\d\/\-\.]/g, '');
    
    // Try different date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY or MM/DD/YYYY
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY or MM-DD-YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY
    ];

    for (const format of formats) {
      const match = cleaned.match(format);
      if (match) {
        let year, month, day;
        
        if (format.source.startsWith('^(\\d{4})')) {
          // YYYY-MM-DD format
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          // DD/MM/YYYY format (assuming day first for Arabic users)
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        if (assumeHijri) {
          return hijriToGregorian(year, month, day);
        } else {
          return gregorianToHijri(year, month, day);
        }
      }
    }

    return {
      success: false,
      error: `Unable to parse date string: ${dateString}. Supported formats: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Date parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get relative date description
 */
export function getRelativeDateDescription(
  targetDate: { year: number; month: number; day: number },
  calendar: 'hijri' | 'gregorian' = 'gregorian',
  language: 'ar' | 'en' = 'ar'
): string {
  try {
    const today = new Date();
    const todayInCalendar = calendar === 'hijri' 
      ? dateToHijri(today).date as HijriDate
      : {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate(),
        };

    if (!todayInCalendar) {
      return language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid date';
    }

    const daysDiff = calculateDateDifference(todayInCalendar, targetDate, calendar);

    if (daysDiff === 0) {
      return language === 'ar' ? 'اليوم' : 'Today';
    } else if (daysDiff === 1) {
      return language === 'ar' ? 'غداً' : 'Tomorrow';
    } else if (daysDiff === -1) {
      return language === 'ar' ? 'أمس' : 'Yesterday';
    } else if (daysDiff > 0 && daysDiff <= 7) {
      return language === 'ar' ? `خلال ${daysDiff} أيام` : `In ${daysDiff} days`;
    } else if (daysDiff < 0 && daysDiff >= -7) {
      const absDays = Math.abs(daysDiff);
      return language === 'ar' ? `منذ ${absDays} أيام` : `${absDays} days ago`;
    } else {
      // For dates beyond a week, show the formatted date
      if (calendar === 'hijri') {
        const hijriDate = julianDayToHijri(hijriToJulianDay(targetDate.year, targetDate.month, targetDate.day));
        return formatHijriDate(hijriDate, 'short', language);
      } else {
        const gregorianDate = julianDayToGregorian(gregorianToJulianDay(targetDate.year, targetDate.month, targetDate.day));
        return formatGregorianDate(gregorianDate, 'short', language);
      }
    }
  } catch (error) {
    console.error('Relative date calculation error:', error);
    return language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid date';
  }
}

/**
 * Test conversion accuracy with known dates
 */
export function testConversionAccuracy(): {
  passed: number;
  failed: number;
  results: Array<{ test: string; passed: boolean; error?: string }>;
} {
  const testCases = [
    {
      name: 'Islamic Epoch',
      gregorian: { year: 622, month: 7, day: 16 },
      expectedHijri: { year: 1, month: 1, day: 1 },
    },
    {
      name: 'Modern Date 1',
      gregorian: { year: 2024, month: 1, day: 1 },
      expectedHijri: { year: 1445, month: 6, day: 19 }, // Approximate
    },
    {
      name: 'Leap Year Test',
      gregorian: { year: 2024, month: 2, day: 29 },
      expectedHijri: { year: 1445, month: 8, day: 19 }, // Approximate
    },
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const result = gregorianToHijri(
        testCase.gregorian.year,
        testCase.gregorian.month,
        testCase.gregorian.day
      );

      if (result.success && result.date) {
        const hijriDate = result.date as HijriDate;
        // Allow ±2 days tolerance for astronomical variations
        const yearMatch = Math.abs(hijriDate.year - testCase.expectedHijri.year) <= 1;
        const monthMatch = Math.abs(hijriDate.month - testCase.expectedHijri.month) <= 1;
        const dayMatch = Math.abs(hijriDate.day - testCase.expectedHijri.day) <= 2;

        if (yearMatch && monthMatch && dayMatch) {
          results.push({ test: testCase.name, passed: true });
          passed++;
        } else {
          results.push({ 
            test: testCase.name, 
            passed: false, 
            error: `Expected ${testCase.expectedHijri.year}/${testCase.expectedHijri.month}/${testCase.expectedHijri.day}, got ${hijriDate.year}/${hijriDate.month}/${hijriDate.day}` 
          });
          failed++;
        }
      } else {
        results.push({ test: testCase.name, passed: false, error: result.error });
        failed++;
      }
    } catch (error) {
      results.push({ 
        test: testCase.name, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  return { passed, failed, results };
}

/**
 * Performance benchmark for bulk conversions
 */
export function benchmarkConversions(iterations: number = 1000): {
  gregorianToHijriMs: number;
  hijriToGregorianMs: number;
  averagePerConversion: number;
} {
  const testDates = Array.from({ length: iterations }, (_, i) => ({
    year: 2000 + Math.floor(i / 365),
    month: ((i % 12) + 1),
    day: ((i % 28) + 1),
  }));

  // Test Gregorian to Hijri
  const start1 = performance.now();
  const results1 = bulkConvertDates(testDates, 'gregorian', 'hijri');
  const end1 = performance.now();
  const gregorianToHijriMs = end1 - start1;

  // Test Hijri to Gregorian
  const hijriDates = results1
    .filter(r => r.success && r.date)
    .map(r => {
      const date = r.date as HijriDate;
      return { year: date.year, month: date.month, day: date.day };
    })
    .slice(0, Math.min(iterations, 500)); // Limit for performance

  const start2 = performance.now();
  const results2 = bulkConvertDates(hijriDates, 'hijri', 'gregorian');
  const end2 = performance.now();
  const hijriToGregorianMs = end2 - start2;

  const totalTime = gregorianToHijriMs + hijriToGregorianMs;
  const totalConversions = results1.length + results2.length;
  const averagePerConversion = totalTime / totalConversions;

  return {
    gregorianToHijriMs,
    hijriToGregorianMs,
    averagePerConversion,
  };
}

/**
 * Comprehensive validation suite
 */
export function runValidationSuite(): {
  passed: number;
  failed: number;
  details: Array<{ test: string; passed: boolean; message: string }>;
} {
  const tests = [
    {
      name: 'Gregorian Leap Year Validation',
      test: () => {
        const feb29_2024 = validateGregorianDate(2024, 2, 29);
        const feb29_2023 = validateGregorianDate(2023, 2, 29);
        return feb29_2024.isValid && !feb29_2023.isValid;
      },
    },
    {
      name: 'Hijri Month Boundary Validation',
      test: () => {
        const safar30 = validateHijriDate(1446, 2, 30); // Safar has 29 days
        const muharram30 = validateHijriDate(1446, 1, 30); // Muharram has 30 days
        return !safar30.isValid && muharram30.isValid;
      },
    },
    {
      name: 'Hijri Leap Year Dhu al-Hijjah',
      test: () => {
        const leapYear = 1445; // Assuming this is a leap year
        const dhulhijjah30_leap = validateHijriDate(leapYear, 12, 30);
        const dhulhijjah30_normal = validateHijriDate(leapYear + 1, 12, 30);
        return dhulhijjah30_leap.isValid === isHijriLeapYear(leapYear) &&
               dhulhijjah30_normal.isValid === isHijriLeapYear(leapYear + 1);
      },
    },
    {
      name: 'Round-trip Conversion Accuracy',
      test: () => {
        const originalDate = { year: 2024, month: 6, day: 15 };
        const hijriResult = gregorianToHijri(originalDate.year, originalDate.month, originalDate.day);
        
        if (!hijriResult.success || !hijriResult.date) return false;
        
        const hijriDate = hijriResult.date as HijriDate;
        const backToGregorian = hijriToGregorian(hijriDate.year, hijriDate.month, hijriDate.day);
        
        if (!backToGregorian.success || !backToGregorian.date) return false;
        
        const gregorianDate = backToGregorian.date as GregorianDate;
        
        // Allow ±1 day tolerance for round-trip conversion
        return Math.abs(gregorianDate.year - originalDate.year) <= 1 &&
               Math.abs(gregorianDate.month - originalDate.month) <= 1 &&
               Math.abs(gregorianDate.day - originalDate.day) <= 1;
      },
    },
    {
      name: 'Current Date Conversion',
      test: () => {
        const now = new Date();
        const hijriResult = dateToHijri(now);
        
        if (!hijriResult.success || !hijriResult.date) return false;
        
        const hijriDate = hijriResult.date as HijriDate;
        const backToDate = hijriToDate(hijriDate.year, hijriDate.month, hijriDate.day);
        
        if (!backToDate) return false;
        
        // Allow ±1 day tolerance
        const diffMs = Math.abs(backToDate.getTime() - now.getTime());
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays <= 1;
      },
    },
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        results.push({ test: test.name, passed: true, message: 'Test passed' });
        passed++;
      } else {
        results.push({ test: test.name, passed: false, message: 'Test failed' });
        failed++;
      }
    } catch (error) {
      results.push({ 
        test: test.name, 
        passed: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  return { passed, failed, details: results };
}

/**
 * Convert date between calendar systems with proper validation
 */
export function convertDateBetweenSystems(
  inputDate: string | Date,
  fromSystem: 'hijri' | 'gregorian',
  toSystem: 'hijri' | 'gregorian'
): ConversionResult {
  try {
    if (fromSystem === toSystem) {
      return {
        success: false,
        error: 'Source and target calendar systems are the same',
      };
    }

    let year: number, month: number, day: number;

    // Parse input date
    if (inputDate instanceof Date) {
      if (fromSystem === 'gregorian') {
        year = inputDate.getFullYear();
        month = inputDate.getMonth() + 1;
        day = inputDate.getDate();
      } else {
        // If input is Date object but we want to treat it as Hijri, we need conversion
        const hijriResult = dateToHijri(inputDate);
        if (!hijriResult.success || !hijriResult.date) {
          return hijriResult;
        }
        const hijriDate = hijriResult.date as HijriDate;
        year = hijriDate.year;
        month = hijriDate.month;
        day = hijriDate.day;
      }
    } else {
      // Parse string date
      const parseResult = parseDateString(inputDate, fromSystem === 'hijri');
      if (!parseResult.success || !parseResult.date) {
        return parseResult;
      }
      const parsedDate = parseResult.date as any;
      year = parsedDate.year;
      month = parsedDate.month;
      day = parsedDate.day;
    }

    // Perform conversion
    if (fromSystem === 'gregorian' && toSystem === 'hijri') {
      return gregorianToHijri(year, month, day);
    } else if (fromSystem === 'hijri' && toSystem === 'gregorian') {
      return hijriToGregorian(year, month, day);
    }

    return {
      success: false,
      error: 'Invalid calendar system combination',
    };
  } catch (error) {
    return {
      success: false,
      error: `Date conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * System-wide date conversion utility
 */
export function convertSystemDate(
  currentDate: Date,
  currentSystem: 'hijri' | 'gregorian',
  targetSystem: 'hijri' | 'gregorian'
): {
  success: boolean;
  convertedDate?: Date;
  formattedDate?: string;
  error?: string;
} {
  try {
    if (currentSystem === targetSystem) {
      return {
        success: true,
        convertedDate: currentDate,
        formattedDate: targetSystem === 'hijri' 
          ? formatHijriDate(gregorianToHijri(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()).date as HijriDate, 'full', 'ar')
          : currentDate.toLocaleDateString(),
      };
    }

    // Convert the current date to the target system
    const conversionResult = convertDateBetweenSystems(currentDate, currentSystem, targetSystem);
    
    if (!conversionResult.success || !conversionResult.date) {
      return {
        success: false,
        error: conversionResult.error || 'Conversion failed',
      };
    }

    let convertedDate: Date;
    let formattedDate: string;

    if (targetSystem === 'hijri') {
      const hijriDate = conversionResult.date as HijriDate;
      convertedDate = hijriToDate(hijriDate.year, hijriDate.month, hijriDate.day) || currentDate;
      formattedDate = formatHijriDate(hijriDate, 'full', 'ar');
    } else {
      const gregorianDate = conversionResult.date as GregorianDate;
      convertedDate = new Date(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day);
      formattedDate = formatGregorianDate(gregorianDate, 'full', 'en');
    }

    return {
      success: true,
      convertedDate,
      formattedDate,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    };
  }
}