import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TenantInvitation } from '@/types';

export function useInvitations() {
  const [invitations, setInvitations] = useState<TenantInvitation[]>([]);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const stored = await AsyncStorage.getItem('tenantInvitations');
      if (stored) {
        setInvitations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const saveInvitations = async (newInvitations: TenantInvitation[]) => {
    try {
      await AsyncStorage.setItem('tenantInvitations', JSON.stringify(newInvitations));
      setInvitations(newInvitations);
    } catch (error) {
      console.error('Failed to save invitations:', error);
    }
  };

  const validateInvitationCode = async (code: string): Promise<TenantInvitation | null> => {
    try {
      const stored = await AsyncStorage.getItem('tenantInvitations');
      if (!stored) return null;

      const allInvitations: TenantInvitation[] = JSON.parse(stored);
      const invitation = allInvitations.find(inv => 
        inv.invitationCode === code && 
        inv.status === 'pending' &&
        new Date(inv.expiresAt) > new Date()
      );

      return invitation || null;
    } catch (error) {
      console.error('Failed to validate invitation code:', error);
      return null;
    }
  };

  const acceptInvitation = async (invitationCode: string, tenantUserId: string) => {
    try {
      const stored = await AsyncStorage.getItem('tenantInvitations');
      if (!stored) return false;

      const allInvitations: TenantInvitation[] = JSON.parse(stored);
      const updated = allInvitations.map(inv => 
        inv.invitationCode === invitationCode 
          ? { ...inv, status: 'accepted' as const }
          : inv
      );

      await AsyncStorage.setItem('tenantInvitations', JSON.stringify(updated));
      setInvitations(updated);
      
      console.log('🎉 Invitation accepted:', { invitationCode, tenantUserId });
      return true;
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return false;
    }
  };

  const addInvitation = async (invitation: Omit<TenantInvitation, 'id' | 'createdAt'>) => {
    const newInvitation: TenantInvitation = {
      ...invitation,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...invitations, newInvitation];
    await saveInvitations(updated);
    
    return newInvitation;
  };

  return {
    invitations,
    validateInvitationCode,
    acceptInvitation,
    addInvitation,
    refreshInvitations: loadInvitations,
  };
}