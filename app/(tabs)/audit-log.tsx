import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { AccessControl } from '@/components/ui/AccessControl';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { AuditLogEntry } from '@/types';
import { ArrowLeft, ArrowRight, Search, Filter, User, Calendar, Activity, Eye, DollarSign, FileText, Building2, Users, CreditCard, TrendingDown, TrendingUp, Clock, Shield } from 'lucide-react-native';

export default function AuditLogScreen() {
  const { language, isRTL, formatDate, formatDateTime } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { auditLogs, isLoading, getLogsByUser, getLogsByAction, getLogsByDateRange } = useAuditLog();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'payments' | 'contracts' | 'properties'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const getActionIcon = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'payment_accepted':
      case 'payment_declined':
        return DollarSign;
      case 'contract_edited':
      case 'discount_applied':
      case 'rent_adjusted':
        return FileText;
      case 'property_updated':
        return Building2;
      case 'unit_updated':
        return Building2;
      case 'tenant_updated':
        return Users;
      default:
        return Activity;
    }
  };

  const getActionColor = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'payment_accepted':
        return colors.success;
      case 'payment_declined':
        return colors.danger;
      case 'contract_edited':
      case 'discount_applied':
        return colors.warning;
      case 'rent_adjusted':
        return colors.primary;
      case 'property_updated':
      case 'unit_updated':
        return colors.primary;
      case 'tenant_updated':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getActionLabel = (action: AuditLogEntry['action']) => {
    const labels = {
      payment_accepted: { ar: 'قبول دفعة', en: 'Payment Accepted' },
      payment_declined: { ar: 'رفض دفعة', en: 'Payment Declined' },
      contract_edited: { ar: 'تعديل عقد', en: 'Contract Edited' },
      discount_applied: { ar: 'تطبيق خصم', en: 'Discount Applied' },
      rent_adjusted: { ar: 'تعديل إيجار', en: 'Rent Adjusted' },
      property_updated: { ar: 'تحديث عقار', en: 'Property Updated' },
      unit_updated: { ar: 'تحديث وحدة', en: 'Unit Updated' },
      tenant_updated: { ar: 'تحديث مستأجر', en: 'Tenant Updated' },
    };
    
    return labels[action]?.[language] || action;
  };

  const getUserRoleLabel = (role: string) => {
    const roles = {
      manager: { ar: 'مدير', en: 'Manager' },
      accountant: { ar: 'محاسب', en: 'Accountant' },
      viewer: { ar: 'مشاهد', en: 'Viewer' },
    };
    
    return roles[role as keyof typeof roles]?.[language] || role;
  };

  const getFilteredLogs = () => {
    let filtered = auditLogs;
    
    // Enhanced search filter - search by employee names, resident names, and show all related operations
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        // 1. Search by employee/user name who performed the action - shows ALL operations by that employee
        // This shows ALL operations performed by that specific employee/subuser
        const userNameMatch = log.userName.toLowerCase().includes(query);
        
        // 2. Search by entity name (resident name, property name, etc.) - shows operations ON that entity
        const entityNameMatch = log.entityName.toLowerCase().includes(query);
        
        // 3. Search by action type - shows operations of that type
        const actionMatch = getActionLabel(log.action).toLowerCase().includes(query);
        
        // 4. Search in details for resident names - shows ALL operations RELATED TO that resident
        // This shows ALL operations related to that specific resident, regardless of who performed them
        const detailsMatch = log.details && (
          (log.details.residentName && log.details.residentName.toLowerCase().includes(query)) ||
          (log.details.propertyName && log.details.propertyName.toLowerCase().includes(query)) ||
          (log.details.unitLabel && log.details.unitLabel.toLowerCase().includes(query)) ||
          (log.details.notes && log.details.notes.toLowerCase().includes(query)) ||
          (log.details.reason && log.details.reason.toLowerCase().includes(query))
        );
        
        // Return true if ANY of the search criteria match
        // Return true if any of the search criteria match
        // This enables searching by:
        // - Employee name (shows all their operations)
        // - Resident name (shows all operations related to that resident)
        // - Action type, property names, unit labels, etc.
        return userNameMatch || entityNameMatch || actionMatch || detailsMatch;
      });
    }
    
    // Apply user filter
    if (selectedUser !== 'all') {
      filtered = getLogsByUser(selectedUser);
    }
    
    // Apply action filter
    if (selectedFilter === 'payments') {
      filtered = filtered.filter(log => log.action === 'payment_accepted' || log.action === 'payment_declined');
    } else if (selectedFilter === 'contracts') {
      filtered = filtered.filter(log => 
        log.action === 'contract_edited' || 
        log.action === 'discount_applied' || 
        log.action === 'rent_adjusted'
      );
    } else if (selectedFilter === 'properties') {
      filtered = filtered.filter(log => 
        log.action === 'property_updated' || 
        log.action === 'unit_updated' || 
        log.action === 'tenant_updated'
      );
    }
    
    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = getLogsByDateRange(dateRange.startDate, dateRange.endDate);
    }
    
    return filtered;
  };

  const filters = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All', count: auditLogs.length },
    { id: 'payments', label: language === 'ar' ? 'المدفوعات' : 'Payments', count: auditLogs.filter(l => l.action.includes('payment')).length },
    { id: 'contracts', label: language === 'ar' ? 'العقود' : 'Contracts', count: auditLogs.filter(l => l.action.includes('contract') || l.action.includes('discount') || l.action.includes('rent')).length },
    { id: 'properties', label: language === 'ar' ? 'العقارات' : 'Properties', count: auditLogs.filter(l => l.action.includes('property') || l.action.includes('unit') || l.action.includes('tenant')).length },
  ];

  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.userId)))
    .map(userId => {
      const log = auditLogs.find(l => l.userId === userId);
      return { id: userId, name: log?.userName || 'Unknown', role: log?.userRole || 'viewer' };
    });

  const filteredLogs = getFilteredLogs();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/settings')}
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
          {language === 'ar' ? 'سجل المراجعة' : 'Audit Log'}
        </Text>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Action Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={[styles.filters, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedFilter === filter.id ? colors.primary : colors.surface,
                    borderColor: selectedFilter === filter.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id as any)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedFilter === filter.id ? colors.surface : colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                    },
                  ]}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* User Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userFiltersScroll}>
          <View style={[styles.userFilters, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[
                styles.userFilterChip,
                {
                  backgroundColor: selectedUser === 'all' ? colors.success : colors.surface,
                  borderColor: selectedUser === 'all' ? colors.success : colors.border,
                },
              ]}
              onPress={() => setSelectedUser('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.userFilterText,
                  {
                    color: selectedUser === 'all' ? colors.surface : colors.textSecondary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                  },
                ]}
              >
                {language === 'ar' ? 'جميع المستخدمين' : 'All Users'}
              </Text>
            </TouchableOpacity>
            
            {uniqueUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userFilterChip,
                  {
                    backgroundColor: selectedUser === user.id ? colors.warning : colors.surface,
                    borderColor: selectedUser === user.id ? colors.warning : colors.border,
                  },
                ]}
                onPress={() => setSelectedUser(user.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.userFilterText,
                    {
                      color: selectedUser === user.id ? colors.surface : colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                    },
                  ]}
                >
                  {user.name} ({getUserRoleLabel(user.role)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Audit Log Entries */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {filteredLogs.map((entry) => {
          const ActionIcon = getActionIcon(entry.action);
          const actionColor = getActionColor(entry.action);
          const isExpanded = expandedEntry === entry.id;
          
          return (
            <Card key={entry.id} style={[styles.logEntry, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.logEntryHeader}
                onPress={() => setExpandedEntry(isExpanded ? null : entry.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.logEntryMain, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.actionIcon, { backgroundColor: `${actionColor}20` }]}>
                    <ActionIcon size={20} color={actionColor} />
                  </View>
                  
                  <View style={styles.logEntryInfo}>
                    <Text
                      style={[
                        styles.actionText,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {getActionLabel(entry.action)}
                    </Text>
                    <Text
                      style={[
                        styles.entityText,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {entry.entityName}
                    </Text>
                    <View style={[styles.logEntryMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.userInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <User size={12} color={colors.textMuted} />
                        <Text
                          style={[
                            styles.userText,
                            {
                              color: colors.textMuted,
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          {entry.userName} ({getUserRoleLabel(entry.userRole)})
                        </Text>
                      </View>
                      <View style={[styles.timeInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Clock size={12} color={colors.textMuted} />
                        <Text
                          style={[
                            styles.timeText,
                            {
                              color: colors.textMuted,
                              fontFamily: 'monospace',
                            },
                          ]}
                        >
                          {formatDateTime(entry.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.logEntryActions}>
                    <View style={[styles.actionBadge, { backgroundColor: `${actionColor}20` }]}>
                      <Text
                        style={[
                          styles.actionBadgeText,
                          {
                            color: actionColor,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {entry.entityType}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={[styles.expandedDetails, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text
                    style={[
                      styles.detailsTitle,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'تفاصيل التغيير' : 'Change Details'}
                  </Text>
                  
                  {entry.details.amount && (
                    <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Text style={[styles.detailLabel, { 
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                      }]}>
                        {language === 'ar' ? 'المبلغ:' : 'Amount:'}
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: colors.textPrimary,
                        fontFamily: 'monospace' 
                      }]}>
                        {entry.details.amount.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Text>
                    </View>
                  )}
                  
                  {entry.details.reason && (
                    <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Text style={[styles.detailLabel, { 
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                      }]}>
                        {language === 'ar' ? 'السبب:' : 'Reason:'}
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                      }]}>
                        {entry.details.reason}
                      </Text>
                    </View>
                  )}
                  
                  {entry.details.notes && (
                    <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Text style={[styles.detailLabel, { 
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                      }]}>
                        {language === 'ar' ? 'ملاحظات:' : 'Notes:'}
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
                      }]}>
                        {entry.details.notes}
                      </Text>
                    </View>
                  )}
                  
                  {/* Before/After Changes */}
                  {entry.details.before && entry.details.after && (
                    <View style={styles.changeComparison}>
                      <View style={[styles.changeSection, { backgroundColor: colors.dangerLight }]}>
                        <Text style={[styles.changeLabel, { 
                          color: colors.danger,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
                        }]}>
                          {language === 'ar' ? 'قبل:' : 'Before:'}
                        </Text>
                        <Text style={[styles.changeValue, { 
                          color: colors.textPrimary,
                          fontFamily: 'monospace' 
                        }]}>
                          {JSON.stringify(entry.details.before, null, 2)}
                        </Text>
                      </View>
                      
                      <View style={[styles.changeSection, { backgroundColor: colors.successLight }]}>
                        <Text style={[styles.changeLabel, { 
                          color: colors.success,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold' 
                        }]}>
                          {language === 'ar' ? 'بعد:' : 'After:'}
                        </Text>
                        <Text style={[styles.changeValue, { 
                          color: colors.textPrimary,
                          fontFamily: 'monospace' 
                        }]}>
                          {JSON.stringify(entry.details.after, null, 2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </Card>
          );
        })}

        {filteredLogs.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Shield size={48} color={colors.textMuted} />
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: 'center',
                },
              ]}
            >
              {language === 'ar' ? 'لا توجد سجلات' : 'No Audit Logs'}
            </Text>
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: 'center',
                },
              ]}
            >
              {searchQuery 
                ? (language === 'ar' ? 'لا توجد نتائج للبحث' : 'No search results')
                : (language === 'ar' ? 'لا توجد أنشطة مسجلة' : 'No activities recorded')
              }
            </Text>
          </View>
        )}
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
  filtersSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    minHeight: 20,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterText: {
    fontSize: fontSize.sm,
  },
  userFiltersScroll: {
    flexGrow: 0,
  },
  userFilters: {
    gap: spacing.sm,
  },
  userFilterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  userFilterText: {
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  logEntry: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  logEntryHeader: {
    padding: spacing.lg,
  },
  logEntryMain: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logEntryInfo: {
    flex: 1,
  },
  actionText: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  entityText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  logEntryMeta: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  userText: {
    fontSize: fontSize.xs,
  },
  timeInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: fontSize.xs,
  },
  logEntryActions: {
    alignItems: 'center',
  },
  actionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionBadgeText: {
    fontSize: fontSize.xs,
  },
  expandedDetails: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailsTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  detailValue: {
    fontSize: fontSize.sm,
    flex: 2,
  },
  changeComparison: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  changeSection: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  changeLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  changeValue: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyTitle: {
    fontSize: fontSize.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
  },
});