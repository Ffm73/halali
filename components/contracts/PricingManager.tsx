import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { PaymentFrequency } from '@/types';
import { DollarSign, Calendar, Plus, Trash2, CreditCard as Edit3, TrendingUp, Sparkles, Calculator, Check, ChevronDown, Zap, Shield, Percent } from 'lucide-react-native';

export interface PriceAdjustment {
  id: string;
  type: 'discount' | 'increase';
  amount: number;
  reason: string;
  appliesTo: 'once' | 'all' | 'specific';
  specificPayments?: number[];
}

export interface PaymentScheduleItem {
  id: string;
  paymentNumber: number;
  dueDate: string;
  baseAmount: number;
  commission: number;
  insurance: number;
  vatAmount: number;
  adjustments: number;
  totalAmount: number;
  isFirstPayment: boolean;
}

export interface PricingStructure {
  baseRent: number;
  commission: number;
  insurance: number;
  vatRate: number;
  paymentFrequency: PaymentFrequency;
  adjustments: PriceAdjustment[];
  paymentSchedule: PaymentScheduleItem[];
}

export interface AIPricingSuggestion {
  suggestedBaseRent: number;
  confidence: number;
  reasoning: string;
  marketComparison: {
    averageRent: number;
    percentageDifference: number;
    similarProperties: number;
  };
  recommendations: string[];
  priceRange: {
    minimum: number;
    maximum: number;
    optimal: number;
  };
}

interface PricingManagerProps {
  value: PricingStructure;
  onChange: (pricing: PricingStructure) => void;
  contractDuration: number;
  startDate: string;
  unitType: {
    bedrooms: number;
    bathrooms: number;
    sizeSqm?: number;
    hasKitchen: boolean;
    hasLivingRoom: boolean;
    amenities: string[];
  };
  propertyLocation: string;
}

