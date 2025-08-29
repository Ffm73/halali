import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HowToPay } from '@/types';

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<HowToPay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const stored = await AsyncStorage.getItem('landlordPaymentMethods');
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      } else {
        // Set default payment methods for demo
        const defaultMethods: HowToPay = {
          id: 'default_payment_methods',
          scope: 'landlord',
          title: 'طرق الدفع المتاحة',
          instructionsRichText: 'يرجى التحويل إلى أحد الحسابات التالية وإرسال إيصال التحويل',
          bankAccounts: [
            {
              bankName: 'البنك الأهلي السعودي',
              iban: 'SA1234567890123456789012',
              accountName: 'أحمد محمد العلي',
            },
            {
              bankName: 'بنك الراجحي',
              iban: 'SA9876543210987654321098',
              accountName: 'أحمد محمد العلي',
            },
          ],
          stcBankHandle: '+966501234567',
        };
        await savePaymentMethods(defaultMethods);
        setPaymentMethods(defaultMethods);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePaymentMethods = async (methods: HowToPay) => {
    try {
      await AsyncStorage.setItem('landlordPaymentMethods', JSON.stringify(methods));
      setPaymentMethods(methods);
      console.log('✅ Payment methods saved:', methods);
    } catch (error) {
      console.error('Failed to save payment methods:', error);
      throw error;
    }
  };

  const updatePaymentMethods = async (updates: Partial<HowToPay>) => {
    if (!paymentMethods) return;
    
    const updated = { ...paymentMethods, ...updates };
    await savePaymentMethods(updated);
  };

  return {
    paymentMethods,
    isLoading,
    savePaymentMethods,
    updatePaymentMethods,
    refreshPaymentMethods: loadPaymentMethods,
  };
}