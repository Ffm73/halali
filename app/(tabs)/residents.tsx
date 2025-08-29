import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useTenants, TenantRecord } from '@/hooks/useTenants';
import { Alert as CustomAlert } from '@/utils/customAlert';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { TenantInvitation, User } from '@/types';
import { Users, UserPlus, Phone, Mail, MessageSquare, Search, Filter, Building2, Calendar, Star, Clock, Eye, Plus, Copy, CircleCheck as CheckCircle, CircleAlert as AlertCircle, ArrowRight, ArrowLeft, Send, X, TrendingUp, Building, Chrome as Home } from 'lucide-react-native';

// Mock resident data with comprehensive information
const mockResidents: (TenantRecord & { 
  currentUnit?: string; 
  currentProperty?: string;
  currentPropertyAr?: string;
  currentPropertyEn?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  monthlyRent?: number;
  lastPaymentDate?: string;
  paymentStatus?: 'current' | 'overdue' | 'partial';
})[] = [
  {
    id: 'resident1',
    userId: 'user1',
    landlordId: 'landlord1',
    fullName: 'محمد أحمد السعيد', // Keep for compatibility
    fullNameAr: 'محمد أحمد السعيد',
    fullNameEn: 'Mohammed Ahmed Alsaeed',
    email: 'mohammed@example.com',
    phoneE164: '+966501234567',
    nationalId: '1234567890',
    nationality: 'SA',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    status: 'active',
    totalContracts: 1,
    currentContracts: 1,
    currentUnit: 'A-101',
    currentProperty: 'برج العلامة', // Keep for compatibility
    currentPropertyAr: 'برج العلامة',
    currentPropertyEn: 'Al-Alamah Tower',
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    monthlyRent: 2875,
    lastPaymentDate: '2024-12-20',
    paymentStatus: 'current',
  },
  {
    id: 'resident2',
    userId: 'user2',
    landlordId: 'landlord1',
    fullName: 'فاطمة علي الزهراني', // Keep for compatibility
    fullNameAr: 'فاطمة علي الزهراني',
    fullNameEn: 'Fatima Ali Alzahrani',
    email: 'fatima@example.com',
    phoneE164: '+966509876543',
    nationalId: '0987654321',
    nationality: 'SA',
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
    status: 'active',
    totalContracts: 1,
    currentContracts: 1,
    currentUnit: 'B-205',
    currentProperty: 'مجمع النور السكني', // Keep for compatibility
    currentPropertyAr: 'مجمع النور السكني',
    currentPropertyEn: 'Al-Noor Residential Complex',
    contractStartDate: '2024-02-01',
    contractEndDate: '2025-01-31',
    monthlyRent: 3450,
    lastPaymentDate: '2025-01-01',
    paymentStatus: 'overdue',
  },
  {
    id: 'resident3',
    userId: 'user3',
    landlordId: 'landlord1',
    fullName: 'خالد محمد الأحمد', // Keep for compatibility
    fullNameAr: 'خالد محمد الأحمد',
    fullNameEn: 'Khalid Mohammed Alahmed',
    email: 'khalid@example.com',
    phoneE164: '+966512345678',
    nationalId: '1122334455',
    nationality: 'SA',
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    status: 'inactive',
    totalContracts: 2,
    currentContracts: 0,
    notes: 'Former resident - excellent payment history',
    lastPaymentDate: '2024-11-20',
    paymentStatus: 'current',
  },
];

// Mock invitations data
const mockInvitations: TenantInvitation[] = [
  {
    id: 'inv1',
    landlordId: 'landlord1',
    landlordName: 'أحمد محمد العلي',
    invitationCode: 'RENT2024001',
    phoneNumber: '+966512345678',
    status: 'pending',
    createdAt: '2025-01-20T09:00:00Z',
    expiresAt: '2025-01-27T09:00:00Z',
    propertyName: 'برج العلامة',
    unitLabel: 'C-301',
  },
  {
    id: 'inv2',
    landlordId: 'landlord1',
    landlordName: 'أحمد محمد العلي',
    invitationCode: 'RENT2024002',
    phoneNumber: '+966523456789',
    status: 'pending',
    createdAt: '2025-01-18T14:00:00Z',
    expiresAt: '2025-01-25T14:00:00Z',
    propertyName: 'مجمع النور السكني',
    unitLabel: 'D-402',
  },
];

