import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { Alert as CustomAlert, Toast, Loading } from '@/utils/customAlert';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Building2, 
  Calendar, 
  DollarSign,
  FileText,
  Download,
  Share as ShareIcon,
  Eye,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  Clock,
  MapPin,
  Users,
  Star
} from 'lucide-react-native';

// Mock detailed resident data
const mockResidentDetails = {
  'resident1': {
    id: 'resident1',
    personalInfo: {
      fullName: 'محمد أحمد السعيد',
      email: 'mohammed@example.com',
      phoneE164: '+966501234567',
      nationalId: '1234567890',
      dateOfBirth: '1985-03-15',
      nationality: 'SA',
      gender: 'male',
      emergencyContact: {
        name: 'أحمد السعيد',
        phone: '+966501234568',
        relationship: 'والد',
      },
    },
    currentContract: {
      id: 'contract1',
      propertyName: 'برج العلامة',
      unitLabel: 'A-101',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyRent: 2500,
      depositAmount: 5000,
      vatRate: 15,
      totalMonthlyAmount: 2875,
      paymentFrequency: 'monthly',
      status: 'active',
    },
    paymentHistory: [
      {
        id: 'payment1',
        month: 'ديسمبر 2024',
        amount: 2875,
        dueDate: '2024-12-20',
        paidDate: '2024-12-18',
        status: 'paid',
        method: 'bank_transfer',
      },
      {
        id: 'payment2',
        month: 'نوفمبر 2024',
        amount: 2875,
        dueDate: '2024-11-20',
        paidDate: '2024-11-19',
        status: 'paid',
        method: 'bank_transfer',
      },
      {
        id: 'payment3',
        month: 'أكتوبر 2024',
        amount: 2875,
        dueDate: '2024-10-20',
        paidDate: '2024-10-22',
        status: 'paid',
        method: 'bank_transfer',
        lateDays: 2,
      },
      {
        id: 'payment4',
        month: 'يناير 2025',
        amount: 2875,
        dueDate: '2025-01-20',
        status: 'overdue',
        daysPastDue: 5,
      },
    ],
    unitDetails: {
      bedrooms: 2,
      bathrooms: 1,
      hasKitchen: true,
      hasLivingRoom: true,
      floor: 1,
      sizeSqm: 85,
      amenities: ['مكيف', 'موقف سيارة'],
    },
    tenancyHistory: [
      {
        propertyName: 'برج العلامة',
        unitLabel: 'A-101',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        monthlyRent: 2500,
      },
    ],
    notes: 'مستأجر ممتاز، دفع منتظم، لا توجد شكاوى',
  },
};

