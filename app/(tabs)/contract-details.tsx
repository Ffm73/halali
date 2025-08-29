import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useTenants } from '@/hooks/useTenants';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Contract, User } from '@/types';
import { ArrowLeft, ArrowRight, FileText, User as UserIcon, Calendar, DollarSign, Building2, Phone, Mail, CreditCard as Edit3, Trash2 } from 'lucide-react-native';

// Mock contract data
const mockContract: Contract = {
  id: 'contract1',
  unitId: '1',
  residentUserId: 'tenant1',
  type: 'residential',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  durationMonths: 12,
  depositAmount: 5000,
  commissionAmount: 0,
  vatRate: 15,
  paymentFrequency: 'monthly',
  status: 'active',
  attachments: [],
  signedAt: '2023-12-15T10:00:00Z',
};

// Mock tenant data
const mockTenant: User = {
  id: 'tenant1',
  role: 'resident',
  fullName: 'محمد أحمد السعيد',
  email: 'mohammed@example.com',
  phoneE164: '+966501234567',
  language: 'ar',
  country: 'SA',
  timeZone: 'Asia/Riyadh',
  status: 'active',
  currency: 'SAR',
  dateSystem: 'hijri',
  gender: 'male',
};

export default function ContractDetailsScreen() {
  const { language, isRTL, formatDate, formatCurrency } = useLocalization();
  const { colors } = useTheme();
  const router = useRouter();
  const { contractId, unitId, unitLabel, propertyName, propertyId } = useLocalSearchParams();
  
  const [contract] = useState(mockContract);
  const [tenant] = useState(mockTenant);

  const handleBackToUnit = () => {
    router.push({
      pathname: '/(tabs)/unit-details',
      params: {
        unitId: unitId || '1',
        unitLabel: unitLabel || 'A-101',
        propertyName: propertyName || 'Property',
        propertyId: propertyId || '1',
      },
    });
  };

  const handleEditContract = () => {
    Alert.alert(
      language === 'ar' ? 'تعديل العقد' : 'Edit Contract',
      language === 'ar' ? 'سيتم فتح نموذج تعديل العقد' : 'Contract edit form will open'
    );
  };

  const handleCancelContract = () => {
    Alert.alert(
      language === 'ar' ? 'إلغاء العقد' : 'Cancel Contract',
      language === 'ar' ? 'هل تريد إلغاء هذا العقد؟' : 'Do you want to cancel this contract?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'ar' ? 'إلغاء العقد' : 'Cancel Contract', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              language === 'ar' ? 'تم إلغاء العقد' : 'Contract Cancelled',
              language === 'ar' ? 'تم إلغاء العقد بنجاح' : 'Contract cancelled successfully'
            );
          }
        },
      ]
    );
  };

  const calculateTotalWithVat = (amount: number, vatRate: number) => {
    return amount + (amount * vatRate / 100);
  };

  const totalMonthlyWithVat = calculateTotalWithVat(2500, contract.vatRate); // Using mock rent amount

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      alignItems: 'center',
      gap: spacing.md,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    backButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: fontSize.xl,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
      textAlign: isRTL ? 'right' : 'left',
    },
    subtitle: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
      textAlign: isRTL ? 'right' : 'left',
      marginTop: spacing.xs,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    contractCard: {
      marginBottom: spacing.lg,
      borderRadius: borderRadius.card,
      backgroundColor: colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    contractHeader: {
      alignItems: 'center',
      gap: spacing.lg,
      marginBottom: spacing.lg,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    contractIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    contractInfo: {
      flex: 1,
    },
    contractTitle: {
      fontSize: fontSize.xl,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.xs,
    },
    contractId: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontFamily: 'monospace',
      textAlign: isRTL ? 'right' : 'left',
    },
    contractStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.success,
    },
    contractStatusText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.surface,
    },
    tenantCard: {
      marginBottom: spacing.lg,
      borderRadius: borderRadius.card,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    tenantHeader: {
      alignItems: 'center',
      gap: spacing.md,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    tenantIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
    },
    tenantInfo: {
      flex: 1,
    },
    tenantName: {
      fontSize: fontSize.lg,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.xs,
    },
    tenantPhone: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontFamily: 'monospace',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.xs,
    },
    tenantEmail: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontFamily: 'Nunito-Regular',
      textAlign: isRTL ? 'right' : 'left',
    },
    detailsCard: {
      marginBottom: spacing.lg,
      borderRadius: borderRadius.card,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    detailsTitle: {
      fontSize: fontSize.lg,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
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
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    detailLabel: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
      flex: 1,
    },
    detailValue: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
      fontFamily: 'monospace',
      fontWeight: '600',
    },
    actionsCard: {
      marginBottom: spacing.lg,
      borderRadius: borderRadius.card,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    actionsTitle: {
      fontSize: fontSize.lg,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.lg,
    },
    actionButtons: {
      gap: spacing.md,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    actionButton: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToUnit}
          activeOpacity={0.7}
        >
          {isRTL ? (
            <ArrowRight size={24} color={colors.textPrimary} />
          ) : (
            <ArrowLeft size={24} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {language === 'ar' ? 'تفاصيل العقد' : 'Contract Details'}
          </Text>
          <Text style={styles.subtitle}>
            {propertyName} - {unitLabel}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true} bounces={true}>
        {/* Contract Information */}
        <Card style={styles.contractCard}>
          <View style={styles.contractHeader}>
            <View style={styles.contractIcon}>
              <FileText size={32} color={colors.surface} />
            </View>
            <View style={styles.contractInfo}>
              <Text style={styles.contractTitle}>
                {language === 'ar' ? 'عقد إيجار نشط' : 'Active Lease Contract'}
              </Text>
              <Text style={styles.contractId}>
                {language === 'ar' ? 'رقم العقد: ' : 'Contract ID: '}{contract.id}
              </Text>
            </View>
            <View style={styles.contractStatus}>
              <Text style={styles.contractStatusText}>
                {language === 'ar' ? 'نشط' : 'Active'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Tenant Information */}
        <Card style={styles.tenantCard}>
          <View style={styles.tenantHeader}>
            <View style={styles.tenantIcon}>
              <UserIcon size={24} color={colors.primary} />
            </View>
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantName}>
                {tenant.fullName}
              </Text>
              <Text style={styles.tenantPhone}>
                {tenant.phoneE164}
              </Text>
              {tenant.email && (
                <Text style={styles.tenantEmail}>
                  {tenant.email}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Contract Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            {language === 'ar' ? 'تفاصيل العقد' : 'Contract Details'}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {language === 'ar' ? 'تاريخ البداية:' : 'Start Date:'}
              </Text>
              <Text style={styles.detailValue}>
                {formatDate(contract.startDate)}
              </Text>
            </View>

            {contract.endDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'ar' ? 'تاريخ النهاية:' : 'End Date:'}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDate(contract.endDate)}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {language === 'ar' ? 'المدة:' : 'Duration:'}
              </Text>
              <Text style={styles.detailValue}>
                {contract.durationMonths} {language === 'ar' ? 'شهر' : 'months'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {language === 'ar' ? 'الإيجار الشهري:' : 'Monthly Rent:'}
              </Text>
              <Text style={[styles.detailValue, { color: colors.primary }]}>
                {formatCurrency(totalMonthlyWithVat)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {language === 'ar' ? 'مبلغ التأمين:' : 'Security Deposit:'}
              </Text>
              <Text style={styles.detailValue}>
                {formatCurrency(contract.depositAmount)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {language === 'ar' ? 'ضريبة القيمة المضافة:' : 'VAT Rate:'}
              </Text>
              <Text style={styles.detailValue}>
                {contract.vatRate}%
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {language === 'ar' ? 'تكرار الدفع:' : 'Payment Frequency:'}
              </Text>
              <Text style={styles.detailValue}>
                {contract.paymentFrequency === 'monthly' 
                  ? (language === 'ar' ? 'شهري' : 'Monthly')
                  : contract.paymentFrequency === 'quarterly'
                  ? (language === 'ar' ? 'ربع سنوي' : 'Quarterly')
                  : (language === 'ar' ? 'سنوي' : 'Yearly')
                }
              </Text>
            </View>

            {contract.signedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {language === 'ar' ? 'تاريخ التوقيع:' : 'Signed Date:'}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDate(contract.signedAt)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Contract Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>
            {language === 'ar' ? 'إجراءات العقد' : 'Contract Actions'}
          </Text>
          
          <View style={styles.actionButtons}>
            <Button
              title={language === 'ar' ? 'تعديل العقد' : 'Edit Contract'}
              onPress={handleEditContract}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title={language === 'ar' ? 'إلغاء العقد' : 'Cancel Contract'}
              onPress={handleCancelContract}
              variant="danger"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}