import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogEntry } from '@/types';

export function useAuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
    // Initialize with enhanced demo data for better search testing
    initializeDemoAuditLogs();
  }, []);

  const initializeDemoAuditLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('auditLogs');
      if (!stored) {
        // Create comprehensive demo audit logs with employee and resident operation tracking
        const demoLogs: AuditLogEntry[] = [
          {
            id: 'audit_1',
            userId: 'staff1',
            userName: 'سارة أحمد المحمد',
            userRole: 'manager',
            action: 'payment_accepted',
            entityType: 'payment',
            entityId: 'payment_1',
            entityName: 'محمد أحمد السعيد - A-101',
            details: {
              amount: 2875,
              reason: 'Payment confirmed by manager',
              notes: 'Payment for January 2025 rent',
              residentName: 'محمد أحمد السعيد',
              propertyName: 'برج العلامة',
              unitLabel: 'A-101',
            },
            timestamp: '2025-01-20T10:30:00Z',
          },
          {
            id: 'audit_2',
            userId: 'staff2',
            userName: 'خالد محمد الأحمد',
            userRole: 'accountant',
            action: 'payment_declined',
            entityType: 'payment',
            entityId: 'payment_2',
            entityName: 'فاطمة علي الزهراني - B-205',
            details: {
              amount: 3450,
              reason: 'Insufficient transfer evidence',
              notes: 'Payment rejected due to unclear bank transfer receipt',
              residentName: 'فاطمة علي الزهراني',
              propertyName: 'مجمع النور السكني',
              unitLabel: 'B-205',
            },
            timestamp: '2025-01-19T14:15:00Z',
          },
          {
            id: 'audit_3',
            userId: 'staff1',
            userName: 'سارة أحمد المحمد',
            userRole: 'manager',
            action: 'contract_edited',
            entityType: 'contract',
            entityId: 'contract_1',
            entityName: 'محمد أحمد السعيد - A-101',
            details: {
              before: { monthlyRent: 2500 },
              after: { monthlyRent: 2600 },
              reason: 'Annual rent increase',
              notes: 'Applied 4% annual increase as per contract terms',
              residentName: 'محمد أحمد السعيد',
              propertyName: 'برج العلامة',
              unitLabel: 'A-101',
            },
            timestamp: '2025-01-18T09:45:00Z',
          },
          {
            id: 'audit_4',
            userId: 'staff2',
            userName: 'خالد محمد الأحمد',
            userRole: 'accountant',
            action: 'discount_applied',
            entityType: 'payment',
            entityId: 'payment_3',
            entityName: 'خالد محمد الأحمد - C-301',
            details: {
              amount: 200,
              reason: 'Long-term tenant discount',
              notes: 'Applied 200 SAR discount for 2-year lease renewal',
              residentName: 'خالد محمد الأحمد',
              propertyName: 'برج العلامة',
              unitLabel: 'C-301',
            },
            timestamp: '2025-01-17T16:20:00Z',
          },
          {
            id: 'audit_5',
            userId: 'staff1',
            userName: 'سارة أحمد المحمد',
            userRole: 'manager',
            action: 'tenant_updated',
            entityType: 'tenant',
            entityId: 'tenant_1',
            entityName: 'فاطمة علي الزهراني',
            details: {
              before: { phoneE164: '+966509876542' },
              after: { phoneE164: '+966509876543' },
              reason: 'Phone number correction',
              notes: 'Updated tenant contact information',
              residentName: 'فاطمة علي الزهراني',
            },
            timestamp: '2025-01-16T11:10:00Z',
          },
          {
            id: 'audit_6',
            userId: 'staff2',
            userName: 'خالد محمد الأحمد',
            userRole: 'accountant',
            action: 'payment_accepted',
            entityType: 'payment',
            entityId: 'payment_4',
            entityName: 'سارة أحمد المحمد - D-402',
            details: {
              amount: 3200,
              reason: 'Payment confirmed by accountant',
              notes: 'Payment for February 2025 rent',
              residentName: 'سارة أحمد المحمد',
              propertyName: 'مجمع النور السكني',
              unitLabel: 'D-402',
            },
            timestamp: '2025-01-15T13:20:00Z',
          },
          {
            id: 'audit_7',
            userId: 'staff1',
            userName: 'سارة أحمد المحمد',
            userRole: 'manager',
            action: 'rent_adjusted',
            entityType: 'contract',
            entityId: 'contract_2',
            entityName: 'عبدالله محمد الغامدي - E-501',
            details: {
              before: { monthlyRent: 3000 },
              after: { monthlyRent: 3100 },
              reason: 'Market adjustment',
              notes: 'Applied market rate adjustment',
              residentName: 'عبدالله محمد الغامدي',
              propertyName: 'برج العلامة',
              unitLabel: 'E-501',
            },
            timestamp: '2025-01-14T11:45:00Z',
          },
          {
            id: 'audit_7',
            userId: 'staff1',
            userName: 'سارة أحمد المحمد',
            userRole: 'manager',
            action: 'rent_adjusted',
            entityType: 'contract',
            entityId: 'contract_2',
            entityName: 'عبدالله محمد الغامدي - E-501',
            details: {
              before: { monthlyRent: 3000 },
              after: { monthlyRent: 3100 },
              reason: 'Market adjustment',
              notes: 'Applied market rate adjustment',
              residentName: 'عبدالله محمد الغامدي',
              propertyName: 'برج العلامة',
              unitLabel: 'E-501',
            },
            timestamp: '2025-01-14T11:45:00Z',
          },
        ];
        
        await AsyncStorage.setItem('auditLogs', JSON.stringify(demoLogs));
        setAuditLogs(demoLogs);
      }
    } catch (error) {
      console.error('Failed to initialize demo audit logs:', error);
    }
  };
  const loadAuditLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('auditLogs');
      if (stored) {
        const logs = JSON.parse(stored);
        // Sort by timestamp (newest first)
        const sortedLogs = logs.sort((a: AuditLogEntry, b: AuditLogEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setAuditLogs(sortedLogs);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAuditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    try {
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `audit_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
      };

      const updatedLogs = [newEntry, ...auditLogs];
      
      // Keep only last 1000 entries to prevent storage bloat
      const trimmedLogs = updatedLogs.slice(0, 1000);
      
      await AsyncStorage.setItem('auditLogs', JSON.stringify(trimmedLogs));
      setAuditLogs(trimmedLogs);
      
      console.log('📋 Audit log entry added:', newEntry.action, newEntry.entityName);
    } catch (error) {
      console.error('Failed to add audit log entry:', error);
    }
  };

  const getLogsByUser = (userId: string) => {
    return auditLogs.filter(log => log.userId === userId);
  };

  const getLogsByAction = (action: AuditLogEntry['action']) => {
    return auditLogs.filter(log => log.action === action);
  };

  const getLogsByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return auditLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });
  };

  const clearOldLogs = async (daysToKeep: number = 90) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredLogs = auditLogs.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );
      
      await AsyncStorage.setItem('auditLogs', JSON.stringify(filteredLogs));
      setAuditLogs(filteredLogs);
      
      console.log(`🗑️ Cleared audit logs older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Failed to clear old audit logs:', error);
    }
  };

  return {
    auditLogs,
    isLoading,
    addAuditLog,
    getLogsByUser,
    getLogsByAction,
    getLogsByDateRange,
    clearOldLogs,
    refreshLogs: loadAuditLogs,
  };
}