import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Property } from '@/types';
import { Building2, MapPin } from 'lucide-react-native';

// Mock data
const mockProperties: (Property & { occupiedUnits: number; totalUnits: number })[] = [
  {
    id: '1',
    landlordId: '1',
    name: 'برج العلامة',
    address: 'شارع الملك فهد',
    city: 'الرياض',
    notes: '',
    photos: [],
    occupiedUnits: 18,
    totalUnits: 20,
  },
  {
    id: '2',
    landlordId: '1',
    name: 'مجمع النور السكني',
    address: 'حي الصفا',
    city: 'جدة',
    notes: '',
    photos: [],
    occupiedUnits: 20,
    totalUnits: 25,
  },
];

export default function PropertiesScreen() {
  const { t, language, isRTL } = useLocalization();
  const { colors } = useTheme();

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
          {t('properties')}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {mockProperties.map((property) => (
          <Card key={property.id}>
            <TouchableOpacity style={styles.propertyContent}>
              <View style={[styles.propertyHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Building2 size={24} color={colors.primary} />
                </View>
                <View style={styles.propertyInfo}>
                  <Text
                    style={[
                      styles.propertyName,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {property.name}
                  </Text>
                  <View style={[styles.locationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <MapPin size={16} color={colors.textMuted} />
                    <Text
                      style={[
                        styles.location,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {property.city}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.propertyStats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text
                  style={[
                    styles.statsText,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'monospace',
                    },
                  ]}
                >
                  {property.occupiedUnits}/{property.totalUnits} {language === 'ar' ? 'وحدة مؤجرة' : 'units occupied'}
                </Text>
                <StatusChip 
                  status={property.occupiedUnits === property.totalUnits ? 'occupied' : 'vacant'} 
                  size="sm" 
                />
              </View>
            </TouchableOpacity>
          </Card>
        ))}
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
  },
  title: {
    fontSize: fontSize.xl,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  propertyContent: {
    padding: 0,
    marginBottom: spacing.md,
  },
  propertyHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  locationRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: fontSize.sm,
  },
  propertyStats: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: fontSize.sm,
  },
});