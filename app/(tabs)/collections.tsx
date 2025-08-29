import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuditLog } from '@/hooks/useAuditLog';
import { formatHijriDate, getCurrentDates, dateToHijri, HijriDate } from '@/utils/dateConversion';
import { spacing, fontSize, borderRadius, numberFont } from '@/constants/theme';
import { Charge, PaymentNotification } from '@/types';
import { 
  Search, 
  Filter, 
  CircleCheck as CheckCircle, 
  CircleAlert as AlertCircle, 
  Clock, 
  DollarSign, 
  User, 
  Building2, 
  Calendar,
  Phone,
  MessageSquare,
  Eye,
  Check,
  X,
  RefreshCw
} from 'lucide-react-native';

// Mock charges data with multi-month scenarios
const generateChargesForDateSystem = (dateSystem: 'hijri' | 'gregorian', language: 'ar' | 'en', formatDate: (date: string) => string): (Charge & { 
  residentName: string; 
  residentNameAr: string;
  residentNameEn: string;
  unitLabel: string; 
  propertyName: string;
  propertyNameAr: string;
  propertyNameEn: string;
  residentPhone: string;
  isMultiMonth?: boolean;
  selectedMonths?: string[];
})[] => {
  const getMonthLabel = (monthOffset: number, baseDate: Date): string => {
    const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, baseDate.getDate());
    
    return formatDate(targetDate.toISOString());
  };

  return [
  {
    id: 'charge1',
    contractId: 'contract1',
    dueDate: '2025-01-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: `${language === 'ar' ? 'إيجار' : 'Rent'} ${getMonthLabel(-1, new Date('2025-01-20'))}`,
    status: 'overdue',
    balanceRemaining: 2875,
    residentName: language === 'ar' ? 'محمد أحمد السعيد' : 'Mohammed Ahmed Alsaeed',
    residentNameAr: 'محمد أحمد السعيد',
    residentNameEn: 'Mohammed Ahmed Alsaeed',
    unitLabel: 'A-101',
    propertyName: language === 'ar' ? 'برج العلامة' : 'Al-Alamah Tower',
    propertyNameAr: 'برج العلامة',
    propertyNameEn: 'Al-Alamah Tower',
    residentPhone: '+966501234567',
  },
  {
    id: 'charge2',
    contractId: 'contract1',
    dueDate: '2025-02-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: `${language === 'ar' ? 'إيجار' : 'Rent'} ${getMonthLabel(0, new Date('2025-02-20'))}`,
    status: 'due',
    balanceRemaining: 2875,
    residentName: language === 'ar' ? 'محمد أحمد السعيد' : 'Mohammed Ahmed Alsaeed',
    residentNameAr: 'محمد أحمد السعيد',
    residentNameEn: 'Mohammed Ahmed Alsaeed',
    unitLabel: 'A-101',
    propertyName: language === 'ar' ? 'برج العلامة' : 'Al-Alamah Tower',
    propertyNameAr: 'برج العلامة',
    propertyNameEn: 'Al-Alamah Tower',
    residentPhone: '+966501234567',
  },
  {
    id: 'multi_charge1',
    contractId: 'contract2',
    dueDate: '2025-01-20',
    amount: 7500, // 3 months × 2500
    vatAmount: 1125, // 3 months × 375
    totalAmount: 8625, // 3 months × 2875
    label: `${language === 'ar' ? 'دفعة متعددة الأشهر' : 'Multi-Month Payment'} (${getMonthLabel(0, new Date('2025-01-20'))}-${getMonthLabel(2, new Date('2025-03-20'))})`,
    status: 'due',
    balanceRemaining: 8625,
    residentName: language === 'ar' ? 'فاطمة علي الزهراني' : 'Fatima Ali Alzahrani',
    residentNameAr: 'فاطمة علي الزهراني',
    residentNameEn: 'Fatima Ali Alzahrani',
    unitLabel: 'B-205',
    propertyName: language === 'ar' ? 'مجمع النور السكني' : 'Al-Noor Residential Complex',
    propertyNameAr: 'مجمع النور السكني',
    propertyNameEn: 'Al-Noor Residential Complex',
    residentPhone: '+966509876543',
    isMultiMonth: true,
    selectedMonths: [getMonthLabel(0, new Date('2025-01-20')), getMonthLabel(1, new Date('2025-02-20')), getMonthLabel(2, new Date('2025-03-20'))],
  },
  {
    id: 'charge3',
    contractId: 'contract3',
    dueDate: '2025-01-15',
    amount: 3000,
    vatAmount: 450,
    totalAmount: 3450,
    label: `${language === 'ar' ? 'إيجار' : 'Rent'} ${getMonthLabel(-1, new Date('2025-01-15'))}`,
    status: 'paid',
    balanceRemaining: 0,
    residentName: language === 'ar' ? 'خالد محمد الأحمد' : 'Khalid Mohammed Alahmed',
    residentNameAr: 'خالد محمد الأحمد',
    residentNameEn: 'Khalid Mohammed Alahmed',
    unitLabel: 'C-301',
    propertyName: language === 'ar' ? 'برج العلامة' : 'Al-Alamah Tower',
    propertyNameAr: 'برج العلامة',
    propertyNameEn: 'Al-Alamah Tower',
    residentPhone: '+966512345678',
  },
  {
    id: 'charge4',
    contractId: 'contract4',
    dueDate: '2025-01-25',
    amount: 2800,
    vatAmount: 420,
    totalAmount: 3220,
    label: `${language === 'ar' ? 'إيجار' : 'Rent'} ${getMonthLabel(0, new Date('2025-01-25'))}`,
    status: 'due',
    balanceRemaining: 3220,
    residentName: language === 'ar' ? 'سارة أحمد المحمد' : 'Sara Ahmed Almohammed',
    residentNameAr: 'سارة أحمد المحمد',
    residentNameEn: 'Sara Ahmed Almohammed',
    unitLabel: 'D-402',
    propertyName: language === 'ar' ? 'مجمع النور السكني' : 'Al-Noor Residential Complex',
    propertyNameAr: 'مجمع النور السكني',
    propertyNameEn: 'Al-Noor Residential Complex',
    residentPhone: '+966534567890',
  },
  {
    id: 'charge5',
    contractId: 'contract5',
    dueDate: '2025-01-10',
    amount: 3500,
    vatAmount: 525,
    totalAmount: 4025,
    label: `${language === 'ar' ? 'إيجار' : 'Rent'} ${getMonthLabel(-1, new Date('2025-01-10'))}`,
    status: 'overdue',
    balanceRemaining: 4025,
    residentName: language === 'ar' ? 'عبدالله محمد الغامدي' : 'Abdullah Mohammed Alghamdi',
    residentNameAr: 'عبدالله محمد الغامدي',
    residentNameEn: 'Abdullah Mohammed Alghamdi',
    unitLabel: 'E-501',
    propertyName: language === 'ar' ? 'برج العلامة' : 'Al-Alamah Tower',
    propertyNameAr: 'برج العلامة',
    propertyNameEn: 'Al-Alamah Tower',
    residentPhone: '+966545678901',
  },
  {
    id: 'charge6',
    contractId: 'contract6',
    dueDate: '2024-12-20',
    amount: 2600,
    vatAmount: 390,
    totalAmount: 2990,
    label: `${language === 'ar' ? 'إيجار' : 'Rent'} ${getMonthLabel(-2, new Date('2024-12-20'))}`,
    status: 'paid',
    balanceRemaining: 0,
    residentName: language === 'ar' ? 'نورا علي الشهري' : 'Nora Ali Alshahri',
    residentNameAr: 'نورا علي الشهري',
    residentNameEn: 'Nora Ali Alshahri',
    unitLabel: 'F-602',
    propertyName: language === 'ar' ? 'مجمع النور السكني' : 'Al-Noor Residential Complex',
    propertyNameAr: 'مجمع النور السكني',
    propertyNameEn: 'Al-Noor Residential Complex',
    residentPhone: '+966556789012',
  },
  ];
};

