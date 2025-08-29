import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { ArrowLeft, ArrowRight, Shield, Eye, Lock, Database, Users, Bell, Globe } from 'lucide-react-native';

export default function PrivacyScreen() {
  const { language, isRTL, formatDate } = useLocalization();
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const isLandlord = user?.role === 'landlord';
  const isResident = user?.role === 'resident';
  const isStaff = user?.role === 'staff';

  const privacySections = [
    {
      icon: Database,
      title: language === 'ar' ? 'جمع البيانات' : 'Data Collection',
      content: isLandlord 
        ? (language === 'ar' 
          ? 'نجمع المعلومات الضرورية لإدارة عقاراتك ومستأجريك، بما في ذلك معلومات الاتصال، تفاصيل العقارات، والمعاملات المالية. جميع البيانات مشفرة ومحمية.'
          : 'We collect information necessary to manage your properties and tenants, including contact details, property information, and financial transactions. All data is encrypted and protected.')
        : (language === 'ar'
          ? 'نجمع معلوماتك الشخصية ومعلومات الإيجار لتوفير خدمات الدفع والتواصل مع المالك. نحن لا نشارك بياناتك مع أطراف ثالثة.'
          : 'We collect your personal information and rental details to provide payment services and communication with your landlord. We do not share your data with third parties.'),
    },
    {
      icon: Lock,
      title: language === 'ar' ? 'حماية البيانات' : 'Data Protection',
      content: language === 'ar'
        ? 'نستخدم تشفير AES-256 لحماية جميع البيانات الحساسة. خوادمنا محمية بجدران حماية متقدمة ونراقب الأنشطة المشبوهة على مدار الساعة.'
        : 'We use AES-256 encryption to protect all sensitive data. Our servers are protected by advanced firewalls and we monitor suspicious activities 24/7.',
    },
    {
      icon: Users,
      title: language === 'ar' ? 'مشاركة البيانات' : 'Data Sharing',
      content: isLandlord
        ? (language === 'ar'
          ? 'بياناتك تُشارك فقط مع المستأجرين والموظفين المصرح لهم. يمكنك التحكم في مستوى الوصول لكل موظف من خلال إعدادات الصلاحيات.'
          : 'Your data is only shared with authorized tenants and staff members. You can control access levels for each staff member through permission settings.')
        : (language === 'ar'
          ? 'معلوماتك تُشارك فقط مع مالك العقار والموظفين المصرح لهم. لا نبيع أو نشارك بياناتك مع شركات أخرى.'
          : 'Your information is only shared with your property owner and authorized staff. We do not sell or share your data with other companies.'),
    },
    {
      icon: Eye,
      title: language === 'ar' ? 'حقوق الوصول' : 'Access Rights',
      content: language === 'ar'
        ? 'يمكنك طلب نسخة من بياناتك الشخصية، تعديل المعلومات غير الصحيحة، أو حذف حسابك في أي وقت. اتصل بنا لممارسة هذه الحقوق.'
        : 'You can request a copy of your personal data, correct inaccurate information, or delete your account at any time. Contact us to exercise these rights.',
    },
    {
      icon: Bell,
      title: language === 'ar' ? 'الإشعارات' : 'Notifications',
      content: language === 'ar'
        ? 'نرسل إشعارات متعلقة بالإيجار والمدفوعات عبر التطبيق والرسائل النصية. يمكنك إلغاء الاشتراك في الإشعارات غير الضرورية من الإعدادات.'
        : 'We send notifications related to rent and payments via app and SMS. You can unsubscribe from non-essential notifications in settings.',
    },
    {
      icon: Globe,
      title: language === 'ar' ? 'النقل الدولي' : 'International Transfers',
      content: language === 'ar'
        ? 'بياناتك قد تُنقل إلى خوادم في دول أخرى لتحسين الأداء، لكن نضمن نفس مستوى الحماية في جميع المواقع.'
        : 'Your data may be transferred to servers in other countries for performance optimization, but we ensure the same level of protection across all locations.',
    },
  ];

  const contactInfo = {
    email: 'privacy@halali.app',
    phone: '+966112345678',
    address: language === 'ar' 
      ? 'الرياض، المملكة العربية السعودية'
      : 'Riyadh, Saudi Arabia',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/settings')}
          activeOpacity={0.7}
        >
          {isRTL ? (
            <ArrowRight size={24} color={colors.textSecondary} />
          ) : (
            <ArrowLeft size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
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
          {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Introduction */}
        <Card style={[styles.introCard, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.introHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.introIcon, { backgroundColor: colors.primary }]}>
              <Shield size={24} color={colors.surface} />
            </View>
            <View style={styles.introContent}>
              <Text
                style={[
                  styles.introTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'حماية خصوصيتك أولويتنا' : 'Your Privacy is Our Priority'}
              </Text>
              <Text
                style={[
                  styles.introDescription,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar'
                  ? 'نحن ملتزمون بحماية بياناتك الشخصية وضمان شفافية كاملة حول كيفية استخدامها.'
                  : 'We are committed to protecting your personal data and ensuring complete transparency about how it is used.'
                }
              </Text>
            </View>
          </View>
          
          <Text
            style={[
              styles.lastUpdated,
              {
                color: colors.textMuted,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'آخر تحديث: ' : 'Last updated: '}{formatDate(new Date('2025-01-01'))}
          </Text>
        </Card>

        {/* Role-specific Notice */}
        {(isLandlord || isStaff) && (
          <Card style={[styles.roleNotice, { backgroundColor: colors.warningLight }]}>
            <Text
              style={[
                styles.roleNoticeText,
                {
                  color: colors.warning,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {isLandlord 
                ? (language === 'ar' 
                  ? '⚠️ كمالك عقار، أنت مسؤول عن حماية بيانات مستأجريك وفقاً للقوانين المحلية.'
                  : '⚠️ As a property owner, you are responsible for protecting your tenants\' data according to local laws.')
                : (language === 'ar'
                  ? '⚠️ كموظف، لديك وصول محدود للبيانات حسب صلاحياتك المحددة من قبل المالك.'
                  : '⚠️ As staff, you have limited data access based on permissions set by the property owner.')
              }
            </Text>
          </Card>
        )}

        {/* Privacy Sections */}
        {privacySections.map((section, index) => (
          <Card key={index} style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primaryLight }]}>
                <section.icon size={20} color={colors.primary} />
              </View>
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
                {section.title}
              </Text>
            </View>
            <Text
              style={[
                styles.sectionContent,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {section.content}
            </Text>
          </Card>
        ))}

        {/* Data Types We Collect */}
        <Card style={[styles.dataTypesCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.dataTypesTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'أنواع البيانات التي نجمعها' : 'Types of Data We Collect'}
          </Text>
          
          <View style={styles.dataTypesList}>
            {[
              language === 'ar' ? 'معلومات الهوية (الاسم، رقم الهاتف، البريد الإلكتروني)' : 'Identity information (name, phone, email)',
              language === 'ar' ? 'معلومات العقارات والوحدات' : 'Property and unit information',
              language === 'ar' ? 'سجلات المدفوعات والمعاملات المالية' : 'Payment records and financial transactions',
              language === 'ar' ? 'سجلات التواصل والإشعارات' : 'Communication and notification logs',
              language === 'ar' ? 'بيانات الاستخدام والتفضيلات' : 'Usage data and preferences',
            ].map((item, index) => (
              <View key={index} style={[styles.dataTypeItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.dataTypeBullet, { backgroundColor: colors.primary }]} />
                <Text
                  style={[
                    styles.dataTypeText,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Your Rights */}
        <Card style={[styles.rightsCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.rightsTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'حقوقك في الخصوصية' : 'Your Privacy Rights'}
          </Text>
          
          <View style={styles.rightsList}>
            {[
              {
                title: language === 'ar' ? 'الحق في الوصول' : 'Right to Access',
                description: language === 'ar' ? 'طلب نسخة من بياناتك الشخصية' : 'Request a copy of your personal data',
              },
              {
                title: language === 'ar' ? 'الحق في التصحيح' : 'Right to Rectification', 
                description: language === 'ar' ? 'تصحيح البيانات غير الصحيحة' : 'Correct inaccurate data',
              },
              {
                title: language === 'ar' ? 'الحق في الحذف' : 'Right to Erasure',
                description: language === 'ar' ? 'طلب حذف بياناتك الشخصية' : 'Request deletion of your personal data',
              },
              {
                title: language === 'ar' ? 'الحق في النقل' : 'Right to Portability',
                description: language === 'ar' ? 'نقل بياناتك إلى خدمة أخرى' : 'Transfer your data to another service',
              },
            ].map((right, index) => (
              <View key={index} style={styles.rightItem}>
                <Text
                  style={[
                    styles.rightTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {right.title}
                </Text>
                <Text
                  style={[
                    styles.rightDescription,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {right.description}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={[styles.contactCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.contactTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          </Text>
          
          <View style={styles.contactInfo}>
            <View style={[styles.contactItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.contactLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
              </Text>
              <Text
                style={[
                  styles.contactValue,
                  {
                    color: colors.primary,
                    fontFamily: 'Nunito-Regular',
                  },
                ]}
              >
                {contactInfo.email}
              </Text>
            </View>
            
            <View style={[styles.contactItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.contactLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'الهاتف:' : 'Phone:'}
              </Text>
              <Text
                style={[
                  styles.contactValue,
                  {
                    color: colors.primary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                {contactInfo.phone}
              </Text>
            </View>
            
            <View style={[styles.contactItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.contactLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {language === 'ar' ? 'العنوان:' : 'Address:'}
              </Text>
              <Text
                style={[
                  styles.contactValue,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  },
                ]}
              >
                {contactInfo.address}
              </Text>
            </View>
          </View>
        </Card>

        {/* Legal Notice */}
        <View style={[styles.legalNotice, { backgroundColor: colors.surfaceSecondary }]}>
          <Text
            style={[
              styles.legalText,
              {
                color: colors.textMuted,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar'
              ? 'هذه السياسة تخضع للقوانين السعودية ولائحة حماية البيانات الشخصية. في حالة وجود تضارب بين النسخة العربية والإنجليزية، تعتبر النسخة العربية هي المرجع.'
              : 'This policy is governed by Saudi Arabian laws and Personal Data Protection Regulation. In case of conflict between Arabic and English versions, the Arabic version shall prevail.'
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  title: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  introCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: '#4CA771',
  },
  introHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  introDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  roleNotice: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  roleNoticeText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    flex: 1,
  },
  sectionContent: {
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  dataTypesCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
  },
  dataTypesTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  dataTypesList: {
    gap: spacing.sm,
  },
  dataTypeItem: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dataTypeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  dataTypeText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  rightsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
  },
  rightsTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  rightsList: {
    gap: spacing.md,
  },
  rightItem: {
    gap: spacing.xs,
  },
  rightTitle: {
    fontSize: fontSize.sm,
  },
  rightDescription: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  contactCard: {
    marginBottom: spacing.lg,
  },
  contactTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  contactInfo: {
    gap: spacing.sm,
  },
  contactItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  contactLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  contactValue: {
    fontSize: fontSize.sm,
  },
  legalNotice: {
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  legalText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});