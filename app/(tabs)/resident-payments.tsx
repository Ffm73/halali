import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { HowToPayModal } from '@/components/payments/HowToPayModal';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuth';
import { useCharges } from '@/hooks/useCharges';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useTheme } from '@/hooks/useTheme';
import { getCurrentDates } from '@/utils/dateConversion';
import { dateToHijri, formatHijriDate } from '@/utils/dateConversion';
import { spacing, fontSize, borderRadius, numberFont } from '@/constants/theme';
import { Charge, HowToPay, Unit, Contract, HijriDate } from '@/types';
import { Calendar, DollarSign, CircleCheck as CheckCircle, CircleAlert as AlertCircle, CreditCard, Plus, Minus, Check, ChevronDown, ChevronUp } from 'lucide-react-native';

// Mock resident data
const mockResidentProperty = {
  id: '1',
  nameAr: 'برج العلامة',
  nameEn: 'Al-Alamah Tower',
  address: 'شارع الملك فهد',
  city: 'الرياض',
};

const mockResidentUnit: Unit = {
  id: '1',
  propertyId: '1',
  unitLabel: 'A-101',
  bedrooms: 2,
  bathrooms: 1,
  hasKitchen: true,
  hasLivingRoom: true,
  floor: 1,
  sizeSqm: 85,
  status: 'occupied',
  amenities: ['مكيف', 'موقف سيارة'],
  photos: [],
};

const mockResidentContract: Contract = {
  id: 'contract1',
  unitId: '1',
  residentUserId: 'resident1',
  type: 'residential',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  durationMonths: 12,
  depositAmount: 5000,
  commissionAmount: 0,
  vatRate: 0.15,
  paymentFrequency: 'monthly',
  status: 'active',
  attachments: [],
  signedAt: '2023-12-15T10:00:00Z',
};

