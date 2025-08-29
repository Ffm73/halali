import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Currency, Language } from '@/types';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Users,
  Shield,
  Check,
  ChevronDown,
  Key,
  Users as GenderIcon,
  Lock
} from 'lucide-react-native';

type RegistrationStep = 'invitation' | 'personal' | 'preferences' | 'verification';

export default function RegisterStaffScreen() {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { login, registerUser } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('invitation');
  const [isLoading, setIsLoading] = useState(false);
  
  // Staff Invitation Code
  const [staffInvitationCode, setStaffInvitationCode] = useState('');

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    fullNameAr: '',
    fullNameEn: '',
    email: '',
    phoneE164: '',
    password: '',
    country: 'SA',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    language: language as Language,
    currency: 'SAR' as Currency,
  });

  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const countries = [
    { code: 'SA', name: language === 'ar' ? 'السعودية' : 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: language === 'ar' ? 'الإمارات' : 'UAE', flag: '🇦🇪' },
    { code: 'KW', name: language === 'ar' ? 'الكويت' : 'Kuwait', flag: '🇰🇼' },
    { code: 'QA', name: language === 'ar' ? 'قطر' : 'Qatar', flag: '🇶🇦' },
    { code: 'BH', name: language === 'ar' ? 'البحرين' : 'Bahrain', flag: '🇧🇭' },
    { code: 'OM', name: language === 'ar' ? 'عمان' : 'Oman', flag: '🇴🇲' },
  ];

  const currencies = [
    { code: 'SAR', name: language === 'ar' ? 'ريال سعودي' : 'Saudi Riyal', symbol: '﷼' },
    { code: 'AED', name: language === 'ar' ? 'درهم إماراتي' : 'UAE Dirham', symbol: 'د.إ' },
    { code: 'KWD', name: language === 'ar' ? 'دينار كويتي' : 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'QAR', name: language === 'ar' ? 'ريال قطري' : 'Qatari Riyal', symbol: 'ر.ق' },
    { code: 'BHD', name: language === 'ar' ? 'دينار بحريني' : 'Bahraini Dinar', symbol: 'د.ب' },
    { code: 'OMR', name: language === 'ar' ? 'ريال عماني' : 'Omani Rial', symbol: 'ر.ع' },
  ];

  const handleNextStep = () => {
    if (currentStep === 'invitation') {
      if (!staffInvitationCode.trim()) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'يرجى إدخال رمز دعوة الموظف' : 'Please enter staff invitation code'
        );
        return;
      }
      setCurrentStep('personal');
    } else if (currentStep === 'personal') {
      if (!personalInfo.fullNameAr.trim() || !personalInfo.fullNameEn.trim()) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'يرجى إدخال الاسم بالعربية والإنجليزية' : 'Please enter name in both Arabic and English'
        );
        return;
      }
      if (personalInfo.email.trim() && !personalInfo.email.includes('@')) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح أو اتركه فارغاً' : 'Please enter a valid email or leave it empty'
        );
        return;
      }
      if (!personalInfo.phoneE164.trim()) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number'
        );
        return;
      }
      if (!personalInfo.password.trim() || personalInfo.password.length < 6) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
        );
        return;
      }
      setCurrentStep('preferences');
    } else if (currentStep === 'preferences') {
      // Send verification code
      Alert.alert(
        language === 'ar' ? 'رمز التحقق' : 'Verification Code',
        language === 'ar' ? 'تم إرسال رمز التحقق إلى رقم هاتفك' : 'Verification code sent to your phone'
      );
      setCurrentStep('verification');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'personal') {
      setCurrentStep('invitation');
    } else if (currentStep === 'preferences') {
      setCurrentStep('personal');
    } else if (currentStep === 'verification') {
      setCurrentStep('preferences');
    }
  };

  const handleRegister = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال رمز التحقق' : 'Please enter verification code'
      );
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('👥 STAFF REGISTRATION: Starting registration process...');
      const result = await registerUser(
        personalInfo.phoneE164,
        personalInfo.password,
        'staff',
        {
          fullName: preferences.language === 'ar' ? personalInfo.fullNameAr : personalInfo.fullNameEn,
          fullNameAr: personalInfo.fullNameAr,
          fullNameEn: personalInfo.fullNameEn,
          email: personalInfo.email,
          phoneNumber: personalInfo.phoneE164,
          password: personalInfo.password,
          role: 'staff',
          country: personalInfo.country,
          language: preferences.language,
          currency: preferences.currency,
          staffInvitationCode,
          gender: personalInfo.gender,
        }
      );
      
      if (result.success) {
        console.log('✅ STAFF REGISTRATION SUCCESSFUL - Should redirect to staff portal');
        Alert.alert(
          language === 'ar' ? '🎉 مرحباً بك!' : '🎉 Welcome!',
          language === 'ar' 
            ? 'تم إنشاء حسابك بنجاح! سيتم توجيهك إلى لوحة التحكم.'
            : 'Your account has been created successfully! You will be redirected to your dashboard.',
          [
            {
              text: language === 'ar' ? 'البدء' : 'Get Started',
              onPress: () => {
                console.log('🎯 STAFF: Navigating to staff portal');
                router.replace('/(tabs)');
              },
            },
          ]
        );
      } else {
        console.log('❌ STAFF REGISTRATION FAILED:', result.error);
        Alert.alert(
          language === 'ar' ? 'خطأ في التسجيل' : 'Registration Error',
          result.error || (language === 'ar' ? 'فشل في إنشاء الحساب' : 'Failed to create account')
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderInvitationStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.stepBadge, { backgroundColor: colors.warning }]}>
          <Key size={20} color={colors.surface} />
        </View>
        <Text
          style={[
            styles.stepTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'رمز دعوة الموظف' : 'Staff Invitation Code'}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'أدخل رمز الدعوة الذي حصلت عليه من المالك' : 'Enter the invitation code you received from the property owner'}
        </Text>
      </View>

      <View style={styles.invitationContainer}>
        <TextInput
          style={[
            styles.invitationInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: 'monospace',
            },
          ]}
          placeholder="STAFF001"
          placeholderTextColor={colors.textMuted}
          value={staffInvitationCode}
          onChangeText={setStaffInvitationCode}
          autoCapitalize="characters"
          textAlign="center"
        />
        
        <Text
          style={[
            styles.invitationHint,
            {
              color: colors.textMuted,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' ? 'الرمز مكون من أحرف وأرقام' : 'Code contains letters and numbers'}
        </Text>

        <View style={[styles.demoInvitations, { 
          backgroundColor: colors.warningLight,
          borderColor: colors.warning,
        }]}>
          <View style={[styles.demoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Shield size={16} color={colors.warning} />
            <Text style={[styles.demoTitle, { 
              color: colors.warning,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
            }]}>
              {language === 'ar' ? 'رموز تجريبية' : 'Demo Codes'}
            </Text>
          </View>
          <View style={styles.demoCodesList}>
            <Text style={[styles.demoCodeItem, { 
              color: colors.warning,
              fontFamily: 'monospace' 
            }]}>
              STAFF001 - {language === 'ar' ? 'مدير (صلاحيات كاملة)' : 'Manager (Full Access)'}
            </Text>
            <Text style={[styles.demoCodeItem, { 
              color: colors.warning,
              fontFamily: 'monospace' 
            }]}>
              STAFF002 - {language === 'ar' ? 'محاسب (مالي)' : 'Accountant (Financial)'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPersonalStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
          <User size={20} color={colors.surface} />
        </View>
        <Text
          style={[
            styles.stepTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'أدخل معلوماتك الأساسية' : 'Enter your basic information'}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {preferences.language === 'ar' ? 'الاسم بالعربية *' : 'Name in Arabic *'}
        </Text>
        <View style={styles.inputWrapper}>
          <View style={[styles.inputIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <User size={20} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: 'Tajawal-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder="سارة أحمد المحمد"
            placeholderTextColor={colors.textMuted}
            value={personalInfo.fullNameAr}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, fullNameAr: text }))}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {preferences.language === 'ar' ? 'الاسم بالإنجليزية *' : 'Name in English *'}
        </Text>
        <View style={styles.inputWrapper}>
          <View style={[styles.inputIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <User size={20} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: 'Nunito-Regular',
                textAlign: 'left',
              },
            ]}
            placeholder="Sara Ahmed Almohammed"
            placeholderTextColor={colors.textMuted}
            value={personalInfo.fullNameEn}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, fullNameEn: text }))}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
        </Text>
        <View style={styles.inputWrapper}>
          <View style={[styles.inputIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Mail size={20} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'left',
              },
            ]}
            placeholder="sara@example.com"
            placeholderTextColor={colors.textMuted}
            value={personalInfo.email}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
        </Text>
        <PhoneInput
          value={personalInfo.phoneE164}
          onChangeText={(phone) => setPersonalInfo(prev => ({ ...prev, phoneE164: phone }))}
          required
        />
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'كلمة المرور *' : 'Password *'}
        </Text>
        <View style={styles.inputWrapper}>
          <View style={[styles.inputIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Lock size={20} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
            placeholderTextColor={colors.textMuted}
            value={personalInfo.password}
            onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, password: text }))}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
        </Text>
        <DatePicker
          value={personalInfo.dateOfBirth}
          onDateChange={(date) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: date }))}
          placeholder={language === 'ar' ? 'اختر تاريخ الميلاد' : 'Select date of birth'}
          maxDate={new Date().toISOString().split('T')[0]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'الجنس *' : 'Gender *'}
        </Text>
        <View style={styles.genderOptions}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              { backgroundColor: colors.surface, borderColor: colors.border },
              personalInfo.gender === 'male' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}
            onPress={() => setPersonalInfo(prev => ({ ...prev, gender: 'male' }))}
          >
            <GenderIcon size={20} color={personalInfo.gender === 'male' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.genderText, { 
              color: personalInfo.gender === 'male' ? colors.primary : colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
            }]}>
              {language === 'ar' ? 'ذكر' : 'Male'}
            </Text>
            {personalInfo.gender === 'male' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              { backgroundColor: colors.surface, borderColor: colors.border },
              personalInfo.gender === 'female' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}
            onPress={() => setPersonalInfo(prev => ({ ...prev, gender: 'female' }))}
          >
            <GenderIcon size={20} color={personalInfo.gender === 'female' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.genderText, { 
              color: personalInfo.gender === 'female' ? colors.primary : colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
            }]}>
              {language === 'ar' ? 'أنثى' : 'Female'}
            </Text>
            {personalInfo.gender === 'female' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'البلد *' : 'Country *'}
        </Text>
        <View style={[styles.selectWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.inputIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <MapPin size={20} color={colors.textSecondary} />
          </View>
          <TouchableOpacity 
            style={styles.selectContent}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <View style={[styles.selectRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.selectText, { 
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
              }]}>
                {countries.find(c => c.code === personalInfo.country)?.flag} {countries.find(c => c.code === personalInfo.country)?.name}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Country Picker Dropdown */}
        {showCountryPicker && (
          <View style={[styles.countryDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView style={styles.countryList} nestedScrollEnabled>
              {(['manager', 'accountant', 'viewer'] as StaffRole[]).map((role) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryOption,
                    personalInfo.country === country.code && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => {
                    setPersonalInfo(prev => ({ ...prev, country: country.code }));
                    setShowCountryPicker(false);
                  }}
                >
                  <View style={[styles.countryOptionContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
                        {country.name}
                      </Text>
                    </View>
                    {personalInfo.country === country.code && (
                      <Check size={16} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.stepBadge, { backgroundColor: colors.success }]}>
          <Globe size={20} color={colors.surface} />
        </View>
        <Text
          style={[
            styles.stepTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'التفضيلات' : 'Preferences'}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'اختر اللغة والعملة المفضلة' : 'Choose your preferred language and currency'}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'اللغة المفضلة *' : 'Preferred Language *'}
        </Text>
        <View style={styles.languageOptions}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              { backgroundColor: colors.surface, borderColor: colors.border },
              preferences.language === 'ar' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, language: 'ar' }))}
          >
            <Text style={styles.languageFlag}>🇸🇦</Text>
            <Text style={[styles.languageText, { 
              color: preferences.language === 'ar' ? colors.primary : colors.textPrimary,
              fontFamily: 'Tajawal-Medium' 
            }]}>
              العربية
            </Text>
            {preferences.language === 'ar' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              { backgroundColor: colors.surface, borderColor: colors.border },
              preferences.language === 'en' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, language: 'en' }))}
          >
            <Text style={styles.languageFlag}>🇺🇸</Text>
            <Text style={[styles.languageText, { 
              color: preferences.language === 'en' ? colors.primary : colors.textPrimary,
              fontFamily: 'Nunito-Medium' 
            }]}>
              English
            </Text>
            {preferences.language === 'en' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'العملة المفضلة *' : 'Preferred Currency *'}
        </Text>
        <View style={styles.currencyGrid}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                preferences.currency === currency.code && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]}
              onPress={() => setPreferences(prev => ({ ...prev, currency: currency.code as Currency }))}
            >
              <Text style={[styles.currencySymbol, { 
                color: preferences.currency === currency.code ? colors.primary : colors.textSecondary 
              }]}>
                {currency.symbol}
              </Text>
              <View style={styles.currencyInfo}>
                <Text style={[styles.currencyCode, { 
                  color: preferences.currency === currency.code ? colors.primary : colors.textPrimary,
                  fontFamily: 'monospace' 
                }]}>
                  {currency.code}
                </Text>
                <Text style={[styles.currencyName, { 
                  color: preferences.currency === currency.code ? colors.primary : colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                }]}>
                  {currency.name}
                </Text>
              </View>
              {preferences.currency === currency.code && <Check size={16} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.stepBadge, { backgroundColor: colors.success }]}>
          <Check size={20} color={colors.surface} />
        </View>
        <Text
          style={[
            styles.stepTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'تأكيد رقم الهاتف' : 'Phone Verification'}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' 
            ? `أدخل رمز التحقق المرسل إلى ${personalInfo.phoneE164}`
            : `Enter the verification code sent to ${personalInfo.phoneE164}`
          }
        </Text>
      </View>

      <View style={styles.verificationContainer}>
        <TextInput
          style={[
            styles.verificationInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: 'monospace',
            },
          ]}
          placeholder="123456"
          placeholderTextColor={colors.textMuted}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        
        <Text
          style={[
            styles.verificationHint,
            {
              color: colors.textMuted,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit code'}
        </Text>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => Alert.alert(
            language === 'ar' ? 'تم الإرسال' : 'Code Sent',
            language === 'ar' ? 'تم إرسال رمز جديد' : 'New code has been sent'
          )}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.resendText,
              {
                color: colors.primary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              },
            ]}
          >
            {language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStepProgress = () => {
    const steps = ['invitation', 'personal', 'preferences', 'verification'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={[styles.header, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            {isRTL ? (
              <ArrowRight size={24} color={colors.textSecondary} />
            ) : (
              <ArrowLeft size={24} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          
          <Logo size="md" style={styles.headerLogo} />
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'حساب موظف' : 'Staff Account'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: colors.warning,
                width: `${getStepProgress()}%` 
              }
            ]} 
          />
        </View>

        {/* Form Content */}
        <Card style={[styles.formCard, { backgroundColor: colors.surface }]}>
          {currentStep === 'invitation' && renderInvitationStep()}
          {currentStep === 'personal' && renderPersonalStep()}
          {currentStep === 'preferences' && renderPreferencesStep()}
          {currentStep === 'verification' && renderVerificationStep()}
        </Card>

        {/* Navigation Buttons */}
        <View style={[styles.navigationButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {currentStep !== 'invitation' && (
            <Button
              title={language === 'ar' ? 'السابق' : 'Previous'}
              onPress={handlePreviousStep}
              variant="secondary"
              style={styles.navButton}
            />
          )}
          
          {currentStep !== 'verification' ? (
            <Button
              title={language === 'ar' ? 'التالي' : 'Next'}
              onPress={handleNextStep}
              variant="primary"
              style={styles.navButton}
            />
          ) : (
            <Button
              title={isLoading 
                ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') 
                : (language === 'ar' ? 'إنشاء الحساب' : 'Create Account')
              }
              onPress={handleRegister}
              disabled={isLoading}
              variant="primary"
              style={styles.navButton}
            />
          )}
        </View>

        {/* Already Have Account */}
        <View style={styles.loginPrompt}>
          <Text
            style={[
              styles.loginPromptText,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.loginLink,
                {
                  color: colors.primary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                },
              ]}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLogo: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  formCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  stepContainer: {
    gap: spacing.lg,
  },
  stepHeader: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: fontSize.xxl,
  },
  stepDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
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
    fontSize: fontSize.lg,
    minHeight: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    minHeight: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    paddingRight: spacing.lg,
    minHeight: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  selectContent: {
    flex: 1,
    paddingLeft: 60,
    paddingVertical: spacing.lg,
  },
  selectRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: fontSize.lg,
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  countryFlag: {
    fontSize: 16,
    flexShrink: 0,
  },
  countryOptionInfo: {
    flex: 1,
  },
  countryOptionName: {
    fontSize: fontSize.sm,
  },
  invitationContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  invitationInput: {
    borderWidth: 3,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  invitationHint: {
    fontSize: fontSize.md,
  },
  demoInvitations: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    width: '100%',
  },
  demoHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  demoTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  demoCodesList: {
    gap: spacing.xs,
  },
  demoCodeItem: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  currencyGrid: {
    gap: spacing.sm,
  },
  currencyOption: {
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
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 32,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: fontSize.sm,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  genderText: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  verificationContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  verificationInput: {
    borderWidth: 3,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  verificationHint: {
    fontSize: fontSize.md,
  },
  resendButton: {
    padding: spacing.md,
  },
  resendText: {
    fontSize: fontSize.md,
  },
  navigationButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  navButton: {
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  loginPrompt: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 167, 113, 0.2)',
  },
  loginPromptText: {
    fontSize: fontSize.md,
  },
  loginLink: {
    fontSize: fontSize.md,
  },
});