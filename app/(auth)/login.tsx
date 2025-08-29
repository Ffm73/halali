import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, User, Shield, LogIn, Phone, Fingerprint, RotateCcw, Crown, Star, Users as UsersIcon, X, CircleCheck as CheckCircle, Globe, Sun, Moon, UserPlus } from 'lucide-react-native';

export default function LoginScreen() {
  const { language, isRTL, setLanguage } = useLocalization();
  const { colors, isDark, toggleTheme } = useTheme();
  const { login, loginWithBiometrics, resetPassword, confirmPasswordReset } = useAuth();
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'phone' | 'code' | 'password'>('phone');

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogin = async () => {
    console.log('🔐 LOGIN BUTTON CLICKED - Starting validation...');
    console.log('📱 Phone number input:', {
      value: phoneNumber,
      length: phoneNumber?.length,
      type: typeof phoneNumber,
      trimmed: phoneNumber?.trim(),
      startsWithPlus: phoneNumber?.startsWith('+')
    });
    console.log('🔑 Password input:', {
      length: password?.length,
      type: typeof password,
      isEmpty: !password?.trim(),
      hasValue: !!password
    });
    
    const cleanPhone = phoneNumber.trim();
    const cleanPassword = password.trim();
    
    if (!cleanPhone) {
      console.log('❌ VALIDATION FAILED: Phone number is empty');
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number'
      );
      return;
    }

    if (!cleanPassword) {
      console.log('❌ VALIDATION FAILED: Password is empty');
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password'
      );
      return;
    }

    console.log('✅ INPUT VALIDATION PASSED - Proceeding to authentication...');
    setIsLoading(true);
    
    try {
      console.log('🚀 CALLING AUTH LOGIN FUNCTION...');
      const result = await login(cleanPhone, cleanPassword);
      console.log('📋 LOGIN FUNCTION RESULT:', {
        success: result.success,
        error: result.error,
        hasError: !!result.error,
        resultType: typeof result
      });
      
      if (result.success) {
        console.log('✅ LOGIN SUCCESSFUL - User authenticated');
        // Force navigation based on user role
        if (result.user) {
          setTimeout(() => {
            if (result.user!.role === 'resident') {
              router.replace('/(tabs)/resident-dashboard');
            } else if (result.user!.role === 'staff') {
              router.replace('/(tabs)/staff-dashboard');
            } else {
              router.replace('/(tabs)');
            }
          }, 500);
        }
      } else {
        console.log('❌ LOGIN FAILED:', result.error);
        console.log('❌ Full error details:', result);
        Alert.alert(
          language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login Error',
          result.error || (language === 'ar' ? 'رقم الهاتف أو كلمة المرور غير صحيحة' : 'Invalid phone number or password')
        );
      }
    } catch (error) {
      console.error('💥 LOGIN EXCEPTION CAUGHT:', error);
      console.error('💥 Exception analysis:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login'
      );
    } finally {
      console.log('🏁 LOGIN ATTEMPT COMPLETED - Resetting loading state');
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await loginWithBiometrics();
      
      if (result.success) {
        console.log('✅ Biometric login successful');
      } else if (result.fallbackToPassword) {
        Alert.alert(
          language === 'ar' ? 'المصادقة البيومترية' : 'Biometric Authentication',
          language === 'ar' ? 'فشلت المصادقة البيومترية. يرجى استخدام كلمة المرور.' : 'Biometric authentication failed. Please use password.',
          [{ text: language === 'ar' ? 'موافق' : 'OK' }]
        );
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          result.error || (language === 'ar' ? 'فشلت المصادقة البيومترية' : 'Biometric authentication failed')
        );
      }
    } catch (error) {
      console.error('Biometric login error:', error);
    }
  };

  const handlePasswordReset = async () => {
    if (resetStep === 'phone') {
      if (!resetPhone.trim()) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number'
        );
        return;
      }
      
      const result = await resetPassword(resetPhone);
      if (result.success) {
        setResetStep('code');
        Alert.alert(
          language === 'ar' ? 'تم الإرسال' : 'Code Sent',
          language === 'ar' ? 'تم إرسال رمز الاستعادة إلى رقم هاتفك' : 'Recovery code sent to your phone'
        );
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          result.error || (language === 'ar' ? 'فشل في إرسال رمز الاستعادة' : 'Failed to send recovery code')
        );
      }
    } else if (resetStep === 'code') {
      if (!resetCode.trim()) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'يرجى إدخال رمز التحقق' : 'Please enter verification code'
        );
        return;
      }
      setResetStep('password');
    } else if (resetStep === 'password') {
      if (!newPassword.trim() || newPassword.length < 6) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
        );
        return;
      }
      
      const result = await confirmPasswordReset(resetPhone, resetCode, newPassword);
      if (result.success) {
        Alert.alert(
          language === 'ar' ? 'تم التحديث' : 'Password Updated',
          language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully'
        );
        
        setShowForgotPassword(false);
        setResetStep('phone');
        setResetPhone('');
        setResetCode('');
        setNewPassword('');
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          result.error || (language === 'ar' ? 'فشل في تحديث كلمة المرور' : 'Failed to update password')
        );
      }
    }
  };

  const fillDemoCredentials = (phone: string, pass: string) => {
    console.log('🎯 DEMO CREDENTIALS BUTTON CLICKED:', { phone, pass });
    setPhoneNumber(phone);
    setPassword(pass);
    console.log('✅ Demo credentials filled:', { 
      phoneSet: phone, 
      passwordSet: pass,
      phoneLength: phone.length,
      passwordLength: pass.length
    });
  };

  const renderForgotPasswordModal = () => (
    <Modal
      visible={showForgotPassword}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowForgotPassword(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowForgotPassword(false);
                setResetStep('phone');
                setResetPhone('');
                setResetCode('');
                setNewPassword('');
              }}
              style={[styles.modalCloseButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {resetStep === 'phone' && (
            <View style={styles.resetStep}>
              <Text
                style={[
                  styles.resetStepTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
              </Text>
              <PhoneInput
                value={resetPhone}
                onChangeText={setResetPhone}
                placeholder="XXXXXXXXX"
                label=""
              />
            </View>
          )}

          {resetStep === 'code' && (
            <View style={styles.resetStep}>
              <Text
                style={[
                  styles.resetStepTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'أدخل رمز التحقق' : 'Enter verification code'}
              </Text>
              <TextInput
                style={[
                  styles.resetInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: 'Nunito-Regular',
                  },
                ]}
                placeholder="123456"
                placeholderTextColor={colors.textMuted}
                value={resetCode}
                onChangeText={setResetCode}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={6}
              />
            </View>
          )}

          {resetStep === 'password' && (
            <View style={styles.resetStep}>
              <Text
                style={[
                  styles.resetStepTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New password'}
              </Text>
              <TextInput
                style={[
                  styles.resetInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                placeholderTextColor={colors.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                secureTextEntry
              />
            </View>
          )}

          <Button
            title={
              resetStep === 'phone' ? (language === 'ar' ? 'إرسال الرمز' : 'Send Code') :
              resetStep === 'code' ? (language === 'ar' ? 'تحقق' : 'Verify') :
              (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')
            }
            onPress={handlePasswordReset}
            variant="primary"
          />
        </View>
      </View>
    </Modal>
  );

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
        {/* Header Controls */}
        <View style={[styles.headerControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
          
          <View style={[styles.controlButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
              onPress={toggleTheme} 
              activeOpacity={0.7}
            >
              {isDark ? (
                <Sun size={18} color={colors.textSecondary} />
              ) : (
                <Moon size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
              onPress={toggleLanguage} 
              activeOpacity={0.7}
            >
              <Globe size={18} color={colors.textSecondary} />
              <Text style={[styles.controlButtonText, { 
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
              }]}>
                {language === 'ar' ? 'EN' : 'عر'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Header */}
        <View style={[styles.header, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Logo size="lg" style={styles.headerLogo} />
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
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In to Account'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' 
              ? 'أدخل رقم هاتفك وكلمة المرور للوصول إلى حسابك'
              : 'Enter your phone number and password to access your account'
            }
          </Text>
        </View>

        {/* Login Form */}
        <Card style={[styles.formCard, { backgroundColor: colors.surface }]}>
          {/* Phone Number Input - Primary Credential */}
          <View style={styles.inputContainer}>
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
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
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
                  styles.passwordInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={[styles.optionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.rememberMeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox, 
                { borderColor: colors.border },
                rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}>
                {rememberMe && (
                  <CheckCircle size={16} color={colors.surface} />
                )}
              </View>
              <Text
                style={[
                  styles.rememberMeText,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'تذكرني' : 'Remember me'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowForgotPassword(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  {
                    color: colors.primary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  },
                ]}
              >
                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            title={isLoading 
              ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...') 
              : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
            }
            onPress={handleLogin}
            disabled={isLoading}
            variant="primary"
            style={styles.loginSubmitButton}
          />

          {/* Biometric Login */}
          <TouchableOpacity
            style={[styles.biometricButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleBiometricLogin}
            activeOpacity={0.7}
          >
            <Fingerprint size={24} color={colors.primary} />
            <Text
              style={[
                styles.biometricText,
                {
                  color: colors.primary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                },
              ]}
            >
              {language === 'ar' ? 'تسجيل الدخول بالبصمة' : 'Sign in with biometrics'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Demo Accounts Section */}
        <View style={[styles.demoSection, { 
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.borderLight,
        }]}>
          <View style={[styles.demoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Shield size={20} color={colors.primary} />
            <Text
              style={[
                styles.demoTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'حسابات تجريبية' : 'Demo Accounts'}
            </Text>
          </View>
          
          <View style={styles.demoAccounts}>
            <TouchableOpacity 
              style={[styles.demoAccount, { backgroundColor: colors.primaryLight }]}
              onPress={() => fillDemoCredentials('+966501234567', 'password123')}
              activeOpacity={0.7}
            >
              <View style={[styles.demoAccountHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Crown size={18} color={colors.primary} />
                <Text style={[styles.demoAccountType, { 
                  color: colors.primary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
                }]}>
                  {language === 'ar' ? 'مالك عقار' : 'Property Owner'}
                </Text>
              </View>
              <Text style={[styles.demoCredentials, { 
                color: colors.textSecondary,
                fontFamily: 'Nunito-Regular' 
              }]}>
                {'+966501234567\npassword123'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.demoAccount, { backgroundColor: colors.successLight }]}
              onPress={() => fillDemoCredentials('+966507654321', 'password123')}
              activeOpacity={0.7}
            >
              <View style={[styles.demoAccountHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Star size={18} color={colors.success} />
                <Text style={[styles.demoAccountType, { 
                  color: colors.success,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
                }]}>
                  {language === 'ar' ? 'مستأجر' : 'Resident'}
                </Text>
              </View>
              <Text style={[styles.demoCredentials, { 
                color: colors.textSecondary,
                fontFamily: 'Nunito-Regular' 
              }]}>
                {'+966507654321\npassword123'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.demoAccount, { backgroundColor: colors.warningLight }]}
              onPress={() => fillDemoCredentials('+966509876543', 'password123')}
              activeOpacity={0.7}
            >
              <View style={[styles.demoAccountHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <UsersIcon size={18} color={colors.warning} />
                <Text style={[styles.demoAccountType, { 
                  color: colors.warning,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
                }]}>
                  {language === 'ar' ? 'موظف' : 'Subuser'}
                </Text>
              </View>
              <Text style={[styles.demoCredentials, { 
                color: colors.textSecondary,
                fontFamily: 'Nunito-Regular' 
              }]}>
                {'+966509876543\npassword123'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupSection}>
          <Text
            style={[
              styles.signupPrompt,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
          </Text>
          <TouchableOpacity
            style={[styles.signupButton, { 
              backgroundColor: colors.primaryLight,
              borderColor: colors.primary,
            }]}
            onPress={() => router.push('/(auth)/welcome-signup')}
            activeOpacity={0.7}
          >
            <UserPlus size={20} color={colors.primary} />
            <Text
              style={[
                styles.signupButtonText,
                {
                  color: colors.primary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                },
              ]}
            >
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      {renderForgotPasswordModal()}
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
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerControls: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlButtons: {
    gap: spacing.sm,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlButtonText: {
    fontSize: fontSize.sm,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  headerLogo: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: 26,
  },
  formCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
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
  passwordInput: {
    paddingRight: 60,
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  optionsRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  rememberMeContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rememberMeText: {
    fontSize: fontSize.md,
  },
  forgotPasswordText: {
    fontSize: fontSize.md,
  },
  loginSubmitButton: {
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  biometricText: {
    fontSize: fontSize.md,
  },
  demoSection: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: spacing.lg,
  },
  demoHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  demoTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  demoAccounts: {
    gap: spacing.md,
  },
  demoAccount: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  demoAccountHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  demoAccountType: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  demoCredentials: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  signupSection: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  signupPrompt: {
    fontSize: fontSize.lg,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  signupButtonText: {
    fontSize: fontSize.lg,
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
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  modalCloseButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  resetStep: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  resetStepTitle: {
    fontSize: fontSize.lg,
  },
  resetInput: {
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});