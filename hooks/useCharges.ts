import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Charge } from '@/types';

export function useCharges() {
  const [charges, setCharges] = useState<Charge[]>([]);

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    try {
      const stored = await AsyncStorage.getItem('userCharges');
      if (stored) {
        setCharges(JSON.parse(stored));
      } else {
        // Initialize with default charges for demo
        const defaultCharges: Charge[] = [
          {
            id: 'charge1',
            contractId: 'contract1',
            dueDate: '2025-01-20',
            amount: 2500,
            vatAmount: 375,
            totalAmount: 2875,
            label: 'January 2025 Rent',
            status: 'overdue',
            balanceRemaining: 2875,
          },
          {
            id: 'charge2',
            contractId: 'contract1',
            dueDate: '2025-02-20',
            amount: 2500,
            vatAmount: 375,
            totalAmount: 2875,
            label: 'February 2025 Rent',
            status: 'due',
            balanceRemaining: 2875,
          },
          {
            id: 'charge3',
            contractId: 'contract1',
            dueDate: '2024-12-20',
            amount: 2500,
            vatAmount: 375,
            totalAmount: 2875,
            label: 'December 2024 Rent',
            status: 'paid',
            balanceRemaining: 0,
          },
        ];
        await AsyncStorage.setItem('userCharges', JSON.stringify(defaultCharges));
        setCharges(defaultCharges);
      }
    } catch (error) {
      console.error('Failed to load charges:', error);
    }
  };

  const updateChargeStatus = async (
    chargeId: string, 
    paymentAmount: number, 
    paymentType: 'full' | 'partial',
    status: 'pending' | 'confirmed' | 'paid' = 'pending'
  ) => {
    try {
      const updated = charges.map(charge => {
        if (charge.id === chargeId) {
          if (status === 'pending') {
            // Payment submitted but not yet confirmed by landlord
            return {
              ...charge,
              status: 'pending' as const,
              paymentReported: true,
              reportedAmount: paymentAmount,
              reportedType: paymentType,
              reportedAt: new Date().toISOString(),
            };
          } else if (status === 'paid' && paymentType === 'full') {
            return {
              ...charge,
              status: 'paid' as const,
              balanceRemaining: 0,
              confirmedAt: new Date().toISOString(),
              paymentReported: false, // Clear pending flag
            };
          } else if (status === 'paid' && paymentType === 'partial') {
            const newBalance = charge.balanceRemaining - paymentAmount;
            return {
              ...charge,
              status: newBalance <= 0 ? 'paid' as const : 'partiallyPaid' as const,
              balanceRemaining: Math.max(0, newBalance),
              confirmedAt: new Date().toISOString(),
              paymentReported: false, // Clear pending flag
            };
          } else if (status === 'confirmed') {
            // Landlord confirmed payment - mark as paid
            return {
              ...charge,
              status: paymentType === 'full' ? 'paid' as const : 'partiallyPaid' as const,
              balanceRemaining: paymentType === 'full' ? 0 : Math.max(0, charge.balanceRemaining - paymentAmount),
              confirmedAt: new Date().toISOString(),
              paymentReported: false,
            };
          } else {
            // Default case for other status updates
            return charge;
          }
        }
        return charge;
      });

      await AsyncStorage.setItem('userCharges', JSON.stringify(updated));
      setCharges(updated);
      
      console.log('💳 Charge updated:', { chargeId, paymentAmount, paymentType });
      return updated;
    } catch (error) {
      console.error('Failed to update charge:', error);
      return null;
    }
  };

  const getUpcomingCharges = () => {
    return charges.filter(charge => 
      charge.status === 'due' || charge.status === 'overdue'
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getOverdueCharges = () => {
    return charges.filter(charge => charge.status === 'overdue');
  };

  return {
    charges,
    updateChargeStatus,
    getUpcomingCharges,
    getOverdueCharges,
    refreshCharges: loadCharges,
  };
}