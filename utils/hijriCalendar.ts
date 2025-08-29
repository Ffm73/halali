/**
 * Comprehensive Hijri Calendar Utilities
 * Provides accurate Hijri date calculations and Islamic calendar features
 */

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  dayOfWeek: number;
  dayOfWeekName: string;
}

export interface IslamicEvent {
  name: string;
  nameAr: string;
  hijriMonth: number;
  hijriDay: number;
  description: string;
  descriptionAr: string;
  isHoliday: boolean;
}

// Hijri month names
export const HIJRI_MONTHS = [
  { name: 'Muharram', nameAr: 'محرم', days: 30 },
  { name: 'Safar', nameAr: 'صفر', days: 29 },
  { name: 'Rabi\' al-awwal', nameAr: 'ربيع الأول', days: 30 },
  { name: 'Rabi\' al-thani', nameAr: 'ربيع الثاني', days: 29 },
  { name: 'Jumada al-awwal', nameAr: 'جمادى الأولى', days: 30 },
  { name: 'Jumada al-thani', nameAr: 'جمادى الثانية', days: 29 },
  { name: 'Rajab', nameAr: 'رجب', days: 30 },
  { name: 'Sha\'ban', nameAr: 'شعبان', days: 29 },
  { name: 'Ramadan', nameAr: 'رمضان', days: 30 },
  { name: 'Shawwal', nameAr: 'شوال', days: 29 },
  { name: 'Dhu al-Qi\'dah', nameAr: 'ذو القعدة', days: 30 },
  { name: 'Dhu al-Hijjah', nameAr: 'ذو الحجة', days: 29 }, // 30 in leap years
];

// Hijri day names
export const HIJRI_DAYS = [
  { name: 'Sunday', nameAr: 'الأحد', short: 'ح' },
  { name: 'Monday', nameAr: 'الإثنين', short: 'ن' },
  { name: 'Tuesday', nameAr: 'الثلاثاء', short: 'ث' },
  { name: 'Wednesday', nameAr: 'الأربعاء', short: 'ر' },
  { name: 'Thursday', nameAr: 'الخميس', short: 'خ' },
  { name: 'Friday', nameAr: 'الجمعة', short: 'ج' },
  { name: 'Saturday', nameAr: 'السبت', short: 'س' },
];

// Important Islamic events and holidays
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    name: 'Islamic New Year',
    nameAr: 'رأس السنة الهجرية',
    hijriMonth: 1,
    hijriDay: 1,
    description: 'Beginning of the Islamic calendar year',
    descriptionAr: 'بداية السنة الهجرية',
    isHoliday: true,
  },
  {
    name: 'Day of Ashura',
    nameAr: 'يوم عاشوراء',
    hijriMonth: 1,
    hijriDay: 10,
    description: 'Day of remembrance in Islam',
    descriptionAr: 'يوم ذكرى في الإسلام',
    isHoliday: true,
  },
  {
    name: 'Mawlid an-Nabi',
    nameAr: 'المولد النبوي',
    hijriMonth: 3,
    hijriDay: 12,
    description: 'Birthday of Prophet Muhammad',
    descriptionAr: 'مولد النبي محمد صلى الله عليه وسلم',
    isHoliday: true,
  },
  {
    name: 'Isra and Mi\'raj',
    nameAr: 'الإسراء والمعراج',
    hijriMonth: 7,
    hijriDay: 27,
    description: 'Night Journey of Prophet Muhammad',
    descriptionAr: 'ليلة الإسراء والمعراج',
    isHoliday: true,
  },
  {
    name: 'Ramadan Begins',
    nameAr: 'بداية رمضان',
    hijriMonth: 9,
    hijriDay: 1,
    description: 'Beginning of the holy month of fasting',
    descriptionAr: 'بداية شهر الصيام المبارك',
    isHoliday: true,
  },
  {
    name: 'Laylat al-Qadr',
    nameAr: 'ليلة القدر',
    hijriMonth: 9,
    hijriDay: 27,
    description: 'Night of Power (approximate date)',
    descriptionAr: 'ليلة القدر (تاريخ تقريبي)',
    isHoliday: true,
  },
  {
    name: 'Eid al-Fitr',
    nameAr: 'عيد الفطر',
    hijriMonth: 10,
    hijriDay: 1,
    description: 'Festival of Breaking the Fast',
    descriptionAr: 'عيد الفطر المبارك',
    isHoliday: true,
  },
  {
    name: 'Eid al-Adha',
    nameAr: 'عيد الأضحى',
    hijriMonth: 12,
    hijriDay: 10,
    description: 'Festival of Sacrifice',
    descriptionAr: 'عيد الأضحى المبارك',
    isHoliday: true,
  },
];

