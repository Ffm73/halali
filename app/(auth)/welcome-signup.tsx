import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/ui/Logo';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Building, UserCheck, Users, ArrowRight, ArrowLeft, Crown, Shield, Star } from 'lucide-react-native';

export default function WelcomeSignupScreen() {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const router = useRouter();

  const userTypes = [
    {
      id: 'landlord',
      title: language === 'ar' ? 'مالك عقار' : 'Property Owner',
      description: language === 'ar' ? 'إدارة العقارات والمستأجرين' : 'Manage properties & tenants',
      icon: Building,
      color: colors.primary,
      route: '/(auth)/register-landlord',
      badge: language === 'ar' ? 'مالك' : 'Owner',
      badgeIcon: Crown,
      features: [
        language === 'ar' ? 'إدارة عقارات متعددة' : 'Multiple properties',
        language === 'ar' ? 'تتبع المدفوعات' : 'Track payments',
        language === 'ar' ? 'إدارة المستأجرين' : 'Manage tenants',
        language === 'ar' ? 'دعوة فريق العمل' : 'Team management',
        language === 'ar' ? 'تقارير مالية' : 'Financial reports',
      ],
    },
    {
      id: 'resident',
      title: language === 'ar' ? 'مستأجر' : 'Tenant',
      description: language === 'ar' ? 'دفع الإيجار وتتبع المدفوعات' : 'Pay rent & track payments',
      icon: UserCheck,
      color: colors.success,
      route: '/(auth)/register-resident',
      badge: language === 'ar' ? 'مستأجر' : 'Tenant',
      badgeIcon: Star,
      features: [
        language === 'ar' ? 'دفع الإيجار بسهولة' : 'Easy payments',
        language === 'ar' ? 'تتبع المدفوعات' : 'Payment history',
        language === 'ar' ? 'إشعارات المواعيد' : 'Due notifications',
        language === 'ar' ? 'التواصل مع المالك' : 'Contact landlord',
        language === 'ar' ? 'تفاصيل العقد' : 'Contract details',
      ],
    },
    {
      id: 'staff',
      title: language === 'ar' ? 'موظف' : 'Staff Member',
      description: language === 'ar' ? 'مساعدة في إدارة العقارات' : 'Assist property management',
      icon: Users,
      color: colors.warning,
      route: '/(auth)/register-staff',
      badge: language === 'ar' ? 'موظف' : 'Staff',
      badgeIcon: Shield,
      features: [
        language === 'ar' ? 'صلاحيات مخصصة' : 'Custom permissions',
        language === 'ar' ? 'إدارة العقارات' : 'Property management',
        language === 'ar' ? 'تحصيل المدفوعات' : 'Collect payments',
        language === 'ar' ? 'إدارة المستأجرين' : 'Manage tenants',
        language === 'ar' ? 'تقارير الأداء' : 'Performance reports',
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={true} bounces={true}>
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
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
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
              ? 'اختر نوع الحساب المناسب'
              : 'Choose your account type'
            }
          </Text>
        </View>

        {/* User Type Cards */}
        <View style={styles.userTypesContainer}>
          {userTypes.map((userType) => (
            <TouchableOpacity
              key={userType.id}
              style={[styles.userTypeCard, { 
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              }]}
              onPress={() => router.push(userType.route as any)}
              activeOpacity={0.8}
            >
              {/* Card Header */}
              <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.userTypeIcon, { backgroundColor: `${userType.color}15` }]}>
                  <userType.icon size={32} color={userType.color} />
                </View>
                <View style={styles.headerInfo}>
                  <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text
                      style={[
                        styles.userTypeTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {userType.title}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: userType.color }]}>
                      <userType.badgeIcon size={12} color={colors.surface} />
                      <Text style={[styles.badgeText, { color: colors.surface }]}>
                        {userType.badge}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.userTypeDescription,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {userType.description}
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  {isRTL ? (
                    <ArrowLeft size={20} color={colors.textMuted} />
                  ) : (
                    <ArrowRight size={20} color={colors.textMuted} />
                  )}
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                {userType.features.map((feature, index) => (
                  <View key={index} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.featureDot, { backgroundColor: userType.color }]} />
                    <Text
                      style={[
                        styles.featureText,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
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
  title: {
    fontSize: 24,
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: 26,
  },
  userTypesContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  userTypeCard: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardHeader: {
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  userTypeIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  userTypeTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  userTypeDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  arrowContainer: {
    padding: spacing.sm,
  },
  featuresContainer: {
    gap: spacing.sm,
  },
  featureRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
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