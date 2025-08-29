import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { ContractCancellationModal, CancellationReason } from './ContractCancellationModal';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useTenants, ContractRecord, TenantRecord } from '@/hooks/useTenants';
import { useRouter } from 'expo-router';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { FileText, User, Calendar, DollarSign, Trash2, Eye, CreditCard as Edit3, CircleCheck as CheckCircle, Building2 } from 'lucide-react-native';

interface ContractManagerProps {
  unitId: string;
  unitLabel: string;
  propertyName: string;
  onContractCreated?: () => void;
  onContractCancelled?: () => void;
}

export function ContractManager({ 
  unitId, 
  unitLabel, 
  propertyName,
  onContractCreated,
  onContractCancelled 
}: ContractManagerProps) {
  const { language, isRTL, formatDate, dateSystem, addDateSystemUpdateCallback } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { 
    getActiveContractForUnit, 
    getCurrentOccupancy, 
    getTenantById, 
    cancelContract,
    getTenantContracts 
  } = useTenants();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeContract = getActiveContractForUnit(unitId);
  const currentOccupancy = getCurrentOccupancy(unitId);
  const tenant = activeContract ? getTenantById(activeContract.tenantId) : null;

  // Register for date system updates
  React.useEffect(() => {
    const cleanup = addDateSystemUpdateCallback(() => {
      setRefreshKey(prev => prev + 1);
    });
    return cleanup;
  }, [addDateSystemUpdateCallback]);
  const handleCancelContract = async (reason: CancellationReason, explanation?: string) => {
    if (!activeContract) return;

    setIsProcessing(true);

    try {
      const fullReason = explanation 
        ? `${language === 'ar' ? reason.labelAr : reason.label}: ${explanation}`
        : (language === 'ar' ? reason.labelAr : reason.label);
      
      await cancelContract(activeContract.id, fullReason);
      
      Alert.alert(
        language === 'ar' ? '✅ تم إلغاء العقد' : '✅ Contract Cancelled',
        language === 'ar' 
          ? `تم إلغاء عقد الوحدة ${unitLabel} بنجاح. الوحدة أصبحت شاغرة ومتاحة للإيجار.`
          : `Contract for unit ${unitLabel} cancelled successfully. Unit is now vacant and available for rent.`,
        [
          {
            text: language === 'ar' ? 'موافق' : 'OK',
            onPress: () => {
              setShowCancelModal(false);
              onContractCancelled?.();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Contract cancellation error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'فشل في إلغاء العقد' : 'Failed to cancel contract'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewFullContract = () => {
    if (!activeContract) return;
    
    router.push({
      pathname: '/(tabs)/contract-details',
      params: {
        contractId: activeContract.id,
      },
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

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString()} ${symbol}`;
  };

  const formatDateWithSystem = (dateString: string): string => {
    const date = new Date(dateString);
    
    if (dateSystem === 'hijri') {
      try {
        const hijriResult = dateToHijri(date);
        if (hijriResult.success && hijriResult.date) {
          const hijriDate = hijriResult.date as HijriDate;
          return formatHijriDate(hijriDate, 'short', language);
        }
      } catch (error) {
        console.warn('Hijri conversion failed in ContractManager');
      }
    }
    
    // Gregorian formatting
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTotalWithVat = (amount: number, vatRate: number) => {
    return amount + (amount * vatRate / 100);
  };

  if (!activeContract || !tenant) {
    return (
      <Card style={[styles.emptyContractCard, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyContractContent}>
          <View style={[styles.emptyContractIcon, { backgroundColor: colors.primaryLight }]}>
            <FileText size={32} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.emptyContractTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'لا يوجد عقد نشط' : 'No Active Contract'}
          </Text>
          <Text
            style={[
              styles.emptyContractText,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'هذه الوحدة شاغرة ومتاحة للإيجار' : 'This unit is vacant and available for rent'}
          </Text>
        </View>
      </Card>
    );
  }

  const totalMonthlyWithVat = calculateTotalWithVat(activeContract.monthlyRent, activeContract.vatRate);

  return (
    <View style={styles.contractContainer}>
      {/* Contract Header */}
      <Card style={[styles.contractHeader, { backgroundColor: colors.successLight }]}>
        <View style={[styles.contractHeaderContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.contractIcon, { backgroundColor: colors.success }]}>
            <FileText size={32} color={colors.surface} />
          </View>
          <View style={styles.contractHeaderInfo}>
            <Text
              style={[
                styles.contractTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'عقد نشط' : 'Active Contract'}
            </Text>
            <Text
              style={[
                styles.contractSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? `العقد رقم: ${activeContract.id}` : `Contract ID: ${activeContract.id}`}
            </Text>
          </View>
          <View style={[styles.contractStatus, { backgroundColor: colors.success }]}>
            <CheckCircle size={20} color={colors.surface} />
            <Text style={[styles.contractStatusText, { color: colors.surface }]}>
              {language === 'ar' ? 'نشط' : 'Active'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Tenant Information */}
      <Card style={[styles.tenantCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.tenantHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.tenantIcon, { backgroundColor: colors.primaryLight }]}>
            <User size={24} color={colors.primary} />
          </View>
          <View style={styles.tenantInfo}>
            <Text
              style={[
                styles.tenantName,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {tenant.fullName}
            </Text>
            <Text
              style={[
                styles.tenantPhone,
                {
                  color: colors.textSecondary,
                  fontFamily: 'monospace',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {tenant.phoneE164}
            </Text>
            {tenant.email && (
              <Text
                style={[
                  styles.tenantEmail,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {tenant.email}
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* Contract Details */}
      <Card style={[styles.contractDetails, { backgroundColor: colors.surface }]}>
        <Text
          style={[
            styles.detailsTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'تفاصيل العقد' : 'Contract Details'}
        </Text>

        <View style={styles.detailsGrid}>
          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {language === 'ar' ? 'تاريخ البداية:' : 'Start Date:'}
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: colors.textPrimary,
                  fontFamily: 'monospace',
                },
              ]}
            >
              {formatDateWithSystem(activeContract.startDate)}
            </Text>
          </View>

          {activeContract.endDate && (
            <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'تاريخ النهاية:' : 'End Date:'}
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                {formatDateWithSystem(activeContract.endDate)}
              </Text>
            </View>
          )}

          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {language === 'ar' ? 'الإيجار الشهري:' : 'Monthly Rent:'}
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: colors.primary,
                  fontFamily: 'monospace',
                },
              ]}
            >
              {formatCurrency(totalMonthlyWithVat)}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {language === 'ar' ? 'مبلغ التأمين:' : 'Security Deposit:'}
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: colors.textPrimary,
                  fontFamily: 'monospace',
                },
              ]}
            >
              {formatCurrency(activeContract.depositAmount)}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {language === 'ar' ? 'تكرار الدفع:' : 'Payment Frequency:'}
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                },
              ]}
            >
              {activeContract.paymentFrequency === 'monthly' 
                ? (language === 'ar' ? 'شهري' : 'Monthly')
                : activeContract.paymentFrequency === 'quarterly'
                ? (language === 'ar' ? 'ربع سنوي' : 'Quarterly')
                : (language === 'ar' ? 'سنوي' : 'Yearly')
              }
            </Text>
          </View>
        </View>
      </Card>

      {/* Contract Actions */}
      <View style={[styles.contractActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Button
          title={language === 'ar' ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
          onPress={handleViewFullContract}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title={language === 'ar' ? 'إلغاء العقد' : 'Cancel Contract'}
          onPress={() => setShowCancelModal(true)}
          variant="danger"
          style={styles.actionButton}
        />
      </View>

      {/* Contract Cancellation Modal */}
      <ContractCancellationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelContract}
        contractId={activeContract.id}
        tenantName={tenant.fullName}
        unitLabel={unitLabel}
        propertyName={propertyName}
        isProcessing={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contractContainer: {
    gap: spacing.lg,
  },
  contractHeader: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  contractHeaderContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  contractIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractHeaderInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  contractSubtitle: {
    fontSize: fontSize.md,
  },
  contractStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  contractStatusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tenantCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tenantHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  tenantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  tenantPhone: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  tenantEmail: {
    fontSize: fontSize.sm,
  },
  contractDetails: {
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: fontSize.md,
    flex: 1,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  contractActions: {
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  emptyContractCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  emptyContractContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  emptyContractIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContractTitle: {
    fontSize: fontSize.lg,
  },
  emptyContractText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});