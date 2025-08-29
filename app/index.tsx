import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { language } = useLocalization();

  console.log('🏠 Index screen mounted - Auth state:', { 
    isAuthenticated, 
    isLoading, 
    userRole: user?.role,
    userName: user?.fullName,
    hasUser: !!user
  });

  useEffect(() => {
    console.log('🔍 Index useEffect triggered');
    console.log('🔍 Current auth state:', { isAuthenticated, isLoading, userRole: user?.role, hasUser: !!user });
    
    if (!isLoading) {
      console.log('✅ Auth loading complete:', { 
        isAuthenticated, 
        userRole: user?.role,
        hasUser: !!user,
        willRedirect: isAuthenticated && user
      });
      
      if (isAuthenticated && user) {
        console.log('🎯 User authenticated, determining redirect...');
        // Route based on user role
        if (user.role === 'resident') {
          console.log('🏠 Redirecting resident to resident portal');
          router.replace('/(tabs)/resident-dashboard');
        } else if (user.role === 'staff') {
          console.log('👥 Redirecting subuser to staff dashboard');
          router.replace('/(tabs)/staff-dashboard');
        } else {
          console.log('🏢 Redirecting landlord to landlord portal');
          router.replace('/(tabs)');
        }
      } else {
        console.log('🔐 Not authenticated, redirecting to welcome');
        router.replace('/(auth)/welcome');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading screen while checking auth
  if (isLoading) {
    console.log('⏳ Rendering loading screen');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  console.log('🔄 Rendering empty view (should redirect soon)');
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>
        {language === 'ar' ? 'جاري التحميل...' : 'Initializing...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.light.primary,
  },
});