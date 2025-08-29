import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import { useCharges } from '@/hooks/useCharges';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { HowToPay } from '@/types';
import { X, Copy, MessageCircle, Phone, CircleCheck as CheckCircle, DollarSign, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface HowToPayModalProps {
  visible: boolean;
  onClose: () => void;
  howToPay: HowToPay;
  amount: number;
  chargeId: string;
  reference: string;
  residentName: string;
  unitLabel: string;
  propertyName: string;
  onPaymentReported: (paymentType: 'full' | 'partial', amount?: number) => void;
}

type PaymentStep = 'instructions' | 'payment_type' | 'partial_amount' | 'confirmation';

export function HowToPayModal({ 
  visible, 
  onClose, 
  howToPay, 
  amount, 
  chargeId,
  reference, 
  residentName,
  unitLabel,
  propertyName,
  onPaymentReported 
}: HowToPayModalProps) {
  const { language, isRTL, formatCurrency } = useLocalization();
  const { colors } = useTheme();
  const { addPaymentNotification } = usePaymentNotifications();
  const { updateChargeStatus } = useCharges();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { paymentMethods, refreshPaymentMethods } = usePaymentMethods();
  const [currentStep, setCurrentStep] = useState<PaymentStep>('instructions');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'partial' | null>(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPaymentMethods, setCurrentPaymentMethods] = useState(howToPay);

  // Define language content based on current language and payment methods
  const languageContent = {
    title: language === 'ar' ? currentPaymentMethods.titleAr || 'طريقة الدفع' : currentPaymentMethods.titleEn || 'How to Pay',
    instructions: language === 'ar' ? currentPaymentMethods.instructionsAr || 'يرجى اتباع التعليمات التالية للدفع' : currentPaymentMethods.instructionsEn || 'Please follow the instructions below to make payment',
    bankAccounts: currentPaymentMethods.bankAccounts?.map(account => ({
      ...account,
      bankName: language === 'ar' ? account.bankNameAr || account.bankName : account.bankNameEn || account.bankName,
      accountName: language === 'ar' ? account.accountNameAr || account.accountName : account.accountNameEn || account.accountName,
    })) || []
  };

  // Refresh payment methods when modal opens
  useEffect(() => {
    if (visible) {
      refreshPaymentMethods();
    }
  }, [visible]);

  // Update current payment methods when they change
  useEffect(() => {
    if (paymentMethods) {
      setCurrentPaymentMethods(paymentMethods);
    }
  }, [paymentMethods]);

  const copyIBAN = (iban: string) => {
    Alert.alert(
      language === 'ar' ? 'تم النسخ' : 'Copied',
      language === 'ar' ? 'تم نسخ رقم الحساب' : 'Account number copied'
    );
  };

  const openWhatsApp = () => {
    const message = language === 'ar' 
      ? `مرحباً، أريد دفع إيجار الوحدة ${unitLabel} بمبلغ ${amount} ريال. المرجع: ${reference}`
      : `Hello, I want to pay rent for unit ${unitLabel} amount ${amount} SAR. Reference: ${reference}`;
    
    const url = `whatsapp://send?phone=${currentPaymentMethods.stcBankHandle}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const makeCall = () => {
    Linking.openURL(`tel:${currentPaymentMethods.stcBankHandle}`);
  };

  const handlePaymentTypeSelection = (type: 'full' | 'partial') => {
    setSelectedPaymentType(type);
    if (type === 'full') {
      setCurrentStep('confirmation');
    } else {
      setCurrentStep('partial_amount');
    }
  };

  const handlePartialAmountSubmit = () => {
    const partial = parseFloat(partialAmount);
    if (!partial || partial <= 0 || partial >= amount) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' 
          ? `يرجى إدخال مبلغ صحيح بين 1 و ${amount - 1} ريال`
          : `Please enter a valid amount between 1 and ${amount - 1} SAR`
      );
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleFinalSave = async () => {
    setIsProcessing(true);
    
    try {
      const paymentAmount = selectedPaymentType === 'full' ? amount : parseFloat(partialAmount);
      
      // 1. Update charge status to show as "pending"
      const updatedCharges = await updateChargeStatus(chargeId, paymentAmount, selectedPaymentType!, 'pending');
      
      if (!updatedCharges) {
        throw new Error('Failed to update charge status');
      }
      
      // 2. Save payment record to storage
      const paymentRecord = {
        id: `payment_${Date.now()}`,
        chargeId,
        residentName,
        unitLabel,
        propertyName,
        amount: paymentAmount,
        paymentType: selectedPaymentType!,
        totalAmount: amount,
        remainingAmount: selectedPaymentType === 'full' ? 0 : amount - paymentAmount,
        reference,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reportedBy: 'resident',
        evidenceUrl: [], // In real app, would include receipt images
      };
      
      // Save to persistent storage
      const existingPayments = await AsyncStorage.getItem('paymentRecords');
      const payments = existingPayments ? JSON.parse(existingPayments) : [];
      payments.push(paymentRecord);
      await AsyncStorage.setItem('paymentRecords', JSON.stringify(payments));
      
      // 3. Send notification to landlord
      await addPaymentNotification({
        chargeId,
        residentName,
        residentPhone: user?.phoneE164 || '',
        unitLabel,
        propertyName,
        amount: paymentAmount,
        paymentType: selectedPaymentType!,
        totalAmount: amount,
        remainingAmount: selectedPaymentType === 'full' ? 0 : amount - paymentAmount,
        reference,
      });
      
      // 4. Add notification to resident about payment being reported
      await addNotification({
        type: 'payment_reminder',
        title: language === 'ar' ? 'دفعة في الانتظار' : 'Payment Pending',
        message: language === 'ar' 
          ? `دفعة ${selectedPaymentType === 'full' ? 'كاملة' : 'جزئية'} بمبلغ ${formatCurrency(paymentAmount)} للوحدة ${unitLabel} في انتظار تأكيد المالك.`
          : `${selectedPaymentType === 'full' ? 'Full' : 'Partial'} payment of ${formatCurrency(paymentAmount)} for unit ${unitLabel} is pending landlord confirmation.`,
        data: {
          chargeId,
          amount: paymentAmount,
          unitLabel,
          propertyName,
          paymentType: selectedPaymentType!,
          status: 'pending',
        },
        priority: 'medium',
      });

      // 5. Call the parent callback to update the payment status
      onPaymentReported(selectedPaymentType!, selectedPaymentType === 'partial' ? paymentAmount : undefined);
      
      // Log the payment for tracking
      console.log('💰 Payment reported:', {
        type: selectedPaymentType,
        amount: paymentAmount,
        totalAmount: amount,
        residentName,
        unitLabel,
        reference,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      
      // Reset modal state and close
      setCurrentStep('instructions');
      setSelectedPaymentType(null);
      setPartialAmount('');
      onClose();
      
    } catch (error) {
      console.error('Payment save error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'فشل في حفظ الدفعة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.' : 'Failed to save payment. Please check connection and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('instructions');
    setSelectedPaymentType(null);
    setPartialAmount('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderInstructionsStep = () => (
    <>
      {/* Amount to Pay */}
      <Card style={styles.amountCard}>
        <Text
          style={[
            styles.amountLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}
        </Text>
        <Text
          style={[
            styles.amountValue,
            {
              color: colors.primary,
              fontFamily: 'monospace',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {formatCurrency(amount)}
        </Text>
        <Text
          style={[
            styles.referenceText,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'المرجع: ' : 'Reference: '}{reference}
        </Text>
        <Text
          style={[
            styles.unitText,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'الوحدة: ' : 'Unit: '}{unitLabel}
        </Text>
      </Card>

      {/* Instructions */}
      <Card style={styles.instructionsCard}>
        <Text
          style={[
            styles.instructionsTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {languageContent.title}
        </Text>
        <Text
          style={[
            styles.instructionsText,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {languageContent.instructions}
        </Text>
      </Card>

      {/* Bank Accounts */}
      {languageContent.bankAccounts.map((account, index) => (
        <Card key={index} style={styles.bankCard}>
          <View style={[styles.bankHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text
              style={[
                styles.bankName,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {account.bankName}
            </Text>
            <Text
              style={[
                styles.accountName,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {account.accountName}
            </Text>
          </View>
          
          <View style={[styles.ibanRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.iban,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surfaceSecondary,
                  fontFamily: 'monospace',
                },
              ]}
            >
              {account.iban}
            </Text>
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => copyIBAN(account.iban)}
            >
              <Copy size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        {currentPaymentMethods.stcBankHandle && (
          <>
            <Button
              title={language === 'ar' ? 'فتح واتساب' : 'Open WhatsApp'}
              onPress={openWhatsApp}
              variant="secondary"
            />
            <Button
              title={language === 'ar' ? 'اتصال هاتفي' : 'Call'}
              onPress={makeCall}
              variant="secondary"
            />
          </>
        )}
      </View>

      {/* Continue to Payment Button */}
      <View style={styles.continueContainer}>
        <Button
          title={language === 'ar' ? 'تم الدفع - المتابعة' : 'Payment Done - Continue'}
          onPress={() => setCurrentStep('payment_type')}
          variant="primary"
        />
      </View>
    </>
  );

  const renderPaymentTypeStep = () => (
    <Card style={styles.paymentTypeCard}>
      <View style={styles.paymentTypeHeader}>
        <CheckCircle size={32} color={colors.success} />
        <Text
          style={[
            styles.paymentTypeTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' ? 'نوع الدفعة' : 'Payment Type'}
        </Text>
        <Text
          style={[
            styles.paymentTypeDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' 
            ? 'اختر نوع الدفعة التي قمت بها'
            : 'Select the type of payment you made'
          }
        </Text>
      </View>

      <View style={styles.paymentOptions}>
        {/* Full Payment Option */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentType === 'full' && styles.paymentOptionSelected,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
          onPress={() => handlePaymentTypeSelection('full')}
          activeOpacity={0.7}
        >
          <View style={[styles.paymentOptionContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.paymentOptionIcon, { backgroundColor: colors.successLight }]}>
              <DollarSign size={24} color={colors.success} />
            </View>
            <View style={styles.paymentOptionInfo}>
              <Text
                style={[
                  styles.paymentOptionTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'دفعة كاملة' : 'Full Payment'}
              </Text>
              <Text
                style={[
                  styles.paymentOptionAmount,
                  {
                    color: colors.primary,
                    fontFamily: 'monospace',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {formatCurrency(amount)}
              </Text>
              <Text
                style={[
                  styles.paymentOptionDescription,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'دفع المبلغ كاملاً' : 'Pay the full amount'}
              </Text>
            </View>
            {selectedPaymentType === 'full' && (
              <CheckCircle size={20} color={colors.success} />
            )}
          </View>
        </TouchableOpacity>

        {/* Partial Payment Option */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentType === 'partial' && styles.paymentOptionSelected,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
          onPress={() => handlePaymentTypeSelection('partial')}
          activeOpacity={0.7}
        >
          <View style={[styles.paymentOptionContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.paymentOptionIcon, { backgroundColor: colors.warningLight }]}>
              <DollarSign size={24} color={colors.warning} />
            </View>
            <View style={styles.paymentOptionInfo}>
              <Text
                style={[
                  styles.paymentOptionTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'دفعة جزئية' : 'Partial Payment'}
              </Text>
              <Text
                style={[
                  styles.paymentOptionAmount,
                  {
                    color: colors.warning,
                    fontFamily: 'monospace',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'مبلغ مخصص' : 'Custom Amount'}
              </Text>
              <Text
                style={[
                  styles.paymentOptionDescription,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'دفع جزء من المبلغ' : 'Pay part of the amount'}
              </Text>
            </View>
            {selectedPaymentType === 'partial' && (
              <CheckCircle size={20} color={colors.warning} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.stepActions}>
        <Button
          title={language === 'ar' ? 'العودة' : 'Back'}
          onPress={() => setCurrentStep('instructions')}
          variant="secondary"
        />
      </View>
    </Card>
  );

  const renderPartialAmountStep = () => (
    <Card style={styles.partialAmountCard}>
      <View style={styles.partialAmountHeader}>
        <DollarSign size={32} color={colors.warning} />
        <Text
          style={[
            styles.partialAmountTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' ? 'مبلغ الدفعة الجزئية' : 'Partial Payment Amount'}
        </Text>
        <Text
          style={[
            styles.partialAmountDescription,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' 
            ? `أدخل المبلغ الذي دفعته (أقل من ${formatCurrency(amount)})`
            : `Enter the amount you paid (less than ${formatCurrency(amount)})`
          }
        </Text>
      </View>

      <View style={styles.amountInputContainer}>
        <Text
          style={[
            styles.amountInputLabel,
            {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid'}
        </Text>
        <TextInput
          style={[
            styles.amountInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: 'monospace',
              textAlign: 'center',
            },
          ]}
          placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
          placeholderTextColor={colors.textMuted}
          value={partialAmount}
          onChangeText={setPartialAmount}
          keyboardType="numeric"
        />
        <Text
          style={[
            styles.amountInputHint,
            {
              color: colors.textMuted,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: 'center',
            },
          ]}
        >
          {language === 'ar' ? 'المبلغ بالريال السعودي' : 'Amount in Saudi Riyals'}
        </Text>
      </View>

      <View style={styles.stepActions}>
        <Button
          title={language === 'ar' ? 'العودة' : 'Back'}
          onPress={() => {
            setCurrentStep('payment_type');
            setSelectedPaymentType(null);
          }}
          variant="secondary"
        />
        <Button
          title={language === 'ar' ? 'متابعة' : 'Continue'}
          onPress={handlePartialAmountSubmit}
          variant="primary"
          disabled={!partialAmount || parseFloat(partialAmount) <= 0}
        />
      </View>
    </Card>
  );

  const renderConfirmationStep = () => {
    const finalAmount = selectedPaymentType === 'full' ? amount : parseFloat(partialAmount);
    const remainingAmount = selectedPaymentType === 'partial' ? amount - finalAmount : 0;

    return (
      <Card style={styles.confirmationCard}>
        <View style={styles.confirmationHeader}>
          <CheckCircle size={48} color={colors.success} />
          <Text
            style={[
              styles.confirmationTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'تأكيد الدفعة' : 'Confirm Payment'}
          </Text>
        </View>

        <View style={styles.confirmationDetails}>
          <View style={[styles.confirmationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'نوع الدفعة:' : 'Payment Type:'}
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'left' : 'right',
                },
              ]}
            >
              {selectedPaymentType === 'full' 
                ? (language === 'ar' ? 'دفعة كاملة' : 'Full Payment')
                : (language === 'ar' ? 'دفعة جزئية' : 'Partial Payment')
              }
            </Text>
          </View>

          <View style={[styles.confirmationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'المبلغ المدفوع:' : 'Amount Paid:'}
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                styles.confirmationAmount,
                {
                  color: colors.success,
                  fontFamily: 'monospace',
                  textAlign: isRTL ? 'left' : 'right',
                },
              ]}
            >
              {formatCurrency(finalAmount)}
            </Text>
          </View>

          {selectedPaymentType === 'partial' && (
            <View style={[styles.confirmationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.confirmationLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'المبلغ المتبقي:' : 'Remaining Amount:'}
              </Text>
              <Text
                style={[
                  styles.confirmationValue,
                  styles.remainingAmount,
                  {
                    color: colors.warning,
                    fontFamily: 'monospace',
                    textAlign: isRTL ? 'left' : 'right',
                  },
                ]}
              >
                {formatCurrency(remainingAmount)}
              </Text>
            </View>
          )}

          <View style={[styles.confirmationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'الوحدة:' : 'Unit:'}
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'left' : 'right',
                },
              ]}
            >
              {unitLabel}
            </Text>
          </View>

          <View style={[styles.confirmationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'المرجع:' : 'Reference:'}
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: colors.textPrimary,
                  fontFamily: 'monospace',
                  textAlign: isRTL ? 'left' : 'right',
                },
              ]}
            >
              {reference}
            </Text>
          </View>
        </View>

        <View style={styles.confirmationNote}>
          <AlertTriangle size={20} color={colors.warning} />
          <Text
            style={[
              styles.confirmationNoteText,
              {
                color: colors.warning,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' 
              ? 'سيتم إشعار المالك بالدفعة وسيقوم بتأكيد الاستلام'
              : 'The landlord will be notified and will confirm receipt'
            }
          </Text>
        </View>

        <View style={styles.stepActions}>
          <Button
            title={language === 'ar' ? 'العودة' : 'Back'}
            onPress={() => {
              setCurrentStep('payment_type');
              setSelectedPaymentType(null);
            }}
            variant="secondary"
          />
          <Button
            title={isProcessing 
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
              : (language === 'ar' ? 'حفظ الدفعة' : 'Save Payment')
            }
            onPress={handleFinalSave}
            variant="primary"
            disabled={isProcessing}
          />
        </View>
      </Card>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
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
            {language === 'ar' ? 'طريقة الدفع' : 'How to Pay'}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={[styles.stepIndicator, { backgroundColor: colors.surface }]}>
          <View style={[styles.stepDot, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }, currentStep === 'instructions' && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[styles.stepNumber, { color: currentStep === 'instructions' ? colors.surface : colors.textMuted }]}>1</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: colors.border }, (currentStep === 'payment_type' || currentStep === 'partial_amount' || currentStep === 'confirmation') && { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }, (currentStep === 'payment_type' || currentStep === 'partial_amount') && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[styles.stepNumber, { color: (currentStep === 'payment_type' || currentStep === 'partial_amount') ? colors.surface : colors.textMuted }]}>2</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: colors.border }, currentStep === 'confirmation' && { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }, currentStep === 'confirmation' && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[styles.stepNumber, { color: currentStep === 'confirmation' ? colors.surface : colors.textMuted }]}>3</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.modalContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 'instructions' && renderInstructionsStep()}
          {currentStep === 'payment_type' && renderPaymentTypeStep()}
          {currentStep === 'partial_amount' && renderPartialAmountStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: spacing.md,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  amountCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  amountLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  referenceText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  unitText: {
    fontSize: fontSize.sm,
  },
  instructionsCard: {
    marginBottom: spacing.md,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  bankCard: {
    marginBottom: spacing.md,
  },
  bankHeader: {
    marginBottom: spacing.sm,
  },
  bankName: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  accountName: {
    fontSize: fontSize.sm,
  },
  ibanRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iban: {
    flex: 1,
    fontSize: fontSize.md,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  copyButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  continueContainer: {
    marginTop: spacing.lg,
  },
  paymentTypeCard: {
    borderWidth: 2,
  },
  paymentTypeHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  paymentTypeTitle: {
    fontSize: fontSize.xl,
  },
  paymentTypeDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  paymentOptions: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  paymentOption: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentOptionSelected: {
  },
  paymentOptionContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  paymentOptionAmount: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  paymentOptionDescription: {
    fontSize: fontSize.sm,
  },
  partialAmountCard: {
    borderWidth: 2,
  },
  partialAmountHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  partialAmountTitle: {
    fontSize: fontSize.xl,
  },
  partialAmountDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  amountInputContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  amountInputLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  amountInput: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.xl,
    fontWeight: '600',
    minHeight: 64,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountInputHint: {
    fontSize: fontSize.sm,
  },
  confirmationCard: {
    borderRadius: borderRadius.card,
    borderWidth: 2,
  },
  confirmationHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  confirmationTitle: {
    fontSize: fontSize.xl,
  },
  confirmationDetails: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  confirmationRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  confirmationLabel: {
    fontSize: fontSize.md,
    flex: 1,
  },
  confirmationValue: {
    fontSize: fontSize.md,
  },
  confirmationAmount: {
    fontWeight: '600',
    fontSize: fontSize.lg,
  },
  remainingAmount: {
    fontWeight: '600',
  },
  confirmationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  confirmationNoteText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  stepActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});