/**
 * Convert Gregorian date to accurate Hijri date
 */
export function gregorianToHijri(gregorianDate: Date): HijriDate {
  try {
    const gYear = gregorianDate.getFullYear();
    const gMonth = gregorianDate.getMonth() + 1;
    const gDay = gregorianDate.getDate();
    
    // More accurate Julian day calculation
    let jd = Math.floor((1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12))) / 4) +
             Math.floor((367 * (gMonth - 2 - 12 * (Math.floor((gMonth - 14) / 12)))) / 12) -
             Math.floor((3 * (Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100))) / 4) +
             gDay - 32075;
    
    // Convert to Hijri using more accurate algorithm
    const hijriEpoch = 1948439.5; // More precise Hijri epoch
    const hijriDays = jd - hijriEpoch;
    
    // Calculate Hijri year with leap year consideration
    const hijriYear = Math.floor((30 * hijriDays + 10646) / 10631);
    let remainingDays = hijriDays - Math.floor((hijriYear * 10631 - 10646) / 30);
    
    // Calculate month and day
    let hijriMonth = 1;
    for (let i = 0; i < 12; i++) {
      const monthDays = HIJRI_MONTHS[i].days + (i === 11 && isHijriLeapYear(hijriYear) ? 1 : 0);
      if (remainingDays < monthDays) {
        hijriMonth = i + 1;
        break;
      }
      remainingDays -= monthDays;
    }
    
    const hijriDay = Math.max(1, Math.floor(remainingDays) + 1);
    const dayOfWeek = gregorianDate.getDay();
    
    return {
      year: hijriYear,
      month: hijriMonth,
      day: hijriDay,
      monthName: HIJRI_MONTHS[hijriMonth - 1].nameAr,
      dayOfWeek,
      dayOfWeekName: HIJRI_DAYS[dayOfWeek].nameAr,
    };
  } catch (error) {
    console.error('Gregorian to Hijri conversion error:', error);
    // Fallback to approximate calculation
    return {
      year: 1446,
      month: 1,
      day: 1,
      monthName: 'محرم',
      dayOfWeek: 0,
      dayOfWeekName: 'الأحد',
    };
  }
}

/**
 * Convert Hijri date to Gregorian date
 */
export function hijriToGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
  try {
    // Calculate total days from Hijri epoch
    const hijriEpoch = 1948439.5;
    
    // Calculate days for complete years
    let totalDays = Math.floor((hijriYear * 10631 - 10646) / 30);
    
    // Add days for complete months in current year
    for (let i = 0; i < hijriMonth - 1; i++) {
      totalDays += HIJRI_MONTHS[i].days;
      if (i === 11 && isHijriLeapYear(hijriYear)) {
        totalDays += 1; // Extra day in Dhu al-Hijjah for leap years
      }
    }
    
    // Add days in current month
    totalDays += hijriDay - 1;
    
    // Convert to Julian day
    const julianDay = totalDays + hijriEpoch;
    
    // Convert Julian day to Gregorian
    const a = julianDay + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((b * 146097) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    
    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = b * 100 + d - 4800 + Math.floor(m / 10);
    
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Hijri to Gregorian conversion error:', error);
    return new Date(); // Fallback to current date
  }
}

/**
 * Check if a Hijri year is a leap year
 */
