import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { 
  Bell, 
  CircleCheck as CheckCircle, 
  CircleAlert as AlertCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react-native';

export default function ResidentNotificationsScreen() {
  const { language, isRTL, formatDate } = useLocalization();
  const { colors } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications,
    refreshNotifications 
  } = useNotifications();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'payment' | 'contract'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment_confirmed':
        return <CheckCircle size={24} color={colors.success} />;
      case 'payment_rejected':
        return <AlertCircle size={24} color={colors.danger} />;
      case 'payment_reminder':
        return <Clock size={24} color={colors.warning} />;
      case 'contract_update':
        return <FileText size={24} color={colors.primary} />;
      default:
        return <Bell size={24} color={colors.textSecondary} />;
    }
  };

  const getNotificationColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment_confirmed':
        return colors.successLight;
      case 'payment_rejected':
        return colors.dangerLight;
      case 'payment_reminder':
        return colors.warningLight;
      case 'contract_update':
        return colors.primaryLight;
      default:
        return colors.surfaceSecondary;
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    switch (selectedFilter) {
      case 'unread':
        filtered = notifications.filter(n => !n.read);
        break;
      case 'payment':
        filtered = notifications.filter(n => 
          n.type === 'payment_confirmed' || 
          n.type === 'payment_rejected' || 
          n.type === 'payment_reminder'
        );
        break;
      case 'contract':
        filtered = notifications.filter(n => n.type === 'contract_update');
        break;
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    
    await markAllAsRead();
    Alert.alert(
      language === 'ar' ? 'تم' : 'Done',
      language === 'ar' ? 'تم تسجيل جميع الإشعارات كمقروءة' : 'All notifications marked as read'
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      language === 'ar' ? 'مسح جميع الإشعارات' : 'Clear All Notifications',
      language === 'ar' ? 'هل تريد حذف جميع الإشعارات؟' : 'Do you want to delete all notifications?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'ar' ? 'مسح' : 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications();
            Alert.alert(
              language === 'ar' ? 'تم' : 'Done',
              language === 'ar' ? 'تم مسح جميع الإشعارات' : 'All notifications cleared'
            );
          }
        },
      ]
    );
  };

  const filters = [
    { 
      id: 'all', 
      label: language === 'ar' ? 'الكل' : 'All',
      count: notifications.length,
    },
    { 
      id: 'unread', 
      label: language === 'ar' ? 'غير مقروء' : 'Unread',
      count: unreadCount,
    },
    { 
      id: 'payment', 
      label: language === 'ar' ? 'المدفوعات' : 'Payments',
      count: notifications.filter(n => 
        n.type === 'payment_confirmed' || 
        n.type === 'payment_rejected' || 
        n.type === 'payment_reminder'
      ).length,
    },
    { 
      id: 'contract', 
      label: language === 'ar' ? 'العقود' : 'Contracts',
      count: notifications.filter(n => n.type === 'contract_update').length,
    },
  ];

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.headerLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
              {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            </Text>
            {unreadCount > 0 && (
              <Text
                style={[
                  styles.unreadCount,
                  {
                    color: colors.danger,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? `${unreadCount} غير مقروء` : `${unreadCount} unread`}
              </Text>
            )}
          </View>
          <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.headerActionButton, { backgroundColor: colors.primaryLight }]}
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
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: colors.successLight }]}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <EyeOff size={20} color={colors.success} />
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: colors.dangerLight }]}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={[styles.filters, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedFilter === filter.id ? colors.primary : colors.surfaceSecondary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id as any)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedFilter === filter.id ? colors.surface : colors.primary,
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

      {/* Notifications List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {filteredNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              {
                backgroundColor: getNotificationColor(notification.type),
                borderColor: colors.border,
              },
              !notification.read && { borderLeftWidth: 4, borderLeftColor: colors.primary },
            ]}
            onPress={() => markAsRead(notification.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.notificationHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.notificationIconContainer}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <Text
                  style={[
                    styles.notificationTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {notification.title}
                </Text>
                <Text
                  style={[
                    styles.notificationMessage,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {notification.message}
                </Text>
                <Text
                  style={[
                    styles.notificationTime,
                    {
                      color: colors.textMuted,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {formatDate(notification.timestamp)}
                </Text>
              </View>
              <View style={styles.notificationActions}>
                {!notification.read && (
                  <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.dangerLight }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredNotifications.length === 0 && (
          <Card style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Bell size={48} color={colors.textMuted} />
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
              {language === 'ar' ? 'لا توجد إشعارات' : 'No Notifications'}
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
              {selectedFilter === 'unread' 
                ? (language === 'ar' ? 'جميع الإشعارات مقروءة' : 'All notifications are read')
                : (language === 'ar' ? 'ستظهر الإشعارات هنا' : 'Notifications will appear here')
              }
            </Text>
          </Card>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  unreadCount: {
    fontSize: fontSize.md,
  },
  headerActions: {
    gap: spacing.sm,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtersSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: spacing.sm,
  },
  filterButton: {
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
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  notificationCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  notificationHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  notificationTime: {
    fontSize: fontSize.xs,
  },
  notificationActions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
});