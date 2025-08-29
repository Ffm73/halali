import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="welcome-signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register-landlord" />
      <Stack.Screen name="register-resident" />
      <Stack.Screen name="register-staff" />
    </Stack>
  );
}