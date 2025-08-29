import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { ContractManager } from '@/components/contracts/ContractManager';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useTenants } from '@/hooks/useTenants';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Unit, Contract, User } from '@/types';
import { ArrowLeft, ArrowRight, Plus, Bed, Bath, Home, Users, RefreshCw } from 'lucide-react-native';
import { UtensilsCrossed, Sofa } from 'lucide-react-native';
import { useEffect } from 'react';

// Mock tenant data
const mockTenants: User[] = [
  {
    id: 'tenant1',
    role: 'resident',
    fullName: 'محمد أحمد السعيد',
    email: 'mohammed@example.com',
    phoneE164: '+966501234567',
    language: 'ar',
    country: 'SA',
    timeZone: 'Asia/Riyadh',
    status: 'active',
  },
  {
    id: 'tenant2',
    role: 'resident',
    fullName: 'فاطمة علي الزهراني',
    email: 'fatima@example.com',
    phoneE164: '+966509876543',
    language: 'ar',
    country: 'SA',
    timeZone: 'Asia/Riyadh',
    status: 'active',
  },
];

// Mock contract data
const mockContracts: Contract[] = [
  {
    id: 'contract1',
    unitId: '1',
    residentUserId: 'tenant1',
    type: 'residential',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    durationMonths: 12,
    depositAmount: 5000,
    commissionAmount: 0,
    vatRate: 0.15,
    paymentFrequency: 'monthly',
    status: 'active',
    attachments: [],
    signedAt: '2023-12-15T10:00:00Z',
  },
  {
    id: 'contract2',
    unitId: '3',
    residentUserId: 'tenant2',
    type: 'residential',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    durationMonths: 12,
    depositAmount: 5000,
    commissionAmount: 0,
    vatRate: 0.15,
    paymentFrequency: 'monthly',
    status: 'active',
    attachments: [],
    signedAt: '2024-01-20T14:30:00Z',
  },
];

// Mock units data
const mockUnits: Unit[] = [
  {
    id: '1',
    propertyId: '1',
    unitLabel: 'A-101',
    bedrooms: 2,
    bathrooms: 1,
    hasKitchen: true,
    hasLivingRoom: true,
    floor: 1,
    sizeSqm: 85,
    status: 'occupied',
    amenities: ['مكيف', 'موقف سيارة'],
    photos: [],
  },
  {
    id: '2',
    propertyId: '1',
    unitLabel: 'A-102',
    bedrooms: 3,
    bathrooms: 2,
    hasKitchen: true,
    hasLivingRoom: true,
    floor: 1,
    sizeSqm: 120,
    status: 'vacant',
    amenities: ['مكيف', 'موقف سيارة', 'شرفة'],
    photos: [],
  },
  {
    id: '3',
    propertyId: '1',
    unitLabel: 'B-201',
    bedrooms: 2,
    bathrooms: 1,
    hasKitchen: true,
    hasLivingRoom: true,
    floor: 2,
    sizeSqm: 85,
    status: 'occupied',
    amenities: ['مكيف'],
    photos: [],
  },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getStyles = (colors: any, spacing: any, fontSize: any, borderRadius: any, isRTL: boolean) => StyleSheet.create({
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
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  unitCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
  },
  unitContent: {
    padding: 0,
  },
  unitHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  unitInfo: {
    flex: 1,
  },
  unitLabel: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  floorText: {
    fontSize: fontSize.sm,
  },
  unitDetails: {
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
  },
  amenitiesContainer: {
    marginTop: spacing.xs,
  },
  amenitiesText: {
    fontSize: fontSize.xs,
  },
  addContractContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addContractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addContractText: {
    fontSize: fontSize.sm,
  },
});

