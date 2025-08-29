import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { useLocalization } from '@/hooks/useLocalization';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { TenantInvitation, TenantProfile, User } from '@/types';
import { UserPlus, MessageSquare, Phone, Users, Copy, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react-native';
import { Crown } from 'lucide-react-native';
import { PhoneInput } from '@/components/ui/PhoneInput';

// Mock data for tenants and invitations
const mockTenants: (User & TenantProfile)[] = [
  {
    id: 'tenant1',
    userId: 'user1',
    landlordId: 'landlord1',
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
    joinedAt: '2024-01-15T10:00:00Z',
    currentUnit: 'A-101',
    currentProperty: 'برج العلامة',
  },
  {
    id: 'tenant2',
    userId: 'user2',
    landlordId: 'landlord1',
    role: 'resident',
    fullName: 'فاطمة علي الزهراني',
    email: 'fatima@example.com',
    phoneE164: '+966509876543',
    language: 'ar',
    country: 'SA',
    timeZone: 'Asia/Riyadh',
    status: 'active',
    currency: 'SAR',
    dateSystem: 'hijri',
    joinedAt: '2024-02-01T14:30:00Z',
    currentUnit: 'B-205',
    currentProperty: 'مجمع النور السكني',
  },
  {
    id: 'tenant3',
    userId: 'user3',
    landlordId: 'landlord1',
    role: 'resident',
    fullName: 'خالد محمد الأحمد',
    email: 'khalid@example.com',
    phoneE164: '+966512345678',
    language: 'ar',
    country: 'SA',
    timeZone: 'Asia/Riyadh',
    status: 'active',
    currency: 'SAR',
    dateSystem: 'hijri',
    joinedAt: '2023-12-01T10:00:00Z',
    currentUnit: null, // No current unit - previous tenant
    currentProperty: null,
  },
];

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
];

