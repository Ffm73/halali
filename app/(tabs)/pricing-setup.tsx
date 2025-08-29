import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PricingTiers, PricingTier } from '@/components/pricing/PricingTiers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { ArrowLeft, ArrowRight, Crown, CircleCheck as CheckCircle, ArrowDown, Zap, Shield, Star, Users } from 'lucide-react-native';

type SetupStep = 'pricing' | 'contacts' | 'confirmation';

export default function PricingSetupScreen() {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('pricing');
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [addedContacts, setAddedContacts] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      id: 'pricing',
      title: language === 'ar' ? 'اختيار الخطة' : 'Choose Plan',
      description: language === 'ar' ? 'اختر الخطة المناسبة لاحتياجاتك' : 'Select the plan that fits your needs',
      icon: Crown,
    },
    {
      id: 'contacts',
      title: language === 'ar' ? 'إضافة جهات الاتصال' : 'Add Contacts',
      description: language === 'ar' ? 'أضف المستأجرين والموظفين' : 'Add tenants and staff members',
      icon: Users,
    },
    {
      id: 'confirmation',
      title: language === 'ar' ? 'التأكيد والبدء' : 'Confirm & Start',
      description: language === 'ar' ? 'راجع الإعدادات وابدأ الاستخدام' : 'Review settings and start using',
      icon: CheckCircle,
    },
  ];

  const handleTierSelected = (tier: PricingTier) => {
    setSelectedTier(tier);
    
    // Auto-advance to next step after selection
    setTimeout(() => {
      setCurrentStep('contacts');
    }, 500);
  };

  const handleContactAdded = (contact: any) => {
    setAddedContacts(prev => [...prev, contact]);
  };

  const handleSkipContacts = () => {
    setCurrentStep('confirmation');
  };

  const handleCompleteSetup = async () => {
    if (!selectedTier) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى اختيار خطة أولاً' : 'Please select a plan first'
      );
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate setup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        language === 'ar' ? '🎉 مرحباً بك!' : '🎉 Welcome!',
        language === 'ar' 
          ? `تم إعداد حسابك بنجاح مع خطة ${selectedTier.nameAr}. يمكنك الآن البدء في إدارة عقاراتك.`
          : `Your account has been set up successfully with ${selectedTier.name} plan. You can now start managing your properties.`,
        [
          {
            text: language === 'ar' ? 'البدء' : 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'فشل في إعداد الحساب' : 'Failed to set up account'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepProgress = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    return ((stepIndex + 1) / steps.length) * 100;
  };

  const renderStepIndicator = () => (
    <View style={[styles.stepIndicator, { backgroundColor: colors.surface }]}>
      <View style={styles.stepProgress}>
        <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${getStepProgress()}%`,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
            },
          ]}
        >
          {language === 'ar' ? `الخطوة ${steps.findIndex(s => s.id === currentStep) + 1} من ${steps.length}` : `Step ${steps.findIndex(s => s.id === currentStep) + 1} of ${steps.length}`}
        </Text>
      </View>
      
      <View style={[styles.stepsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          const StepIcon = step.icon;
          
          return (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isCompleted ? colors.success : isActive ? colors.primary : colors.surfaceSecondary,
                    borderColor: isCompleted ? colors.success : isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <StepIcon 
                  size={20} 
                  color={isCompleted || isActive ? colors.surface : colors.textMuted} 
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: 'center',
                  },
                ]}
              >
                {step.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderPricingStep = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
          {language === 'ar' ? 'اختر خطة التسعير' : 'Choose Your Pricing Plan'}
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
            ? 'اختر الخطة التي تناسب حجم عقاراتك وفريقك'
            : 'Select the plan that matches your property portfolio and team size'
          }
        </Text>
      </View>

      <PricingTiers
        onTierSelected={handleTierSelected}
        selectedTierId={selectedTier?.id}
        showAnnualDiscount={true}
      />

      {selectedTier && (
        <Card style={[styles.selectedPlanCard, { backgroundColor: colors.successLight }]}>
          <View style={[styles.selectedPlanHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <CheckCircle size={24} color={colors.success} />
            <Text
              style={[
                styles.selectedPlanText,
                {
                  color: colors.success,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' 
                ? `تم اختيار خطة ${selectedTier.nameAr}`
                : `${selectedTier.name} plan selected`
              }
            </Text>
          </View>
          <Button
            title={language === 'ar' ? 'متابعة إلى إضافة جهات الاتصال' : 'Continue to Add Contacts'}
            onPress={() => setCurrentStep('contacts')}
            variant="primary"
            style={styles.continueButton}
          />
        </Card>
      )}
    </View>
  );

  const renderContactsStep = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
          {language === 'ar' ? 'إضافة جهات الاتصال' : 'Add Contacts'}
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
            ? 'أضف المستأجرين والموظفين لبدء إدارة عقاراتك'
            : 'Add tenants and staff members to start managing your properties'
          }
        </Text>
      </View>

      <View style={[styles.stepActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Button
          title={language === 'ar' ? 'تخطي الآن' : 'Skip for Now'}
          onPress={handleSkipContacts}
          variant="secondary"
          style={styles.stepActionButton}
        />
        <Button
          title={language === 'ar' ? 'متابعة' : 'Continue'}
          onPress={() => setCurrentStep('confirmation')}
          variant="primary"
          style={styles.stepActionButton}
        />
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
          {language === 'ar' ? 'تأكيد الإعداد' : 'Confirm Setup'}
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
            ? 'راجع اختياراتك وابدأ استخدام حلالي'
            : 'Review your choices and start using Halali'
          }
        </Text>
      </View>

      {/* Selected Plan Summary */}
      {selectedTier && (
        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.summaryHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primaryLight }]}>
              <Crown size={24} color={colors.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text
                style={[
                  styles.summaryTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? selectedTier.nameAr : selectedTier.name}
              </Text>
              <Text
                style={[
                  styles.summaryPrice,
                  {
                    color: colors.primary,
                    fontFamily: 'monospace',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {selectedTier.price.toLocaleString()} {selectedTier.currency}/{language === 'ar' ? (selectedTier.period === 'month' ? 'شهر' : 'سنة') : selectedTier.period}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Contacts Summary */}
      <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.summaryHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.successLight }]}>
            <Users size={24} color={colors.success} />
          </View>
          <View style={styles.summaryInfo}>
            <Text
              style={[
                styles.summaryTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'جهات الاتصال' : 'Contacts'}
            </Text>
            <Text
              style={[
                styles.summaryDescription,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' 
                ? `تم إضافة ${addedContacts.length} جهة اتصال`
                : `${addedContacts.length} contacts added`
              }
            </Text>
          </View>
        </View>
      </Card>

      {/* Setup Benefits */}
      <Card style={[styles.benefitsCard, { backgroundColor: colors.primaryLight }]}>
        <Text
          style={[
            styles.benefitsTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'ما ستحصل عليه' : 'What You Get'}
        </Text>
        
        <View style={styles.benefitsList}>
          {[
            {
              icon: Zap,
              text: language === 'ar' ? 'إعداد فوري للحساب' : 'Instant account setup',
            },
            {
              icon: Shield,
              text: language === 'ar' ? 'حماية متقدمة للبيانات' : 'Advanced data protection',
            },
            {
              icon: Star,
              text: language === 'ar' ? 'دعم فني مخصص' : 'Dedicated technical support',
            },
          ].map((benefit, index) => (
            <View key={index} style={[styles.benefitItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary }]}>
                <benefit.icon size={16} color={colors.surface} />
              </View>
              <Text
                style={[
                  styles.benefitText,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Final Actions */}
      <View style={[styles.finalActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Button
          title={language === 'ar' ? 'العودة' : 'Back'}
          onPress={() => setCurrentStep('contacts')}
          variant="secondary"
          style={styles.finalActionButton}
        />
        <Button
          title={isProcessing 
            ? (language === 'ar' ? 'جاري الإعداد...' : 'Setting up...') 
            : (language === 'ar' ? 'إكمال الإعداد' : 'Complete Setup')
          }
          onPress={handleCompleteSetup}
          disabled={isProcessing}
          variant="primary"
          style={styles.finalActionButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/settings')}
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
          {language === 'ar' ? 'إعداد الحساب' : 'Account Setup'}
        </Text>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {currentStep === 'pricing' && renderPricingStep()}
        {currentStep === 'contacts' && renderContactsStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  stepIndicator: {
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  stepProgress: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  stepsContainer: {
    justifyContent: 'space-around',
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepLabel: {
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepContent: {
    gap: spacing.lg,
  },
  stepHeader: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    fontSize: fontSize.lg,
    lineHeight: 26,
  },
  selectedPlanCard: {
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  selectedPlanHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  selectedPlanText: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  continueButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  stepActions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  stepActionButton: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  summaryPrice: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  summaryDescription: {
    fontSize: fontSize.md,
  },
  benefitsCard: {
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  finalActions: {
    gap: spacing.md,
  },
  finalActionButton: {
    flex: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});