export default function ResidentProfileScreen() {
  const { language, isRTL, formatDate, formatCurrency } = useLocalization();
  const { colors } = useTheme();
  const router = useRouter();
  const { residentId, residentName } = useLocalSearchParams();
  
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'contract' | 'payments'>('overview');

  // Get resident details (in real app, fetch from API)
  const residentDetails = mockResidentDetails['resident1'];

  const tabs = [
    {
      id: 'overview',
      label: language === 'ar' ? 'نظرة عامة' : 'Overview',
      icon: Eye,
    },
    {
      id: 'contract',
      label: language === 'ar' ? 'العقد' : 'Contract',
      icon: FileText,
    },
    {
      id: 'payments',
      label: language === 'ar' ? 'المدفوعات' : 'Payments',
      icon: DollarSign,
    },
  ];

  const handleExportProfile = async () => {
    // Show loading overlay
    Loading.show(
      language === 'ar' ? 'جاري إنشاء التقرير' : 'Generating Report',
      language === 'ar' ? 'يرجى الانتظار...' : 'Please wait...'
    );
    
    try {
      // Simulate PDF generation with progress
      for (let i = 0; i <= 100; i += 20) {
        Loading.updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // In a real app, generate PDF and share
      const profileData = `
Resident Profile Report
======================

Personal Information:
- Name: ${residentDetails.personalInfo.fullName}
- Phone: ${residentDetails.personalInfo.phoneE164}
- Email: ${residentDetails.personalInfo.email}
- National ID: ${residentDetails.personalInfo.nationalId}

Current Contract:
- Property: ${residentDetails.currentContract.propertyName}
- Unit: ${residentDetails.currentContract.unitLabel}
- Monthly Rent: ${formatCurrency(residentDetails.currentContract.totalMonthlyAmount)}
- Contract Period: ${formatDate(residentDetails.currentContract.startDate)} - ${formatDate(residentDetails.currentContract.endDate)}

Payment Summary:
- Total Payments: ${residentDetails.paymentHistory.filter(p => p.status === 'paid').length}
- On-time Payments: ${residentDetails.paymentHistory.filter(p => p.status === 'paid' && !p.lateDays).length}
- Late Payments: ${residentDetails.paymentHistory.filter(p => p.lateDays).length}
- Outstanding: ${residentDetails.paymentHistory.filter(p => p.status === 'overdue').length}

Generated on: ${formatDate(new Date().toISOString())}
      `;

      // Share the profile data
      await Share.share({
        message: profileData,
        title: `${residentDetails.personalInfo.fullName} - Profile Report`,
      });

      // Hide loading and show success toast
      Loading.hide();
      Toast.success(
        language === 'ar' ? 'تم التصدير بنجاح' : 'Export Successful',
        language === 'ar' 
          ? 'تم إنشاء تقرير الملف الشخصي'
          : 'Profile report generated'
      );
    } catch (error) {
      console.error('Export error:', error);
      Loading.hide();
      CustomAlert.error(
        language === 'ar' ? 'خطأ في التصدير' : 'Export Error',
        language === 'ar' ? 'فشل في إنشاء التقرير' : 'Failed to generate report'
      );
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color={colors.success} />;
      case 'overdue': return <AlertCircle size={16} color={colors.danger} />;
      case 'partial': return <Clock size={16} color={colors.warning} />;
      default: return <Clock size={16} color={colors.textMuted} />;
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Personal Information */}
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.infoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
            <User size={24} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.infoTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
            }]}>
              {residentDetails.personalInfo.fullName}
            </Text>
          </View>

          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {residentDetails.personalInfo.phoneE164}
            </Text>
          </View>

          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: 'Nunito-Regular' 
            }]}>
              {residentDetails.personalInfo.email}
            </Text>
          </View>

          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'رقم الهوية:' : 'National ID:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {residentDetails.personalInfo.nationalId}
            </Text>
          </View>

          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'تاريخ الميلاد:' : 'Date of Birth:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {formatDate(residentDetails.personalInfo.dateOfBirth)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Current Unit */}
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.infoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.infoIcon, { backgroundColor: colors.successLight }]}>
            <Building2 size={24} color={colors.success} />
          </View>
          <Text
            style={[
              styles.infoTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'الوحدة الحالية' : 'Current Unit'}
          </Text>
        </View>

        <View style={styles.unitSummary}>
          <Text
            style={[
              styles.unitName,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {residentDetails.currentContract.propertyName} - {residentDetails.currentContract.unitLabel}
          </Text>
          <Text
            style={[
              styles.unitSpecs,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {residentDetails.unitDetails.bedrooms} {language === 'ar' ? 'غرف نوم' : 'bedrooms'} • {residentDetails.unitDetails.bathrooms} {language === 'ar' ? 'حمامات' : 'bathrooms'} • {residentDetails.unitDetails.sizeSqm} {language === 'ar' ? 'م²' : 'sqm'}
          </Text>
          <Text
            style={[
              styles.rentAmount,
              {
                color: colors.primary,
                fontFamily: 'monospace',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {formatCurrency(residentDetails.currentContract.totalMonthlyAmount)} {language === 'ar' ? 'شهرياً' : '/month'}
          </Text>
        </View>
      </Card>

      {/* Emergency Contact */}
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.infoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.infoIcon, { backgroundColor: colors.warningLight }]}>
            <Phone size={24} color={colors.warning} />
          </View>
          <Text
            style={[
              styles.infoTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'جهة الاتصال الطارئة' : 'Emergency Contact'}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'الاسم:' : 'Name:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
            }]}>
              {residentDetails.personalInfo.emergencyContact.name}
            </Text>
          </View>

          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'الهاتف:' : 'Phone:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {residentDetails.personalInfo.emergencyContact.phone}
            </Text>
          </View>

          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.infoLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'العلاقة:' : 'Relationship:'}
            </Text>
            <Text style={[styles.infoValue, { 
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
            }]}>
              {residentDetails.personalInfo.emergencyContact.relationship}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderContractTab = () => (
    <View style={styles.tabContent}>
      <Card style={[styles.contractCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.contractHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.contractIcon, { backgroundColor: colors.successLight }]}>
            <FileText size={32} color={colors.success} />
          </View>
          <View style={styles.contractInfo}>
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
              {language === 'ar' ? 'عقد الإيجار النشط' : 'Active Lease Contract'}
            </Text>
            <Text
              style={[
                styles.contractId,
                {
                  color: colors.textSecondary,
                  fontFamily: 'monospace',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'رقم العقد: ' : 'Contract ID: '}{residentDetails.currentContract.id}
            </Text>
          </View>
          <View style={[styles.contractStatus, { backgroundColor: colors.success }]}>
            <CheckCircle size={16} color={colors.surface} />
            <Text style={[styles.contractStatusText, { color: colors.surface }]}>
              {language === 'ar' ? 'نشط' : 'Active'}
            </Text>
          </View>
        </View>

        <View style={styles.contractDetails}>
          <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.contractLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'تاريخ البداية:' : 'Start Date:'}
            </Text>
            <Text style={[styles.contractValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {formatDate(residentDetails.currentContract.startDate)}
            </Text>
          </View>

          <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.contractLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'تاريخ النهاية:' : 'End Date:'}
            </Text>
            <Text style={[styles.contractValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {formatDate(residentDetails.currentContract.endDate)}
            </Text>
          </View>

          <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.contractLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'الإيجار الأساسي:' : 'Base Rent:'}
            </Text>
            <Text style={[styles.contractValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {formatCurrency(residentDetails.currentContract.monthlyRent)}
            </Text>
          </View>

          <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.contractLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'ضريبة القيمة المضافة:' : 'VAT:'}
            </Text>
            <Text style={[styles.contractValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {residentDetails.currentContract.vatRate}%
            </Text>
          </View>

          <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.contractLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'الإجمالي الشهري:' : 'Total Monthly:'}
            </Text>
            <Text style={[styles.contractValue, styles.totalAmount, { 
              color: colors.primary,
              fontFamily: 'monospace' 
            }]}>
              {formatCurrency(residentDetails.currentContract.totalMonthlyAmount)}
            </Text>
          </View>

          <View style={[styles.contractRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.contractLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'مبلغ التأمين:' : 'Security Deposit:'}
            </Text>
            <Text style={[styles.contractValue, { 
              color: colors.textPrimary,
              fontFamily: 'monospace' 
            }]}>
              {formatCurrency(residentDetails.currentContract.depositAmount)}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderPaymentsTab = () => (
    <View style={styles.tabContent}>
      <Card style={[styles.paymentsCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.paymentsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.paymentsIcon, { backgroundColor: colors.primaryLight }]}>
            <DollarSign size={24} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.paymentsTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تاريخ المدفوعات' : 'Payment History'}
          </Text>
        </View>

        <View style={styles.paymentsList}>
          {residentDetails.paymentHistory.map((payment) => (
            <View key={payment.id} style={[styles.paymentItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.paymentIcon}>
                {getPaymentStatusIcon(payment.status)}
              </View>
              <View style={styles.paymentDetails}>
                <Text
                  style={[
                    styles.paymentMonth,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {payment.month}
                </Text>
                <Text
                  style={[
                    styles.paymentDueDate,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'مستحق: ' : 'Due: '}{formatDate(payment.dueDate)}
                </Text>
                {payment.paidDate && (
                  <Text
                    style={[
                      styles.paymentPaidDate,
                      {
                        color: colors.success,
                        fontFamily: 'monospace',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'مدفوع: ' : 'Paid: '}{formatDate(payment.paidDate)}
                  </Text>
                )}
                {payment.lateDays && (
                  <Text
                    style={[
                      styles.paymentLate,
                      {
                        color: colors.warning,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? `متأخر ${payment.lateDays} أيام` : `${payment.lateDays} days late`}
                  </Text>
                )}
                {payment.daysPastDue && (
                  <Text
                    style={[
                      styles.paymentOverdue,
                      {
                        color: colors.danger,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? `متأخر ${payment.daysPastDue} أيام` : `${payment.daysPastDue} days overdue`}
                  </Text>
                )}
              </View>
              <View style={styles.paymentAmount}>
                <Text
                  style={[
                    styles.paymentAmountText,
                    {
                      color: colors.textPrimary,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'left' : 'right',
                    },
                  ]}
                >
                  {formatCurrency(payment.amount)}
                </Text>
                <StatusChip status={payment.status as any} size="sm" />
              </View>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Card style={[styles.historyCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.historyHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.historyIcon, { backgroundColor: colors.primaryLight }]}>
            <Calendar size={24} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.historyTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تاريخ الإقامة' : 'Tenancy History'}
          </Text>
        </View>

        <View style={styles.historyList}>
          {residentDetails.tenancyHistory.map((tenancy, index) => (
            <View key={index} style={[styles.historyItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.historyItemIcon, { backgroundColor: colors.successLight }]}>
                <Building2 size={20} color={colors.success} />
              </View>
              <View style={styles.historyItemDetails}>
                <Text
                  style={[
                    styles.historyItemTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {tenancy.propertyName} - {tenancy.unitLabel}
                </Text>
                <Text
                  style={[
                    styles.historyItemPeriod,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {formatDate(tenancy.startDate)} - {formatDate(tenancy.endDate)}
                </Text>
                <Text
                  style={[
                    styles.historyItemRent,
                    {
                      color: colors.primary,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {formatCurrency(tenancy.monthlyRent)} {language === 'ar' ? 'شهرياً' : '/month'}
                </Text>
              </View>
              <View style={[styles.historyItemStatus, { backgroundColor: colors.successLight }]}>
                <Text
                  style={[
                    styles.historyItemStatusText,
                    {
                      color: colors.success,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {language === 'ar' ? 'نشط' : 'Active'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Notes */}
      {residentDetails.notes && (
        <Card style={[styles.notesCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.notesTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'ملاحظات' : 'Notes'}
          </Text>
          <Text
            style={[
              styles.notesText,
              {
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {residentDetails.notes}
          </Text>
        </Card>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.profileHeaderContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => router.push('/(tabs)/residents')}
            activeOpacity={0.7}
          >
            {isRTL ? (
              <ArrowRight size={24} color={colors.textPrimary} />
            ) : (
              <ArrowLeft size={24} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
          
          <View style={styles.profileHeaderInfo}>
            <Text
              style={[
                styles.profileTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {residentDetails.personalInfo.fullName}
            </Text>
            <Text
              style={[
                styles.profileSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {residentDetails.currentContract.propertyName} - {residentDetails.currentContract.unitLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={handleExportProfile}
            disabled={isExporting}
            activeOpacity={0.7}
          >
            {isExporting ? (
              <Clock size={20} color={colors.surface} />
            ) : (
              <Download size={20} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabNavigation, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabs, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor: selectedTab === tab.id ? colors.primary : colors.surfaceSecondary,
                },
              ]}
              onPress={() => setSelectedTab(tab.id as any)}
              activeOpacity={0.8}
            >
              <tab.icon 
                size={18} 
                color={selectedTab === tab.id ? colors.surface : colors.primary} 
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === tab.id ? colors.surface : colors.primary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'contract' && renderContractTab()}
        {selectedTab === 'payments' && renderPaymentsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeaderContent: {
    padding: spacing.lg,
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
  profileHeaderInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  profileSubtitle: {
    fontSize: fontSize.md,
  },
  exportButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabNavigation: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.xs,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    flexShrink: 1,
    numberOfLines: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  tabContent: {
    gap: spacing.lg,
  },
  infoCard: {
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  infoValue: {
    fontSize: fontSize.sm,
  },
  unitSummary: {
    gap: spacing.sm,
  },
  unitName: {
    fontSize: fontSize.lg,
  },
  unitSpecs: {
    fontSize: fontSize.md,
  },
  rentAmount: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  contractCard: {
    borderRadius: borderRadius.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
  },
  contractHeader: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  contractIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  contractId: {
    fontSize: fontSize.sm,
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
  contractDetails: {
    gap: spacing.md,
  },
  contractRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contractLabel: {
    fontSize: fontSize.md,
    flex: 1,
  },
  contractValue: {
    fontSize: fontSize.md,
  },
  totalAmount: {
    fontWeight: '700',
    fontSize: fontSize.lg,
  },
  paymentsCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  paymentsHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  paymentsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentsTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  paymentsList: {
    gap: spacing.md,
  },
  paymentItem: {
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentMonth: {
    fontSize: fontSize.md,
  },
  paymentDueDate: {
    fontSize: fontSize.sm,
  },
  paymentPaidDate: {
    fontSize: fontSize.sm,
  },
  paymentLate: {
    fontSize: fontSize.xs,
  },
  paymentOverdue: {
    fontSize: fontSize.xs,
  },
  paymentAmount: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  paymentAmountText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  historyCard: {
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  historyHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  historyList: {
    gap: spacing.md,
  },
  historyItem: {
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  historyItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  historyItemTitle: {
    fontSize: fontSize.md,
  },
  historyItemPeriod: {
    fontSize: fontSize.sm,
  },
  historyItemRent: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  historyItemStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  historyItemStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  notesCard: {
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  notesTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  notesText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});