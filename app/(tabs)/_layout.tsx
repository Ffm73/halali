import { Tabs } from 'expo-router';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Chrome as Home, Coins, Settings, UserPlus, Users, Mail, Crown, CreditCard, DollarSign, Bell } from 'lucide-react-native';

export default function TabLayout() {
  const { t, isRTL, language } = useLocalization();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  console.log('📱 TabLayout rendering for user:', { 
    role: user?.role, 
    name: user?.fullName 
  });

  const isStaff = user?.role === 'staff';
  const isResident = user?.role === 'resident';
  const isLandlord = user?.role === 'landlord';

  // Staff permissions
  const permissions = user?.permissions?.permissions || [];
  const canViewDashboard = permissions.includes('view_dashboard');
  const canViewCollections = permissions.includes('view_collections');
  const canViewTenants = permissions.includes('view_tenants');
  const canViewReports = permissions.includes('view_reports');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      {/* Dashboard screens */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
          href: isLandlord ? '/' : null,
        }}
      />
      <Tabs.Screen
        name="staff-dashboard"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
          href: (isStaff && canViewDashboard) ? '/staff-dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="resident-dashboard"
        options={{
          title: language === 'ar' ? 'الرئيسية' : 'Main',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
          href: isResident ? '/resident-dashboard' : null,
        }}
      />

      {/* Collections */}
      <Tabs.Screen
        name="collections"
        options={{
          title: t('collections'),
          tabBarIcon: ({ size, color }) => (
            <Coins size={size} color={color} />
          ),
          href: (isLandlord || (isStaff && canViewCollections)) ? '/collections' : null,
        }}
      />

      {/* Tenants/Invitations */}
      <Tabs.Screen
        name="residents"
        options={{
          title: language === 'ar' ? 'المستأجرين' : 'Residents',
          tabBarIcon: ({ size, color }) => (
            <UserPlus size={size} color={color} />
          ),
          href: (isLandlord || (isStaff && canViewTenants)) ? '/residents' : null,
        }}
      />

      {/* Staff Reports */}

      {/* Resident Payments */}
      <Tabs.Screen
        name="resident-payments"
        options={{
          title: language === 'ar' ? 'المدفوعات' : 'Payments',
          tabBarIcon: ({ size, color }) => (
            <CreditCard size={size} color={color} />
          ),
          href: isResident ? '/resident-payments' : null,
        }}
      />


      {/* Settings - Available to all roles */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens - available but not in tab bar */}
      <Tabs.Screen name="ai-create" options={{ href: null }} />
      <Tabs.Screen name="property-details" options={{ href: null }} />
      <Tabs.Screen name="unit-details" options={{ href: null }} />
      <Tabs.Screen name="resident-profile" options={{ href: null }} />
      <Tabs.Screen name="properties" options={{ href: null }} />
      <Tabs.Screen name="contract-form" options={{ href: null }} />
      <Tabs.Screen name="contract-details" options={{ href: null }} />
      <Tabs.Screen name="tenants" options={{ href: null }} />
      <Tabs.Screen name="tenants-management" options={{ href: null }} />
      <Tabs.Screen name="privacy" options={{ href: null }} />
      <Tabs.Screen name="payment-methods" options={{ href: null }} />
      <Tabs.Screen name="team-management" options={{ href: null }} />
      <Tabs.Screen name="pricing-setup" options={{ href: null }} />
      <Tabs.Screen name="resident-notifications" options={{ href: null }} />
      <Tabs.Screen name="audit-log" options={{ href: null }} />
    </Tabs>
  );
}