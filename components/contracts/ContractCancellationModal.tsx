import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { X, TriangleAlert as AlertTriangle, FileText, DollarSign,  Home, Users, Calendar, MessageSquare, Check } from 'lucide-react-native';

export interface CancellationReason {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  requiresExplanation: boolean;
  icon: any;
  severity: 'low' | 'medium' | 'high';
}

interface ContractCancellationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: CancellationReason, explanation?: string) => void;
  contractId: string;
  tenantName: string;
  unitLabel: string;
  propertyName: string;
  isProcessing?: boolean;
}

export function ContractCancellationModal({
  visible,
  onClose,
  onConfirm,
  contractId,
  tenantName,
  unitLabel,
  propertyName,
  isProcessing = false,
}: ContractCancellationModalProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [explanation, setExplanation] = useState('');
  const [step, setStep] = useState<'reason' | 'confirmation'>('reason');

  const cancellationReasons: CancellationReason[] = [
    {
      id: 'lease_violation',
      label: 'Tenant Violation of Lease Terms',
      labelAr: 'مخالفة المستأجر لشروط العقد',
      description: 'Tenant has violated specific terms of the lease agreement',
      descriptionAr: 'قام المستأجر بمخالفة شروط محددة في اتفاقية الإيجار',
      requiresExplanation: true,
      icon: AlertTriangle,
      severity: 'high',
    },
    {
      id: 'non_payment',
      label: 'Non-payment of Rent',
      labelAr: 'عدم دفع الإيجار',
      description: 'Tenant has failed to pay rent as agreed',
      descriptionAr: 'فشل المستأجر في دفع الإيجار كما هو متفق عليه',
      requiresExplanation: true,
      icon: DollarSign,
      severity: 'high',
    },
    {
      id: 'property_sale',
      label: 'Property Sale/Owner Needs Unit',
      labelAr: 'بيع العقار/حاجة المالك للوحدة',
      description: 'Property is being sold or owner requires the unit',
      descriptionAr: 'يتم بيع العقار أو يحتاج المالك للوحدة',
      requiresExplanation: false,
      icon: Home,
      severity: 'medium',
    },
    {
      id: 'mutual_agreement',
      label: 'Mutual Agreement',
      labelAr: 'اتفاق متبادل',
      description: 'Both parties agree to terminate the contract',
      descriptionAr: 'يتفق الطرفان على إنهاء العقد',
      requiresExplanation: false,
      icon: Users,
      severity: 'low',
    },
    {
      id: 'lease_end',
      label: 'End of Lease Term',
      labelAr: 'انتهاء مدة الإيجار',
      description: 'Natural expiration of the lease period',
      descriptionAr: 'انتهاء طبيعي لفترة الإيجار',
      requiresExplanation: false,
      icon: Calendar,
      severity: 'low',
    },
    {
      id: 'other',
      label: 'Other Reason',
      labelAr: 'سبب آخر',
      description: 'Specify a custom reason for cancellation',
      descriptionAr: 'تحديد سبب مخصص للإلغاء',
      requiresExplanation: true,
      icon: MessageSquare,
      severity: 'medium',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const handleReasonSelect = (reason: CancellationReason) => {
    setSelectedReason(reason);
    if (!reason.requiresExplanation) {
      setStep('confirmation');
    }
  };

  const handleNext = () => {
    if (!selectedReason) return;
    
    if (selectedReason.requiresExplanation && !explanation.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال تفسير للسبب' : 'Please provide an explanation for the reason'
      );
      return;
    }
    
    setStep('confirmation');
  };

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason, explanation.trim() || undefined);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setExplanation('');
    setStep('reason');
    onClose();
  };

  const renderReasonSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
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
          {language === 'ar' ? 'سبب إلغاء العقد' : 'Contract Cancellation Reason'}
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
          {language === 'ar' ? 'اختر السبب الأنسب لإلغاء العقد' : 'Select the most appropriate reason for contract cancellation'}
        </Text>
      </View>

      <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
        {cancellationReasons.map((reason) => {
          const isSelected = selectedReason?.id === reason.id;
          const severityColor = getSeverityColor(reason.severity);
          
          return (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? severityColor : colors.border,
                },
                isSelected && { backgroundColor: `${severityColor}10` },
              ]}
              onPress={() => handleReasonSelect(reason)}
              activeOpacity={0.8}
            >
              <View style={[styles.reasonContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.reasonIcon, { backgroundColor: `${severityColor}20` }]}>
                  <reason.icon size={24} color={severityColor} />
                </View>
                <View style={styles.reasonInfo}>
                  <Text
                    style={[
                      styles.reasonLabel,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? reason.labelAr : reason.label}
                  </Text>
                  <Text
                    style={[
                      styles.reasonDescription,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? reason.descriptionAr : reason.description}
                  </Text>
                  {reason.requiresExplanation && (
                    <Text
                      style={[
                        styles.explanationRequired,
                        {
                          color: colors.warning,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? '* يتطلب تفسير' : '* Requires explanation'}
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <View style={[styles.selectedIndicator, { backgroundColor: severityColor }]}>
                    <Check size={16} color={colors.surface} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Explanation Field */}
      {selectedReason?.requiresExplanation && (
        <Card style={[styles.explanationCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.explanationLabel,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تفسير السبب *' : 'Reason Explanation *'}
          </Text>
          <TextInput
            style={[
              styles.explanationInput,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={language === 'ar' 
              ? 'يرجى تقديم تفاصيل إضافية حول سبب الإلغاء...'
              : 'Please provide additional details about the cancellation reason...'
            }
            placeholderTextColor={colors.textMuted}
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>
      )}

      <View style={[styles.stepActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Button
          title={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onPress={handleClose}
          variant="secondary"
          style={styles.stepActionButton}
        />
        <Button
          title={language === 'ar' ? 'متابعة' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          style={styles.stepActionButton}
          disabled={!selectedReason}
        />
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
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
          {language === 'ar' ? 'تأكيد إلغاء العقد' : 'Confirm Contract Cancellation'}
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
          {language === 'ar' ? 'راجع التفاصيل وأكد الإلغاء' : 'Review details and confirm cancellation'}
        </Text>
      </View>

      {/* Contract Summary */}
      <Card style={[styles.contractSummary, { backgroundColor: colors.dangerLight }]}>
        <View style={[styles.summaryHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <AlertTriangle size={24} color={colors.danger} />
          <Text
            style={[
              styles.summaryTitle,
              {
                color: colors.danger,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'العقد المراد إلغاؤه' : 'Contract to be Cancelled'}
          </Text>
        </View>
        
        <View style={styles.summaryDetails}>
          <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.summaryLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'المستأجر:' : 'Tenant:'}
            </Text>
            <Text style={[styles.summaryValue, { 
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
            }]}>
              {tenantName}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.summaryLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'الوحدة:' : 'Unit:'}
            </Text>
            <Text style={[styles.summaryValue, { 
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
            }]}>
              {propertyName} - {unitLabel}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.summaryLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'رقم العقد:' : 'Contract ID:'}
            </Text>
            <Text style={[styles.summaryValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {contractId}
            </Text>
          </View>
        </View>
      </Card>

      {/* Selected Reason */}
      {selectedReason && (
        <Card style={[styles.selectedReasonCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.selectedReasonHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.selectedReasonIcon, { backgroundColor: `${getSeverityColor(selectedReason.severity)}20` }]}>
              <selectedReason.icon size={20} color={getSeverityColor(selectedReason.severity)} />
            </View>
            <Text
              style={[
                styles.selectedReasonTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? selectedReason.labelAr : selectedReason.label}
            </Text>
          </View>
          
          {explanation && (
            <View style={[styles.explanationPreview, { backgroundColor: colors.surfaceSecondary }]}>
              <Text
                style={[
                  styles.explanationPreviewLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'التفسير:' : 'Explanation:'}
              </Text>
              <Text
                style={[
                  styles.explanationPreviewText,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {explanation}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Warning Notice */}
      <Card style={[styles.warningNotice, { backgroundColor: colors.warningLight }]}>
        <Text
          style={[
            styles.warningNoticeText,
            {
              color: colors.warning,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' 
            ? '⚠️ تحذير: إلغاء العقد سيؤدي إلى إخلاء الوحدة فوراً وإنهاء جميع الالتزامات التعاقدية. هذا الإجراء لا يمكن التراجع عنه.'
            : '⚠️ Warning: Cancelling the contract will immediately vacate the unit and terminate all contractual obligations. This action cannot be undone.'
          }
        </Text>
      </Card>

      <View style={[styles.stepActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Button
          title={language === 'ar' ? 'العودة' : 'Back'}
          onPress={() => setStep('reason')}
          variant="secondary"
          style={styles.stepActionButton}
        />
        <Button
          title={isProcessing 
            ? (language === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...') 
            : (language === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation')
          }
          onPress={handleConfirm}
          disabled={isProcessing}
          variant="danger"
          style={styles.stepActionButton}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
            disabled={isProcessing}
          >
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
            {language === 'ar' ? 'إلغاء العقد' : 'Cancel Contract'}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'reason' && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, { color: step === 'reason' ? colors.surface : colors.textMuted }]}>1</Text>
          </View>
          <View style={[styles.stepLine, step === 'confirmation' && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'confirmation' && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, { color: step === 'confirmation' ? colors.surface : colors.textMuted }]}>2</Text>
          </View>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {step === 'reason' && renderReasonSelection()}
          {step === 'confirmation' && renderConfirmation()}
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
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  stepDotActive: {
    backgroundColor: '#4CA771',
    borderColor: '#4CA771',
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: spacing.sm,
  },
  stepLineActive: {
    backgroundColor: '#4CA771',
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  stepContainer: {
    gap: spacing.lg,
  },
  stepHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  reasonsList: {
    maxHeight: 400,
  },
  reasonOption: {
    borderWidth: 2,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  reasonContent: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonInfo: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  reasonDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  explanationRequired: {
    fontSize: fontSize.xs,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationCard: {
    marginTop: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  explanationLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  explanationInput: {
    borderWidth: 2,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    fontSize: fontSize.md,
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contractSummary: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  summaryHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  summaryDetails: {
    gap: spacing.sm,
  },
  summaryRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  summaryValue: {
    fontSize: fontSize.sm,
  },
  selectedReasonCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  selectedReasonHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  selectedReasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedReasonTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  explanationPreview: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  explanationPreviewLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  explanationPreviewText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  warningNotice: {
    borderRadius: borderRadius.card,
    borderLeftColor: '#F59E0B',
  },
  warningNoticeText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  stepActions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stepActionButton: {
    flex: 1,
  },
});