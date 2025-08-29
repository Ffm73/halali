import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Currency, ThemeMode } from '@/types';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';
import { Platform, Linking } from 'react-native';
import { Alert as CustomAlert, Toast, AlertUtils, Loading } from '@/utils/customAlert';
import { 
  Globe, 
  Calendar, 
  DollarSign, 
  Bell, 
  Users, 
  Trash2,
  Shield,
  Moon,
  Sun,
  CreditCard,
  Crown
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { t, language, isRTL, setLanguage, dateSystem, currency, setCurrency, toggleDateSystem } = useLocalization();
  const { user, logout, updateUserProfile } = useAuth();
  const { colors, mode, setThemeMode, isDark } = useTheme();
  const { paymentMethods, savePaymentMethods } = usePaymentMethods();
  const router = useRouter();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const currencies = [
    { code: 'SAR', name: language === 'ar' ? 'ريال سعودي' : 'Saudi Riyal', symbol: '﷼' },
    { code: 'AED', name: language === 'ar' ? 'درهم إماراتي' : 'UAE Dirham', symbol: 'د.إ' },
    { code: 'KWD', name: language === 'ar' ? 'دينار كويتي' : 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'QAR', name: language === 'ar' ? 'ريال قطري' : 'Qatari Riyal', symbol: 'ر.ق' },
    { code: 'BHD', name: language === 'ar' ? 'دينار بحريني' : 'Bahraini Dinar', symbol: 'د.ب' },
    { code: 'OMR', name: language === 'ar' ? 'ريال عماني' : 'Omani Rial', symbol: 'ر.ع' },
    { code: 'USD', name: language === 'ar' ? 'دولار أمريكي' : 'US Dollar', symbol: '$' },
    { code: 'EUR', name: language === 'ar' ? 'يورو' : 'Euro', symbol: '€' },
    { code: 'GBP', name: language === 'ar' ? 'جنيه إسترليني' : 'British Pound', symbol: '£' },
  ];

  const handleCurrencyChange = async (newCurrency: Currency) => {
    setIsSavingSettings(true);
    
    try {
      setShowCurrencyPicker(false);
      
      // Use the global setCurrency function
      await setCurrency(newCurrency);
      
      // Update user profile
      await updateUserProfile({ currency: newCurrency });
      
      // Use a consistent title for currency changes to prevent stacking
      const currencyTitle = language === 'ar' ? 'تم تحديث العملة' : 'Currency Updated';
      const currencyMessage = language === 'ar' ? 
        `تم التبديل إلى ${currencies.find(c => c.code === newCurrency)?.name}` : 
        `Switched to ${currencies.find(c => c.code === newCurrency)?.name}`;
      
      Toast.success(currencyTitle, currencyMessage, undefined, 2000); // Shorter duration
    } catch (error) {
      console.error('Error updating currency:', error);
      Toast.error(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'فشل في تحديث العملة' : 'Failed to update currency'
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTeamManagement = () => {
    router.push('/(tabs)/team-management');
  };

  const handleNotificationSettings = () => {
    // Open system notification settings
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openURL('android-app://com.android.settings/android.settings.APP_NOTIFICATION_SETTINGS');
    } else {
      // Web fallback - show instructions
      CustomAlert.alert(
        language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings',
        language === 'ar' 
          ? 'لتفعيل الإشعارات، يرجى السماح للإشعارات في إعدادات المتصفح'
          : 'To enable notifications, please allow notifications in your browser settings'
      );
    }
  };

  const handlePrivacyPolicy = () => {
    router.push('/(tabs)/privacy');
  };

  const handlePaymentMethods = () => {
    router.push('/(tabs)/payment-methods');
  };

  const handlePricingSetup = () => {
    router.push('/(tabs)/pricing-setup');
  };

  const handleDeleteAccount = () => {
    AlertUtils.confirmDelete(
      language === 'ar' ? 'الحساب' : 'Account',
      () => {
        Toast.success(
          language === 'ar' ? 'تم حذف الحساب' : 'Account Deleted',
          language === 'ar' ? 'تم حذف حسابك بنجاح' : 'Your account has been deleted'
        );
      },
      language
    );
  };

  const handleLogout = async () => {
    console.log('🚪 LOGOUT BUTTON PRESSED - Starting logout process');
    AlertUtils.confirmLogout(
      async () => {
        console.log('✅ USER CONFIRMED LOGOUT - Executing logout sequence');
        
        // Show loading
        Loading.show(
          language === 'ar' ? 'جاري تسجيل الخروج' : 'Signing Out',
          language === 'ar' ? 'يرجى الانتظار...' : 'Please wait...'
        );
        
        try {
          // Step 1: Clear authentication state
          console.log('🔄 Step 1: Calling logout function');
          const logoutResult = await logout();
          console.log('✅ Step 1 Complete: Authentication cleared', logoutResult);
          
          // Hide loading
          Loading.hide();
          
          // Step 2: Navigate to welcome page
          console.log('🔄 Step 2: Redirecting to welcome page');
          router.replace('/(auth)/welcome');
          
          console.log('✅ LOGOUT COMPLETE: Navigation executed');
          
        } catch (error) {
          console.error('💥 LOGOUT ERROR - Redirecting anyway:', error);
          Loading.hide();
          // Force redirect even if logout fails
          router.replace('/(auth)/welcome');
        }
      },
      language
    );
  };
  const settingsSections = [
    {
      title: language === 'ar' ? 'التفضيلات' : 'Preferences',
      items: [
        {
          icon: isDark ? Sun : Moon,
          label: language === 'ar' ? 'المظهر' : 'Theme',
          value: mode === 'light' ? (language === 'ar' ? 'فاتح' : 'Light') :
                mode === 'dark' ? (language === 'ar' ? 'داكن' : 'Dark') :
                (language === 'ar' ? 'تلقائي' : 'Auto'),
          onPress: () => {
            // Cycle through theme modes: light -> dark -> system -> light
            const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
            setThemeMode(nextMode);
            // Use a consistent title for theme changes to prevent stacking
            const themeTitle = language === 'ar' ? 'تم تغيير المظهر' : 'Theme Changed';
            const themeMessage = language === 'ar' ? 
              `تم التبديل إلى ${nextMode === 'light' ? 'فاتح' : nextMode === 'dark' ? 'داكن' : 'تلقائي'}` : 
              `Switched to ${nextMode}`;
            
            Toast.success(themeTitle, themeMessage, undefined, 2000); // Shorter duration
          },
        },
        {
          icon: DollarSign,
          label: language === 'ar' ? 'العملة' : 'Currency',
          value: currencies.find(c => c.code === currency)?.name || currency,
          onPress: () => setShowCurrencyPicker(true),
        },
        ...(user?.role === 'landlord' ? [{
          icon: CreditCard,
          label: language === 'ar' ? 'طرق الدفع' : 'Payment Methods',
          value: '',
          onPress: handlePaymentMethods,
        }, {
          icon: Crown,
          label: language === 'ar' ? 'إعداد الأسعار' : 'Pricing Setup',
          value: '',
          onPress: handlePricingSetup,
        }] : []),
      ],
    },
    {
      title: language === 'ar' ? 'الإشعارات والفريق' : 'Notifications & Team',
      items: [
        {
          icon: Bell,
          label: language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings',
          value: '',
          onPress: handleNotificationSettings,
        },
        {
          icon: Users,
          label: language === 'ar' ? 'إدارة الفريق' : 'Team Management',
          value: '',
          onPress: handleTeamManagement,
        },
        ...(user?.role === 'landlord' ? [{
          icon: Shield,
          label: language === 'ar' ? 'سجل المراجعة' : 'Audit Log',
          value: '',
          onPress: () => router.push('/(tabs)/audit-log'),
        }] : []),
      ],
    },
    {
      title: language === 'ar' ? 'البيانات والأمان' : 'Data & Security',
      items: [
        {
          icon: Shield,
          label: language === 'ar' ? 'الخصوصية' : 'Privacy Policy',
          value: '',
          onPress: handlePrivacyPolicy,
        },
        {
          icon: Trash2,
          label: language === 'ar' ? 'حذف الحساب' : 'Delete Account',
          value: '',
          onPress: handleDeleteAccount,
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
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
          {t('settings')}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* User Info */}
        <Card style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.userInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text
              style={[
                styles.userName,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {user?.fullName}
            </Text>
            <Text
              style={[
                styles.userRole,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {user?.role === 'landlord' ? (language === 'ar' ? 'مالك' : 'Landlord') : user?.role}
            </Text>
          </View>
        </Card>

        {/* Settings Sections */}
        {settingsSections.filter(section => {
          // Hide team management section for residents
          if (user?.role === 'resident' && section.title === (language === 'ar' ? 'الإشعارات والفريق' : 'Notifications & Team')) {
            return section.items.some(item => item.label !== (language === 'ar' ? 'إدارة الفريق' : 'Team Management'));
          }
          return true;
        }).map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {section.title}
            </Text>
            
            <Card>
              {section.items.filter(item => {
                // Hide team management for residents
                if (user?.role === 'resident' && item.label === (language === 'ar' ? 'إدارة الفريق' : 'Team Management')) {
                  return false;
                }
                return true;
              }).map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.filter(item => {
                      if (user?.role === 'resident' && item.label === (language === 'ar' ? 'إدارة الفريق' : 'Team Management')) {
                        return false;
                      }
                      return true;
                    }).length - 1 && styles.settingItemBorder,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <item.icon 
                      size={20} 
                      color={item.danger ? colors.danger : colors.textSecondary} 
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        item.danger && { color: colors.danger },
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.value ? (
                    <Text
                      style={[
                        styles.settingValue,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {item.value}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.dangerLight }]} onPress={handleLogout} activeOpacity={0.7}>
          <Text
            style={[
              styles.logoutText,
              {
                color: colors.danger,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              },
            ]}
          >
            {language === 'ar' ? 'تسجيل خروج' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View style={[styles.currencyModal, { backgroundColor: colors.surface }]}>
            <Text
              style={[
                styles.currencyModalTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'اختر العملة' : 'Select Currency'}
            </Text>
            
            <ScrollView style={styles.currencyList}>
              {currencies.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyOption,
                    currency === curr.code && { backgroundColor: colors.primaryLight },
                    { flexDirection: isRTL ? 'row-reverse' : 'row' }
                  ]}
                  onPress={() => handleCurrencyChange(curr.code as Currency)}
                  disabled={isSavingSettings}
                >
                  <View style={styles.currencyInfo}>
                    <Text
                      style={[
                        styles.currencyName,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {curr.name}
                    </Text>
                    <Text
                      style={[
                        styles.currencyCode,
                        {
                          color: colors.textSecondary,
                          fontFamily: 'monospace',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {curr.code} • {curr.symbol}
                    </Text>
                  </View>
                  {currency === curr.code && (
                    <View style={[styles.selectedIndicator, isSavingSettings && { opacity: 0.5 }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  title: {
    fontSize: fontSize.xl,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  userCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.card,
  },
  userInfo: {
    padding: 0,
  },
  userName: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  userRole: {
    fontSize: fontSize.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  settingItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.md,
    flex: 1,
  },
  settingValue: {
    fontSize: fontSize.sm,
  },
  logoutButton: {
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoutText: {
    fontSize: fontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  currencyModal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    zIndex: 9999,
  },
  currencyModalTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyOption: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  currencyCode: {
    fontSize: fontSize.sm,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2F8F6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});