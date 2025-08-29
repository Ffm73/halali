import '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CustomAlertProvider } from '@/components/ui/CustomAlert';
import { useFonts } from 'expo-font';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';
import { Platform } from 'react-native';

// Polyfill AsyncStorage for web
if (Platform.OS === 'web') {
  if (typeof window !== 'undefined' && !window.AsyncStorage) {
    window.AsyncStorage = AsyncStorage;
  }
  if (typeof global !== 'undefined' && !global.AsyncStorage) {
    global.AsyncStorage = AsyncStorage;
  }
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Tajawal-Regular': Tajawal_400Regular,
    'Tajawal-Medium': Tajawal_500Medium,
    'Tajawal-Bold': Tajawal_700Bold,
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Medium': Nunito_500Medium,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FDF9' }}>
        <Text style={{ fontSize: 16, color: '#4CA771' }}>
          {Platform.OS === 'web' ? 'Loading...' : 'Loading fonts...'}
        </Text>
      </View>
    );
  }

  if (fontError) {
    console.error('Font loading error:', fontError);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FDF9' }}>
        <Text style={{ fontSize: 16, color: '#EF4444' }}>
          {Platform.OS === 'web' ? 'Loading error' : 'Font loading failed'}
        </Text>
      </View>
    );
  }

  return (
    <CustomAlertProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </CustomAlertProvider>
  );
}