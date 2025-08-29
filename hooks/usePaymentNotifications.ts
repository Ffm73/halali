import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentNotification {
  id: string;
  chargeId: string;
  residentName: string;
  residentPhone: string;
  unitLabel: string;
  propertyName: string;
  amount: number;
  paymentType: 'full' | 'partial';
  totalAmount: number;
  remainingAmount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'rejected';
  reference: string;
}

export function usePaymentNotifications() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('paymentNotifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load payment notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications: PaymentNotification[]) => {
    try {
      await AsyncStorage.setItem('paymentNotifications', JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to save payment notifications:', error);
    }
  };

  const addPaymentNotification = async (notification: Omit<PaymentNotification, 'id' | 'timestamp' | 'status'>) => {
    const newNotification: PaymentNotification = {
      ...notification,
      id: `payment_notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    const updated = [...notifications, newNotification];
    await saveNotifications(updated);
    
    console.log('💰 Payment notification added:', newNotification);
    return newNotification;
  };

  const confirmPayment = async (notificationId: string, confirmed: boolean) => {
    const updated = notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, status: confirmed ? 'confirmed' : 'rejected' as const }
        : notif
    );
    await saveNotifications(updated);
    
    console.log('✅ Payment notification updated:', { notificationId, confirmed });
  };

  const removeNotification = async (notificationId: string) => {
    const updated = notifications.filter(notif => notif.id !== notificationId);
    await saveNotifications(updated);
  };

  const getPendingNotifications = () => {
    return notifications.filter(notif => notif.status === 'pending');
  };

  return {
    notifications,
    addPaymentNotification,
    confirmPayment,
    removeNotification,
    getPendingNotifications,
  };
}