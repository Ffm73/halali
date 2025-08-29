import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { ChevronDown, Check } from 'lucide-react-native';

// Country codes with phone prefixes
const countries = [
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', prefix: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات', prefix: '+971', flag: '🇦🇪' },
  { code: 'US', name: 'United States', nameAr: 'الولايات المتحدة', prefix: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة', prefix: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', nameAr: 'كندا', prefix: '+1', flag: '🇨🇦' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا', prefix: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', nameAr: 'ألمانيا', prefix: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', nameAr: 'إيطاليا', prefix: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', nameAr: 'إسبانيا', prefix: '+34', flag: '🇪🇸' },
  { code: 'AU', name: 'Australia', nameAr: 'أستراليا', prefix: '+61', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', nameAr: 'اليابان', prefix: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', nameAr: 'كوريا الجنوبية', prefix: '+82', flag: '🇰🇷' },
  { code: 'IN', name: 'India', nameAr: 'الهند', prefix: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', nameAr: 'باكستان', prefix: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', nameAr: 'بنغلاديش', prefix: '+880', flag: '🇧🇩' },
  { code: 'EG', name: 'Egypt', nameAr: 'مصر', prefix: '+20', flag: '🇪🇬' },
  { code: 'JO', name: 'Jordan', nameAr: 'الأردن', prefix: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', nameAr: 'لبنان', prefix: '+961', flag: '🇱🇧' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', prefix: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', prefix: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', prefix: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان', prefix: '+968', flag: '🇴🇲' },
];

// Convert Arabic numerals to English
export const convertArabicToEnglish = (input: string): string => {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const englishNumerals = '0123456789';
  
  return input.replace(/[٠-٩]/g, (match) => {
    const index = arabicNumerals.indexOf(match);
    return englishNumerals[index];
  });
};

interface PhoneInputProps {
  value: string;
  onChangeText: (fullPhoneNumber: string) => void;
  placeholder?: string;
  style?: any;
  label?: string;
  required?: boolean;
}

export function PhoneInput({ 
  value, 
  onChangeText, 
  placeholder = 'XXXXXXXXX',
  style,
  label,
  required = false
}: PhoneInputProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Extract phone number from full value when component mounts
  React.useEffect(() => {
    if (value && value.startsWith('+')) {
      const country = countries.find(c => value.startsWith(c.prefix));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.prefix.length));
      }
    }
  }, []);

  const handlePhoneNumberChange = (text: string) => {
    // Convert Arabic numerals to English
    const convertedText = convertArabicToEnglish(text);
    // Remove any non-numeric characters
    const numericOnly = convertedText.replace(/[^0-9]/g, '');
    setPhoneNumber(numericOnly);
    
    // Call parent callback with full phone number
    const fullPhoneNumber = selectedCountry.prefix + numericOnly;
    onChangeText(fullPhoneNumber);
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Update full phone number with new country code
    const fullPhoneNumber = country.prefix + phoneNumber;
    onChangeText(fullPhoneNumber);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {label}{required && ' *'}
        </Text>
      )}
      
      <View style={[styles.inputContainer, { flexDirection: 'row' }]}>
        {/* Country Selector - Always on the left */}
        <TouchableOpacity
          style={[
            styles.countrySelector,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            showCountryPicker && { borderColor: colors.primary }
          ]}
          onPress={() => setShowCountryPicker(!showCountryPicker)}
        >
          <View style={styles.countrySelectorContent}>
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
            <Text
              style={[
                styles.countryPrefix,
                {
                  color: colors.textPrimary,
                  fontFamily: 'Nunito-Regular',
                },
              ]}
            >
              {selectedCountry.prefix}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Phone Number Input - Always on the right */}
        <TextInput
          style={[
            styles.phoneInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: 'Nunito-Regular',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          keyboardType="phone-pad"
        />
      </View>

      {/* Country Picker Dropdown */}
      {showCountryPicker && (
        <View style={[styles.countryDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView 
            style={styles.countryList} 
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryOption,
                  selectedCountry.code === country.code && { backgroundColor: colors.primaryLight }
                ]}
                onPress={() => handleCountrySelect(country)}
              >
                <View style={styles.countryOptionContent}>
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <View style={styles.countryOptionInfo}>
                    <Text
                      style={[
                        styles.countryOptionName,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {language === 'ar' ? country.nameAr : country.name}
                    </Text>
                    <Text
                      style={[
                        styles.countryOptionPrefix,
                        {
                          color: colors.textSecondary,
                          fontFamily: 'Nunito-Regular',
                        },
                      ]}
                    >
                      {country.prefix}
                    </Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <Check size={16} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  countrySelector: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    width: 100,
    flexShrink: 0,
  },
  countrySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  countryFlag: {
    fontSize: 14,
    flexShrink: 0,
  },
  countryPrefix: {
    fontSize: fontSize.xs,
    flexShrink: 0,
    minWidth: 28,
    textAlign: 'center',
  },
  phoneInput: {
    flex: 1,
    flexGrow: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
    maxWidth: '100%',
  },
  countryDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    maxHeight: 200,
    marginTop: spacing.xs,
    zIndex: 99999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  countryList: {
    maxHeight: 200,
  },
  countryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  countryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    minWidth: 0,
  },
  countryFlag: {
    fontSize: 14,
    flexShrink: 0,
  },
  countryPrefix: {
    fontSize: fontSize.xs,
    flexShrink: 0,
    minWidth: 32,
    textAlign: 'center',
  },
  countryOptionName: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  countryOptionPrefix: {
    fontSize: fontSize.xs,
  },
});