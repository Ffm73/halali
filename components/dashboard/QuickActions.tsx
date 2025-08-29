import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing, borderRadius, fontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { Mic, Building2, UserPlus, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function QuickActions() {
  const { t, language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const router = useRouter();

  const actions = [
    {
      id: 'ai-create',
      icon: Mic,
      label: language === 'ar' ? 'إضافة عقار' : 'Add Property',
      onPress: () => router.push('/(tabs)/ai-create'),
    },
    {
      id: 'add-property',
      icon: Building2,
      label: language === 'ar' ? 'العقارات' : 'Properties',
      onPress: () => router.push('/(tabs)/properties'),
    },
    {
      id: 'invite-staff',
      icon: UserPlus,
      label: language === 'ar' ? 'دعوة موظف' : 'Invite Staff',
      onPress: () => router.push('/(tabs)/settings'),
    },
  ];

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <action.icon size={24} color={colors.primary} />
          <Text
            style={[
              styles.actionLabel,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Medium',
                textAlign: 'center',
              },
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});