export default function CollectionsScreen() {
  const { language, isRTL, formatDate, dateSystem, addDateSystemUpdateCallback, formatCurrency } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { notifications, confirmPayment, removeNotification } = usePaymentNotifications();
  const { notifyPaymentStatus } = useNotifications();
  const { addAuditLog } = useAuditLog();
  
  const [charges, setCharges] = useState(() => generateChargesForDateSystem(dateSystem, language, formatDate));
  const [refreshKey, setRefreshKey] = useState(0);

  // Update charges when date system changes
  React.useEffect(() => {
    setCharges(generateChargesForDateSystem(dateSystem, language, formatDate));
    setRefreshKey(prev => prev + 1);
  }, [dateSystem, language]);

  // Register for date system updates
  React.useEffect(() => {
    const cleanup = addDateSystemUpdateCallback(() => {
      setCharges(generateChargesForDateSystem(dateSystem, language, formatDate));
      setRefreshKey(prev => prev + 1);
    });
    return cleanup;
  }, [addDateSystemUpdateCallback, dateSystem, language, formatDate]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'due' | 'overdue' | 'paid'>('all');
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [showPaymentDetails, setShowPaymentDetails] = useState<string | null>(null);

  const getFilteredCharges = () => {
    let filtered = charges;
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(c => c.status === selectedFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.residentName.toLowerCase().includes(query) ||
        c.unitLabel.toLowerCase().includes(query) ||
        c.propertyName.toLowerCase().includes(query) ||
        c.label.toLowerCase().includes(query)
      );
    }
    
    // Clear date-based sorting with proper priority
    filtered = filtered.sort((a, b) => {
      // Primary sort: Status priority (overdue first, then due, then paid)
      const statusOrder = { 'overdue': 1, 'due': 2, 'partiallyPaid': 3, 'paid': 4 };
      const aStatusPriority = statusOrder[a.status] || 5;
      const bStatusPriority = statusOrder[b.status] || 5;
      
      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority;
      }
      
      // Secondary sort: Due date (earliest first for overdue/due, latest first for paid)
      const aDate = new Date(a.dueDate).getTime();
      const bDate = new Date(b.dueDate).getTime();
      
      if (a.status === 'paid' && b.status === 'paid') {
        // For paid charges, show most recent first
        return bDate - aDate;
      } else {
        // For overdue/due charges, show earliest due date first
        return aDate - bDate;
      }
    });
    
    return filtered;
  };

  const handleConfirmPayment = async (chargeId: string) => {
    try {
      const charge = charges.find(c => c.id === chargeId);
      if (!charge) return;

      // 1. Update charge status to confirmed/paid and save to storage
      const updatedCharges = charges.map(c => {
        if (c.id === chargeId) {
          const reportedAmount = (c as any).reportedAmount || c.totalAmount;
          const reportedType = (c as any).reportedType || 'full';
          
          if (reportedType === 'full') {
            return { 
              ...c, 
              status: 'paid' as const, 
              balanceRemaining: 0,
              confirmedAt: new Date().toISOString(),
              confirmedBy: user?.fullName || 'Landlord',
              paymentReported: false, // Clear reported flag
            };
          } else {
            const newBalance = c.balanceRemaining - reportedAmount;
            return {
              ...c,
              status: newBalance <= 0 ? 'paid' as const : 'partiallyPaid' as const,
              balanceRemaining: Math.max(0, newBalance),
              confirmedAt: new Date().toISOString(),
              confirmedBy: user?.fullName || 'Landlord',
              paymentReported: false, // Clear reported flag
            };
          }
        }
        return c;
      });
      
      // Save updated charges to storage
      await AsyncStorage.setItem('landlordCharges', JSON.stringify(updatedCharges));
      setCharges(updatedCharges);

      // 2. Update resident's charge data to reflect confirmation
      await updateResidentChargeStatus(chargeId, 'confirmed', (charge as any).reportedAmount || charge.totalAmount, (charge as any).reportedType || 'full');

      // 3. Send notification to resident about payment confirmation
      await notifyPaymentStatus(
        'resident1', // In real app, get from charge/contract data
        'confirmed',
        {
          amount: (charge as any).reportedAmount || charge.totalAmount,
          unitLabel: charge.unitLabel,
          propertyName: charge.propertyName,
          chargeId: charge.id,
          paymentType: (charge as any).reportedType || 'full',
          month: charge.label,
        }
      );

      // 4. Remove from payment notifications queue
      const notification = notifications.find(n => n.chargeId === chargeId);
      if (notification) {
        await confirmPayment(notification.id, true);
      }

      // 5. Add payment to resident's payment history
      await addToPaymentHistory({
        id: `payment_${Date.now()}`,
        chargeId,
        amount: (charge as any).reportedAmount || charge.totalAmount,
        paymentType: (charge as any).reportedType || 'full',
        paidAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        status: 'confirmed',
        method: 'bank_transfer',
        reference: `${charge.unitLabel}-${chargeId}`,
      });

      // 6. Add audit log entry
      await addAuditLog({
        userId: user?.id || 'unknown',
        userName: user?.fullName || 'Unknown User',
        userRole: user?.staffRole || 'manager',
        action: 'payment_accepted',
        entityType: 'payment',
        entityId: chargeId,
        entityName: `${charge.residentName} - ${charge.unitLabel}`,
        details: {
          amount: (charge as any).reportedAmount || charge.totalAmount,
          reason: 'Payment confirmed by landlord/staff',
          notes: `Payment for ${charge.label}`,
        },
      });

      Alert.alert(
        language === 'ar' ? '✅ تم تأكيد استلام الدفعة' : '✅ Payment Receipt Confirmed',
        language === 'ar' 
          ? `تم تأكيد استلام دفعة ${charge.residentName} للوحدة ${charge.unitLabel} وإشعار المستأجر.\n\nتم تحديث حالة الدفعة في النظام.`
          : `Payment from ${charge.residentName} for unit ${charge.unitLabel} confirmed and tenant notified.\n\nPayment status updated in system.`
      );
    } catch (error) {
      console.error('Payment confirmation error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'فشل في تأكيد الدفعة' : 'Failed to confirm payment'
      );
    }
  };

  const handleRejectPayment = async (chargeId: string) => {
    try {
      const charge = charges.find(c => c.id === chargeId);
      if (!charge) return;

      Alert.alert(
        language === 'ar' ? 'رفض الدفعة' : 'Reject Payment',
        language === 'ar' ? 'هل أنت متأكد من رفض هذه الدفعة؟' : 'Are you sure you want to reject this payment?',
        [
          { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
          { 
            text: language === 'ar' ? 'رفض' : 'Reject', 
            style: 'destructive',
            onPress: async () => {
              try {
                // 1. Reset charge status to original unpaid state
                const originalStatus = new Date(charge.dueDate) < new Date() ? 'overdue' : 'due';
                const updatedCharges = charges.map(c => 
                  c.id === chargeId 
                    ? { 
                        ...c, 
                        status: originalStatus,
                        balanceRemaining: c.totalAmount, // Reset to full amount
                        paymentReported: false, // Reset payment reported flag
                        lastPaymentAttempt: undefined, // Clear payment attempt
                      }
                    : c
                );
                setCharges(updatedCharges);

                // 2. Send notification to resident about payment rejection
                await notifyPaymentStatus(
                  'resident1', // In real app, get from charge/contract data
                  'rejected',
                  {
                    amount: charge.totalAmount,
                    unitLabel: charge.unitLabel,
                    propertyName: charge.propertyName,
                    chargeId: charge.id,
                    paymentType: 'full',
                    month: charge.label,
                  }
                );

                // 3. Remove from payment notifications queue
                const notification = notifications.find(n => n.chargeId === chargeId);
                if (notification) {
                  await confirmPayment(notification.id, false);
                }

                // 4. Update charge status in resident's data to reset payment buttons
                await updateResidentChargeStatus(chargeId, 'reset');

                // 5. Add audit log entry
                await addAuditLog({
                  userId: user?.id || 'unknown',
                  userName: user?.fullName || 'Unknown User',
                  userRole: user?.staffRole || 'manager',
                  action: 'payment_declined',
                  entityType: 'payment',
                  entityId: chargeId,
                  entityName: `${charge.residentName} - ${charge.unitLabel}`,
                  details: {
                    amount: charge.totalAmount,
                    reason: 'Payment rejected by landlord/staff',
                    notes: `Payment rejection for ${charge.label}`,
                  },
                });

                Alert.alert(
                  language === 'ar' ? '✅ تم رفض الدفعة' : '✅ Payment Rejected',
                  language === 'ar' 
                    ? `تم رفض دفعة ${charge.residentName} للوحدة ${charge.unitLabel} وإشعار المستأجر.\n\nتم إعادة تعيين حالة الدفعة ويمكن للمستأجر المحاولة مرة أخرى.`
                    : `Payment from ${charge.residentName} for unit ${charge.unitLabel} rejected and tenant notified.\n\nPayment status reset and tenant can try again.`
                );
              } catch (error) {
                console.error('Payment rejection error:', error);
                Alert.alert(
                  language === 'ar' ? 'خطأ' : 'Error',
                  language === 'ar' ? 'فشل في رفض الدفعة' : 'Failed to reject payment'
                );
              }
            },
          },
        ],
        {
          cancelable: true,
        }
      );
    } catch (error) {
      console.error('Payment rejection error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ أثناء رفض الدفعة' : 'An error occurred while rejecting payment'
      );
    }
  };

  const handleContactResident = (phone: string, method: 'call' | 'whatsapp' | 'sms') => {
    const url = method === 'call' ? `tel:${phone}` : 
                method === 'whatsapp' ? `whatsapp://send?phone=${phone}` :
                `sms:${phone}`;
    // In a real app, use Linking.openURL(url)
    console.log(`Contacting ${phone} via ${method}`);
  };

  // Helper function to update resident's charge status
  const updateResidentChargeStatus = async (
    chargeId: string, 
    action: 'confirmed' | 'reset',
    amount?: number,
    paymentType?: 'full' | 'partial'
  ) => {
    try {
      // Update resident's charge data in storage
      const residentCharges = await AsyncStorage.getItem('residentCharges');
      if (residentCharges) {
        const charges = JSON.parse(residentCharges);
        const updatedCharges = charges.map((charge: any) => {
          if (charge.id === chargeId) {
            if (action === 'confirmed') {
              if (paymentType === 'full') {
                return {
                  ...charge,
                  status: 'paid',
                  balanceRemaining: 0,
                  confirmedAt: new Date().toISOString(),
                  paymentReported: false, // Clear pending flag
                };
              } else if (paymentType === 'partial' && amount) {
                const newBalance = charge.balanceRemaining - amount;
                return {
                  ...charge,
                  status: newBalance <= 0 ? 'paid' : 'partiallyPaid',
                  balanceRemaining: Math.max(0, newBalance),
                  confirmedAt: new Date().toISOString(),
                  paymentReported: false, // Clear pending flag
                };
              }
            } else if (action === 'reset') {
              const originalStatus = new Date(charge.dueDate) < new Date() ? 'overdue' : 'due';
              return {
                ...charge,
                status: originalStatus,
                balanceRemaining: charge.totalAmount,
                paymentReported: false,
              };
            }
          }
          return charge;
        });
        
        await AsyncStorage.setItem('residentCharges', JSON.stringify(updatedCharges));
      }
      
      console.log(`📱 Updating resident charge status: ${chargeId} - ${action}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to update resident charge status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Helper function to add payment to resident's payment history
  const addToPaymentHistory = async (payment: any) => {
    try {
      const existingHistory = await AsyncStorage.getItem('residentPaymentHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(payment);
      await AsyncStorage.setItem('residentPaymentHistory', JSON.stringify(history));
      
      console.log('💰 Payment added to resident history:', payment.id);
      return { success: true };
    } catch (error) {
      console.error('Failed to add payment to history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'due': return colors.primary;
      case 'overdue': return colors.danger;
      case 'partiallyPaid': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const filters = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All', count: charges.length },
    { id: 'overdue', label: language === 'ar' ? 'متأخر' : 'Overdue', count: charges.filter(c => c.status === 'overdue').length },
    { id: 'due', label: language === 'ar' ? 'مستحق' : 'Due', count: charges.filter(c => c.status === 'due').length },
    { id: 'paid', label: language === 'ar' ? 'مدفوع' : 'Paid', count: charges.filter(c => c.status === 'paid').length },
  ];

  const filteredCharges = getFilteredCharges();
  const totalDue = filteredCharges.filter(c => c.status === 'due' || c.status === 'overdue').reduce((sum, c) => sum + c.totalAmount, 0);
  const totalOverdue = filteredCharges.filter(c => c.status === 'overdue').reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Clean Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'left' : 'right',
              },
            ]}
          >
            {language === 'ar' ? 'التحصيلات' : 'Collections'}
          </Text>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              setCharges(generateChargesForDateSystem(dateSystem, language, formatDate));
              Alert.alert(
                language === 'ar' ? 'تم التحديث' : 'Refreshed',
                language === 'ar' ? 'تم تحديث البيانات' : 'Data refreshed'
              );
            }}
            activeOpacity={0.7}
          >
            <RefreshCw size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Summary Stats - Subtle */}
        <View style={[styles.summaryStats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary, fontFamily: 'monospace' }]}>
              {formatCurrency(totalDue)}
            </Text>
            <Text style={[styles.statLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'إجمالي المستحقات' : 'Total Due'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.danger, fontFamily: 'monospace' }]}>
              {formatCurrency(totalOverdue)}
            </Text>
            <Text style={[styles.statLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'المتأخرات' : 'Overdue'}
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filters - Minimal */}
      <View style={styles.controlsSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={[styles.filters, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedFilter === filter.id ? colors.primary : colors.surface,
                    borderColor: selectedFilter === filter.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id as any)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedFilter === filter.id ? colors.surface : colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                    },
                  ]}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Collections List - Clean & Organized */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {filteredCharges.map((charge) => (
          <View key={charge.id} style={[styles.chargeItem, { backgroundColor: colors.surface }]}>
            {/* Main Charge Info */}
            <View style={[styles.chargeHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.chargeMainInfo}>
                <View style={[styles.chargeTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text
                    style={[
                      styles.residentName,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {charge.residentName}
                  </Text>
                  <StatusChip status={charge.status} size="sm" />
                </View>
                
                <View style={[styles.chargeMetaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.metaItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Building2 size={12} color={colors.textMuted} />
                    <Text style={[styles.metaText, { 
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                    }]}>
                      {charge.propertyName} - {charge.unitLabel}
                    </Text>
                  </View>
                  <View style={[styles.metaItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Calendar size={12} color={colors.textMuted} />
                    <Text style={[styles.metaText, { 
                      color: colors.textSecondary,
                      fontFamily: 'monospace'
                    }]}>
                      {formatDate(charge.dueDate)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.chargeAmount}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color: colors.textPrimary,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'left' : 'right',
                    },
                  ]}
                >
                  {formatCurrency(charge.totalAmount)}
                </Text>
                {charge.isMultiMonth && (
                  <View style={[styles.multiMonthBadge, { backgroundColor: colors.warningLight }]}>
                    <Text style={[styles.multiMonthText, { 
                      color: colors.warning,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
                    }]}>
                      {language === 'ar' ? 'متعدد' : 'Multi'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Multi-Month Details - Subtle */}
            {charge.isMultiMonth && charge.selectedMonths && (
              <View style={[styles.multiMonthDetails, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.multiMonthTitle, {
                  color: colors.warning,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                  textAlign: isRTL ? 'right' : 'left',
                }]}>
                  {language === 'ar' ? 'الأشهر:' : 'Months:'}
                </Text>
                <View style={styles.monthsList}>
                  {charge.selectedMonths.map((month, index) => (
                    <Text key={index} style={[styles.monthItem, {
                      color: colors.warning,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    }]}>
                      {month}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons - Minimal */}
            <View style={[styles.actionButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => handleContactResident(charge.residentPhone, 'call')}
                activeOpacity={0.7}
              >
                <Phone size={14} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                onPress={() => handleContactResident(charge.residentPhone, 'whatsapp')}
                activeOpacity={0.7}
              >
                <MessageSquare size={14} color={colors.success} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowPaymentDetails(showPaymentDetails === charge.id ? null : charge.id)}
                activeOpacity={0.7}
              >
                <Eye size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {charge.status !== 'paid' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                    onPress={() => handleConfirmPayment(charge.id)}
                    activeOpacity={0.7}
                  >
                    <Check size={14} color={colors.success} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.dangerLight }]}
                    onPress={() => handleRejectPayment(charge.id)}
                    activeOpacity={0.7}
                  >
                    <X size={14} color={colors.danger} />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Expanded Details - Clean */}
            {showPaymentDetails === charge.id && (
              <View style={[styles.expandedDetails, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.detailsTitle, {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                  textAlign: isRTL ? 'right' : 'left',
                }]}>
                  {language === 'ar' ? 'تفاصيل الدفعة' : 'Payment Details'}
                </Text>
                
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { 
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                    }]}>
                      {language === 'ar' ? 'المبلغ الأساسي:' : 'Base Amount:'}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
                      {formatCurrency(charge.amount)}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { 
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                    }]}>
                      {language === 'ar' ? 'ضريبة القيمة المضافة:' : 'VAT:'}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
                      {formatCurrency(charge.vatAmount)}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { 
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                    }]}>
                      {language === 'ar' ? 'الإجمالي:' : 'Total:'}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.primary, fontFamily: 'monospace' }]}>
                      {formatCurrency(charge.totalAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}

        {filteredCharges.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <DollarSign size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
              textAlign: language === 'ar' ? 'right' : 'left',
            }]}>
              {language === 'ar' ? 'لا توجد نتائج' : 'No Results'}
            </Text>
            <Text style={[styles.emptyText, {
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              textAlign: 'center',
            }]}>
              {searchQuery 
                ? (language === 'ar' ? 'لا توجد نتائج للبحث' : 'No search results')
                : (language === 'ar' ? 'لا توجد مستحقات' : 'No charges available')
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  summaryStats: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  controlsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    minHeight: 20,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterText: {
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  chargeItem: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  chargeHeader: {
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  chargeMainInfo: {
    flex: 1,
  },
  chargeTitleRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  residentName: {
    fontSize: fontSize.md,
    flex: 1,
  },
  chargeMetaRow: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  metaItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  chargeAmount: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amountText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  multiMonthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  multiMonthText: {
    fontSize: fontSize.xs,
  },
  multiMonthDetails: {
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  multiMonthTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  monthsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  monthItem: {
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
  },
  actionButtons: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedDetails: {
    padding: spacing.md,
    borderRadius: 6,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  detailsTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  detailsGrid: {
    gap: spacing.sm,
  },
  detailRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyTitle: {
    fontSize: fontSize.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
  },
});