// Generate charges based on date system
const generateResidentCharges = (dateSystem: 'hijri' | 'gregorian', language: 'ar' | 'en', formatDate: (date: Date | string) => string): Charge[] => {
  const formatDateForSystem = (date: Date): string => {
    if (dateSystem === 'hijri') {
      const hijriResult = dateToHijri(date);
      if (hijriResult.success && hijriResult.date) {
        const hijriDate = hijriResult.date as HijriDate;
        return formatHijriDate(hijriDate, 'short', language);
      }
    }
    
    if (language === 'ar') {
      return date.toLocaleDateString('ar-SA-u-ca-gregory', {
        year: 'numeric',
        month: 'long',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    }
  };
  
  const getMonthLabel = (monthOffset: number, baseDate: Date) => {
    const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, baseDate.getDate());
    return `${language === 'ar' ? 'إيجار' : 'Rent'} ${formatDateForSystem(targetDate)}`;
  };

  return [
  {
    id: 'charge1',
    contractId: 'contract1',
    dueDate: '2025-01-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(-1, new Date('2025-01-20')),
    status: 'overdue',
    balanceRemaining: 2875,
  },
  {
    id: 'charge2',
    contractId: 'contract1',
    dueDate: '2025-02-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(0, new Date('2025-02-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge3',
    contractId: 'contract1',
    dueDate: '2025-03-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(1, new Date('2025-03-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge4',
    contractId: 'contract1',
    dueDate: '2025-04-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(2, new Date('2025-04-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge5',
    contractId: 'contract1',
    dueDate: '2025-05-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(3, new Date('2025-05-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge6',
    contractId: 'contract1',
    dueDate: '2025-06-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(4, new Date('2025-06-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge7',
    contractId: 'contract1',
    dueDate: '2025-07-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(5, new Date('2025-07-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge8',
    contractId: 'contract1',
    dueDate: '2025-08-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(6, new Date('2025-08-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge9',
    contractId: 'contract1',
    dueDate: '2025-09-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(7, new Date('2025-09-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge10',
    contractId: 'contract1',
    dueDate: '2025-10-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(8, new Date('2025-10-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge11',
    contractId: 'contract1',
    dueDate: '2025-11-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(9, new Date('2025-11-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge12',
    contractId: 'contract1',
    dueDate: '2025-12-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(10, new Date('2025-12-20')),
    status: 'due',
    balanceRemaining: 2875,
  },
  {
    id: 'charge_paid1',
    contractId: 'contract1',
    dueDate: '2024-12-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(-2, new Date('2024-12-20')),
    status: 'paid',
    balanceRemaining: 0,
  },
  {
    id: 'charge_paid2',
    contractId: 'contract1',
    dueDate: '2024-11-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(-3, new Date('2024-11-20')),
    status: 'paid',
    balanceRemaining: 0,
  },
  ];
};

const mockHowToPay: HowToPay = {
  id: 'howto1',
  scope: 'landlord',
  title: 'طرق الدفع المتاحة',
  instructionsRichText: 'يرجى التحويل إلى أحد الحسابات التالية وإرسال إيصال التحويل',
  bankAccounts: [
    {
      bankName: 'البنك الأهلي السعودي',
      iban: 'SA1234567890123456789012',
      accountName: 'أحمد محمد العلي',
    },
    {
      bankName: 'بنك الراجحي',
      iban: 'SA9876543210987654321098',
      accountName: 'أحمد محمد العلي',
    },
  ],
  stcBankHandle: '+966501234567',
};

export default function ResidentPaymentsScreen() {
  const { language, isRTL, formatDate, dateSystem, t, formatCurrency } = useLocalization();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { paymentMethods } = usePaymentMethods();
  
  const [mockResidentCharges, setMockResidentCharges] = useState(() => generateResidentCharges(dateSystem, language, formatDate));
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [showHowToPay, setShowHowToPay] = useState(false);
  const [showMultiPayment, setShowMultiPayment] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    upcoming: true,
    pending: true,
    paid: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Update charges when date system changes
  React.useEffect(() => {
    setMockResidentCharges(generateResidentCharges(dateSystem, language, formatDate));
    setRefreshKey(prev => prev + 1);
  }, [dateSystem, language]);

  // Load charges from storage on mount and when refreshKey changes
  React.useEffect(() => {
    const loadChargesFromStorage = async () => {
      try {
        const storedCharges = await AsyncStorage.getItem('residentCharges');
        if (storedCharges) {
          const charges = JSON.parse(storedCharges);
          setMockResidentCharges(charges);
        } else {
          // Initialize with generated charges and save to storage
          const initialCharges = generateResidentCharges(dateSystem, language, formatDate);
          await AsyncStorage.setItem('residentCharges', JSON.stringify(initialCharges));
          setMockResidentCharges(initialCharges);
        }
      } catch (error) {
        console.error('Failed to load charges from storage:', error);
        // Fallback to generated charges
        setMockResidentCharges(generateResidentCharges(dateSystem, language, formatDate));
      }
    };
    
    loadChargesFromStorage();
  }, [refreshKey]);

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return language === 'ar' ? 'اليوم' : 'Today';
    } else if (diffDays === 1) {
      return language === 'ar' ? 'غداً' : 'Tomorrow';
    } else if (diffDays < 0) {
      return language === 'ar' ? `متأخر ${Math.abs(diffDays)} يوم` : `${Math.abs(diffDays)} days overdue`;
    } else {
      return formatDate(date);
    }
  };

  const getUpcomingCharges = () => {
    return mockResidentCharges
      .filter(charge => 
        charge.status === 'due' || charge.status === 'overdue' || 
        (charge.status !== 'paid' && charge.status !== 'pending')
      )
      .sort((a, b) => {
        // Priority: overdue first, then pending, then due
        const statusOrder = { 'overdue': 1, 'pending': 2, 'due': 3 };
        const aOrder = statusOrder[a.status] || 4;
        const bOrder = statusOrder[b.status] || 4;
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        // Then sort by due date (earliest first)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  };

  const getPendingCharges = () => {
    return mockResidentCharges
      .filter(charge => charge.status === 'pending')
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  };

  const getPaidCharges = () => {
    return mockResidentCharges
      .filter(charge => charge.status === 'paid')
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()); // Latest first for paid
  };

  const toggleChargeSelection = (chargeId: string) => {
    setSelectedCharges(prev => 
      prev.includes(chargeId) 
        ? prev.filter(id => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const getSelectedChargesTotal = () => {
    return selectedCharges.reduce((total, chargeId) => {
      const charge = mockResidentCharges.find(c => c.id === chargeId);
      return total + (charge?.totalAmount || 0);
    }, 0);
  };

  const handlePaySelected = () => {
    if (selectedCharges.length === 0) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى اختيار مدفوعات للدفع' : 'Please select payments to pay'
      );
      return;
    }

    setShowMultiPayment(true);
  };

  const handleSinglePayment = (charge: Charge) => {
    setSelectedCharges([charge.id]);
    setShowHowToPay(true);
  };

  const handlePaymentReported = (paymentType: 'full' | 'partial', amount?: number) => {
    const paymentAmount = paymentType === 'full' ? selectedCharges.reduce((sum, id) => {
      const charge = mockResidentCharges.find(c => c.id === id);
      return sum + (charge?.totalAmount || 0);
    }, 0) : amount;
    
    // Update local charges state to show payments as pending
    const updatedCharges = mockResidentCharges.map(charge => {
      if (selectedCharges.includes(charge.id)) {
        const chargeAmount = paymentType === 'full' ? charge.totalAmount : (amount || 0) / selectedCharges.length;
        return {
          ...charge,
          status: 'pending' as const, // Show as pending
          paymentReported: true,
          reportedAmount: chargeAmount,
          reportedType: paymentType,
          reportedAt: new Date().toISOString(),
        };
      }
      return charge;
    });
    
    setMockResidentCharges(updatedCharges);
    
    // Save to storage
    AsyncStorage.setItem('residentCharges', JSON.stringify(updatedCharges));
    
    Alert.alert(
      language === 'ar' ? 'دفعة في الانتظار' : 'Payment Pending',
      language === 'ar' 
        ? `دفعة بمبلغ ${formatCurrency(paymentAmount || 0)} في انتظار تأكيد المالك.\n\nسيتم إشعارك عند التأكيد وإضافتها لسجل المدفوعات.`
        : `Payment of ${formatCurrency(paymentAmount || 0)} is pending landlord confirmation.\n\nYou will be notified when confirmed and added to payment history.`,
      [
        {
          text: language === 'ar' ? 'موافق' : 'OK',
          onPress: () => {
            setSelectedCharges([]);
            setShowHowToPay(false);
            setShowMultiPayment(false);
            // Refresh charges from storage
            setRefreshKey(prev => prev + 1);
          },
        },
      ]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    title: {
      fontSize: fontSize.xl,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
      textAlign: isRTL ? 'right' : 'left',
    },
    sectionCard: {
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.card,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.md,
    },
    multiSelectHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.lg,
    },
    multiSelectInfo: {
      flex: 1,
    },
    multiSelectTitle: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.xs,
    },
    multiSelectTotal: {
      fontSize: fontSize.lg,
      color: colors.primary,
      fontFamily: numberFont,
      textAlign: isRTL ? 'right' : 'left',
    },
    paymentItem: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    paymentHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentLabel: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: spacing.xs,
    },
    paymentMeta: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    paymentDate: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontFamily: numberFont,
    },
    paymentAmount: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    amountText: {
      fontSize: fontSize.md,
      color: colors.textPrimary,
      fontFamily: numberFont,
      fontWeight: '600',
    },
    paymentActions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    selectButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    selectButtonUnselected: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    historyItem: {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    historyHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    historyInfo: {
      flex: 1,
    },
    historyLabel: {
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: 2,
    },
    historyDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontFamily: numberFont,
      textAlign: isRTL ? 'right' : 'left',
    },
    historyAmount: {
      fontSize: fontSize.sm,
      color: colors.success,
      fontFamily: numberFont,
      fontWeight: '600',
    },
    noPayments: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.md,
    },
    noPaymentsText: {
      fontSize: fontSize.md,
      color: colors.success,
      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
      textAlign: 'center',
    },
    noPaymentHistory: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.md,
    },
    noPaymentHistoryText: {
      fontSize: fontSize.md,
    },
    bulkPaymentActions: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bulkPaymentButton: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    sectionHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    sectionHeaderTitle: {
      fontSize: fontSize.lg,
      color: colors.textPrimary,
      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
    },
    sectionHeaderCount: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontFamily: 'monospace',
    },
    expandButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surfaceSecondary,
    },
  });

  const upcomingCharges = getUpcomingCharges();
  const pendingCharges = getPendingCharges();
  const paidCharges = getPaidCharges();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('payments')}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'ar' ? 'إدارة مدفوعات الإيجار' : 'Manage your rent payments'}
          </Text>
        </View>

        {/* Multi-Select Header */}
        {selectedCharges.length > 0 && (
          <View style={styles.multiSelectHeader}>
            <View style={styles.multiSelectInfo}>
              <Text style={styles.multiSelectTitle}>
                {language === 'ar' 
                  ? `${selectedCharges.length} مدفوعات محددة`
                  : `${selectedCharges.length} payments selected`
                }
              </Text>
              <Text style={styles.multiSelectTotal}>
                {language === 'ar' ? 'الإجمالي: ' : 'Total: '}{formatCurrency(getSelectedChargesTotal())}
              </Text>
            </View>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
              <Button
                title={language === 'ar' ? 'إلغاء' : 'Clear'}
                onPress={() => setSelectedCharges([])}
                variant="secondary"
                size="sm"
              />
              <Button
                title={language === 'ar' ? 'دفع المحدد' : 'Pay Selected'}
                onPress={handlePaySelected}
                variant="primary"
                size="sm"
              />
            </View>
          </View>
        )}

        {/* Upcoming Payments */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => toggleSection('upcoming')}
            activeOpacity={0.7}
          >
            <View style={[styles.sectionHeaderLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.sectionHeaderTitle}>
                {language === 'ar' ? 'المدفوعات المستحقة' : 'Due Payments'}
              </Text>
              <Text style={styles.sectionHeaderCount}>
                ({upcomingCharges.length})
              </Text>
            </View>
            <TouchableOpacity style={styles.expandButton} activeOpacity={0.7}>
              {expandedSections.upcoming ? (
                <ChevronUp size={16} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>

          {expandedSections.upcoming && upcomingCharges.map((charge) => {
            const isSelected = selectedCharges.includes(charge.id);
            
            return (
              <View key={charge.id} style={styles.paymentItem}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>
                      {charge.label}
                    </Text>
                    <View style={styles.paymentMeta}>
                      <Calendar size={16} color={colors.textSecondary} />
                      <Text style={styles.paymentDate}>
                        {getRelativeDate(charge.dueDate)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={styles.amountText}>
                      {formatCurrency(charge.totalAmount)}
                    </Text>
                    <StatusChip status={charge.status} size="sm" />
                  </View>
                </View>
                
                <View style={styles.paymentActions}>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      isSelected ? styles.selectButtonSelected : styles.selectButtonUnselected
                    ]}
                    onPress={() => toggleChargeSelection(charge.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && <Check size={16} color={colors.surface} />}
                  </TouchableOpacity>
                  
                  <Button
                    title={language === 'ar' ? 'ادفع الآن' : 'Pay Now'}
                    onPress={() => handleSinglePayment(charge)}
                    variant={charge.status === 'overdue' ? 'danger' : 'primary'}
                    size="sm"
                  />
                </View>
              </View>
            );
          })}

          {expandedSections.upcoming && upcomingCharges.length === 0 && (
            <View style={styles.noPayments}>
              <CheckCircle size={48} color={colors.success} />
              <Text style={styles.noPaymentsText}>
                {language === 'ar' ? 'جميع المدفوعات محدثة!' : 'All payments are up to date!'}
              </Text>
            </View>
          )}
        </Card>

        {/* Pending Payments */}
        {pendingCharges.length > 0 && (
          <Card style={styles.sectionCard}>
            <TouchableOpacity
              style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => toggleSection('pending')}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionHeaderLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.sectionHeaderTitle}>
                  {language === 'ar' ? 'المدفوعات في الانتظار' : 'Pending Payments'}
                </Text>
                <Text style={styles.sectionHeaderCount}>
                  ({pendingCharges.length})
                </Text>
              </View>
              <TouchableOpacity style={styles.expandButton} activeOpacity={0.7}>
                {expandedSections.pending ? (
                  <ChevronUp size={16} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={16} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>

            {expandedSections.pending && pendingCharges.map((charge) => (
              <View key={charge.id} style={styles.paymentItem}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>
                      {charge.label}
                    </Text>
                    <View style={styles.paymentMeta}>
                      <Calendar size={16} color={colors.textSecondary} />
                      <Text style={styles.paymentDate}>
                        {language === 'ar' ? 'في انتظار التأكيد' : 'Awaiting confirmation'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={styles.amountText}>
                      {formatCurrency(charge.totalAmount)}
                    </Text>
                    <StatusChip status={charge.status} size="sm" />
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Payment History */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => toggleSection('paid')}
            activeOpacity={0.7}
          >
            <View style={[styles.sectionHeaderLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.sectionHeaderTitle}>
                {language === 'ar' ? 'تاريخ المدفوعات' : 'Payment History'}
              </Text>
              <Text style={styles.sectionHeaderCount}>
                ({paidCharges.length})
              </Text>
            </View>
            <TouchableOpacity style={styles.expandButton} activeOpacity={0.7}>
              {expandedSections.paid ? (
                <ChevronUp size={16} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>

          {expandedSections.paid && paidCharges.length > 0 ? paidCharges.map((charge) => (
            <View key={charge.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <CheckCircle size={20} color={colors.success} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyLabel}>
                    {charge.label}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(charge.dueDate)}
                  </Text>
                </View>
                <Text style={styles.historyAmount}>
                  {formatCurrency(charge.totalAmount)}
                </Text>
              </View>
            </View>
          )) : (
            expandedSections.paid && <View style={styles.noPaymentHistory}>
              <CheckCircle size={32} color={colors.textMuted} />
              <Text
                style={[
                  styles.noPaymentHistoryText,
                  {
                    color: colors.textMuted,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                  },
                ]}
              >
                {language === 'ar' ? 'لا توجد مدفوعات سابقة' : 'No payment history yet'}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Bulk Payment Actions */}
      {selectedCharges.length > 1 && (
        <View style={styles.bulkPaymentActions}>
          <Button
            title={`${language === 'ar' ? 'دفع' : 'Pay'} ${selectedCharges.length} ${language === 'ar' ? 'مدفوعات' : 'payments'} - ${formatCurrency(getSelectedChargesTotal())}`}
            onPress={handlePaySelected}
            variant="primary"
            style={styles.bulkPaymentButton}
          />
        </View>
      )}

      {/* How to Pay Modal for Single Payment */}
      {selectedCharges.length === 1 && (
        <HowToPayModal
          visible={showHowToPay}
          onClose={() => {
            setShowHowToPay(false);
            setSelectedCharges([]);
          }}
          howToPay={paymentMethods || mockHowToPay}
          amount={mockResidentCharges.find(c => c.id === selectedCharges[0])?.totalAmount || 0}
          chargeId={selectedCharges[0]}
          reference={`${mockResidentUnit.unitLabel}-${selectedCharges[0]}`}
          residentName={user?.fullName || ''}
          unitLabel={mockResidentUnit.unitLabel}
          propertyName={language === 'ar' ? mockResidentProperty.nameAr : mockResidentProperty.nameEn}
          onPaymentReported={handlePaymentReported}
        />
      )}

      {/* How to Pay Modal for Multiple Payments */}
      {selectedCharges.length > 1 && (
        <HowToPayModal
          visible={showMultiPayment}
          onClose={() => {
            setShowMultiPayment(false);
            setSelectedCharges([]);
          }}
          howToPay={paymentMethods || mockHowToPay}
          amount={getSelectedChargesTotal()}
          chargeId={selectedCharges.join(',')}
          reference={`${mockResidentUnit.unitLabel}-MULTI-${Date.now()}`}
          residentName={user?.fullName || ''}
          unitLabel={mockResidentUnit.unitLabel}
          propertyName={language === 'ar' ? mockResidentProperty.nameAr : mockResidentProperty.nameEn}
          onPaymentReported={handlePaymentReported}
        />
      )}
    </SafeAreaView>
  );
}