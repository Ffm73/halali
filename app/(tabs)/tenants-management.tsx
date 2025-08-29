import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { TenantSelector } from '@/components/tenants/TenantSelector';
import { DatePicker } from '@/components/ui/DatePicker';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useTenants, TenantRecord } from '@/hooks/useTenants';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { ArrowLeft, ArrowRight, Users, UserPlus, Phone, Mail, MessageSquare, CreditCard as Edit3, Trash2, Search, Filter, Building2, Calendar, Star, Clock, Eye, Plus } from 'lucide-react-native';

export default function TenantsManagementScreen() {
  const { language, isRTL, formatDate } = useLocalization();
  const { colors } = useTheme();
  const { 
    tenants, 
    contracts, 
    occupancies,
    getTenantStats, 
    getTenantContracts, 
    getTenantCurrentUnit,
    updateTenant,
    searchTenants 
  } = useTenants();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);

  const stats = getTenantStats();

  const filters = [
    { 
      id: 'all', 
      label: language === 'ar' ? 'الكل' : 'All',
      icon: Users,
      color: colors.primary,
      count: stats.totalTenants,
    },
    { 
      id: 'active', 
      label: language === 'ar' ? 'نشط' : 'Active',
      icon: Star,
      color: colors.success,
      count: stats.activeTenants,
    },
    { 
      id: 'inactive', 
      label: language === 'ar' ? 'غير نشط' : 'Inactive',
      icon: Clock,
      color: colors.textMuted,
      count: stats.inactiveTenants,
    },
  ];

  const getFilteredTenants = () => {
    let filtered = tenants;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchTenants(searchQuery);
    }
    
    // Apply status filter
    if (selectedFilter === 'active') {
      filtered = filtered.filter(t => t.currentContracts > 0);
    } else if (selectedFilter === 'inactive') {
      filtered = filtered.filter(t => t.currentContracts === 0);
    }
    
    return filtered;
  };

  const handleContactTenant = (tenant: TenantRecord, method: 'call' | 'whatsapp' | 'sms') => {
    const actions = {
      call: `tel:${tenant.phoneE164}`,
      whatsapp: `whatsapp://send?phone=${tenant.phoneE164}`,
      sms: `sms:${tenant.phoneE164}`,
    };
    
    Linking.openURL(actions[method]).catch(() => {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'لا يمكن فتح التطبيق' : 'Cannot open application'
      );
    });
  };

  const handleEditTenant = (tenant: TenantRecord) => {
    setSelectedTenant(tenant);
    Alert.alert(
      language === 'ar' ? 'تعديل المستأجر' : 'Edit Tenant',
      language === 'ar' ? 'سيتم فتح نموذج تعديل بيانات المستأجر' : 'Tenant edit form will open'
    );
  };

  const handleDeactivateTenant = async (tenant: TenantRecord) => {
    if (tenant.currentContracts > 0) {
      Alert.alert(
        language === 'ar' ? 'لا يمكن الإلغاء' : 'Cannot Deactivate',
        language === 'ar' ? 'لا يمكن إلغاء تفعيل مستأجر لديه عقود نشطة' : 'Cannot deactivate tenant with active contracts'
      );
      return;
    }

    Alert.alert(
      language === 'ar' ? 'إلغاء تفعيل المستأجر' : 'Deactivate Tenant',
      language === 'ar' ? `هل تريد إلغاء تفعيل ${tenant.fullName}؟` : `Deactivate ${tenant.fullName}?`,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            const success = await updateTenant(tenant.id, { status: 'inactive' });
            if (success) {
              Alert.alert(
                language === 'ar' ? 'تم' : 'Done',
                language === 'ar' ? 'تم إلغاء تفعيل المستأجر' : 'Tenant deactivated'
              );
            }
          }
        },
      ]
    );
  };

  const getTenantStatusInfo = (tenant: TenantRecord) => {
    if (tenant.currentContracts > 0) {
      const currentUnit = getTenantCurrentUnit(tenant.id);
      return {
        status: 'active',
        label: language === 'ar' ? 'مستأجر حالي' : 'Current Tenant',
        color: colors.success,
        backgroundColor: colors.successLight,
        unit: currentUnit,
      };
    } else if (tenant.totalContracts > 0) {
      return {
        status: 'former',
        label: language === 'ar' ? 'مستأجر سابق' : 'Former Tenant',
        color: colors.warning,
        backgroundColor: colors.warningLight,
        unit: null,
      };
    } else {
      return {
        status: 'new',
        label: language === 'ar' ? 'جديد' : 'New',
        color: colors.primary,
        backgroundColor: colors.primaryLight,
        unit: null,
      };
    }
  };

  const filteredTenants = getFilteredTenants();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
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
          {language === 'ar' ? 'إدارة المستأجرين' : 'Tenant Management'}
        </Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Users size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.primary, fontFamily: 'monospace' }]}>
              {stats.totalTenants}
            </Text>
            <Text style={[styles.statLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'إجمالي المستأجرين' : 'Total Tenants'}
            </Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
              <Star size={24} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.success, fontFamily: 'monospace' }]}>
              {stats.activeTenants}
            </Text>
            <Text style={[styles.statLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'نشط' : 'Active'}
            </Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
              <Clock size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.warning, fontFamily: 'monospace' }]}>
              {stats.totalContracts}
            </Text>
            <Text style={[styles.statLabel, { 
              color: colors.textSecondary,
              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
            }]}>
              {language === 'ar' ? 'إجمالي العقود' : 'Total Contracts'}
            </Text>
          </Card>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={language === 'ar' ? 'البحث بالاسم، الهاتف، أو رقم الهوية' : 'Search by name, phone, or ID'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={[styles.filters, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedFilter === filter.id ? filter.color : colors.surfaceSecondary,
                    borderColor: filter.color,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id as any)}
                activeOpacity={0.8}
              >
                <filter.icon 
                  size={18} 
                  color={selectedFilter === filter.id ? colors.surface : filter.color} 
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedFilter === filter.id ? colors.surface : filter.color,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tenants List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {filteredTenants.map((tenant) => {
          const statusInfo = getTenantStatusInfo(tenant);
          const tenantContracts = getTenantContracts(tenant.id);
          
          return (
            <Card key={tenant.id} style={[styles.tenantCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.tenantHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.tenantIcon, { backgroundColor: statusInfo.backgroundColor }]}>
                  <Users size={24} color={statusInfo.color} />
                </View>
                <View style={styles.tenantInfo}>
                  <View style={[styles.tenantTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text
                      style={[
                        styles.tenantName,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {tenant.fullName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color: statusInfo.color,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.tenantDetails, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.tenantDetailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Phone size={14} color={colors.textMuted} />
                      <Text
                        style={[
                          styles.tenantDetailText,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                          },
                        ]}
                      >
                        {tenant.phoneE164}
                      </Text>
                    </View>
                    {tenant.nationalId && (
                      <View style={[styles.tenantDetailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <CreditCard size={14} color={colors.textMuted} />
                        <Text
                          style={[
                            styles.tenantDetailText,
                            {
                              color: colors.textSecondary,
                              fontFamily: 'monospace',
                            },
                          ]}
                        >
                          {tenant.nationalId}
                        </Text>
                      </View>
                    )}
                  </View>

                  {statusInfo.unit && (
                    <View style={[styles.currentUnitInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Building2 size={16} color={colors.primary} />
                      <Text
                        style={[
                          styles.currentUnitText,
                          {
                            color: colors.primary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {language === 'ar' ? `الوحدة الحالية: ${statusInfo.unit}` : `Current Unit: ${statusInfo.unit}`}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.tenantStats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text
                      style={[
                        styles.tenantStatsText,
                        {
                          color: colors.textMuted,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        },
                      ]}
                    >
                      {language === 'ar' 
                        ? `${tenant.totalContracts} عقود إجمالي • انضم ${formatDate(tenant.createdAt)}`
                        : `${tenant.totalContracts} total contracts • Joined ${formatDate(tenant.createdAt)}`
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.actionButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => handleContactTenant(tenant, 'call')}
                  activeOpacity={0.7}
                >
                  <Phone size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                  onPress={() => handleContactTenant(tenant, 'whatsapp')}
                  activeOpacity={0.7}
                >
                  <MessageSquare size={16} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.warningLight }]}
                  onPress={() => handleEditTenant(tenant)}
                  activeOpacity={0.7}
                >
                  <Edit3 size={16} color={colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => {
                    Alert.alert(
                      language === 'ar' ? 'تاريخ العقود' : 'Contract History',
                      language === 'ar' 
                        ? `${tenant.fullName} لديه ${tenant.totalContracts} عقود في المجموع`
                        : `${tenant.fullName} has ${tenant.totalContracts} contracts total`
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Eye size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}

        {filteredTenants.length === 0 && (
          <Card style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Users size={48} color={colors.textMuted} />
            </View>
            <Text
              style={[
                styles.emptyStateTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: 'center',
                },
              ]}
            >
              {language === 'ar' ? 'لا توجد نتائج' : 'No Results Found'}
            </Text>
            <Text
              style={[
                styles.emptyStateText,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: 'center',
                },
              ]}
            >
              {searchQuery 
                ? (language === 'ar' ? 'لا توجد نتائج للبحث' : 'No search results')
                : (language === 'ar' ? 'لا يوجد مستأجرين' : 'No tenants available')
              }
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Add Tenant Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowTenantSelector(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color={colors.surface} />
          <Text
            style={[
              styles.addButtonText,
              {
                color: colors.surface,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
              },
            ]}
          >
            {language === 'ar' ? 'إدارة المستأجرين' : 'Tenant Management'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tenant Selector Modal */}
      <TenantSelector
        visible={showTenantSelector}
        onClose={() => setShowTenantSelector(false)}
        onTenantSelected={(tenant) => {
          setShowTenantSelector(false);
          Alert.alert(
            language === 'ar' ? 'تم اختيار المستأجر' : 'Tenant Selected',
            language === 'ar' ? `تم اختيار ${tenant.fullName}` : `Selected ${tenant.fullName}`
          );
        }}
        onCreateNew={() => {
          setShowTenantSelector(false);
          Alert.alert(
            language === 'ar' ? 'إضافة مستأجر جديد' : 'Add New Tenant',
            language === 'ar' ? 'سيتم فتح نموذج إضافة مستأجر جديد' : 'New tenant form will open'
          );
        }}
      />
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
  statsSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    minHeight: 24,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  tenantCard: {
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tenantHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tenantIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantTitleRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tenantName: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  tenantDetails: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  tenantDetailItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  tenantDetailText: {
    fontSize: fontSize.sm,
  },
  currentUnitInfo: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  currentUnitText: {
    fontSize: fontSize.sm,
  },
  tenantStats: {
    alignItems: 'center',
  },
  tenantStatsText: {
    fontSize: fontSize.xs,
  },
  actionButtons: {
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  addButtonContainer: {
    padding: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: fontSize.lg,
  },
});