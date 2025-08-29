import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/ui/Logo';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Building, UserCheck, Users, ArrowRight, ArrowLeft, LogIn, UserPlus, Sparkles, Shield, Zap, Globe, Moon, Sun } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { language, isRTL, setLanguage } = useLocalization();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const features = [
    {
      icon: Zap,
      title: language === 'ar' ? 'سريع وآمن' : 'Fast & Secure',
      description: language === 'ar' ? 'تسجيل دخول بخطوة واحدة' : 'One-step login process',
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'حماية متقدمة' : 'Advanced Security',
      description: language === 'ar' ? 'حماية بيانات متعددة المستويات' : 'Multi-layer data protection',
    },
    {
      icon: Sparkles,
      title: language === 'ar' ? 'تجربة ذكية' : 'Smart Experience',
      description: language === 'ar' ? 'واجهة تتكيف مع احتياجاتك' : 'Interface that adapts to your needs',
    },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header Controls */}
        <View style={[styles.headerControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
            onPress={toggleTheme} 
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun size={20} color={colors.textSecondary} />
            ) : (
              <Moon size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
            onPress={toggleLanguage} 
            activeOpacity={0.7}
          >
            <Globe size={20} color={colors.textSecondary} />
            <Text style={[styles.controlButtonText, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
            }]}>
              {language === 'ar' ? 'EN' : 'عر'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Logo size="lg" style={styles.heroLogo} />
          <Text
            style={[
              styles.heroTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'مرحباً بك في حلالي' : 'Welcome to Halali'}
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' 
              ? 'منصة إدارة العقارات الذكية'
              : 'Smart property management'
            }
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
                <feature.icon size={20} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text
                  style={[
                    styles.featureTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Clear Authentication Actions */}
        <View style={styles.authActionsContainer}>
          {/* Primary Action: Create Account */}
          <TouchableOpacity
            style={[styles.primaryAuthButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/welcome-signup')}
            activeOpacity={0.8}
          >
            <UserPlus size={28} color={colors.surface} />
            <View style={styles.authButtonContent}>
              <Text
                style={[
                  styles.primaryAuthTitle,
                  {
                    color: colors.surface,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  },
                ]}
              >
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
              </Text>
              <Text
                style={[
                  styles.authSubtext,
                  {
                    color: colors.surface,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'ابدأ رحلتك معنا اليوم' : 'Start your journey with us today'}
              </Text>
            </View>
            <View style={styles.authButtonArrow}>
              {isRTL ? (
                <ArrowLeft size={24} color={colors.surface} />
              ) : (
                <ArrowRight size={24} color={colors.surface} />
              )}
            </View>
          </TouchableOpacity>

          {/* Secondary Action: Sign In */}
          <TouchableOpacity
            style={[styles.secondaryAuthButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            }]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <LogIn size={28} color={colors.primary} />
            <View style={styles.authButtonContent}>
              <Text
                style={[
                  styles.secondaryAuthTitle,
                  {
                    color: colors.primary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  },
                ]}
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In to Account'}
              </Text>
              <Text
                style={[
                  styles.authSubtext,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
              </Text>
            </View>
            <View style={styles.authButtonArrow}>
              {isRTL ? (
                <ArrowLeft size={24} color={colors.primary} />
              ) : (
                <ArrowRight size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text
            style={[
              styles.trustTitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'موثوق من قبل آلاف المستخدمين' : 'Trusted by thousands of users'}
          </Text>
          
          <View style={[styles.trustStats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.trustStat}>
              <Text
                style={[
                  styles.trustNumber,
                  {
                    color: colors.primary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                10,000+
              </Text>
              <Text
                style={[
                  styles.trustLabel,
                  {
                    color: colors.textMuted,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'وحدة' : 'Units'}
              </Text>
            </View>
            
            <View style={styles.trustStat}>
              <Text
                style={[
                  styles.trustNumber,
                  {
                    color: colors.primary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                500+
              </Text>
              <Text
                style={[
                  styles.trustLabel,
                  {
                    color: colors.textMuted,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'مالك' : 'Owners'}
              </Text>
            </View>
            
            <View style={styles.trustStat}>
              <Text
                style={[
                  styles.trustNumber,
                  {
                    color: colors.primary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                99.9%
              </Text>
              <Text
                style={[
                  styles.trustLabel,
                  {
                    color: colors.textMuted,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'وقت التشغيل' : 'Uptime'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Access for Returning Users */}
        <View style={[styles.quickAccessSection, { backgroundColor: colors.surfaceSecondary }]}>
          <Text
            style={[
              styles.quickAccessTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'وصول سريع' : 'Quick Access'}
          </Text>
          <Text
            style={[
              styles.quickAccessSubtitle,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'استخدم رقم هاتفك للدخول السريع' : 'Use your phone number for quick access'}
          </Text>
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
    paddingTop: spacing.lg,
  },
  headerControls: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  heroSection: {
    marginBottom: spacing.xxl,
  },
  heroLogo: {
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  featuresSection: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  featureItem: {
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  authActionsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  primaryAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  secondaryAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  authButtonContent: {
    flex: 1,
  },
  primaryAuthTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  secondaryAuthTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  authSubtext: {
    fontSize: fontSize.md,
    opacity: 0.9,
  },
  authButtonArrow: {
    padding: spacing.sm,
  },
  trustSection: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  trustTitle: {
    fontSize: fontSize.md,
  },
  trustStats: {
    justifyContent: 'space-around',
    width: '100%',
  },
  trustStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  trustNumber: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  trustLabel: {
    fontSize: fontSize.sm,
  },
  quickAccessSection: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickAccessTitle: {
    fontSize: fontSize.md,
  },
  quickAccessSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});