export function PricingManager({ 
  value, 
  onChange, 
  contractDuration, 
  startDate,
  unitType,
  propertyLocation 
}: PricingManagerProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<AIPricingSuggestion | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const paymentFrequencies = [
    { 
      id: 'monthly', 
      label: language === 'ar' ? 'شهري' : 'Monthly',
      description: language === 'ar' ? 'دفعة كل شهر' : 'Payment every month',
    },
    { 
      id: 'quarterly', 
      label: language === 'ar' ? 'ربع سنوي' : 'Quarterly',
      description: language === 'ar' ? 'دفعة كل 3 أشهر' : 'Payment every 3 months',
    },
    { 
      id: 'yearly', 
      label: language === 'ar' ? 'سنوي' : 'Yearly',
      description: language === 'ar' ? 'دفعة واحدة في السنة' : 'One payment per year',
    },
  ];

  // Generate payment schedule when pricing changes
  useEffect(() => {
    generatePaymentSchedule();
  }, [value.baseRent, value.commission, value.insurance, value.vatRate, value.paymentFrequency, value.adjustments, contractDuration, startDate]);

  const generatePaymentSchedule = () => {
    if (!startDate || !value.baseRent || contractDuration <= 0) return;

    const schedule: PaymentScheduleItem[] = [];
    const paymentsPerYear = value.paymentFrequency === 'monthly' ? 12 : value.paymentFrequency === 'quarterly' ? 4 : 1;
    const totalPayments = Math.ceil((contractDuration / 12) * paymentsPerYear);
    const monthsBetweenPayments = value.paymentFrequency === 'monthly' ? 1 : value.paymentFrequency === 'quarterly' ? 3 : 12;

    for (let i = 0; i < totalPayments; i++) {
      const isFirstPayment = i === 0;
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + (i * monthsBetweenPayments));

      // Calculate amounts
      const baseAmount = value.baseRent * monthsBetweenPayments;
      const commission = isFirstPayment ? value.commission : 0;
      const insurance = isFirstPayment ? value.insurance : 0;
      const vatAmount = (baseAmount + commission + insurance) * (value.vatRate / 100);
      
      // Apply adjustments
      let adjustmentAmount = 0;
      value.adjustments.forEach(adj => {
        if (adj.appliesTo === 'all' || 
            (adj.appliesTo === 'once' && isFirstPayment) ||
            (adj.appliesTo === 'specific' && adj.specificPayments?.includes(i + 1))) {
          adjustmentAmount += adj.type === 'discount' ? -adj.amount : adj.amount;
        }
      });

      const totalAmount = baseAmount + commission + insurance + vatAmount + adjustmentAmount;

      schedule.push({
        id: `payment_${i + 1}`,
        paymentNumber: i + 1,
        dueDate: paymentDate.toISOString().split('T')[0],
        baseAmount,
        commission,
        insurance,
        vatAmount,
        adjustments: adjustmentAmount,
        totalAmount: Math.max(0, totalAmount),
        isFirstPayment,
      });
    }

    onChange({ ...value, paymentSchedule: schedule });
  };

  const generateAIPricingSuggestion = async () => {
    setIsGeneratingAI(true);
    
    try {
      // Simulate AI pricing analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate realistic pricing based on unit type and location
      let basePrice = 2500; // Default base
      
      // Adjust for bedrooms
      if (unitType.bedrooms === 1) basePrice = 2200;
      else if (unitType.bedrooms === 2) basePrice = 3000;
      else if (unitType.bedrooms === 3) basePrice = 4000;
      else if (unitType.bedrooms >= 4) basePrice = 5500;
      
      // Adjust for size
      if (unitType.sizeSqm) {
        if (unitType.sizeSqm > 100) basePrice *= 1.15;
        else if (unitType.sizeSqm < 60) basePrice *= 0.9;
      }
      
      // Location adjustments
      if (propertyLocation.includes('الرياض') || propertyLocation.includes('Riyadh')) {
        basePrice *= 1.1;
      } else if (propertyLocation.includes('جدة') || propertyLocation.includes('Jeddah')) {
        basePrice *= 1.05;
      }
      
      // Amenities bonus
      const amenityBonus = unitType.amenities.length * 100;
      basePrice += amenityBonus;
      
      const suggestion: AIPricingSuggestion = {
        suggestedBaseRent: Math.round(basePrice),
        confidence: 85,
        reasoning: language === 'ar' 
          ? `بناءً على ${unitType.bedrooms} غرف نوم في ${propertyLocation} مع ${unitType.amenities.length} مرافق. السعر يعكس ظروف السوق المحلية ومواصفات الوحدة.`
          : `Based on ${unitType.bedrooms} bedrooms in ${propertyLocation} with ${unitType.amenities.length} amenities. Price reflects local market conditions and unit specifications.`,
        marketComparison: {
          averageRent: Math.round(basePrice * 0.95),
          percentageDifference: 5,
          similarProperties: Math.floor(Math.random() * 20) + 10,
        },
        recommendations: language === 'ar' ? [
          'فكر في تعديلات الأسعار الموسمية',
          'راجع الأسعار ربع سنوياً حسب تغيرات السوق',
          'قدم خصومات للعقود طويلة المدى',
          'أضف بدلات المرافق للميزة التنافسية',
        ] : [
          'Consider seasonal pricing adjustments',
          'Review pricing quarterly based on market changes',
          'Offer long-term contract discounts',
          'Include utility allowances for competitive advantage',
        ],
        priceRange: {
          minimum: Math.round(basePrice * 0.85),
          maximum: Math.round(basePrice * 1.15),
          optimal: Math.round(basePrice),
        },
      };
      
      setAISuggestion(suggestion);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('AI pricing generation failed:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'فشل في توليد اقتراحات الأسعار' : 'Failed to generate pricing suggestions'
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion) return;
    
    onChange({
      ...value,
      baseRent: aiSuggestion.suggestedBaseRent,
    });
    
    setShowAISuggestions(false);
    
    Alert.alert(
      language === 'ar' ? '✅ تم التطبيق' : '✅ Applied',
      language === 'ar' ? 'تم تطبيق اقتراح الذكاء الاصطناعي' : 'AI suggestion applied successfully'
    );
  };

  const addPriceAdjustment = () => {
    const newAdjustment: PriceAdjustment = {
      id: `adj_${Date.now()}`,
      type: 'discount',
      amount: 0,
      reason: '',
      appliesTo: 'all',
    };
    
    onChange({
      ...value,
      adjustments: [...value.adjustments, newAdjustment],
    });
  };

  const updateAdjustment = (adjustmentId: string, updates: Partial<PriceAdjustment>) => {
    const updatedAdjustments = value.adjustments.map(adj =>
      adj.id === adjustmentId ? { ...adj, ...updates } : adj
    );
    
    onChange({
      ...value,
      adjustments: updatedAdjustments,
    });
  };

  const removeAdjustment = (adjustmentId: string) => {
    onChange({
      ...value,
      adjustments: value.adjustments.filter(adj => adj.id !== adjustmentId),
    });
  };

  const updatePaymentAmount = (paymentId: string, newAmount: number) => {
    const updatedSchedule = value.paymentSchedule.map(payment =>
      payment.id === paymentId ? { ...payment, totalAmount: newAmount } : payment
    );
    
    onChange({
      ...value,
      paymentSchedule: updatedSchedule,
    });
  };

  const getCurrencySymbol = (currency: string = 'SAR') => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'د.إ';
      case 'SAR':
      default: return '﷼';
    }
  };

  const formatCurrency = (amount: number, currency: string = user?.currency || 'SAR') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString()} ${symbol}`;
  };

  return (
    <View style={styles.container}>
      {/* Basic Pricing */}
      <Card style={[styles.pricingCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.pricingHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.pricingIcon, { backgroundColor: colors.primaryLight }]}>
            <DollarSign size={24} color={colors.primary} />
          </View>
          <View style={styles.pricingInfo}>
            <Text
              style={[
                styles.pricingTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'التسعير الأساسي' : 'Basic Pricing'}
            </Text>
            <Text
              style={[
                styles.pricingSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'حدد الإيجار والرسوم' : 'Set rent and fees'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.aiButton, { backgroundColor: colors.successLight }]}
            onPress={generateAIPricingSuggestion}
            disabled={isGeneratingAI}
            activeOpacity={0.7}
          >
            <Sparkles size={20} color={colors.success} />
            <Text
              style={[
                styles.aiButtonText,
                {
                  color: colors.success,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                },
              ]}
            >
              {isGeneratingAI 
                ? (language === 'ar' ? 'جاري التحليل...' : 'Analyzing...')
                : (language === 'ar' ? 'اقتراح ذكي' : 'AI Suggest')
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pricingInputs}>
          {/* Base Rent */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'الإيجار الشهري *' : 'Monthly Rent *'}
            </Text>
            <View style={styles.currencyInputWrapper}>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                  },
                ]}
                placeholder="2500"
                placeholderTextColor={colors.textMuted}
                value={(value.baseRent ?? 0).toString()}
                onChangeText={(text) => {
                  const amount = parseInt(text) || 0;
                  onChange({ ...value, baseRent: amount });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                {getCurrencySymbol(user?.currency)}
              </Text>
            </View>
          </View>

          {/* Commission (One-time) */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'العمولة (دفعة واحدة)' : 'Commission (One-time)'}
            </Text>
            <View style={styles.currencyInputWrapper}>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={(value.commission ?? 0).toString()}
                onChangeText={(text) => {
                  const amount = parseInt(text) || 0;
                  onChange({ ...value, commission: amount });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                {getCurrencySymbol(user?.currency)}
              </Text>
            </View>
          </View>

          {/* Insurance/Deposit (One-time) */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'التأمين/الضمان (دفعة واحدة)' : 'Insurance/Deposit (One-time)'}
            </Text>
            <View style={styles.currencyInputWrapper}>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={(value.insurance ?? 0).toString()}
                onChangeText={(text) => {
                  const amount = parseInt(text) || 0;
                  onChange({ ...value, insurance: amount });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                {getCurrencySymbol(user?.currency)}
              </Text>
            </View>
          </View>

          {/* VAT Rate */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'ضريبة القيمة المضافة (%)' : 'VAT Rate (%)'}
            </Text>
            <View style={styles.currencyInputWrapper}>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                  },
                ]}
                placeholder="15"
                placeholderTextColor={colors.textMuted}
                value={(value.vatRate ?? 0).toString()}
                onChangeText={(text) => {
                  const rate = parseFloat(text) || 0;
                  onChange({ ...value, vatRate: Math.min(100, Math.max(0, rate)) });
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <Percent size={20} color={colors.textSecondary} />
            </View>
          </View>

          {/* Payment Frequency */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'تكرار الدفع *' : 'Payment Frequency *'}
            </Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
              ]}
              onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
            >
              <View style={[styles.selectContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Calendar size={20} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.selectText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    },
                  ]}
                >
                  {paymentFrequencies.find(f => f.id === value.paymentFrequency)?.label}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {showFrequencyPicker && (
              <View style={[styles.frequencyDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {paymentFrequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq.id}
                    style={[
                      styles.frequencyOption,
                      value.paymentFrequency === freq.id && { backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => {
                      onChange({ ...value, paymentFrequency: freq.id as PaymentFrequency });
                      setShowFrequencyPicker(false);
                    }}
                  >
                    <View style={styles.frequencyOptionContent}>
                      <Text
                        style={[
                          styles.frequencyOptionLabel,
                          {
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {freq.label}
                      </Text>
                      <Text
                        style={[
                          styles.frequencyOptionDescription,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          },
                        ]}
                      >
                        {freq.description}
                      </Text>
                    </View>
                    {value.paymentFrequency === freq.id && (
                      <Check size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Price Adjustments */}
      <Card style={[styles.adjustmentsCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.adjustmentsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text
            style={[
              styles.adjustmentsTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تعديلات الأسعار' : 'Price Adjustments'}
          </Text>
          <TouchableOpacity
            style={[styles.addAdjustmentButton, { backgroundColor: colors.primary }]}
            onPress={addPriceAdjustment}
            activeOpacity={0.7}
          >
            <Plus size={16} color={colors.surface} />
            <Text
              style={[
                styles.addAdjustmentText,
                {
                  color: colors.surface,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                },
              ]}
            >
              {language === 'ar' ? 'إضافة' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {value.adjustments.map((adjustment) => (
          <View key={adjustment.id} style={[styles.adjustmentItem, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.adjustmentInputs}>
              <View style={styles.adjustmentRow}>
                <View style={styles.adjustmentTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.adjustmentTypeButton,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      adjustment.type === 'discount' && { backgroundColor: colors.successLight, borderColor: colors.success }
                    ]}
                    onPress={() => updateAdjustment(adjustment.id, { type: 'discount' })}
                  >
                    <Text
                      style={[
                        styles.adjustmentTypeText,
                        {
                          color: adjustment.type === 'discount' ? colors.success : colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'خصم' : 'Discount'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.adjustmentTypeButton,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      adjustment.type === 'increase' && { backgroundColor: colors.warningLight, borderColor: colors.warning }
                    ]}
                    onPress={() => updateAdjustment(adjustment.id, { type: 'increase' })}
                  >
                    <Text
                      style={[
                        styles.adjustmentTypeText,
                        {
                          color: adjustment.type === 'increase' ? colors.warning : colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'زيادة' : 'Increase'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.adjustmentAmountWrapper}>
                  <TextInput
                    style={[
                      styles.adjustmentAmountInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: 'monospace',
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={(adjustment.amount ?? 0).toString()}
                    onChangeText={(text) => {
                      const amount = parseInt(text) || 0;
                      updateAdjustment(adjustment.id, { amount });
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                    {getCurrencySymbol(user?.currency)}
                  </Text>
                </View>
              </View>

              <TextInput
                style={[
                  styles.adjustmentReasonInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={language === 'ar' ? 'سبب التعديل...' : 'Adjustment reason...'}
                placeholderTextColor={colors.textMuted}
                value={adjustment.reason}
                onChangeText={(text) => updateAdjustment(adjustment.id, { reason: text })}
              />

              <View style={styles.adjustmentAppliesTo}>
                {(['once', 'all'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.appliesOption,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      adjustment.appliesTo === option && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                    ]}
                    onPress={() => updateAdjustment(adjustment.id, { appliesTo: option })}
                  >
                    <Text
                      style={[
                        styles.appliesOptionText,
                        {
                          color: adjustment.appliesTo === option ? colors.primary : colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {option === 'once' 
                        ? (language === 'ar' ? 'مرة واحدة' : 'One time')
                        : (language === 'ar' ? 'جميع الدفعات' : 'All payments')
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.removeAdjustmentButton, { backgroundColor: colors.dangerLight }]}
              onPress={() => removeAdjustment(adjustment.id)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
          style={[
            styles.appliesOption,
            { backgroundColor: colors.surface, borderColor: colors.border },
            adjustment.appliesTo === 'specific' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
          ]}
          onPress={() => updateAdjustment(adjustment.id, { appliesTo: 'specific' })}
        >
          <Text
            style={[
              styles.appliesOptionText,
              {
                color: adjustment.appliesTo === 'specific' ? colors.primary : colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              },
            ]}
          >
            {language === 'ar' ? 'دفعات محددة' : 'Specific payments'}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Payment Schedule Preview */}
      {value.paymentSchedule.length > 0 && (
        <Card style={[styles.scheduleCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.scheduleTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'جدول المدفوعات' : 'Payment Schedule'} ({value.paymentSchedule.length})
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.scheduleTable}>
              {/* Table Header */}
              <View style={[styles.scheduleRow, styles.scheduleHeaderRow, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? '#' : '#'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'الإيجار' : 'Rent'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'العمولة' : 'Commission'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'التأمين' : 'Insurance'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'الضريبة' : 'VAT'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'الإجمالي' : 'Total'}
                </Text>
                <Text style={[styles.scheduleCell, styles.scheduleHeaderCell]}>
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Text>
              </View>

              {/* Table Rows */}
              {value.paymentSchedule.slice(0, 6).map((payment) => (
                <View key={payment.id} style={[styles.scheduleRow, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.scheduleCell, { color: colors.primary, fontFamily: 'monospace' }]}>
                    {payment.paymentNumber}
                  </Text>
                  <Text style={[styles.scheduleCell, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.scheduleCell, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
                    {payment.baseAmount.toLocaleString()}
                  </Text>
                  <Text style={[styles.scheduleCell, { color: colors.textSecondary, fontFamily: 'monospace' }]}>
                    {payment.commission || '-'}
                  </Text>
                  <Text style={[styles.scheduleCell, { color: colors.textSecondary, fontFamily: 'monospace' }]}>
                    {payment.insurance || '-'}
                  </Text>
                  <Text style={[styles.scheduleCell, { color: colors.textSecondary, fontFamily: 'monospace' }]}>
                    {Math.round(payment.vatAmount)}
                  </Text>
                  <Text style={[styles.scheduleCell, { color: colors.success, fontFamily: 'monospace', fontWeight: '600' }]}>
                    {Math.round(payment.totalAmount).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={[styles.editPaymentButton, { backgroundColor: colors.warningLight }]}
                    onPress={() => setEditingPayment(editingPayment === payment.id ? null : payment.id)}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={14} color={colors.warning} />
                  </TouchableOpacity>
                </View>
              ))}

              {value.paymentSchedule.length > 6 && (
                <View style={[styles.scheduleRow, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.scheduleCell, { 
                    color: colors.textMuted,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                    flex: 1 
                  }]}>
                    {language === 'ar' ? `... و ${value.paymentSchedule.length - 6} دفعات أخرى` : `... and ${value.paymentSchedule.length - 6} more payments`}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Card>
          {/* Specific Payment Selection for 'specific' appliesTo */}
          {adjustment.appliesTo === 'specific' && (
            <View style={styles.specificPaymentsContainer}>
              <Text
                style={[
                  styles.specificPaymentsLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'اختر الدفعات المحددة:' : 'Select specific payments:'}
              </Text>
              <View style={styles.paymentSelectionGrid}>
                {value.paymentSchedule.slice(0, 12).map((payment) => (
                  <TouchableOpacity
                    key={payment.id}
                    style={[
                      styles.paymentSelectionItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      adjustment.specificPayments?.includes(payment.paymentNumber) && {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      const currentSelections = adjustment.specificPayments || [];
                      const isSelected = currentSelections.includes(payment.paymentNumber);
                      
                      let newSelections;
                      if (isSelected) {
                        newSelections = currentSelections.filter(p => p !== payment.paymentNumber);
                      } else {
                        newSelections = [...currentSelections, payment.paymentNumber];
                      }
                      
                      updateAdjustment(adjustment.id, { specificPayments: newSelections });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.paymentSelectionNumber,
                        {
                          color: adjustment.specificPayments?.includes(payment.paymentNumber) 
                            ? colors.primary 
                            : colors.textPrimary,
                          fontFamily: 'monospace',
                        },
                      ]}
                    >
                      #{payment.paymentNumber}
                    </Text>
                    <Text
                      style={[
                        styles.paymentSelectionDate,
                        {
                          color: adjustment.specificPayments?.includes(payment.paymentNumber) 
                            ? colors.primary 
                            : colors.textSecondary,
                          fontFamily: 'monospace',
                        },
                      ]}
                    >
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </Text>
                    {adjustment.specificPayments?.includes(payment.paymentNumber) && (
                      <View style={[styles.paymentSelectionCheck, { backgroundColor: colors.primary }]}>
                        <Check size={12} color={colors.surface} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {value.paymentSchedule.length > 12 && (
                <Text
                  style={[
                    styles.morePaymentsText,
                    {
                      color: colors.textMuted,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: 'center',
                    },
                  ]}
                >
                  {language === 'ar' 
                    ? `و ${value.paymentSchedule.length - 12} دفعات أخرى متاحة`
                    : `and ${value.paymentSchedule.length - 12} more payments available`
                  }
                </Text>
              )}
            </View>
          )}

      )}

      {/* AI Suggestions Modal */}
      {showAISuggestions && aiSuggestion && (
        <View style={styles.aiSuggestionsOverlay}>
          <Card style={[styles.aiSuggestionsCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.aiSuggestionsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.aiIcon, { backgroundColor: colors.successLight }]}>
                <Sparkles size={24} color={colors.success} />
              </View>
              <View style={styles.aiSuggestionsInfo}>
                <Text
                  style={[
                    styles.aiSuggestionsTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'اقتراح الذكاء الاصطناعي' : 'AI Pricing Suggestion'}
                </Text>
                <Text
                  style={[
                    styles.aiConfidence,
                    {
                      color: colors.success,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'الثقة: ' : 'Confidence: '}{aiSuggestion.confidence}%
                </Text>
              </View>
            </View>

            <View style={[styles.aiSuggestionAmount, { backgroundColor: colors.successLight }]}>
              <Text
                style={[
                  styles.aiSuggestedPrice,
                  {
                    color: colors.success,
                    fontFamily: 'monospace',
                    textAlign: 'center',
                  },
                ]}
              >
                {formatCurrency(aiSuggestion.suggestedBaseRent)}
              </Text>
              <Text
                style={[
                  styles.aiSuggestedLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                  },
                ]}
              >
                {language === 'ar' ? 'السعر المقترح شهرياً' : 'Suggested monthly rent'}
              </Text>
            </View>

            <Text
              style={[
                styles.aiReasoning,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {aiSuggestion.reasoning}
            </Text>

            <View style={[styles.aiActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Button
                title={language === 'ar' ? 'إغلاق' : 'Close'}
                onPress={() => setShowAISuggestions(false)}
                variant="secondary"
                size="sm"
                style={styles.aiActionButton}
              />
              <Button
                title={language === 'ar' ? 'تطبيق الاقتراح' : 'Apply Suggestion'}
                onPress={applyAISuggestion}
                variant="primary"
                size="sm"
                style={styles.aiActionButton}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  pricingCard: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  pricingHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pricingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricingInfo: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  pricingSubtitle: {
    fontSize: fontSize.sm,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  aiButtonText: {
    fontSize: fontSize.sm,
  },
  pricingInputs: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  selectInput: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  selectContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  selectText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  frequencyDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    zIndex: 99999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 250,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  frequencyOptionContent: {
    flex: 1,
  },
  frequencyOptionLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  frequencyOptionDescription: {
    fontSize: fontSize.sm,
  },
  adjustmentsCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  adjustmentsHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  adjustmentsTitle: {
    fontSize: fontSize.lg,
  },
  addAdjustmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  addAdjustmentText: {
    fontSize: fontSize.sm,
  },
  adjustmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  adjustmentInputs: {
    flex: 1,
    gap: spacing.sm,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  adjustmentTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adjustmentTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  adjustmentTypeText: {
    fontSize: fontSize.sm,
  },
  adjustmentAmountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  adjustmentAmountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
  },
  adjustmentReasonInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
  },
  adjustmentAppliesTo: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  appliesOption: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  appliesOptionText: {
    fontSize: fontSize.sm,
  },
  specificPaymentsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  specificPaymentsLabel: {
    fontSize: fontSize.sm,
  },
  paymentSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  paymentSelectionItem: {
    width: 80,
    height: 60,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentSelectionNumber: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  paymentSelectionDate: {
    fontSize: fontSize.xs,
  },
  paymentSelectionCheck: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  morePaymentsText: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  removeAdjustmentButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  scheduleCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  scheduleTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  scheduleTable: {
    minWidth: 800,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  scheduleHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
  },
  scheduleCell: {
    flex: 1,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 80,
    textAlign: 'center',
  },
  scheduleHeaderCell: {
    fontWeight: '600',
    color: '#4CA771',
    fontFamily: 'Nunito-SemiBold',
  },
  editPaymentButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  aiSuggestionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 1000,
  },
  aiSuggestionsCard: {
    width: '100%',
    maxWidth: 400,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  aiSuggestionsHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSuggestionsInfo: {
    flex: 1,
  },
  aiSuggestionsTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  aiConfidence: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  aiSuggestionAmount: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  aiSuggestedPrice: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  aiSuggestedLabel: {
    fontSize: fontSize.sm,
  },
  aiReasoning: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  aiActions: {
    gap: spacing.md,
  },
  aiActionButton: {
    flex: 1,
  },
});