import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { HowToPayModal } from '@/components/payments/HowToPayModal';
import { VerificationBanner } from '@/components/verification/VerificationBanner';
import { VerificationModal } from '@/components/verification/VerificationModal';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuth';
import { useCharges } from '@/hooks/useCharges';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/hooks/useNotifications';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { getCurrentDates, gregorianToHijri, formatHijriDate, dateToHijri } from '@/utils/dateConversion';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Charge, HowToPay, Unit, Contract, HijriDate } from '@/types';
import { Building, Calendar, DollarSign, Bell, TriangleAlert as AlertTriangle, Clock, Phone, MessageSquare, CreditCard, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Building2 } from 'lucide-react-native';

// Import additional icons for quick controls
import { Globe, Moon, Sun } from 'lucide-react-native';

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
// Generate charges based on date system and language
const generateResidentCharges = (dateSystem: 'hijri' | 'gregorian', language: 'ar' | 'en', formatDate: (date: Date | string) => string): Charge[] => {
  const formatDateForSystem = (date: Date): string => {
    if (dateSystem === 'hijri') {
      const hijriResult = gregorianToHijri(date);
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
    dueDate: '2024-12-20',
    amount: 2500,
    vatAmount: 375,
    totalAmount: 2875,
    label: getMonthLabel(-2, new Date('2024-12-20')),
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

export default function ResidentDashboardScreen() {
  const { t, language, isRTL, formatDate, formatDateTime, dateSystem, isRamadan: isCurrentlyRamadan, gregorianToHijri, formatHijriDate, getCurrentBothDates, numberFont, formatCurrency, setLanguage, toggleDateSystem } = useLocalization();
  const { user, needsVerification } = useAuth();
  const { charges, getUpcomingCharges, getOverdueCharges } = useCharges();
  const { colors, isDark, toggleTheme, mode } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [mockResidentCharges, setMockResidentCharges] = useState(() => generateResidentCharges(dateSystem, language));
  const [showHowToPay, setShowHowToPay] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'phone' | 'email'>('phone');
  const { paymentMethods } = usePaymentMethods();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

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

  const toggleLanguage = () => {
    console.log('🌐 Language toggle clicked, current:', language);
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    console.log('✅ Language changed to:', newLanguage);
  };

  const handleDateSystemToggle = async () => {
    console.log('📅 Date system toggle clicked, current:', dateSystem);
    const result = await toggleDateSystem();
    if (result.success) {
      console.log('✅ Date system toggled successfully to:', result.newDateSystem);
    } else {
      console.error('❌ Date system toggle failed:', result.error);
    }
  };

  const handleThemeToggle = () => {
    console.log('🎨 Theme toggle clicked, current mode:', mode);
    toggleTheme();
    console.log('✅ Theme toggled');
  };

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

  const handlePayNow = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowHowToPay(true);
  };

  const handlePaymentReported = (paymentType: 'full' | 'partial', amount?: number) => {
    const paymentAmount = paymentType === 'full' ? selectedCharge?.totalAmount : amount;
    
    // Update local charges state to show payment as pending
    if (selectedCharge) {
      const updatedCharges = mockResidentCharges.map(charge => {
        if (charge.id === selectedCharge.id) {
          return {
            ...charge,
            status: 'pending' as const, // Show as pending
            paymentReported: true,
            reportedAmount: paymentAmount || 0,
            reportedType: paymentType,
            reportedAt: new Date().toISOString(),
          };
        }
        return charge;
      });
      
      setMockResidentCharges(updatedCharges);
      
      // Save to storage
      AsyncStorage.setItem('residentCharges', JSON.stringify(updatedCharges));
    }
    
    Alert.alert(
      language === 'ar' ? 'دفعة في الانتظار' : 'Payment Pending',
      language === 'ar' 
        ? `دفعة بمبلغ ${formatCurrency(paymentAmount || 0)} في انتظار تأكيد المالك.\n\nسيتم إشعارك عند تأكيد الاستلام وإضافتها لسجل المدفوعات.`
        : `Payment of ${formatCurrency(paymentAmount || 0)} is pending landlord confirmation.\n\nYou will be notified when confirmed and it will be added to your payment history.`,
      [
        {
          text: language === 'ar' ? 'موافق' : 'OK',
          onPress: () => {
            setSelectedCharge(null);
            setShowHowToPay(false);
            // Refresh charges from storage
            setRefreshKey(prev => prev + 1);
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <>
        {/* Header */}
        <View style={styles.header}>
          {/* Quick Controls */}
          <View style={[styles.quickControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
              onPress={handleDateSystemToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.controlButtonText, { 
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
              }]}>
                {dateSystem === 'hijri' ? (language === 'ar' ? 'هجري' : 'Hijri') : (language === 'ar' ? 'ميلادي' : 'Gregorian')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
              onPress={handleThemeToggle} 
              activeOpacity={0.7}
            >
              {isDark ? (
                <Sun size={18} color={colors.textSecondary} />
              ) : (
                <Moon size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]} 
              onPress={toggleLanguage} 
              activeOpacity={0.7}
            >
              <Globe size={18} color={colors.textSecondary} />
              <Text style={[styles.controlButtonText, { 
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
              }]}>
                {language === 'ar' ? 'EN' : 'عر'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text
            style={[
              styles.currentDate,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {formatDate(new Date())}
            {isCurrentlyRamadan && language === 'ar' && ' - رمضان مبارك 🌙'}
          </Text>
          <Logo size="md" style={styles.logo} />
          <Text
            style={[
              styles.appTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'حلالي' : 'Halali'}
          </Text>
          
          <Text
            style={[
              styles.welcomeUser,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'مرحباً' : 'Welcome'} {user ? (language === 'ar' ? user.fullNameAr || user.fullName : user.fullNameEn || user.fullName) : ''}
          </Text>
          </View>
        </View>

        {/* Overdue Alerts */}
        {getOverdueCharges().length > 0 && (
          <Card style={[styles.alertCard, { 
            backgroundColor: colors.surface,
            borderLeftColor: colors.danger 
          }]}>
            <View style={[styles.alertHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <AlertCircle size={20} color={colors.danger} />
              <Text
                style={[
                  styles.alertTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'تذكير دفع' : 'Payment Reminder'}
              </Text>
            </View>
            <Text
              style={[
                styles.alertText,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' 
                ? `لديك ${getOverdueCharges().length} مدفوعات مستحقة. يرجى المراجعة والدفع.`
                : `You have ${getOverdueCharges().length} payments due. Please review and pay.`
              }
            </Text>
          </Card>
        )}

        {/* Verification Banner */}
        {needsVerification() && (
          <VerificationBanner
            onVerifyPhone={() => {
              setVerificationType('phone');
              setShowVerificationModal(true);
            }}
            onVerifyEmail={() => {
              setVerificationType('email');
              setShowVerificationModal(true);
            }}
          />
        )}

        {/* Payment Status Notifications */}
        {notifications.length > 0 && (
          <View style={styles.notificationsSection}>
            <Card style={[styles.notificationsCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.notificationsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Bell size={16} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.notificationsTitle,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </Text>
                {unreadCount > 0 && (
                  <View style={[styles.notificationsBadge, { backgroundColor: colors.danger }]}>
                    <Text style={[styles.notificationsBadgeText, { color: colors.surface }]}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              
              {notifications.slice(0, 2).map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.subtleNotificationItem,
                    !notification.read && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => markAsRead(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.subtleNotificationContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={styles.subtleNotificationIcon}>
                      {notification.type === 'payment_confirmed' && (
                        <CheckCircle size={12} color={colors.success} />
                      )}
                      {notification.type === 'payment_rejected' && (
                        <AlertCircle size={12} color={colors.danger} />
                      )}
                      {notification.type === 'payment_reminder' && (
                        <Clock size={12} color={colors.warning} />
                      )}
                    </View>
                    <View style={styles.subtleNotificationText}>
                      <Text
                        style={[
                          styles.subtleNotificationTitle,
                          {
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {notification.title}
                      </Text>
                      <Text
                        style={[
                          styles.subtleNotificationMessage,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {notification.message}
                      </Text>
                    </View>
                    {!notification.read && (
                      <View style={[styles.subtleUnreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {notifications.length > 2 && (
                <TouchableOpacity
                  style={styles.subtleViewAllButton}
                  onPress={() => setShowAllNotifications(!showAllNotifications)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.subtleViewAllText,
                      {
                        color: colors.textMuted,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: 'center',
                      }
                    ]}
                  >
                    {showAllNotifications
                      ? (language === 'ar' ? 'إخفاء' : 'Hide')
                      : (language === 'ar' 
                        ? `+${notifications.length - 2} أخرى`
                        : `+${notifications.length - 2} more`)
                    }
                  </Text>
                </TouchableOpacity>
              )}

              {/* Expanded Notifications */}
              {showAllNotifications && notifications.length > 2 && (
                <View style={styles.expandedNotifications}>
                  {notifications.slice(2).map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.subtleNotificationItem,
                        !notification.read && { backgroundColor: colors.primaryLight },
                      ]}
                      onPress={() => markAsRead(notification.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.subtleNotificationContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View style={styles.subtleNotificationIcon}>
                          {notification.type === 'payment_confirmed' && (
                            <CheckCircle size={12} color={colors.success} />
                          )}
                          {notification.type === 'payment_rejected' && (
                            <AlertCircle size={12} color={colors.danger} />
                          )}
                          {notification.type === 'payment_reminder' && (
                            <Clock size={12} color={colors.warning} />
                          )}
                        </View>
                        <View style={styles.subtleNotificationText}>
                          <Text
                            style={[
                              styles.subtleNotificationTitle,
                              {
                                color: colors.textPrimary,
                                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                                textAlign: isRTL ? 'right' : 'left',
                              },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {notification.title}
                          </Text>
                          <Text
                            style={[
                              styles.subtleNotificationMessage,
                              {
                                color: colors.textSecondary,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                                textAlign: isRTL ? 'right' : 'left',
                              },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {notification.message}
                          </Text>
                        </View>
                        {!notification.read && (
                          <View style={[styles.subtleUnreadDot, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Unit Information */}
        <Card style={[styles.unitCard, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.unitHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.unitIcon, { backgroundColor: colors.surface }]}>
              <Building2 size={24} color={colors.primary} />
            </View>
            <View style={styles.unitInfo}>
              <Text
                style={[
                  styles.propertyName,
                  {
                    color: colors.primary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'وحدتك' : 'Your Unit'}
              </Text>
              <Text
                style={[
                  styles.unitLabel,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? mockResidentProperty.nameAr : mockResidentProperty.nameEn} - {mockResidentUnit.unitLabel}
              </Text>
              <Text
                style={[
                  styles.unitDetails,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {mockResidentUnit.bedrooms} {language === 'ar' ? 'غرف نوم' : 'bedrooms'} • {mockResidentUnit.bathrooms} {language === 'ar' ? 'حمامات' : 'bathrooms'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Upcoming Payments */}
        <Card style={[styles.paymentsCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'المدفوعات القادمة' : 'Upcoming Payments'}
          </Text>

          {getUpcomingCharges()
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
            })
            .map((charge) => (
            <View key={charge.id} style={styles.paymentItem}>
              <View style={[styles.paymentHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.paymentInfo}>
                  <Text
                    style={[
                      styles.paymentLabel,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {charge.label}
                  </Text>
                  <View style={[styles.paymentMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.paymentDate,
                        {
                          color: colors.textSecondary,
                          fontFamily: 'monospace',
                        },
                      ]}
                    >
                      {getRelativeDate(charge.dueDate)}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentAmount}>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color: colors.textPrimary,
                        fontFamily: 'monospace',
                      },
                    ]}
                  >
                    {formatCurrency(charge.totalAmount)}
                  </Text>
                  <StatusChip status={charge.status} size="sm" />
                </View>
              </View>
              
              <View style={styles.paymentActions}>
                <Button
                  title={language === 'ar' ? 'ادفع الآن' : 'Pay Now'}
                  onPress={() => handlePayNow(charge)}
                  variant={charge.status === 'overdue' ? 'danger' : 'primary'}
                  size="sm"
                />
              </View>
            </View>
          ))}

          {getUpcomingCharges().length === 0 && (
            <View style={styles.noPayments}>
              <CheckCircle size={48} color={colors.success} />
              <Text
                style={[
                  styles.noPaymentsText,
                  {
                    color: colors.success,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                  },
                ]}
              >
                {language === 'ar' ? 'جميع المدفوعات محدثة!' : 'All payments are up to date!'}
              </Text>
            </View>
          )}
        </Card>

        {/* Payment History */}
        <Card style={[styles.lastPaymentCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'آخر دفعة' : 'Last Payment'}
          </Text>

          {(() => {
            const lastPaidCharge = mockResidentCharges
              .filter(c => c.status === 'paid')
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
            
            if (lastPaidCharge) {
              return (
                <View style={styles.lastPaymentItem}>
                  <View style={[styles.lastPaymentHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <CheckCircle size={20} color={colors.success} />
                    <View style={styles.lastPaymentInfo}>
                      <Text
                        style={[
                          styles.lastPaymentLabel,
                          {
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {lastPaidCharge.label}
                      </Text>
                      <Text
                        style={[
                          styles.lastPaymentDate,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {formatDate(lastPaidCharge.dueDate)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.lastPaymentAmount,
                        {
                          color: colors.success,
                          fontFamily: 'monospace',
                        },
                      ]}
                    >
                      {formatCurrency(lastPaidCharge.totalAmount)}
                    </Text>
                  </View>
                </View>
              );
            } else {
              return (
                <View style={styles.noLastPayment}>
                  <Text
                    style={[
                      styles.noLastPaymentText,
                      {
                        color: colors.textMuted,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'لا توجد مدفوعات سابقة' : 'No previous payments'}
                  </Text>
                </View>
              );
            }
          })()}
        </Card>

        {/* Contract Information */}
        <Card style={[styles.contractCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'معلومات العقد' : 'Contract Information'}
          </Text>

          <View style={styles.contractDetails}>
            <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.contractLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'تاريخ البداية:' : 'Start Date:'}
              </Text>
              <Text
                style={[
                  styles.contractValue,
                  {
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                    textAlign: isRTL ? 'left' : 'right',
                  },
                ]}
              >
                {formatDate(mockResidentContract.startDate)}
              </Text>
            </View>

            <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.contractLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'تاريخ النهاية:' : 'End Date:'}
              </Text>
              <Text
                style={[
                  styles.contractValue,
                  {
                    color: colors.textPrimary,
                    fontFamily: 'monospace',
                    textAlign: isRTL ? 'left' : 'right',
                  },
                ]}
              >
                {mockResidentContract.endDate && formatDate(mockResidentContract.endDate)}
              </Text>
            </View>

            <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.contractLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'مبلغ التأمين:' : 'Deposit Amount:'}
              </Text>
              <Text
                style={[
                  styles.contractValue,
                  {
                    color: colors.textPrimary,
                    fontFamily: numberFont,
                    textAlign: isRTL ? 'left' : 'right',
                  },
                ]}
              >
                {formatCurrency(mockResidentContract.depositAmount)}
              </Text>
            </View>
          </View>
        </Card>
        </>
      </ScrollView>

      {/* How to Pay Modal */}
      {selectedCharge && (
        <HowToPayModal
          visible={showHowToPay}
          onClose={() => {
            setShowHowToPay(false);
            setSelectedCharge(null);
          }}
          howToPay={paymentMethods || mockHowToPay}
          amount={selectedCharge.totalAmount}
          chargeId={selectedCharge.id}
          reference={`${mockResidentUnit.unitLabel}-${selectedCharge.id}`}
          residentName={user?.fullName || ''}
          unitLabel={mockResidentUnit.unitLabel}
          propertyName={language === 'ar' ? mockResidentProperty.nameAr : mockResidentProperty.nameEn}
          onPaymentReported={handlePaymentReported}
        />
      )}

      {/* Verification Modal */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type={verificationType}
        phoneNumber={user?.phoneE164}
        email={user?.email}
      />
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
  contentContainer: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  quickControls: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
  welcomeSection: {
    gap: spacing.xs,
  },
  currentDate: {
    fontSize: fontSize.md,
  },
  logo: {
    marginBottom: spacing.xs,
  },
  appTitle: {
    fontSize: fontSize.xl,
  },
  welcomeUser: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  alertCard: {
    borderLeftWidth: 3,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  alertHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertTitle: {
    fontSize: fontSize.md,
    flex: 1,
  },
  alertText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  unitCard: {
    marginBottom: spacing.md,
  },
  unitHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  unitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitInfo: {
    flex: 1,
  },
  unitLabel: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  propertyName: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  unitDetails: {
    fontSize: fontSize.sm,
  },
  paymentsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  paymentItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  paymentHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  paymentMeta: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  paymentDate: {
    fontSize: fontSize.sm,
  },
  paymentAmount: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amountText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  paymentActions: {
    alignItems: 'flex-end',
  },
  noPayments: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  noPaymentsText: {
    fontSize: fontSize.md,
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  lastPaymentCard: {
    marginBottom: spacing.md,
  },
  lastPaymentItem: {
    paddingVertical: spacing.sm,
  },
  lastPaymentHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  lastPaymentInfo: {
    flex: 1,
  },
  lastPaymentLabel: {
    fontSize: fontSize.md,
    marginBottom: 2,
  },
  lastPaymentDate: {
    fontSize: fontSize.sm,
  },
  lastPaymentAmount: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  noLastPayment: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noLastPaymentText: {
    fontSize: fontSize.sm,
  },
  historyItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyLabel: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: fontSize.xs,
  },
  historyAmount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  notificationsSection: {
    marginBottom: spacing.md,
  },
  notificationsCard: {
    borderRadius: borderRadius.card,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationsHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  notificationsTitle: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  notificationsBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  subtleNotificationItem: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  subtleNotificationContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtleNotificationIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtleNotificationText: {
    flex: 1,
  },
  subtleNotificationTitle: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  subtleNotificationMessage: {
    fontSize: fontSize.xs,
    lineHeight: 14,
  },
  subtleUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtleViewAllButton: {
    padding: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  subtleViewAllText: {
    fontSize: fontSize.xs,
  },
  expandedNotifications: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  notificationItem: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  notificationIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  viewAllButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  viewAllText: {
    fontSize: fontSize.sm,
  },
  remainingText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  contractCard: {
    marginBottom: spacing.md,
  },
  contractDetails: {
    gap: spacing.sm,
  },
  contractRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  contractLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  contractValue: {
    fontSize: fontSize.sm,
  },
});