export default function ResidentsScreen() {
  const { language, isRTL, formatDate, formatCurrency, t } = useLocalization();
  const { colors } = useTheme();
  const { 
    tenants, 
    getTenantStats, 
    searchTenants 
  } = useTenants();
  const router = useRouter();
  
  const [residents] = useState(mockResidents);
  const [invitations, setInvitations] = useState(mockInvitations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  const stats = {
    totalResidents: residents.length,
    activeResidents: residents.filter(r => r.currentContracts > 0).length,
    inactiveResidents: residents.filter(r => r.currentContracts === 0).length,
    pendingInvitations: invitations.filter(i => i.status === 'pending').length,
  };

  const filters = [
    { 
      id: 'all', 
      label: language === 'ar' ? 'الكل' : 'All',
      icon: Users,
      color: colors.primary,
      count: stats.totalResidents,
    },
    { 
      id: 'active', 
      label: language === 'ar' ? 'نشط' : 'Active',
      icon: Star,
      color: colors.success,
      count: stats.activeResidents,
    },
    { 
      id: 'inactive', 
      label: language === 'ar' ? 'سابق' : 'Former',
      icon: Clock,
      color: colors.textMuted,
      count: stats.inactiveResidents,
    },
  ];

  const getFilteredResidents = () => {
    let filtered = residents;
    
    // Apply status filter
    if (selectedFilter === 'active') {
      filtered = filtered.filter(r => r.currentContracts > 0);
    } else if (selectedFilter === 'inactive') {
      filtered = filtered.filter(r => r.currentContracts === 0);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.fullName.toLowerCase().includes(query) ||
        r.phoneE164.includes(query) ||
        (r.nationalId && r.nationalId.includes(query)) ||
        (r.currentUnit && r.currentUnit.toLowerCase().includes(query)) ||
        (r.currentProperty && r.currentProperty.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const generateInvitationCode = () => {
    return 'RENT' + Date.now().toString().slice(-6);
  };

  const handleSendInvitation = async (method: 'sms' | 'whatsapp') => {
    if (!invitePhone.trim()) {
      CustomAlert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number'
      );
      return;
    }

    if (!invitePhone.startsWith('+') || invitePhone.length < 10) {
      CustomAlert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'تنسيق رقم الهاتف غير صحيح' : 'Invalid phone number format'
      );
      return;
    }

    setIsSendingInvitation(true);

    try {
      const invitationCode = generateInvitationCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      // Create invitation message
      const message = language === 'ar' 
        ? `🏠 مرحباً! تم دعوتك للانضمام كمستأجر في منصة حلالي لإدارة العقارات

🔑 رمز الدعوة: *${invitationCode}*

📱 خطوات التسجيل:
1. حمل تطبيق "حلالي" من متجر التطبيقات
2. اختر "إنشاء حساب جديد"
3. اختر "مستأجر"
4. أدخل رمز الدعوة: ${invitationCode}
5. أكمل بياناتك الشخصية

⏰ ينتهي الرمز خلال 7 أيام
📞 للاستفسار: اتصل بالمالك

مرحباً بك في حلالي! 🎉`
        : `🏠 Hello! You've been invited to join Halali property management platform as a resident

🔑 Invitation Code: *${invitationCode}*

📱 Registration Steps:
1. Download "Halali" app from app store
2. Select "Create New Account"
3. Choose "Tenant"
4. Enter invitation code: ${invitationCode}
5. Complete your personal information

⏰ Code expires in 7 days
📞 For questions: Contact property owner

Welcome to Halali! 🎉`;

      // Create new invitation record
      const newInvitation: TenantInvitation = {
        id: `inv_${Date.now()}`,
        landlordId: 'landlord1',
        landlordName: 'أحمد محمد العلي',
        invitationCode,
        phoneNumber: invitePhone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        propertyName: selectedProperty || 'برج العلامة',
        unitLabel: selectedUnit || 'متاح',
      };

      // Send via selected method
      if (method === 'whatsapp') {
        const whatsappUrl = `whatsapp://send?phone=${invitePhone}&text=${encodeURIComponent(message)}`;
        await Linking.openURL(whatsappUrl);
      } else {
        const smsUrl = `sms:${invitePhone}?body=${encodeURIComponent(message)}`;
        await Linking.openURL(smsUrl);
      }

      // Add to invitations list
      setInvitations(prev => [...prev, newInvitation]);

      Alert.alert(
        language === 'ar' ? '✅ تم الإرسال بنجاح' : '✅ Invitation Sent Successfully',
        language === 'ar' 
          ? `تم إرسال دعوة المستأجر عبر ${method === 'whatsapp' ? 'واتساب' : 'الرسائل النصية'}\n\nرمز الدعوة: ${invitationCode}\nرقم الهاتف: ${invitePhone}\n\nسيتم إشعارك عند قبول الدعوة.`
          : `Resident invitation sent via ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'}\n\nInvitation Code: ${invitationCode}\nPhone: ${invitePhone}\n\nYou'll be notified when invitation is accepted.`,
        [
          {
            text: language === 'ar' ? 'موافق' : 'OK',
            onPress: () => {
              setShowInviteModal(false);
              setInvitePhone('');
              setSelectedProperty('');
              setSelectedUnit('');
            },
          },
        ]
      );

    } catch (error) {
      console.error('Invitation sending error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ في الإرسال' : 'Sending Error',
        language === 'ar' ? 'فشل في إرسال الدعوة. يرجى المحاولة مرة أخرى.' : 'Failed to send invitation. Please try again.'
      );
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const handleResidentPress = (resident: TenantRecord & { currentUnit?: string; currentProperty?: string }) => {
    router.push({
      pathname: '/(tabs)/resident-profile',
      params: {
        residentId: resident.id,
        residentName: resident.fullName,
      },
    });
  };

  const handleCopyInvitationCode = (code: string) => {
    // In a real app, use Clipboard API
    Alert.alert(
      language === 'ar' ? 'تم النسخ' : 'Copied',
      language === 'ar' ? `تم نسخ رمز الدعوة: ${code}` : `Invitation code copied: ${code}`
    );
  };

  const getResidentStatusInfo = (resident: typeof mockResidents[0]) => {
    if (resident.currentContracts > 0) {
      return {
        status: 'active',
        label: language === 'ar' ? 'مستأجر حالي' : 'Current Resident',
        color: colors.success,
        backgroundColor: colors.successLight,
      };
    } else if (resident.totalContracts > 0) {
      return {
        status: 'former',
        label: language === 'ar' ? 'مستأجر سابق' : 'Former Resident',
        color: colors.warning,
        backgroundColor: colors.warningLight,
      };
    } else {
      return {
        status: 'new',
        label: language === 'ar' ? 'جديد' : 'New',
        color: colors.primary,
        backgroundColor: colors.primaryLight,
      };
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'current': return colors.success;
      case 'overdue': return colors.danger;
      case 'partial': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const filteredResidents = getFilteredResidents();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Clean Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.headerLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
              {t('residents')}
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
                ? `${stats.totalResidents} مستأجر • ${stats.activeResidents} نشط`
                : `${stats.totalResidents} residents • ${stats.activeResidents} active`
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.primary }]}
            onPress={() => setShowInviteModal(true)}
            activeOpacity={0.8}
          >
            <UserPlus size={20} color={colors.surface} />
            <Text
              style={[
                styles.primaryActionText,
                {
                  color: colors.surface,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                },
              ]}
            >
              {language === 'ar' ? 'دعوة' : 'Invite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters - Collections Style */}
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
                    borderColor: colors.primary,
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Current Residents */}
        <View style={styles.residentsSection}>
          {filteredResidents.map((resident) => {
            const statusInfo = getResidentStatusInfo(resident);
            
            return (
              <TouchableOpacity
                key={resident.id}
                style={[styles.residentCard, { backgroundColor: colors.surface }]}
                onPress={() => handleResidentPress(resident)}
                activeOpacity={0.7}
              >
                {/* Main Info Row */}
                <View style={[styles.residentMainRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.residentAvatar, { backgroundColor: statusInfo.backgroundColor }]}>
                    <Users size={20} color={statusInfo.color} />
                  </View>
                  
                  <View style={styles.residentInfo}>
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
                      {resident.fullName}
                    </Text>
                    
                    {resident.currentUnit && (
                      <View style={[styles.unitInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Home size={12} color={colors.textMuted} />
                        <Text
                          style={[
                            styles.unitText,
                            {
                              color: colors.textSecondary,
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          {resident.currentProperty} - {resident.currentUnit}
                        </Text>
                      </View>
                    )}
                    
                    <View style={[styles.contactInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Phone size={12} color={colors.textMuted} />
                      <Text
                        style={[
                          styles.contactText,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                          },
                        ]}
                      >
                        {resident.phoneE164}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.residentMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: statusInfo.color,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                    
                    {resident.monthlyRent && (
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
                        {formatCurrency(resident.monthlyRent, 'SAR')}
                      </Text>
                    )}
                    
                    {resident.paymentStatus && (
                      <View style={[styles.paymentStatus, { backgroundColor: `${getPaymentStatusColor(resident.paymentStatus)}20` }]}>
                        <View style={[styles.paymentDot, { backgroundColor: getPaymentStatusColor(resident.paymentStatus) }]} />
                        <Text
                          style={[
                            styles.paymentStatusText,
                            {
                              color: getPaymentStatusColor(resident.paymentStatus),
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          {resident.paymentStatus === 'current' ? (language === 'ar' ? 'محدث' : 'Current') :
                           resident.paymentStatus === 'overdue' ? (language === 'ar' ? 'متأخر' : 'Overdue') :
                           (language === 'ar' ? 'جزئي' : 'Partial')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredResidents.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <Users size={32} color={colors.textMuted} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: 'center',
                  },
                ]}
              >
                {language === 'ar' ? 'لا توجد نتائج' : 'No Results Found'}
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: 'center',
                  },
                ]}
              >
                {searchQuery 
                  ? (language === 'ar' ? 'لا توجد نتائج للبحث' : 'No search results')
                  : (language === 'ar' ? 'لا يوجد مستأجرين' : 'No residents yet')
                }
              </Text>
            </View>
          )}
        </View>

        {/* Pending Invitations - Collapsed by default */}
        {invitations.length > 0 && (
          <View style={styles.invitationsSection}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
                {language === 'ar' ? 'الدعوات المرسلة' : 'Sent Invitations'}
              </Text>
              <View style={[styles.invitationsBadge, { backgroundColor: colors.warningLight }]}>
                <Text
                  style={[
                    styles.invitationsBadgeText,
                    {
                      color: colors.warning,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {invitations.length}
                </Text>
              </View>
            </View>

            {invitations.map((invitation) => (
              <View key={invitation.id} style={[styles.invitationCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.invitationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.invitationIcon, { backgroundColor: colors.warningLight }]}>
                    <Clock size={16} color={colors.warning} />
                  </View>
                  
                  <View style={styles.invitationInfo}>
                    <View style={[styles.invitationHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Text
                        style={[
                          styles.invitationCode,
                          {
                            color: colors.primary,
                            fontFamily: 'monospace',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {invitation.invitationCode}
                      </Text>
                      <TouchableOpacity
                        style={[styles.copyButton, { backgroundColor: colors.primaryLight }]}
                        onPress={() => handleCopyInvitationCode(invitation.invitationCode)}
                        activeOpacity={0.7}
                      >
                        <Copy size={10} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text
                      style={[
                        styles.invitationPhone,
                        {
                          color: colors.textSecondary,
                          fontFamily: 'monospace',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {invitation.phoneNumber}
                    </Text>
                    
                    <Text
                      style={[
                        styles.invitationExpiry,
                        {
                          color: colors.textMuted,
                          fontFamily: 'monospace',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'تنتهي: ' : 'Expires: '}{formatDate(invitation.expiresAt)}
                    </Text>
                  </View>

                  <View style={[styles.invitationStatus, { backgroundColor: colors.warningLight }]}>
                    <Text
                      style={[
                        styles.invitationStatusText,
                        {
                          color: colors.warning,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'معلق' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Invite Modal - Simplified */}
      {showInviteModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
                {language === 'ar' ? 'دعوة مستأجر جديد' : 'Invite New Resident'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowInviteModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.inviteForm}>
                <PhoneInput
                  value={invitePhone}
                  onChangeText={setInvitePhone}
                  label={language === 'ar' ? 'رقم هاتف المستأجر *' : 'Resident Phone Number *'}
                  placeholder="XXXXXXXXX"
                  required
                />

                <View style={styles.formGroup}>
                  <Text
                    style={[
                      styles.formLabel,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'العقار (اختياري)' : 'Property (Optional)'}
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    placeholder={language === 'ar' ? 'اسم العقار' : 'Property name'}
                    placeholderTextColor={colors.textMuted}
                    value={selectedProperty}
                    onChangeText={setSelectedProperty}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text
                    style={[
                      styles.formLabel,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'الوحدة (اختياري)' : 'Unit (Optional)'}
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    placeholder={language === 'ar' ? 'رقم الوحدة' : 'Unit number'}
                    placeholderTextColor={colors.textMuted}
                    value={selectedUnit}
                    onChangeText={setSelectedUnit}
                  />
                </View>

                {/* Send Options */}
                <View style={styles.sendOptions}>
                  <Text
                    style={[
                      styles.sendOptionsTitle,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'طريقة الإرسال' : 'Send Method'}
                  </Text>
                  
                  <View style={[styles.sendButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.success }]}
                      onPress={() => handleSendInvitation('whatsapp')}
                      disabled={isSendingInvitation}
                      activeOpacity={0.8}
                    >
                      <MessageSquare size={16} color={colors.surface} />
                      <Text
                        style={[
                          styles.sendButtonText,
                          {
                            color: colors.surface,
                            fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          },
                        ]}
                      >
                        {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleSendInvitation('sms')}
                      disabled={isSendingInvitation}
                      activeOpacity={0.8}
                    >
                      <Send size={16} color={colors.surface} />
                      <Text
                        style={[
                          styles.sendButtonText,
                          {
                            color: colors.surface,
                            fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          },
                        ]}
                      >
                        {language === 'ar' ? 'رسالة نصية' : 'SMS'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formActions}>
                  <Button
                    title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                    onPress={() => {
                      setShowInviteModal(false);
                      setInvitePhone('');
                      setSelectedProperty('');
                      setSelectedUnit('');
                    }}
                    variant="secondary"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  primaryActionText: {
    fontSize: fontSize.md,
  },
  controlsSection: {
    paddingHorizontal: spacing.md,
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
    paddingBottom: spacing.xxl,
  },
  residentsSection: {
    gap: spacing.sm,
  },
  residentCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  residentMainRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  residentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  residentInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  residentName: {
    fontSize: fontSize.md,
  },
  unitInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  unitText: {
    fontSize: fontSize.sm,
  },
  contactInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactText: {
    fontSize: fontSize.sm,
  },
  residentMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  rentAmount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  paymentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paymentStatusText: {
    fontSize: fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
  },
  invitationsSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    flex: 1,
  },
  invitationsBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitationsBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  invitationCard: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  invitationRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  invitationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitationInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  invitationHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  invitationCode: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  copyButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  invitationPhone: {
    fontSize: fontSize.sm,
  },
  invitationExpiry: {
    fontSize: fontSize.xs,
  },
  invitationStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  invitationStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  modalCloseButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inviteForm: {
    gap: spacing.lg,
  },
  formGroup: {
    gap: spacing.sm,
  },
  formLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
  },
  sendOptions: {
    gap: spacing.md,
  },
  sendOptionsTitle: {
    fontSize: fontSize.md,
  },
  sendButtons: {
    gap: spacing.md,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButtonText: {
    fontSize: fontSize.md,
  },
  formActions: {
    gap: spacing.md,
  },
});