export default function TenantsScreen() {
  const { t, language, isRTL, formatDate } = useLocalization();
  const router = useRouter();
  const [tenants] = useState(mockTenants);
  const [invitations, setInvitations] = useState(mockInvitations);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');

  const generateInvitationCode = () => {
    return 'RENT' + Date.now().toString().slice(-6);
  };

  const handleSendInvitation = async () => {
    if (!invitePhone.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number'
      );
      return;
    }

    const invitationCode = generateInvitationCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const newInvitation: TenantInvitation = {
      id: `inv_${Date.now()}`,
      landlordId: 'landlord1',
      landlordName: 'أحمد محمد العلي',
      invitationCode,
      phoneNumber: invitePhone,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      propertyName: 'برج العلامة',
      unitLabel: 'C-301',
    };

    setInvitations(prev => [...prev, newInvitation]);

    // Send WhatsApp invitation
    const message = language === 'ar' 
      ? `🏠 مرحباً! تم دعوتك للانضمام كمستأجر في عقار "${newInvitation.propertyName}"\n\n🔑 رمز الدعوة: *${invitationCode}*\n\n📱 قم بتحميل تطبيق "حلالي" وأدخل هذا الرمز للانضمام\n\n⏰ ينتهي الرمز خلال 7 أيام`
      : `🏠 Hello! You've been invited to join as a tenant for property "${newInvitation.propertyName}"\n\n🔑 Invitation Code: *${invitationCode}*\n\n📱 Download "Halali" app and enter this code to join\n\n⏰ Code expires in 7 days`;

    const whatsappUrl = `whatsapp://send?phone=${invitePhone}&text=${encodeURIComponent(message)}`;
    
    try {
      await Linking.openURL(whatsappUrl);
      Alert.alert(
        language === 'ar' ? '✅ تم الإرسال' : '✅ Sent Successfully',
        language === 'ar' 
          ? `تم إرسال الدعوة عبر واتساب\nرمز الدعوة: ${invitationCode}`
          : `Invitation sent via WhatsApp\nInvitation Code: ${invitationCode}`
      );
    } catch (error) {
      // Fallback to copying the message
      Alert.alert(
        language === 'ar' ? '📋 رمز الدعوة' : '📋 Invitation Code',
        `${language === 'ar' ? 'رمز الدعوة:' : 'Invitation Code:'} ${invitationCode}\n\n${message}`,
        [
          {
            text: language === 'ar' ? '📋 نسخ' : '📋 Copy',
            onPress: () => {
              // In a real app, you'd use Clipboard API
              console.log('Copied invitation:', invitationCode);
            },
          },
          { text: language === 'ar' ? 'موافق' : 'OK' },
        ]
      );
    }

    setShowInviteForm(false);
    setInvitePhone('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={colors.light.warning} />;
      case 'accepted':
        return <CheckCircle size={16} color={colors.light.success} />;
      case 'expired':
        return <XCircle size={16} color={colors.light.danger} />;
      default:
        return <Clock size={16} color={colors.light.textMuted} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'الدعوات' : 'Invitations'}
        </Text>
        <View style={styles.headerButtons}>
          <Button
            title={language === 'ar' ? 'دعوة مستأجر' : 'Invite Tenant'}
            onPress={() => setShowInviteForm(true)}
            variant="primary"
            size="sm"
          />
          <Button
            title={language === 'ar' ? 'دعوة موظف' : 'Invite Staff'}
            onPress={() => router.push('/(tabs)/team-management')}
            variant="secondary"
            size="sm"
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Current Tenants */}
        <Card style={styles.sectionCard}>
          <Text
            style={[
              styles.sectionTitle,
              {
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('invitations')}
          </Text>

          {tenants.map((tenant) => (
            <View key={tenant.id} style={styles.tenantItem}>
              <View style={[styles.tenantHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.tenantIcon}>
                  <Users size={20} color={colors.light.primary} />
                </View>
                <View style={styles.tenantInfo}>
                  <Text
                    style={[
                      styles.tenantName,
                      {
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {tenant.fullName}
                  </Text>
                  <Text
                    style={[
                      styles.tenantUnit,
                      {
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {tenant.currentProperty && tenant.currentUnit 
                      ? `${tenant.currentProperty} - ${tenant.currentUnit}`
                      : (language === 'ar' ? 'مستأجر سابق' : 'Former tenant')
                    }
                  </Text>
                  <Text
                    style={[
                      styles.tenantJoined,
                      {
                        fontFamily: 'monospace',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'انضم في: ' : 'Joined: '}{formatDate(tenant.joinedAt)}
                  </Text>
                </View>
                <View style={styles.tenantActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Linking.openURL(`tel:${tenant.phoneE164}`)}
                  >
                    <Phone size={16} color={colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Linking.openURL(`whatsapp://send?phone=${tenant.phoneE164}`)}
                  >
                    <MessageSquare size={16} color={colors.light.success} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'الدعوات المرسلة' : 'Sent Invitations'} ({invitations.length})
            </Text>

            {invitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationItem}>
                <View style={[styles.invitationHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={styles.invitationInfo}>
                    <View style={[styles.invitationTitle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      {getStatusIcon(invitation.status)}
                      <Text
                        style={[
                          styles.invitationCode,
                          {
                            fontFamily: 'monospace',
                          },
                        ]}
                      >
                        {invitation.invitationCode}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.invitationPhone,
                        {
                          fontFamily: 'monospace',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {invitation.phoneNumber}
                    </Text>
                    <Text
                      style={[
                        styles.invitationProperty,
                        {
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {invitation.propertyName} - {invitation.unitLabel}
                    </Text>
                    <Text
                      style={[
                        styles.invitationExpiry,
                        {
                          fontFamily: 'monospace',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'تنتهي: ' : 'Expires: '}{formatDate(invitation.expiresAt)}
                    </Text>
                  </View>
                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        // Copy invitation code
                        console.log('Copied:', invitation.invitationCode);
                        Alert.alert(
                          language === 'ar' ? 'تم النسخ' : 'Copied',
                          invitation.invitationCode
                        );
                      }}
                    >
                      <Copy size={16} color={colors.light.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <Card style={styles.inviteFormCard}>
            <Text
              style={[
                styles.formTitle,
                {
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'دعوة مستأجر جديد' : 'Invite New Tenant'}
            </Text>

            <View style={styles.inputGroup}>
              <PhoneInput
                value={invitePhone}
                onChangeText={setInvitePhone}
                placeholder="XXXXXXXXX"
                required
              />
            </View>

            <View style={styles.formActions}>
              <Button
                title={language === 'ar' ? '📤 إرسال الدعوة' : '📤 Send Invitation'}
                onPress={handleSendInvitation}
                variant="primary"
              />
              <Button
                title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                onPress={() => {
                  setShowInviteForm(false);
                  setInvitePhone('');
                }}
                variant="secondary"
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.light.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.light.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  tenantItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.borderLight,
  },
  tenantHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tenantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.light.primary,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: fontSize.md,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  tenantUnit: {
    fontSize: fontSize.sm,
    color: colors.light.textSecondary,
    marginBottom: spacing.xs,
  },
  tenantJoined: {
    fontSize: fontSize.xs,
    color: colors.light.textMuted,
  },
  tenantActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  invitationItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.borderLight,
  },
  invitationHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationTitle: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  invitationCode: {
    fontSize: fontSize.md,
    color: colors.light.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  invitationPhone: {
    fontSize: fontSize.sm,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },
  invitationProperty: {
    fontSize: fontSize.sm,
    color: colors.light.textSecondary,
    marginBottom: spacing.xs,
  },
  invitationExpiry: {
    fontSize: fontSize.xs,
    color: colors.light.textMuted,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pricingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteFormCard: {
    backgroundColor: colors.light.primaryLight,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.light.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: fontSize.lg,
    color: colors.light.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.light.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    backgroundColor: colors.light.surface,
    minHeight: 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  toggleLabel: {
    fontSize: fontSize.md,
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  toggleDescription: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  contractSection: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  contractSectionTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  contractTypeOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contractTypeOption: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  contractTypeText: {
    fontSize: fontSize.md,
  },
});