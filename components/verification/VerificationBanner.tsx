import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Phone, Mail, X } from 'lucide-react-native';

interface VerificationBannerProps {
  onDismiss?: () => void;
  onVerifyPhone?: () => void;
  onVerifyEmail?: () => void;
}

export function VerificationBanner({ onDismiss, onVerifyPhone, onVerifyEmail }: VerificationBannerProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { user, verificationStatus, getVerificationProgress } = useAuth();

  // Don't show if user is fully verified
  if (verificationStatus.phone && (!user?.email || verificationStatus.email)) {
    return null;
  }

  const progress = getVerificationProgress();
  const needsPhoneVerification = !verificationStatus.phone;
  const needsEmailVerification = user?.email && !verificationStatus.email;

  return (
    <Card style={[styles.banner, { backgroundColor: colors.warningLight }]}>
      <View style={[styles.bannerHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.bannerIcon}>
          <AlertCircle size={20} color={colors.warning} />
        </View>
        <View style={styles.bannerContent}>
          <Text
            style={[
              styles.bannerTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'إكمال التحقق' : 'Complete Verification'}
          </Text>
          <Text
            style={[
              styles.bannerDescription,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' 
              ? `تحقق من هويتك للوصول إلى جميع الميزات (${progress}% مكتمل)`
              : `Verify your identity to access all features (${progress}% complete)`
            }
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.warning,
              width: `${progress}%` 
            }
          ]} 
        />
      </View>

      {/* Verification Actions */}
      <View style={styles.verificationActions}>
        {needsPhoneVerification && (
          <TouchableOpacity
            style={[styles.verificationAction, { backgroundColor: colors.surface }]}
            onPress={onVerifyPhone}
            activeOpacity={0.7}
          >
            <Phone size={16} color={colors.warning} />
            <Text
              style={[
                styles.verificationActionText,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {language === 'ar' ? 'تحقق من الهاتف' : 'Verify Phone'}
            </Text>
          </TouchableOpacity>
        )}

        {needsEmailVerification && (
          <TouchableOpacity
            style={[styles.verificationAction, { backgroundColor: colors.surface }]}
            onPress={onVerifyEmail}
            activeOpacity={0.7}
          >
            <Mail size={16} color={colors.warning} />
            <Text
              style={[
                styles.verificationActionText,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {language === 'ar' ? 'تحقق من الإيميل' : 'Verify Email'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: spacing.md,
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
});