import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

export interface AppNotification {
  id: string;
  type: 'payment_confirmed' | 'payment_rejected' | 'payment_reminder' | 'contract_update' | 'general';
  title: string;
  message: string;
  data?: {
    chargeId?: string;
    contractId?: string;
    amount?: number;
    unitLabel?: string;
    propertyName?: string;
    dueDate?: string;
    paymentType?: 'full' | 'partial';
  };
  timestamp: string;
  read: boolean;
  userId: string;
  priority: 'low' | 'medium' | 'high';
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read && n.userId === user?.id).length;
    setUnreadCount(unread);
  }, [notifications, user]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('appNotifications');
      if (stored) {
        const allNotifications = JSON.parse(stored);
        // Filter notifications for current user
        const userNotifications = allNotifications.filter((n: AppNotification) => n.userId === user?.id);
        setNotifications(userNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications: AppNotification[]) => {
    try {
      // Load all notifications first
      const stored = await AsyncStorage.getItem('appNotifications');
      const allNotifications = stored ? JSON.parse(stored) : [];
      
      // Remove old notifications for current user and add new ones
      const otherUsersNotifications = allNotifications.filter((n: AppNotification) => n.userId !== user?.id);
      const updatedAllNotifications = [...otherUsersNotifications, ...newNotifications];
      
      await AsyncStorage.setItem('appNotifications', JSON.stringify(updatedAllNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'userId'>) => {
    if (!user) return;

    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: user.id,
    };

    const updated = [...notifications, newNotification];
    await saveNotifications(updated);
    
    console.log('🔔 Notification added for user:', user.id, newNotification.title);
    return newNotification;
  };

  const markAsRead = async (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    await saveNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    await saveNotifications(updated);
  };

  const removeNotification = async (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    await saveNotifications(updated);
  };

  const clearAllNotifications = async () => {
    await saveNotifications([]);
  };

  // Send payment status notification to resident
  const notifyPaymentStatus = async (
    residentUserId: string,
    status: 'confirmed' | 'rejected',
    paymentData: {
      amount: number;
      unitLabel: string;
      propertyName: string;
      chargeId: string;
      paymentType: 'full' | 'partial';
      month: string;
    }
  ) => {
    try {
      // Load all notifications
      const stored = await AsyncStorage.getItem('appNotifications');
      const allNotifications = stored ? JSON.parse(stored) : [];
      
      const notification: AppNotification = {
        id: `payment_status_${Date.now()}_${Math.random()}`,
        type: status === 'confirmed' ? 'payment_confirmed' : 'payment_rejected',
        title: status === 'confirmed' 
          ? (language === 'ar' ? 'تم تأكيد استلام الدفعة' : 'Payment Confirmed')
          : (language === 'ar' ? 'لم يتم تأكيد الدفعة' : 'Payment Not Confirmed'),
        message: status === 'confirmed'
          ? (language === 'ar' 
            ? `تم تأكيد استلام دفعة ${paymentData.month} للوحدة ${paymentData.unitLabel} بمبلغ ${paymentData.amount.toLocaleString()} ريال. تم إضافتها لسجل المدفوعات.`
            : `Payment for ${paymentData.month} unit ${paymentData.unitLabel} of ${paymentData.amount.toLocaleString()} SAR confirmed. Added to payment history.`)
          : (language === 'ar'
            ? `لم يتم تأكيد استلام دفعة ${paymentData.month} للوحدة ${paymentData.unitLabel}. يرجى التحقق من تفاصيل التحويل.`
            : `Payment for ${paymentData.month} unit ${paymentData.unitLabel} not confirmed. Please check transfer details.`),
        data: {
          chargeId: paymentData.chargeId,
          amount: paymentData.amount,
          unitLabel: paymentData.unitLabel,
          propertyName: paymentData.propertyName,
          paymentType: paymentData.paymentType,
        },
        timestamp: new Date().toISOString(),
        read: false,
        userId: residentUserId,
        priority: status === 'confirmed' ? 'medium' : 'high',
      };

      // Add to all notifications
      const updatedAllNotifications = [...allNotifications, notification];
      await AsyncStorage.setItem('appNotifications', JSON.stringify(updatedAllNotifications));
      
      console.log('🔔 Payment status notification sent to resident:', residentUserId, status);
      return notification;
    } catch (error) {
      console.error('Failed to send payment notification:', error);
      throw error;
    }
  };

  const getUserNotifications = () => {
    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Limit to recent 50 notifications
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  const getNotificationsByType = (type: AppNotification['type']) => {
    return notifications.filter(n => n.type === type);
  };

  return {
    notifications: getUserNotifications(),
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    notifyPaymentStatus,
    getUnreadNotifications,
    getNotificationsByType,
    refreshNotifications: loadNotifications,
  };
}