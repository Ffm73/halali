import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Check, Star, Crown, Zap, Shield, Users, Building, TrendingUp, ArrowRight } from 'lucide-react-native';

export interface PricingTier {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  period: 'month' | 'year';
  popular?: boolean;
  recommended?: boolean;
  features: string[];
  featuresAr: string[];
  limits: {
    properties: number | 'unlimited';
    units: number | 'unlimited';
    staff: number;
    storage: string;
  };
  additionalStaffPrice?: number;
  additionalStaffCurrency?: string;
  badge?: {
    text: string;
    textAr: string;
    color: string;
  };
}

interface PricingTiersProps {
  onTierSelected: (tier: PricingTier) => void;
  selectedTierId?: string;
  showAnnualDiscount?: boolean;
}

export function PricingTiers({ onTierSelected, selectedTierId, showAnnualDiscount = true }: PricingTiersProps) {
  const { language, isRTL, formatCurrency } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const pricingTiers: PricingTier[] = [
    {
      id: 'pro',
      name: 'Pro',
      nameAr: 'برو',
      price: 60,
      currency: 'SAR',
      period: 'month',
      popular: true,
      badge: {
        text: '1 Month Free Trial',
        textAr: 'شهر مجاني',
        color: '#4CA771',
      },
      features: [
        'Unlimited properties',
        'Unlimited units',
        'Advanced analytics',
        'Unlimited staff users',
        'Automated reminders',
        'Contract templates',
        'Financial reports',
        'AI-powered insights',
        '24/7 support',
        '1 month free trial',
      ],
      featuresAr: [
        'عقارات غير محدودة',
        'وحدات غير محدودة',
        'تحليلات متقدمة',
        'مستخدمين موظفين غير محدودين',
        'تذكيرات تلقائية',
        'قوالب العقود',
        'التقارير المالية',
        'رؤى مدعومة بالذكاء الاصطناعي',
        'دعم على مدار الساعة',
        'شهر مجاني',
      ],
      limits: {
        properties: 'unlimited',
        units: 'unlimited',
        staff: 4,
        storage: 'Unlimited',
      },
      additionalStaffPrice: 4,
      additionalStaffCurrency: 'SAR',
    },
  ];

  const getAnnualDiscount = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 10; // 2 months free
    const savings = (monthlyPrice * 12) - yearlyPrice;
    const percentage = Math.round((savings / (monthlyPrice * 12)) * 100);
    return { savings, percentage };
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'pro': return Crown;
      default: return Building;
    }
  };

  const getTierColor = (tier: PricingTier) => {
    if (tier.popular) return colors.primary;
    return colors.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
          {language === 'ar' ? 'اختر الخطة المناسبة' : 'Choose Your Plan'}
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
            ? 'خطط مرنة تنمو مع احتياجاتك'
            : 'Flexible plans that grow with your needs'
          }
        </Text>
      </View>

      {/* Billing Period Toggle */}
      {/* Free Trial Notice */}
      <View style={[styles.freeTrialNotice, { backgroundColor: colors.successLight }]}>
        <Text
          style={[
            styles.freeTrialText,
            {
              color: colors.success,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' ? '🎉 شهر مجاني عند الاشتراك' : '🎉 1 Month Free Trial'}
        </Text>
      </View>

      {/* Pricing Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tiersContainer}
        style={styles.tiersScroll}
      >
        {pricingTiers.map((tier) => {
          const TierIcon = getTierIcon(tier.id);
          const tierColor = getTierColor(tier);
          const isSelected = selectedTierId === tier.id;

          return (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? tierColor : colors.border,
                },
                isSelected && { borderWidth: 3, elevation: 8 },
                tier.popular && styles.popularCard,
              ]}
              onPress={() => onTierSelected(tier)}
              activeOpacity={0.9}
            >
              {/* Badge */}
              {tier.badge && (
                <View style={[styles.badge, { backgroundColor: tier.badge.color }]}>
                  <Text style={[styles.badgeText, { color: colors.surface }]}>
                    {language === 'ar' ? tier.badge.textAr : tier.badge.text}
                  </Text>
                </View>
              )}

              {/* Tier Header */}
              <View style={[styles.tierHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.tierIconContainer, { backgroundColor: `${tierColor}15` }]}>
                  <TierIcon size={32} color={tierColor} />
                </View>
                <Text
                  style={[
                    styles.tierName,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? tier.nameAr : tier.name}
                </Text>
              </View>

              {/* Pricing */}
              <View style={[styles.pricingSection, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.priceContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text
                    style={[
                      styles.price,
                      {
                        color: tierColor,
                        fontFamily: 'monospace',
                      },
                    ]}
                  >
                    {formatCurrency(tier.price, tier.currency)}
                  </Text>
                  <Text
                    style={[
                      styles.period,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      },
                    ]}
                  >
                    /{language === 'ar' ? (tier.period === 'month' ? 'شهر' : 'سنة') : tier.period}
                  </Text>
                </View>
                
                {/* Free Trial Indicator */}
                <View style={[styles.freeTrialIndicator, { backgroundColor: colors.successLight }]}>
                  <Text
                    style={[
                      styles.freeTrialIndicatorText,
                      {
                        color: colors.success,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'شهر مجاني' : 'Free Trial'}
                  </Text>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                {(language === 'ar' ? tier.featuresAr : tier.features).map((feature, index) => (
                  <View key={index} style={[styles.featureItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.checkIcon, { backgroundColor: colors.successLight }]}>
                      <Check size={12} color={colors.success} />
                    </View>
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

              {/* Limits Summary */}
              <View style={[styles.limitsContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Text
                  style={[
                    styles.limitsTitle,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'الحدود:' : 'Limits:'}
                </Text>
                <View style={styles.limitsList}>
                  <Text style={[styles.limitItem, { 
                    color: colors.textMuted,
                    fontFamily: 'monospace' 
                  }]}>
                    {tier.limits.properties === 'unlimited' 
                      ? (language === 'ar' ? 'عقارات لا محدودة' : 'Unlimited Properties')
                      : `${tier.limits.properties} ${language === 'ar' ? 'عقارات' : 'Properties'}`
                    }
                  </Text>
                  <Text style={[styles.limitItem, { 
                    color: colors.textMuted,
                    fontFamily: 'monospace' 
                  }]}>
                    {tier.limits.units === 'unlimited' 
                      ? (language === 'ar' ? 'وحدات لا محدودة' : 'Unlimited Units')
                      : `${tier.limits.units} ${language === 'ar' ? 'وحدات' : 'Units'}`
                    }
                  </Text>
                  <Text style={[styles.limitItem, { 
                    color: colors.textMuted,
                    fontFamily: 'monospace' 
                  }]}>
                    {`${tier.limits.staff} ${language === 'ar' ? 'موظفين' : 'Staff'}`}
                  </Text>
                  {tier.additionalStaffPrice && (
                    <Text style={[styles.limitItem, { 
                      color: colors.primary,
                      fontFamily: 'monospace',
                      fontSize: fontSize.xs,
                    }]}>
                      {language === 'ar' 
                        ? `+${tier.additionalStaffPrice} ${tier.additionalStaffCurrency}/موظف إضافي`
                        : `+${tier.additionalStaffPrice} ${tier.additionalStaffCurrency}/additional staff`
                      }
                    </Text>
                  )}
                </View>
              </View>

              {/* CTA Button */}
              <Button
                title={isSelected 
                  ? (language === 'ar' ? 'محدد' : 'Selected')
                  : (language === 'ar' ? 'اختيار الخطة' : 'Choose Plan')
                }
                onPress={() => onTierSelected(tier)}
                variant={isSelected ? 'secondary' : 'primary'}
                style={[
                  styles.ctaButton,
                  { backgroundColor: isSelected ? colors.successLight : tierColor },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Value Proposition */}
      <View style={[styles.valueProposition, { backgroundColor: colors.primaryLight }]}>
        <View style={[styles.valueHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Shield size={24} color={colors.primary} />
          <Text
            style={[
              styles.valueTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' 
              ? 'خطط مرنة تناسب احتياجاتك'
              : 'Flexible plans for your needs'
            }
          </Text>
        </View>
        <Text
          style={[
            styles.valueDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' 
            ? 'جرب حلالي لمدة 30 يوماً. إذا لم تكن راضياً، سنسترد أموالك بالكامل.'
            : 'Try Halali for 30 days. If you\'re not satisfied, we\'ll refund your money completely.'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: 26,
  },
  freeTrialNotice: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: '#4CA771',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  freeTrialText: {
    fontSize: fontSize.lg,
  },
  freeTrialIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  freeTrialIndicatorText: {
    fontSize: fontSize.xs,
  },
  tiersScroll: {
    marginBottom: spacing.xl,
  },
  tiersContainer: {
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  tierCard: {
    width: 280,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
  },
  popularCard: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowOpacity: 0.25,
  },
  badge: {
    position: 'absolute',
    top: -spacing.sm,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  tierHeader: {
    marginBottom: spacing.lg,
  },
  tierIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tierName: {
    fontSize: fontSize.xl,
  },
  pricingSection: {
    marginBottom: spacing.lg,
  },
  priceContainer: {
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
  },
  period: {
    fontSize: fontSize.lg,
  },
  featuresContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureItem: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  limitsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  limitsTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  limitsList: {
    gap: spacing.xs,
  },
  limitItem: {
    fontSize: fontSize.xs,
  },
  ctaButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  valueProposition: {
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  valueHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  valueTitle: {
    fontSize: fontSize.lg,
  },
  valueDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});