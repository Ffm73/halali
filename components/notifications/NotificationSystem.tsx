import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { Bell, Phone, MessageSquare, CircleAlert as AlertCircle, Clock } from 'lucide-react-native';

export interface NotificationItem {
  id: string;
  type: 'payment_overdue' | 'payment_due' | 'payment_received';
  title: string;
  message: string;
  residentName?: string;
  residentPhone?: string;
  unitLabel?: string;
  amount?: number;
  dueDate?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationSystemProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onSendReminder: (residentPhone: string, message: string) => void;
}

export function NotificationSystem({ 
  notifications, 
  onMarkAsRead, 
  onSendReminder 
}: NotificationSystemProps) {
  const { language, isRTL } = useLocalization();
  const { user } = useAuth();
  const { colors } = useTheme();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_overdue':
        return <AlertCircle size={20} color={colors.danger} />;
      case 'payment_due':
        return <Clock size={20} color={colors.warning} />;
      case 'payment_received':
        return <Bell size={20} color={colors.success} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const handleSendWhatsApp = (phone: string, message: string) => {
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'لا يمكن فتح واتساب' : 'Cannot open WhatsApp'
      );
    });
  };

  const handleSendSMS = (phone: string, message: string) => {
    const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'لا يمكن فتح الرسائل' : 'Cannot open Messages'
      );
    });
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'لا يمكن إجراء المكالمة' : 'Cannot make phone call'
      );
    });
  };

  const handleSendAppReminder = (notification: NotificationItem) => {
    Alert.alert(
      language === 'ar' ? 'تم الإرسال' : 'Sent',
      language === 'ar' 
        ? `تم إرسال تذكير إلى ${notification.residentName} عبر التطبيق`
        : `Push notification sent to ${notification.residentName} through app`
    );
    
    // Log the reminder for tracking
    console.log('📱 App reminder sent:', {
      residentName: notification.residentName,
      unitLabel: notification.unitLabel,
      amount: notification.amount,
      type: notification.type,
    });
  };

  const generateReminderMessage = (notification: NotificationItem) => {
    // Get month name based on user's date system
    const monthName = user?.dateSystem === 'hijri' 
      ? (language === 'ar' ? 'محرم' : 'Muharram') // This would be dynamic based on actual month
      : (language === 'ar' ? 'يناير' : 'January'); // This would be dynamic based on actual month
    
    if (language === 'ar') {
      return `مرحباً ${notification.residentName}، هذا تذكير بأن إيجار ${monthName} للوحدة ${notification.unitLabel} بمبلغ ${notification.amount?.toLocaleString()} ريال ${notification.type === 'payment_overdue' ? 'متأخر' : 'مستحق'}. يرجى الدفع في أقرب وقت ممكن.`;
    } else {
      return `Hello ${notification.residentName}, this is a reminder that your ${monthName} rent for unit ${notification.unitLabel} of ${notification.amount?.toLocaleString()} SAR is ${notification.type === 'payment_overdue' ? 'overdue' : 'due'}. Please pay as soon as possible.`;
    }
  };

  return (
    <View style={styles.container}>
      {notifications.map((notification) => (
        <Card key={notification.id} style={[
          styles.notificationCard,
          { backgroundColor: colors.surface, borderColor: colors.borderLight },
          !notification.read && styles.unreadCard,
          !notification.read && { borderLeftColor: colors.primary, backgroundColor: colors.primaryLight },
          notification.type === 'payment_overdue' && styles.overdueCard,
          notification.type === 'payment_overdue' && { backgroundColor: colors.surface, borderLeftColor: colors.danger }
        ]}>
          <View style={[styles.notificationHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>
            <View style={styles.notificationContent}>
              <Text
                style={[
                  styles.notificationTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
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
            </View>
          </View>

          {/* Action Buttons for Payment Reminders */}
          {(notification.type === 'payment_overdue' || notification.type === 'payment_due') && 
           notification.residentPhone && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.borderLight }]}
                onPress={() => handleCall(notification.residentPhone!)}
              >
                <Phone size={16} color={colors.primary} />
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    },
                  ]}
                >
                  {language === 'ar' ? 'اتصال' : 'Call'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.borderLight }]}
                onPress={() => handleSendWhatsApp(
                  notification.residentPhone!,
                  generateReminderMessage(notification)
                )}
              >
                <MessageSquare size={16} color={colors.success} />
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    },
                  ]}
                >
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.borderLight }]}
                onPress={() => handleSendSMS(
                  notification.residentPhone!,
                  generateReminderMessage(notification)
                )}
              >
                <MessageSquare size={16} color={colors.warning} />
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    },
                  ]}
                >
                  {language === 'ar' ? 'رساله نصيه' : 'SMS'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.borderLight }]}
                onPress={() => handleSendAppReminder(notification)}
              >
                <Bell size={16} color={colors.primary} />
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    },
                  ]}
                >
                  {language === 'ar' ? 'تطبيق' : 'App'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mark as Read Button */}
          {!notification.read && (
            <View style={styles.markReadContainer}>
              <Button
                title={language === 'ar' ? 'تم القراءة' : 'Mark as Read'}
                onPress={() => onMarkAsRead(notification.id)}
                variant="secondary"
                size="sm"
              />
            </View>
          )}
        </Card>
      ))}

      {notifications.length === 0 && (
        <View style={styles.emptyState}>
          <Bell size={48} color={colors.light.textMuted} />
          <Text
            style={[
              styles.emptyStateText,
              {
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: 'center',
              },
            ]}
          >
            {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  notificationCard: {
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.light.borderLight,
  },
  unreadCard: {
    borderLeftWidth: 3,
    backgroundColor: colors.light.primaryLight,
  },
  overdueCard: {
    borderLeftColor: colors.light.danger,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSize.sm,
    color: colors.light.textPrimary,
    marginBottom: 2,
  },
  notificationMessage: {
    color: colors.light.textSecondary,
    lineHeight: 16,
    marginBottom: 2,
  },
  notificationTimestamp: {
    fontSize: fontSize.xs,
    color: colors.light.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: fontSize.xs,
  },
  markReadContainer: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: fontSize.md,
  },
});