import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useTenants, TenantRecord } from '@/hooks/useTenants';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Search, User, Phone, CreditCard, Plus, X, Check, Users, Star, Clock } from 'lucide-react-native';

interface TenantSelectorProps {
  visible: boolean;
  onClose: () => void;
  onTenantSelected: (tenant: TenantRecord) => void;
  onCreateNew: () => void;
  excludeTenantIds?: string[];
}

export function TenantSelector({ 
  visible, 
  onClose, 
  onTenantSelected, 
  onCreateNew,
  excludeTenantIds = [] 
}: TenantSelectorProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { tenants, searchTenants } = useTenants();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDateFields, setShowDateFields] = useState(false);

  const categories = [
    { 
      id: 'all', 
      label: language === 'ar' ? 'الكل' : 'All',
      icon: Users,
      color: colors.primary,
    },
    { 
      id: 'active', 
      label: language === 'ar' ? 'نشط' : 'Active',
      icon: Star,
      color: colors.success,
    },
    { 
      id: 'inactive', 
      label: language === 'ar' ? 'غير نشط' : 'Inactive',
      icon: Clock,
      color: colors.textMuted,
    },
  ];

  const getFilteredTenants = () => {
    let filtered = tenants.filter(t => !excludeTenantIds.includes(t.id));
    
    // Apply category filter
    if (selectedCategory === 'active') {
      filtered = filtered.filter(t => t.currentContracts > 0);
    } else if (selectedCategory === 'inactive') {
      filtered = filtered.filter(t => t.currentContracts === 0);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchTenants(searchQuery).filter(t => !excludeTenantIds.includes(t.id));
    }
    
    return filtered;
  };

  const getTenantStatusBadge = (tenant: TenantRecord) => {
    if (tenant.currentContracts > 0) {
      return {
        label: language === 'ar' ? 'مستأجر حالي' : 'Current Tenant',
        color: colors.success,
        backgroundColor: colors.successLight,
      };
    } else if (tenant.totalContracts > 0) {
      return {
        label: language === 'ar' ? 'مستأجر سابق' : 'Former Tenant',
        color: colors.warning,
        backgroundColor: colors.warningLight,
      };
    } else {
      return {
        label: language === 'ar' ? 'جديد' : 'New',
        color: colors.primary,
        backgroundColor: colors.primaryLight,
      };
    }
  };

  const filteredTenants = getFilteredTenants();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
          >
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.modalTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'اختيار المستأجر' : 'Select Tenant'}
          </Text>
        </View>

        {/* Search Bar */}
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
        </View>

        {/* Category Filters */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={[styles.categories, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategory === category.id ? category.color : colors.surfaceSecondary,
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id as any)}
                  activeOpacity={0.8}
                >
                  <category.icon 
                    size={18} 
                    color={selectedCategory === category.id ? colors.surface : category.color} 
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: selectedCategory === category.id ? colors.surface : category.color,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Create New Tenant Button */}
        <View style={styles.createNewSection}>
          <TouchableOpacity
            style={[styles.createNewButton, { backgroundColor: colors.primary }]}
            onPress={onCreateNew}
            activeOpacity={0.8}
          >
            <Plus size={24} color={colors.surface} />
            <Text
              style={[
                styles.createNewText,
                {
                  color: colors.surface,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                },
              ]}
            >
              {language === 'ar' ? 'إضافة مستأجر جديد' : 'Add New Tenant'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tenants List */}
        <ScrollView style={styles.tenantsList} showsVerticalScrollIndicator={true}>
          {filteredTenants.map((tenant) => {
            const statusBadge = getTenantStatusBadge(tenant);
            
            return (
              <TouchableOpacity
                key={tenant.id}
                style={[styles.tenantItem, { backgroundColor: colors.surface }]}
                onPress={() => onTenantSelected(tenant)}
                activeOpacity={0.7}
              >
                <View style={[styles.tenantHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.tenantIcon, { backgroundColor: colors.primaryLight }]}>
                    <User size={24} color={colors.primary} />
                  </View>
                  <View style={styles.tenantInfo}>
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
                          ? `${tenant.totalContracts} عقود إجمالي • ${tenant.currentContracts} نشط`
                          : `${tenant.totalContracts} total contracts • ${tenant.currentContracts} active`
                        }
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tenantBadge}>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color: statusBadge.color,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredTenants.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <User size={48} color={colors.textMuted} />
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
              <Button
                title={language === 'ar' ? 'إضافة مستأجر جديد' : 'Add New Tenant'}
                onPress={onCreateNew}
                variant="primary"
                size="sm"
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
    alignItems: 'center',
    gap: spacing.md,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  searchSection: {
    padding: spacing.md,
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
  categoriesSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categories: {
    gap: spacing.sm,
  },
  categoryButton: {
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
  categoryButtonText: {
    fontSize: fontSize.sm,
  },
  createNewSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  createNewButton: {
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
  createNewText: {
    fontSize: fontSize.lg,
  },
  tenantsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  tenantItem: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    zIndex: 10,
  },
  tenantHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
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
  tenantName: {
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
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
  tenantStats: {
    alignItems: 'center',
  },
  tenantStatsText: {
    fontSize: fontSize.xs,
  },
  tenantBadge: {
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
    borderRadius: borderRadius.card,
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
    marginBottom: spacing.md,
  },
});