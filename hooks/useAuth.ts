import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser: loadUser,
  };
}