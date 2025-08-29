import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { X, Phone, Mail, CircleCheck as CheckCircle, Clock, RefreshCw } from 'lucide-react-native';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'phone' | 'email';
  phoneNumber?: string;
  email?: string;
}

export function VerificationModal({ visible, onClose, type, phoneNumber, email }: VerificationModalProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { verifyPhoneNumber, verifyEmail, sendPhoneVerification, sendEmailVerification } = useAuth();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال رمز التحقق' : 'Please enter verification code'
      );
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (type === 'phone' && phoneNumber) {
        result = await verifyPhoneNumber(phoneNumber, verificationCode);
      } else if (type === 'email' && email) {
        result = await verifyEmail(email, verificationCode);
      } else {
        throw new Error('Invalid verification type or missing contact info');
      }

      if (result.success) {
        Alert.alert(
          language === 'ar' ? 'تم التحقق بنجاح' : 'Verification Successful',
          language === 'ar' 
            ? `تم تحقق ${type === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'} بنجاح`
            : `${type === 'phone' ? 'Phone number' : 'Email'} verified successfully`,
          [
            {
              text: language === 'ar' ? 'موافق' : 'OK',
              onPress: () => {
                setVerificationCode('');
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ في التحقق' : 'Verification Error',
          result.error || (language === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code')
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ أثناء التحقق' : 'An error occurred during verification'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      let result;
      if (type === 'phone' && phoneNumber) {
        result = await sendPhoneVerification(phoneNumber);
      } else if (type === 'email' && email) {
        result = await sendEmailVerification(email);
      } else {
        throw new Error('Invalid verification type or missing contact info');
      }

      if (result.success) {
        Alert.alert(
          language === 'ar' ? 'تم الإرسال' : 'Code Sent',
          language === 'ar' 
            ? `تم إرسال رمز جديد إلى ${type === 'phone' ? 'رقم هاتفك' : 'بريدك الإلكتروني'}`
            : `New code sent to your ${type === 'phone' ? 'phone' : 'email'}`
        );
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          result.error || (language === 'ar' ? 'فشل في إرسال الرمز' : 'Failed to send code')
        );
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ أثناء إرسال الرمز' : 'An error occurred while sending code'
      );
    } finally {
      setIsResending(false);
    }
  };

  const getIcon = () => {
    return type === 'phone' ? 
      <Phone size={32} color={colors.primary} /> : 
      <Mail size={32} color={colors.primary} />;
  };

  const getTitle = () => {
    if (type === 'phone') {
      return language === 'ar' ? 'تحقق من رقم الهاتف' : 'Verify Phone Number';
    } else {
      return language === 'ar' ? 'تحقق من البريد الإلكتروني' : 'Verify Email Address';
    }
  };

  const getDescription = () => {
    const contact = type === 'phone' ? phoneNumber : email;
    if (type === 'phone') {
      return language === 'ar' 
        ? `أدخل رمز التحقق المرسل إلى ${contact}`
        : `Enter the verification code sent to ${contact}`;
    } else {
      return language === 'ar' 
        ? `أدخل رمز التحقق المرسل إلى ${contact}`
        : `Enter the verification code sent to ${contact}`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.modalTitle,
              {
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
                color: colors.textPrimary,
              },
            ]}
          >
            {getTitle()}
          </Text>
        </View>

        <View style={styles.modalContent}>
          <Card style={[styles.verificationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.verificationHeader}>
              <View style={[styles.verificationIcon, { backgroundColor: colors.primaryLight }]}>
                {getIcon()}
              </View>
              <Text
                style={[
                  styles.verificationTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: 'center',
                  },
                ]}
              >
                {getTitle()}
              </Text>
              <Text
                style={[
                  styles.verificationDescription,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                  },
                ]}
              >
                {getDescription()}
              </Text>
            </View>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={[
                  styles.codeInput,
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
                  styles.codeHint,
                  {
                    color: colors.textMuted,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                  },
                ]}
              >
                {language === 'ar' ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit code'}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title={isLoading 
                  ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') 
                  : (language === 'ar' ? 'تحقق' : 'Verify')
                }
                onPress={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
                variant="primary"
              />

              <TouchableOpacity
                style={[styles.resendButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={handleResendCode}
                disabled={isResending}
                activeOpacity={0.7}
              >
                <RefreshCw size={16} color={colors.primary} />
                <Text
                  style={[
                    styles.resendText,
                    {
                      color: colors.primary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {isResending 
                    ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                    : (language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code')
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Code Hint */}
            <View style={[styles.demoHint, { backgroundColor: colors.successLight }]}>
              <CheckCircle size={16} color={colors.success} />
              <Text
                style={[
                  styles.demoHintText,
                  {
                    color: colors.success,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'للتجربة: استخدم الرمز 123456' : 'For demo: use code 123456'}
              </Text>
            </View>
          </Card>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderLeftWidth: 4,
  },
  bannerHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  bannerDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  verificationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  verificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  verificationActionText: {
    fontSize: fontSize.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
    alignItems: 'center',
    gap: spacing.md,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  verificationCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.card,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  verificationHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  verificationIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationTitle: {
    fontSize: fontSize.xl,
  },
  verificationDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  codeInputContainer: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  codeInput: {
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
  codeHint: {
    fontSize: fontSize.md,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  resendText: {
    fontSize: fontSize.md,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  demoHintText: {
    fontSize: fontSize.sm,
  },
});