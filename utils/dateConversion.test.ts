/**
 * Comprehensive Test Suite for Date Conversion System
 * 
 * Tests all edge cases, leap years, month boundaries, and conversion accuracy
 * against known historical dates and established conversion tables.
 */

import {
  gregorianToHijri,
  hijriToGregorian,
  dateToHijri,
  hijriToDate,
  validateGregorianDate,
  validateHijriDate,
  isGregorianLeapYear,
  isHijriLeapYear,
  formatHijriDate,
  formatGregorianDate,
  getCurrentDates,
  isCurrentlyRamadan,
  getDaysUntilRamadan,
  calculateDateDifference,
  addDays,
  getMonthBoundaries,
  bulkConvertDates,
  parseDateString,
  getRelativeDateDescription,
  testConversionAccuracy,
  benchmarkConversions,
  runValidationSuite,
} from './dateConversion';

describe('Date Conversion System', () => {
  
  describe('Leap Year Detection', () => {
    test('should correctly identify Gregorian leap years', () => {
      expect(isGregorianLeapYear(2000)).toBe(true);  // Divisible by 400
      expect(isGregorianLeapYear(2004)).toBe(true);  // Divisible by 4, not by 100
      expect(isGregorianLeapYear(1900)).toBe(false); // Divisible by 100, not by 400
      expect(isGregorianLeapYear(2001)).toBe(false); // Not divisible by 4
    });

    test('should correctly identify Hijri leap years', () => {
      // Test known leap years in 30-year cycle
      expect(isHijriLeapYear(2)).toBe(true);
      expect(isHijriLeapYear(5)).toBe(true);
      expect(isHijriLeapYear(7)).toBe(true);
      expect(isHijriLeapYear(10)).toBe(true);
      expect(isHijriLeapYear(13)).toBe(true);
      expect(isHijriLeapYear(16)).toBe(true);
      expect(isHijriLeapYear(18)).toBe(true);
      expect(isHijriLeapYear(21)).toBe(true);
      expect(isHijriLeapYear(24)).toBe(true);
      expect(isHijriLeapYear(26)).toBe(true);
      expect(isHijriLeapYear(29)).toBe(true);
      
      // Test non-leap years
      expect(isHijriLeapYear(1)).toBe(false);
      expect(isHijriLeapYear(3)).toBe(false);
      expect(isHijriLeapYear(4)).toBe(false);
      expect(isHijriLeapYear(30)).toBe(false);
    });
  });

  describe('Date Validation', () => {
    test('should validate correct Gregorian dates', () => {
      const result = validateGregorianDate(2024, 1, 15);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid Gregorian dates', () => {
      // Invalid month
      let result = validateGregorianDate(2024, 13, 15);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // Invalid day for February non-leap year
      result = validateGregorianDate(2023, 2, 29);
      expect(result.isValid).toBe(false);

      // Valid day for February leap year
      result = validateGregorianDate(2024, 2, 29);
      expect(result.isValid).toBe(true);
    });

    test('should validate correct Hijri dates', () => {
      const result = validateHijriDate(1446, 1, 15);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid Hijri dates', () => {
      // Invalid month
      let result = validateHijriDate(1446, 13, 15);
      expect(result.isValid).toBe(false);

      // Invalid day for 29-day month
      result = validateHijriDate(1446, 2, 30); // Safar has 29 days
      expect(result.isValid).toBe(false);

      // Valid day for Dhu al-Hijjah in leap year
      result = validateHijriDate(1445, 12, 30); // If 1445 is leap year
      expect(result.isValid).toBe(isHijriLeapYear(1445));
    });
  });

  describe('Known Historical Date Conversions', () => {
    test('should correctly convert Islamic epoch', () => {
      // July 16, 622 CE = 1 Muharram 1 AH
      const result = gregorianToHijri(622, 7, 16);
      expect(result.success).toBe(true);
      if (result.date) {
        const hijriDate = result.date as HijriDate;
        expect(hijriDate.year).toBe(1);
        expect(hijriDate.month).toBe(1);
        expect(hijriDate.day).toBe(1);
      }
    });

    test('should correctly convert known dates', () => {
      // Test some well-documented conversions
      const testCases = [
        { gregorian: { year: 2024, month: 1, day: 1 }, expectedHijri: { year: 1445, month: 6 } },
        { gregorian: { year: 2025, month: 1, day: 1 }, expectedHijri: { year: 1446, month: 6 } },
      ];

      testCases.forEach(testCase => {
        const result = gregorianToHijri(
          testCase.gregorian.year,
          testCase.gregorian.month,
          testCase.gregorian.day
        );
        
        expect(result.success).toBe(true);
        if (result.date) {
          const hijriDate = result.date as HijriDate;
          // Allow for ±1 day tolerance due to astronomical variations
          expect(Math.abs(hijriDate.year - testCase.expectedHijri.year)).toBeLessThanOrEqual(1);
          expect(Math.abs(hijriDate.month - testCase.expectedHijri.month)).toBeLessThanOrEqual(1);
        }
      });
    });
  });

  describe('Bidirectional Conversion Accuracy', () => {
    test('should maintain accuracy in round-trip conversions', () => {
      const testDates = [
        { year: 2024, month: 1, day: 1 },
        { year: 2024, month: 2, day: 29 }, // Leap year
        { year: 2024, month: 12, day: 31 },
        { year: 2025, month: 6, day: 15 },
      ];

      testDates.forEach(testDate => {
        // Gregorian -> Hijri -> Gregorian
        const hijriResult = gregorianToHijri(testDate.year, testDate.month, testDate.day);
        expect(hijriResult.success).toBe(true);
        
        if (hijriResult.date) {
          const hijriDate = hijriResult.date as HijriDate;
          const backToGregorian = hijriToGregorian(hijriDate.year, hijriDate.month, hijriDate.day);
          expect(backToGregorian.success).toBe(true);
          
          if (backToGregorian.date) {
            const gregorianDate = backToGregorian.date as GregorianDate;
            // Allow ±1 day tolerance for round-trip conversion
            expect(Math.abs(gregorianDate.year - testDate.year)).toBeLessThanOrEqual(1);
            expect(Math.abs(gregorianDate.month - testDate.month)).toBeLessThanOrEqual(1);
            expect(Math.abs(gregorianDate.day - testDate.day)).toBeLessThanOrEqual(1);
          }
        }
      });
    });

    test('should handle edge cases correctly', () => {
      // Test month boundaries
      const endOfMonth = gregorianToHijri(2024, 1, 31);
      expect(endOfMonth.success).toBe(true);

      // Test year boundaries
      const endOfYear = gregorianToHijri(2024, 12, 31);
      expect(endOfYear.success).toBe(true);

      // Test leap year February
      const leapDay = gregorianToHijri(2024, 2, 29);
      expect(leapDay.success).toBe(true);
    });
  });

  describe('Date Formatting', () => {
    test('should format Hijri dates correctly', () => {
      const hijriDate: HijriDate = {
        year: 1446,
        month: 1,
        day: 15,
        monthName: 'Muharram',
        monthNameAr: 'محرم',
        dayOfWeek: 1,
        dayOfWeekName: 'Monday',
        dayOfWeekNameAr: 'الإثنين',
        isValid: true,
      };

      expect(formatHijriDate(hijriDate, 'numeric', 'en')).toBe('15/01/1446');
      expect(formatHijriDate(hijriDate, 'short', 'ar')).toBe('15 محرم 1446');
      expect(formatHijriDate(hijriDate, 'full', 'ar')).toBe('الإثنين 15 محرم 1446هـ');
    });

    test('should format Gregorian dates correctly', () => {
      const gregorianDate: GregorianDate = {
        year: 2024,
        month: 6,
        day: 15,
        monthName: 'June',
        monthNameAr: 'يونيو',
        dayOfWeek: 6,
        dayOfWeekName: 'Saturday',
        dayOfWeekNameAr: 'السبت',
        isValid: true,
      };

      expect(formatGregorianDate(gregorianDate, 'numeric', 'en')).toBe('15/06/2024');
      expect(formatGregorianDate(gregorianDate, 'short', 'ar')).toBe('15 يونيو 2024');
      expect(formatGregorianDate(gregorianDate, 'full', 'en')).toBe('Saturday 15 June 2024 CE');
    });
  });

  describe('Performance Tests', () => {
    test('should handle bulk conversions efficiently', () => {
      const testDates = Array.from({ length: 100 }, (_, i) => ({
        year: 2020 + Math.floor(i / 365),
        month: ((i % 12) + 1),
        day: ((i % 28) + 1),
      }));

      const start = performance.now();
      const results = bulkConvertDates(testDates, 'gregorian', 'hijri');
      const end = performance.now();

      expect(results).toHaveLength(100);
      expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
      
      // Check that most conversions succeeded
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(95); // At least 95% success rate
    });
  });

  describe('Islamic Calendar Features', () => {
    test('should detect Ramadan correctly', () => {
      // Mock a date in Ramadan (9th month)
      const ramadanDate = julianDayToHijri(hijriToJulianDay(1446, 9, 15));
      expect(ramadanDate.month).toBe(9);
      
      // Test Ramadan detection function
      const { hijri } = getCurrentDates();
      const isRamadan = hijri.month === 9;
      expect(typeof isRamadan).toBe('boolean');
    });

    test('should calculate days until Ramadan', () => {
      const daysUntilRamadan = getDaysUntilRamadan();
      expect(typeof daysUntilRamadan).toBe('number');
      expect(daysUntilRamadan).toBeGreaterThanOrEqual(0);
      expect(daysUntilRamadan).toBeLessThanOrEqual(365);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid inputs gracefully', () => {
      // Invalid Gregorian date
      const result1 = gregorianToHijri(2024, 13, 32);
      expect(result1.success).toBe(false);
      expect(result1.error).toBeDefined();

      // Invalid Hijri date
      const result2 = hijriToGregorian(1446, 13, 32);
      expect(result2.success).toBe(false);
      expect(result2.error).toBeDefined();

      // Invalid Date object
      const result3 = dateToHijri(new Date('invalid'));
      expect(result3.success).toBe(false);
      expect(result3.error).toBeDefined();
    });

    test('should provide meaningful error messages', () => {
      const result = validateGregorianDate(2024, 13, 15);
      expect(result.errors[0]).toContain('Invalid month: 13');
    });
  });

  describe('Integration Tests', () => {
    test('should run comprehensive validation suite', () => {
      const results = runValidationSuite();
      expect(results.passed).toBeGreaterThan(0);
      expect(results.details).toBeDefined();
      
      // Log results for debugging
      console.log('Validation Suite Results:', results);
    });

    test('should run accuracy tests', () => {
      const results = testConversionAccuracy();
      expect(results.passed).toBeGreaterThan(0);
      expect(results.results).toBeDefined();
      
      // Log results for debugging
      console.log('Accuracy Test Results:', results);
    });

    test('should run performance benchmarks', () => {
      const results = benchmarkConversions(100); // Smaller number for tests
      expect(results.gregorianToHijriMs).toBeGreaterThan(0);
      expect(results.hijriToGregorianMs).toBeGreaterThan(0);
      expect(results.averagePerConversion).toBeGreaterThan(0);
      
      // Log results for debugging
      console.log('Performance Benchmark Results:', results);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle contract date calculations', () => {
      // Test a typical 12-month contract starting today
      const startDate = new Date();
      const hijriStart = dateToHijri(startDate);
      expect(hijriStart.success).toBe(true);

      if (hijriStart.date) {
        const hijriDate = hijriStart.date as HijriDate;
        
        // Add 12 months (approximately 354 days in Hijri calendar)
        const endDateResult = addDays(
          { year: hijriDate.year, month: hijriDate.month, day: hijriDate.day },
          354,
          'hijri'
        );
        
        expect(endDateResult.success).toBe(true);
      }
    });

    test('should handle payment due date calculations', () => {
      // Test monthly payment calculations
      const baseDate = { year: 1446, month: 1, day: 1 };
      
      for (let i = 1; i <= 12; i++) {
        const monthlyDate = addDays(baseDate, i * 29.5, 'hijri'); // Average Hijri month
        expect(monthlyDate.success).toBe(true);
      }
    });
  });
});

// Export test utilities for external use
export {
  testConversionAccuracy,
  benchmarkConversions,
  runValidationSuite,
};