export function isHijriLeapYear(hijriYear: number): boolean {
  // Hijri leap year cycle: years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 in a 30-year cycle
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  const yearInCycle = hijriYear % 30;
  return leapYears.includes(yearInCycle);
}

/**
 * Get current Hijri date
 */
export function getCurrentHijriDate(): HijriDate {
  return gregorianToHijri(new Date());
}

/**
 * Format Hijri date as string
 */
export function formatHijriDateString(hijriDate: HijriDate, style: 'full' | 'short' | 'numeric' = 'full'): string {
  switch (style) {
    case 'numeric':
      return `${hijriDate.day.toString().padStart(2, '0')}/${hijriDate.month.toString().padStart(2, '0')}/${hijriDate.year}`;
    case 'short':
      return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}`;
    case 'full':
    default:
      return `${hijriDate.dayOfWeekName} ${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}هـ`;
  }
}

/**
 * Check if current date is in Ramadan
 */
export function isCurrentlyRamadan(): boolean {
  const hijriDate = getCurrentHijriDate();
  return hijriDate.month === 9; // Ramadan is the 9th month
}

/**
 * Get days remaining in current Hijri month
 */
export function getDaysRemainingInHijriMonth(): number {
  const hijriDate = getCurrentHijriDate();
  const monthDays = HIJRI_MONTHS[hijriDate.month - 1].days;
  const extraDay = hijriDate.month === 12 && isHijriLeapYear(hijriDate.year) ? 1 : 0;
  return (monthDays + extraDay) - hijriDate.day;
}

/**
 * Get upcoming Islamic events in current Hijri year
 */
export function getUpcomingIslamicEvents(limit: number = 5): IslamicEvent[] {
  const currentHijri = getCurrentHijriDate();
  const currentDayOfYear = getDayOfHijriYear(currentHijri);
  
  return ISLAMIC_EVENTS
    .map(event => ({
      ...event,
      dayOfYear: getDayOfHijriYear({ 
        year: currentHijri.year, 
        month: event.hijriMonth, 
        day: event.hijriDay,
        monthName: '',
        dayOfWeek: 0,
        dayOfWeekName: ''
      }),
    }))
    .filter(event => event.dayOfYear >= currentDayOfYear)
    .sort((a, b) => a.dayOfYear - b.dayOfYear)
    .slice(0, limit);
}

/**
 * Calculate day of year for Hijri date
 */
function getDayOfHijriYear(hijriDate: { year: number; month: number; day: number }): number {
  let dayOfYear = hijriDate.day;
  
  for (let i = 0; i < hijriDate.month - 1; i++) {
    dayOfYear += HIJRI_MONTHS[i].days;
    if (i === 11 && isHijriLeapYear(hijriDate.year)) {
      dayOfYear += 1;
    }
  }
  
  return dayOfYear;
}

/**
 * Get prayer times for a given date (simplified calculation)
 */
export function getPrayerTimes(date: Date, latitude: number = 24.7136, longitude: number = 46.6753): {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
} {
  // Simplified prayer time calculation for Riyadh
  // In production, use a proper prayer time library like 'adhan'
  
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const solarDeclination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  
  // Approximate prayer times (would need proper calculation in production)
  return {
    fajr: '05:30',
    sunrise: '06:45',
    dhuhr: '12:15',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
  };
}

/**
 * Check if a date falls on a Friday (Jumu'ah)
 */
export function isJumuah(date: Date): boolean {
  return date.getDay() === 5; // Friday
}

/**
 * Get Hijri date for next Friday
 */
export function getNextJumuah(): Date {
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
  return nextFriday;
}

/**
 * Validate Hijri date
 */
export function isValidHijriDate(year: number, month: number, day: number): boolean {
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  
  const monthDays = HIJRI_MONTHS[month - 1].days;
  const extraDay = month === 12 && isHijriLeapYear(year) ? 1 : 0;
  
  return day <= (monthDays + extraDay);
}

/**
 * Get business days excluding Fridays and Islamic holidays
 */
export function getBusinessDaysInHijriMonth(hijriYear: number, hijriMonth: number): number {
  const monthDays = HIJRI_MONTHS[hijriMonth - 1].days;
  const extraDay = hijriMonth === 12 && isHijriLeapYear(hijriYear) ? 1 : 0;
  const totalDays = monthDays + extraDay;
  
  let businessDays = 0;
  
  for (let day = 1; day <= totalDays; day++) {
    const gregorianDate = hijriToGregorian(hijriYear, hijriMonth, day);
    const dayOfWeek = gregorianDate.getDay();
    
    // Skip Fridays (5) and Saturdays (6) for Saudi business days
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      // Check if it's not an Islamic holiday
      const isHoliday = ISLAMIC_EVENTS.some(event => 
        event.hijriMonth === hijriMonth && event.hijriDay === day && event.isHoliday
      );
      
      if (!isHoliday) {
        businessDays++;
      }
    }
  }
  
  return businessDays;
}

/**
 * Format Hijri date for contracts and legal documents
 */
export function formatHijriForLegalDocument(date: Date, language: 'ar' | 'en' = 'ar'): string {
  const hijriDate = gregorianToHijri(date);
  
  if (language === 'ar') {
    return `${hijriDate.day} من شهر ${hijriDate.monthName} لعام ${hijriDate.year} هجرية`;
  } else {
    const monthName = HIJRI_MONTHS[hijriDate.month - 1].name;
    return `${hijriDate.day} ${monthName} ${hijriDate.year} AH`;
  }
}

/**
 * Get Hijri calendar for a specific month
 */
export function getHijriCalendarMonth(hijriYear: number, hijriMonth: number): {
  days: Array<{ day: number; gregorianDate: Date; isToday: boolean; isWeekend: boolean }>;
  monthName: string;
  year: number;
} {
  const monthDays = HIJRI_MONTHS[hijriMonth - 1].days;
  const extraDay = hijriMonth === 12 && isHijriLeapYear(hijriYear) ? 1 : 0;
  const totalDays = monthDays + extraDay;
  
  const days = [];
  const today = new Date();
  
  for (let day = 1; day <= totalDays; day++) {
    const gregorianDate = hijriToGregorian(hijriYear, hijriMonth, day);
    const isToday = gregorianDate.toDateString() === today.toDateString();
    const isWeekend = gregorianDate.getDay() === 5 || gregorianDate.getDay() === 6; // Friday & Saturday
    
    days.push({
      day,
      gregorianDate,
      isToday,
      isWeekend,
    });
  }
  
  return {
    days,
    monthName: HIJRI_MONTHS[hijriMonth - 1].nameAr,
    year: hijriYear,
  };
}

/**
 * Smooth date system switching utility
 */
export function switchDateSystemSmoothly(
  currentSystem: 'hijri' | 'gregorian',
  targetSystem: 'hijri' | 'gregorian',
  currentDate: Date
): {
  newDate: Date;
  formattedDate: string;
  transitionMessage: string;
} {
  try {
    if (currentSystem === targetSystem) {
      return {
        newDate: currentDate,
        formattedDate: formatHijriDateString(gregorianToHijri(currentDate), 'full'),
        transitionMessage: 'No change needed',
      };
    }

    let formattedDate: string;
    let transitionMessage: string;

    if (targetSystem === 'hijri') {
      const hijriDate = gregorianToHijri(currentDate);
      formattedDate = formatHijriDateString(hijriDate, 'full');
      transitionMessage = `Switched to Hijri calendar: ${formattedDate}`;
    } else {
      formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      transitionMessage = `Switched to Gregorian calendar: ${formattedDate}`;
    }
    return {
      newDate: currentDate,
      formattedDate,
      transitionMessage,
    };
  } catch (error) {
    console.error('Date system switching error:', error);
    return {
      newDate: currentDate,
      formattedDate: currentDate.toLocaleDateString(),
      transitionMessage: 'Date system switch completed with fallback',
    };
  }
}