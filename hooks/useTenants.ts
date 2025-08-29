import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Contract, Unit } from '@/types';

export interface TenantRecord {
  id: string;
  userId: string;
  landlordId: string;
  fullName: string;
  email?: string;
  phoneE164: string;
  nationalId?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive'; // Overall tenant status
  totalContracts: number;
  currentContracts: number;
  notes?: string;
}

export interface ContractRecord {
  id: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  type: 'residential' | 'commercial';
  startDate: string;
  endDate?: string;
  durationMonths: number;
  monthlyRent: number;
  depositAmount: number;
  vatRate: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'draft' | 'active' | 'cancelled' | 'expired' | 'completed';
  createdAt: string;
  signedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  attachments: string[];
}

export interface OccupancyRecord {
  id: string;
  unitId: string;
  tenantId: string;
  contractId: string;
  startDate: string;
  endDate?: string;
  status: 'current' | 'ended';
  createdAt: string;
  endedAt?: string;
}

export function useTenants() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [occupancies, setOccupancies] = useState<OccupancyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadAllData();
  }, [refreshTrigger]);

  const loadAllData = async () => {
    try {
      const [tenantsData, contractsData, occupanciesData] = await Promise.all([
        AsyncStorage.getItem('tenantRecords'),
        AsyncStorage.getItem('contractRecords'),
        AsyncStorage.getItem('occupancyRecords'),
      ]);

      if (tenantsData) {
        setTenants(JSON.parse(tenantsData));
      } else {
        // Initialize with demo data
        await initializeDemoData();
      }

      if (contractsData) {
        setContracts(JSON.parse(contractsData));
      }

      if (occupanciesData) {
        setOccupancies(JSON.parse(occupanciesData));
      }
    } catch (error) {
      console.error('Failed to load tenant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDemoData = async () => {
    const demoTenants: TenantRecord[] = [
      {
        id: 'tenant1',
        userId: 'user1',
        landlordId: 'landlord1',
        fullName: 'محمد أحمد السعيد', // Keep for compatibility
        fullNameAr: 'محمد أحمد السعيد',
        fullNameEn: 'Mohammed Ahmed Alsaeed',
        email: 'mohammed@example.com',
        phoneE164: '+966501234567',
        nationalId: '1234567890',
        nationality: 'SA',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        status: 'active',
        totalContracts: 1,
        currentContracts: 1,
      },
      {
        id: 'tenant2',
        userId: 'user2',
        landlordId: 'landlord1',
        fullName: 'فاطمة علي الزهراني', // Keep for compatibility
        fullNameAr: 'فاطمة علي الزهراني',
        fullNameEn: 'Fatima Ali Alzahrani',
        email: 'fatima@example.com',
        phoneE164: '+966509876543',
        nationalId: '0987654321',
        nationality: 'SA',
        createdAt: '2024-02-01T14:30:00Z',
        updatedAt: '2024-02-01T14:30:00Z',
        status: 'active',
        totalContracts: 1,
        currentContracts: 1,
      },
      {
        id: 'tenant3',
        userId: 'user3',
        landlordId: 'landlord1',
        fullName: 'خالد محمد الأحمد', // Keep for compatibility
        fullNameAr: 'خالد محمد الأحمد',
        fullNameEn: 'Khalid Mohammed Alahmed',
        email: 'khalid@example.com',
        phoneE164: '+966512345678',
        nationalId: '1122334455',
        nationality: 'SA',
        createdAt: '2023-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
        status: 'inactive', // Former tenant
        totalContracts: 2,
        currentContracts: 0,
        notes: 'Former tenant - good payment history',
      },
    ];

    await saveTenants(demoTenants);
    setTenants(demoTenants);
  };

  const saveTenants = async (tenantsData: TenantRecord[]) => {
    try {
      await AsyncStorage.setItem('tenantRecords', JSON.stringify(tenantsData));
    } catch (error) {
      console.error('Failed to save tenants:', error);
    }
  };

  const saveContracts = async (contractsData: ContractRecord[]) => {
    try {
      await AsyncStorage.setItem('contractRecords', JSON.stringify(contractsData));
    } catch (error) {
      console.error('Failed to save contracts:', error);
    }
  };

  const saveOccupancies = async (occupanciesData: OccupancyRecord[]) => {
    try {
      await AsyncStorage.setItem('occupancyRecords', JSON.stringify(occupanciesData));
    } catch (error) {
      console.error('Failed to save occupancies:', error);
    }
  };

  // Create or update tenant record
  const createOrUpdateTenant = async (tenantData: Omit<TenantRecord, 'id' | 'createdAt' | 'updatedAt' | 'totalContracts' | 'currentContracts'>) => {
    console.log('🔄 Creating/updating tenant with data:', tenantData);
    try {
      // Check if tenant already exists by phone or national ID
      const existingTenant = tenants.find(t => 
        t.phoneE164 === tenantData.phoneE164 || 
        (tenantData.nationalId && t.nationalId === tenantData.nationalId)
      );
      
      console.log('🔍 Existing tenant check:', { 
        found: !!existingTenant, 
        existingId: existingTenant?.id,
        searchPhone: tenantData.phoneE164,
        searchNationalId: tenantData.nationalId
      });

      let updatedTenants: TenantRecord[];

      if (existingTenant) {
        console.log('🔄 Updating existing tenant:', existingTenant.id);
        // Update existing tenant
        updatedTenants = tenants.map(t => 
          t.id === existingTenant.id 
            ? { 
                ...t, 
                ...tenantData, 
                updatedAt: new Date().toISOString(),
                status: 'active' // Reactivate if creating new contract
              }
            : t
        );
      } else {
        console.log('🆕 Creating new tenant record');
        // Create new tenant
        const newTenant: TenantRecord = {
          ...tenantData,
          id: `tenant_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalContracts: 0,
          currentContracts: 0,
        };
        updatedTenants = [...tenants, newTenant];
      }

      console.log('💾 Saving tenant data to storage...');
      await saveTenants(updatedTenants);
      setTenants(updatedTenants);
      
      const resultTenant = existingTenant || updatedTenants[updatedTenants.length - 1];
      console.log('✅ Tenant created/updated successfully:', resultTenant.id);

      return resultTenant;
    } catch (error) {
      console.error('💥 Failed to create/update tenant:', error);
      console.error('💥 Tenant creation error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        tenantData,
        currentTenantsCount: tenants.length
      });
      throw error;
    }
  };

  // Create new contract
  const createContract = async (contractData: Omit<ContractRecord, 'id' | 'createdAt' | 'status'>) => {
    console.log('🔄 Creating contract with data:', contractData);
    try {
      // Validate required fields
      if (!contractData.tenantId) {
        throw new Error('Tenant ID is required');
      }
      if (!contractData.unitId) {
        throw new Error('Unit ID is required');
      }
      if (!contractData.startDate) {
        throw new Error('Start date is required');
      }
      if (!contractData.monthlyRent || contractData.monthlyRent <= 0) {
        throw new Error('Valid monthly rent is required');
      }
      
      console.log('✅ Contract validation passed');
      
      const newContract: ContractRecord = {
        ...contractData,
        id: `contract_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active',
        signedAt: new Date().toISOString(),
      };

      console.log('💾 Saving contract to storage...');
      const updatedContracts = [...contracts, newContract];
      await saveContracts(updatedContracts);
      setContracts(updatedContracts);
      console.log('✅ Contract saved to storage');

      // Create occupancy record
      console.log('🔄 Creating occupancy record...');
      const newOccupancy: OccupancyRecord = {
        id: `occupancy_${Date.now()}`,
        unitId: contractData.unitId,
        tenantId: contractData.tenantId,
        contractId: newContract.id,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        status: 'current',
        createdAt: new Date().toISOString(),
      };

      console.log('💾 Saving occupancy record...');
      const updatedOccupancies = [...occupancies, newOccupancy];
      await saveOccupancies(updatedOccupancies);
      setOccupancies(updatedOccupancies);
      console.log('✅ Occupancy record saved');

      // Update tenant contract counts
      console.log('🔄 Updating tenant contract counts...');
      const updatedTenants = tenants.map(t => 
        t.id === contractData.tenantId 
          ? { 
              ...t, 
              totalContracts: t.totalContracts + 1,
              currentContracts: t.currentContracts + 1,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      console.log('💾 Saving updated tenant counts...');
      await saveTenants(updatedTenants);
      setTenants(updatedTenants);
      console.log('✅ Tenant counts updated');

      console.log('✅ Contract created successfully:', newContract.id);
      return newContract;
    } catch (error) {
      console.error('💥 Failed to create contract:', error);
      console.error('💥 Contract creation error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        contractData,
        currentContractsCount: contracts.length,
        currentTenantsCount: tenants.length
      });
      throw error;
    }
  };

  // Force refresh of all data
  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Create contract from invitation draft
  const createContractFromInvitation = async (invitation: any, tenantId: string) => {
    try {
      if (!invitation.contractDraft) {
        throw new Error('No contract draft found in invitation');
      }

      const contractData = {
        tenantId,
        unitId: invitation.unitId || '1', // Should be provided with invitation
        propertyId: invitation.propertyId || '1', // Should be provided with invitation
        type: invitation.contractDraft.type,
        startDate: invitation.contractDraft.startDate,
        endDate: calculateEndDate(invitation.contractDraft.startDate, invitation.contractDraft.durationMonths),
        durationMonths: invitation.contractDraft.durationMonths,
        monthlyRent: invitation.contractDraft.monthlyRent,
        depositAmount: invitation.contractDraft.depositAmount,
        vatRate: invitation.contractDraft.vatRate,
        paymentFrequency: invitation.contractDraft.paymentFrequency,
        notes: invitation.contractDraft.notes,
        attachments: [],
      };

      return await createContract(contractData);
    } catch (error) {
      console.error('Failed to create contract from invitation:', error);
      throw error;
    }
  };

  // Helper function to calculate end date
  const calculateEndDate = (startDate: string, months: number): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toISOString().split('T')[0];
  };
  // Cancel contract
  const cancelContract = async (contractId: string, reason: string) => {
    try {
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Update contract status
      const updatedContracts = contracts.map(c => 
        c.id === contractId 
          ? { 
              ...c, 
              status: 'cancelled' as const,
              cancelledAt: new Date().toISOString(),
              cancellationReason: reason
            }
          : c
      );
      await saveContracts(updatedContracts);
      setContracts(updatedContracts);

      // End occupancy
      const updatedOccupancies = occupancies.map(o => 
        o.contractId === contractId 
          ? { 
              ...o, 
              status: 'ended' as const,
              endedAt: new Date().toISOString()
            }
          : o
      );
      await saveOccupancies(updatedOccupancies);
      setOccupancies(updatedOccupancies);

      // Update tenant current contract count (but keep total count)
      const updatedTenants = tenants.map(t => 
        t.id === contract.tenantId 
          ? { 
              ...t, 
              currentContracts: Math.max(0, t.currentContracts - 1),
              updatedAt: new Date().toISOString()
            }
          : t
      );
      await saveTenants(updatedTenants);
      setTenants(updatedTenants);

      console.log('✅ Contract cancelled successfully:', contractId);
      return true;
    } catch (error) {
      console.error('Failed to cancel contract:', error);
      throw error;
    }
  };

  // Get tenant by ID
  const getTenantById = (tenantId: string): TenantRecord | null => {
    return tenants.find(t => t.id === tenantId) || null;
  };

  // Get active tenants (have current contracts)
  const getActiveTenants = (): TenantRecord[] => {
    return tenants.filter(t => t.currentContracts > 0);
  };

  // Get available tenants (can be assigned to new contracts)
  const getAvailableTenants = (): TenantRecord[] => {
    return tenants.filter(t => t.status === 'active');
  };

  // Get tenant's contract history
  const getTenantContracts = (tenantId: string): ContractRecord[] => {
    return contracts.filter(c => c.tenantId === tenantId);
  };

  // Get current occupancy for unit
  const getCurrentOccupancy = (unitId: string): OccupancyRecord | null => {
    return occupancies.find(o => o.unitId === unitId && o.status === 'current') || null;
  };

  // Get tenant's current unit
  const getTenantCurrentUnit = (tenantId: string): string | null => {
    const currentOccupancy = occupancies.find(o => 
      o.tenantId === tenantId && o.status === 'current'
    );
    return currentOccupancy?.unitId || null;
  };

  // Check if unit is occupied
  const isUnitOccupied = (unitId: string): boolean => {
    return occupancies.some(o => o.unitId === unitId && o.status === 'current');
  };

  // Get contract for unit
  const getActiveContractForUnit = (unitId: string): ContractRecord | null => {
    const occupancy = getCurrentOccupancy(unitId);
    if (!occupancy) return null;
    
    return contracts.find(c => c.id === occupancy.contractId && c.status === 'active') || null;
  };

  // Search tenants
  const searchTenants = (query: string): TenantRecord[] => {
    const lowercaseQuery = query.toLowerCase();
    return tenants.filter(t => 
      t.fullName.toLowerCase().includes(lowercaseQuery) ||
      t.phoneE164.includes(query) ||
      (t.nationalId && t.nationalId.includes(query)) ||
      (t.email && t.email.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Update tenant information
  const updateTenant = async (tenantId: string, updates: Partial<TenantRecord>) => {
    try {
      const updatedTenants = tenants.map(t => 
        t.id === tenantId 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      );
      
      await saveTenants(updatedTenants);
      setTenants(updatedTenants);
      
      console.log('✅ Tenant updated:', tenantId);
      return true;
    } catch (error) {
      console.error('Failed to update tenant:', error);
      return false;
    }
  };

  // Get tenant statistics
  const getTenantStats = () => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.currentContracts > 0).length;
    const inactiveTenants = tenants.filter(t => t.currentContracts === 0).length;
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const cancelledContracts = contracts.filter(c => c.status === 'cancelled').length;

    return {
      totalTenants,
      activeTenants,
      inactiveTenants,
      totalContracts,
      activeContracts,
      cancelledContracts,
    };
  };

  return {
    tenants,
    contracts,
    occupancies,
    isLoading,
    createOrUpdateTenant,
    createContract,
    createContractFromInvitation,
    cancelContract,
    getTenantById,
    getActiveTenants,
    getAvailableTenants,
    getTenantContracts,
    getCurrentOccupancy,
    getTenantCurrentUnit,
    isUnitOccupied,
    getActiveContractForUnit,
    searchTenants,
    updateTenant,
    getTenantStats,
    refreshData: loadAllData,
    forceRefresh,
  };
}