export default function PropertyDetailsScreen() {
  const { t, language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { isUnitOccupied, refreshData, forceRefresh } = useTenants();
  const router = useRouter();
  const { id, name, refresh } = useLocalSearchParams();
  const [units] = useState<Unit[]>(mockUnits);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = getStyles(colors, spacing, fontSize, borderRadius, isRTL);

  // Auto-refresh when refresh parameter changes
  useEffect(() => {
    if (refresh) {
      handleRefresh();
    }
  }, [refresh]);

  const propertyName = typeof name === 'string' ? decodeURIComponent(name) : 'Property';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      forceRefresh();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleContractChange = () => {
    // Refresh data and trigger re-render
    handleRefresh();
  };

  const handleAddUnit = () => {
    router.push('/(tabs)/ai-create');
  };

  const handleUnitPress = (unit: Unit) => {
    // Navigate to unit details page
    router.push({
      pathname: '/(tabs)/unit-details',
      params: {
        unitId: unit.id,
        unitLabel: unit.unitLabel,
        propertyName: typeof name === 'string' ? decodeURIComponent(name) : 'Property',
        propertyId: id || '1',
      },
    });
  };

  const getTenantForUnit = (unitId: string): User | null => {
    const contract = mockContracts.find(c => c.unitId === unitId && c.status === 'active');
    if (!contract) return null;
    return mockTenants.find(t => t.id === contract.residentUserId) || null;
  };

  const getContractForUnit = (unitId: string): Contract | null => {
    return mockContracts.find(c => c.unitId === unitId && c.status === 'active') || null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          {isRTL ? (
            <ArrowRight size={24} color={colors.textPrimary} />
          ) : (
            <ArrowLeft size={24} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {propertyName}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primaryLight }]}
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          <RefreshCw 
            size={20} 
            color={colors.primary} 
            style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>

      {/* Add Unit Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title={language === 'ar' ? 'إضافة وحدة' : 'Add Unit'}
          onPress={handleAddUnit}
          variant="primary"
        />
      </View>

      {/* Units List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'الوحدات' : 'Units'} ({units.length})
        </Text>

        {units.map((unit) => (
          <Card key={unit.id} style={styles.unitCard}>
            <TouchableOpacity
              style={styles.unitContent}
              onPress={() => handleUnitPress(unit)}
              activeOpacity={0.7}
            >
              <View style={[styles.unitHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.unitInfo}>
                  <Text
                    style={[
                      styles.unitLabel,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {unit.unitLabel}
                  </Text>
                  <Text
                    style={[
                      styles.floorText,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? `الطابق ${unit.floor}` : `Floor ${unit.floor}`}
                    {unit.sizeSqm && ` • ${unit.sizeSqm} ${language === 'ar' ? 'م²' : 'sqm'}`}
                  </Text>
                </View>
                <StatusChip status={isUnitOccupied(unit.id) ? 'occupied' : 'vacant'} />
              </View>

              <View style={[styles.unitDetails, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.detailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Bed size={16} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.detailText,
                      {
                        color: colors.textSecondary,
                        fontFamily: 'monospace',
                      },
                    ]}
                  >
                    {unit.bedrooms}
                  </Text>
                </View>

                <View style={[styles.detailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Bath size={16} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.detailText,
                      {
                        color: colors.textSecondary,
                        fontFamily: 'monospace',
                      },
                    ]}
                  >
                    {unit.bathrooms}
                  </Text>
                </View>

                {unit.hasKitchen && (
                  <View style={[styles.detailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <UtensilsCrossed size={16} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.detailText,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'مطبخ' : 'Kitchen'}
                    </Text>
                  </View>
                )}

                {unit.hasLivingRoom && (
                  <View style={[styles.detailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Sofa size={16} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.detailText,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'صالة' : 'Living'}
                    </Text>
                  </View>
                )}
              </View>

              {unit.amenities.length > 0 && (
                <View style={styles.amenitiesContainer}>
                  <Text
                    style={[
                      styles.amenitiesText,
                      {
                        color: colors.textMuted,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {unit.amenities.join(' • ')}
                  </Text>
                </View>
              )}

              {!isUnitOccupied(unit.id) && (
                <View style={styles.addContractContainer}>
                  <TouchableOpacity
                    style={[styles.addContractButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                    onPress={() => router.push({
                      pathname: '/(tabs)/contract-form',
                      params: {
                        unitId: unit.id,
                        unitLabel: unit.unitLabel,
                        propertyName: typeof name === 'string' ? decodeURIComponent(name) : 'Property',
                      },
                    })}
                    activeOpacity={0.7}
                  >
                    <Plus size={16} color={colors.primary} />
                    <Text
                      style={[
                        styles.addContractText,
                        {
                          color: colors.primary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'إضافة عقد' : 'Add Contract'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}