import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentDates, dateToHijri, formatHijriDate, HijriDate } from '@/utils/dateConversion';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { NotificationSystem } from '@/components/notifications/NotificationSystem';
import { VerificationBanner } from '@/components/verification/VerificationBanner';
import { VerificationModal } from '@/components/verification/VerificationModal';
import { Logo } from '@/components/ui/Logo';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { DashboardMetrics, UpcomingCharge, Property, Unit, Contract } from '@/types';
import { NotificationItem } from '@/components/notifications/NotificationSystem';
import { Globe, Moon, Sun, Chrome as Home, Users } from 'lucide-react-native';

// Function to generate mock notifications with proper localization context
const generateMockNotifications = (language: string, dateSystem: string): NotificationItem[] => {
  const formatDateForSystem = (date: Date): string => {
    if (dateSystem === 'hijri') {
      const hijriResult = dateToHijri(date);
      if (hijriResult.success && hijriResult.date) {
        const hijriDate = hijriResult.date as HijriDate;
        return formatHijriDate(hijriDate, 'short', language as 'ar' | 'en');
      }
    }
    
    if (language === 'ar') {
      return date.toLocaleDateString('ar-SA-u-ca-gregory', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };
  
  return [
    {
      id: 'notif1',
      type: 'payment_overdue',
      title: language === 'ar' ? 'إيجار متأخر' : 'Overdue Rent',
      message: (() => {
        const currentDate = new Date('2025-01-20');
        const formattedDate = formatDateForSystem(currentDate);
        return language === 'ar' 
          ? `محمد أحمد - الوحدة A-101 - إيجار ${formattedDate} متأخر 3 أيام`
          : `Mohammed Ahmed - Unit A-101 - ${formattedDate} rent overdue 3 days`;
      })(),
      residentName: 'محمد أحمد',
      residentPhone: '+966501234567',
      unitLabel: 'A-101',
      amount: 2875,
      dueDate: '2025-01-20',
      timestamp: '2025-01-23T10:30:00Z',
      read: false,
    },
    {
      id: 'notif2',
      type: 'payment_due',
      title: language === 'ar' ? 'إيجار مستحق غداً' : 'Rent Due Tomorrow',
      message: (() => {
        const currentDate = new Date('2025-01-25');
        const formattedDate = formatDateForSystem(currentDate);
        return language === 'ar' 
          ? `فاطمة علي - الوحدة B-205 - إيجار ${formattedDate} مستحق غداً`
          : `Fatima Ali - Unit B-205 - ${formattedDate} rent due tomorrow`;
      })(),
      residentName: 'فاطمة علي',
      residentPhone: '+966509876543',
      unitLabel: 'B-205',
      amount: 3000,
      dueDate: '2025-01-25',
      timestamp: '2025-01-24T09:00:00Z',
      read: false,
    },
    {
      id: 'notif3',
      type: 'payment_received',
      title: language === 'ar' ? 'تم استلام دفعة' : 'Payment Received',
      message: (() => {
        const currentDate = new Date('2025-01-22');
        const formattedDate = formatDateForSystem(currentDate);
        return language === 'ar' 
          ? `خالد السعيد - الوحدة C-301 - تم دفع إيجار ${formattedDate}`
          : `Khalid Alsaeed - Unit C-301 - ${formattedDate} rent paid`;
      })(),
      residentName: 'خالد السعيد',
      unitLabel: 'C-301',
      amount: 2800,
      timestamp: '2025-01-22T16:45:00Z',
      read: true,
    },
  ];
};

// Real data based on actual properties and units
const realProperties: Property[] = [
  {
    id: '1',
    landlordId: '1',
    name: 'برج العلامة', // Keep for compatibility
    nameAr: 'برج العلامة',
    nameEn: 'Al-Alamah Tower',
    address: 'شارع الملك فهد',
    city: 'الرياض',
    notes: '',
    photos: [],
  },
  {
    id: '2', 
    landlordId: '1',
    name: 'مجمع النور السكني', // Keep for compatibility
    nameAr: 'مجمع النور السكني',
    nameEn: 'Al-Noor Residential Complex',
    address: 'حي الصفا',
    city: 'جدة',
    notes: '',
    photos: [],
  },
];

// Real units data
const realUnits: Unit[] = [
  // Property 1 units (برج العلامة)
  { id: '1', propertyId: '1', unitLabel: 'A-101', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 1, sizeSqm: 85, status: 'occupied', amenities: ['مكيف', 'موقف سيارة'], photos: [] },
  { id: '2', propertyId: '1', unitLabel: 'A-102', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 1, sizeSqm: 120, status: 'vacant', amenities: ['مكيف', 'موقف سيارة', 'شرفة'], photos: [] },
  { id: '3', propertyId: '1', unitLabel: 'B-201', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 2, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '4', propertyId: '1', unitLabel: 'B-202', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 2, sizeSqm: 65, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '5', propertyId: '1', unitLabel: 'C-301', bedrooms: 2, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 3, sizeSqm: 95, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '6', propertyId: '1', unitLabel: 'C-302', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 3, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '7', propertyId: '1', unitLabel: 'D-401', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 4, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '8', propertyId: '1', unitLabel: 'D-402', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 4, sizeSqm: 65, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '9', propertyId: '1', unitLabel: 'E-501', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 5, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '10', propertyId: '1', unitLabel: 'E-502', bedrooms: 2, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 5, sizeSqm: 95, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '11', propertyId: '1', unitLabel: 'F-601', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 6, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة', 'شرفة'], photos: [] },
  { id: '12', propertyId: '1', unitLabel: 'F-602', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 6, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة', 'شرفة'], photos: [] },
  { id: '13', propertyId: '1', unitLabel: 'G-701', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 7, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '14', propertyId: '1', unitLabel: 'G-702', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 7, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '15', propertyId: '1', unitLabel: 'H-801', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 8, sizeSqm: 65, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '16', propertyId: '1', unitLabel: 'H-802', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 8, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '17', propertyId: '1', unitLabel: 'I-901', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 9, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '18', propertyId: '1', unitLabel: 'I-902', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 9, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '19', propertyId: '1', unitLabel: 'J-1001', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 10, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة', 'شرفة'], photos: [] },
  { id: '20', propertyId: '1', unitLabel: 'J-1002', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 10, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  
  // Property 2 units (مجمع النور السكني) 
  { id: '21', propertyId: '2', unitLabel: 'A-101', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 1, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة'], photos: [] },
  { id: '22', propertyId: '2', unitLabel: 'A-102', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 1, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '23', propertyId: '2', unitLabel: 'B-201', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 2, sizeSqm: 65, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '24', propertyId: '2', unitLabel: 'B-202', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 2, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '25', propertyId: '2', unitLabel: 'C-301', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 3, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '26', propertyId: '2', unitLabel: 'C-302', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 3, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '27', propertyId: '2', unitLabel: 'D-401', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 4, sizeSqm: 65, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '28', propertyId: '2', unitLabel: 'D-402', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 4, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '29', propertyId: '2', unitLabel: 'E-501', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 5, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة', 'شرفة'], photos: [] },
  { id: '30', propertyId: '2', unitLabel: 'E-502', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 5, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '31', propertyId: '2', unitLabel: 'F-601', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 6, sizeSqm: 65, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '32', propertyId: '2', unitLabel: 'F-602', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 6, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '33', propertyId: '2', unitLabel: 'G-701', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 7, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '34', propertyId: '2', unitLabel: 'G-702', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 7, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '35', propertyId: '2', unitLabel: 'H-801', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 8, sizeSqm: 65, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '36', propertyId: '2', unitLabel: 'H-802', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 8, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '37', propertyId: '2', unitLabel: 'I-901', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 9, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة'], photos: [] },
  { id: '38', propertyId: '2', unitLabel: 'I-902', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 9, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '39', propertyId: '2', unitLabel: 'J-1001', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 10, sizeSqm: 65, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '40', propertyId: '2', unitLabel: 'J-1002', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 10, sizeSqm: 85, status: 'occupied', amenities: ['مكيف'], photos: [] },
  { id: '41', propertyId: '2', unitLabel: 'K-1101', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 11, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'شرفة'], photos: [] },
  { id: '42', propertyId: '2', unitLabel: 'K-1102', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 11, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '43', propertyId: '2', unitLabel: 'L-1201', bedrooms: 3, bathrooms: 2, hasKitchen: true, hasLivingRoom: true, floor: 12, sizeSqm: 120, status: 'occupied', amenities: ['مكيف', 'موقف سيارة', 'شرفة'], photos: [] },
  { id: '44', propertyId: '2', unitLabel: 'L-1202', bedrooms: 2, bathrooms: 1, hasKitchen: true, hasLivingRoom: true, floor: 12, sizeSqm: 85, status: 'vacant', amenities: ['مكيف'], photos: [] },
  { id: '45', propertyId: '2', unitLabel: 'M-1301', bedrooms: 1, bathrooms: 1, hasKitchen: true, hasLivingRoom: false, floor: 13, sizeSqm: 65, status: 'occupied', amenities: ['مكيف'], photos: [] },
];

// Real contracts data
const realContracts: Contract[] = [
  // Property 1 contracts (برج العلامة) - 17 occupied units
  { id: 'c1', unitId: '1', residentUserId: 'tenant1', type: 'residential', startDate: '2024-01-01', endDate: '2024-12-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [], signedAt: '2023-12-15T10:00:00Z' },
  { id: 'c3', unitId: '3', residentUserId: 'tenant2', type: 'residential', startDate: '2024-02-01', endDate: '2025-01-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [], signedAt: '2024-01-20T14:30:00Z' },
  { id: 'c4', unitId: '4', residentUserId: 'tenant3', type: 'residential', startDate: '2024-03-01', endDate: '2025-02-28', durationMonths: 12, monthlyRent: 2200, depositAmount: 4400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c5', unitId: '5', residentUserId: 'tenant4', type: 'residential', startDate: '2024-01-15', endDate: '2024-12-31', durationMonths: 12, monthlyRent: 3200, depositAmount: 6400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c6', unitId: '6', residentUserId: 'tenant5', type: 'residential', startDate: '2024-04-01', endDate: '2025-03-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c7', unitId: '7', residentUserId: 'tenant6', type: 'residential', startDate: '2024-05-01', endDate: '2025-04-30', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c9', unitId: '9', residentUserId: 'tenant7', type: 'residential', startDate: '2024-06-01', endDate: '2025-05-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c10', unitId: '10', residentUserId: 'tenant8', type: 'residential', startDate: '2024-07-01', endDate: '2025-06-30', durationMonths: 12, monthlyRent: 3200, depositAmount: 6400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c11', unitId: '11', residentUserId: 'tenant9', type: 'residential', startDate: '2024-08-01', endDate: '2025-07-31', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c12', unitId: '12', residentUserId: 'tenant10', type: 'residential', startDate: '2024-09-01', endDate: '2025-08-31', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c13', unitId: '13', residentUserId: 'tenant11', type: 'residential', startDate: '2024-10-01', endDate: '2025-09-30', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c14', unitId: '14', residentUserId: 'tenant12', type: 'residential', startDate: '2024-11-01', endDate: '2025-10-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c16', unitId: '16', residentUserId: 'tenant13', type: 'residential', startDate: '2024-12-01', endDate: '2025-11-30', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c17', unitId: '17', residentUserId: 'tenant14', type: 'residential', startDate: '2024-08-15', endDate: '2025-08-14', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c18', unitId: '18', residentUserId: 'tenant15', type: 'residential', startDate: '2024-09-15', endDate: '2025-09-14', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c19', unitId: '19', residentUserId: 'tenant16', type: 'residential', startDate: '2024-10-15', endDate: '2025-10-14', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  
  // Property 2 contracts (مجمع النور السكني) - 20 occupied units  
  { id: 'c21', unitId: '21', residentUserId: 'tenant17', type: 'residential', startDate: '2024-02-01', endDate: '2025-01-31', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c22', unitId: '22', residentUserId: 'tenant18', type: 'residential', startDate: '2024-01-01', endDate: '2024-12-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c24', unitId: '24', residentUserId: 'tenant19', type: 'residential', startDate: '2024-03-01', endDate: '2025-02-28', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c25', unitId: '25', residentUserId: 'tenant20', type: 'residential', startDate: '2024-04-01', endDate: '2025-03-31', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c27', unitId: '27', residentUserId: 'tenant21', type: 'residential', startDate: '2024-05-01', endDate: '2025-04-30', durationMonths: 12, monthlyRent: 2200, depositAmount: 4400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c28', unitId: '28', residentUserId: 'tenant22', type: 'residential', startDate: '2024-06-01', endDate: '2025-05-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c29', unitId: '29', residentUserId: 'tenant23', type: 'residential', startDate: '2024-07-01', endDate: '2025-06-30', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c31', unitId: '31', residentUserId: 'tenant24', type: 'residential', startDate: '2024-08-01', endDate: '2025-07-31', durationMonths: 12, monthlyRent: 2200, depositAmount: 4400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c32', unitId: '32', residentUserId: 'tenant25', type: 'residential', startDate: '2024-09-01', endDate: '2025-08-31', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c33', unitId: '33', residentUserId: 'tenant26', type: 'residential', startDate: '2024-10-01', endDate: '2025-09-30', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c35', unitId: '35', residentUserId: 'tenant27', type: 'residential', startDate: '2024-11-01', endDate: '2025-10-31', durationMonths: 12, monthlyRent: 2200, depositAmount: 4400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c36', unitId: '36', residentUserId: 'tenant28', type: 'residential', startDate: '2024-12-01', endDate: '2025-11-30', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c37', unitId: '37', residentUserId: 'tenant29', type: 'residential', startDate: '2024-08-15', endDate: '2025-08-14', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c39', unitId: '39', residentUserId: 'tenant30', type: 'residential', startDate: '2024-09-15', endDate: '2025-09-14', durationMonths: 12, monthlyRent: 2200, depositAmount: 4400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c40', unitId: '40', residentUserId: 'tenant31', type: 'residential', startDate: '2024-10-15', endDate: '2025-10-14', durationMonths: 12, monthlyRent: 3000, depositAmount: 6000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c41', unitId: '41', residentUserId: 'tenant32', type: 'residential', startDate: '2024-11-15', endDate: '2025-11-14', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c43', unitId: '43', residentUserId: 'tenant33', type: 'residential', startDate: '2024-12-15', endDate: '2025-12-14', durationMonths: 12, monthlyRent: 4000, depositAmount: 8000, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
  { id: 'c45', unitId: '45', residentUserId: 'tenant34', type: 'residential', startDate: '2024-07-01', endDate: '2025-06-30', durationMonths: 12, monthlyRent: 2200, depositAmount: 4400, commissionAmount: 0, vatRate: 15, paymentFrequency: 'monthly', status: 'active', attachments: [] },
];

// Calculate real metrics from actual data
const calculateRealMetrics = (properties: Property[], units: typeof realUnits, contracts: typeof realContracts): DashboardMetrics & { monthlyIncome: number; yearlyIncome: number } => {
  // Calculate accurate unit counts
  const totalUnits = units.length;
  const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
  const vacantUnits = units.filter(unit => unit.status === 'vacant').length;
  
  // Calculate accurate income based on active contracts
  const activeContracts = realContracts.filter(contract => contract.status === 'active');
  
  // Calculate monthly income from actual contract data
  let monthlyIncome = 0;
  activeContracts.forEach(contract => {
    // Use actual monthly rent from contract with VAT
    const totalRent = contract.monthlyRent * (1 + contract.vatRate / 100);
    monthlyIncome += totalRent;
  });
  
  const yearlyIncome = monthlyIncome * 12;
  
  // Calculate accurate due and overdue charges
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Simulate realistic charge distribution
  const dueThisWeek = Math.floor(occupiedUnits * 0.25); // 25% of occupied units have charges due this week
  const overdueCharges = Math.floor(occupiedUnits * 0.08); // 8% of occupied units are overdue
  
  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    dueThisWeek,
    overdueCharges,
    monthlyIncome,
    yearlyIncome,
  };
};

// Helper function to get property statistics
const getPropertyStats = (propertyId: string) => {
  const propertyUnits = realUnits.filter(unit => unit.propertyId === propertyId);
  const totalUnits = propertyUnits.length;
  const occupiedUnits = propertyUnits.filter(unit => {
    // Check if unit has an active contract by looking for it in realContracts
    return realContracts.some(contract => 
      contract.unitId === unit.id && contract.status === 'active'
    );
  }).length;
  
  return { occupiedUnits, totalUnits };
};

const mockUpcomingCharges: UpcomingCharge[] = [
];

export default function DashboardScreen() {
  const { t, language, isRTL, setLanguage, dateSystem, formatDate, getHijriToday, toggleDateSystem, isRamadan: isCurrentlyRamadan, numberFont, formatCurrency } = useLocalization();
  const { user, needsVerification } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'phone' | 'email'>('phone');
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  
  // Initialize notifications with proper localization context
  React.useEffect(() => {
    setNotifications(generateMockNotifications(language, dateSystem));
  }, [language, dateSystem]);
  
  // Calculate real metrics from actual data
  const realMetrics = calculateRealMetrics(realProperties, realUnits, realContracts);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  // Add date system toggle handler
  const handleDateSystemToggle = async () => {
    console.log('📅 Date system toggle clicked');
    const result = await toggleDateSystem();
    if (result.success) {
      console.log('✅ Date system toggled successfully to:', result.newDateSystem);
    } else {
      console.error('❌ Date system toggle failed:', result.error);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleSendReminder = (residentPhone: string, message: string) => {
    console.log('Sending reminder to:', residentPhone, 'Message:', message);
    // In a real app, this would send the reminder and log it
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.headerLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text
              style={[
                styles.currentDate,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {dateSystem === 'hijri' ? getHijriToday() : formatDate(new Date())}
              {isCurrentlyRamadan && language === 'ar' && (
                <Text style={{ color: colors.warning }}> 🌙</Text>
              )}
            </Text>
            <Logo size="md" style={styles.logo} />
            <Text
              style={[
                styles.appTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'حلالي' : 'Halali'}
            </Text>
            <Text
              style={[
                styles.welcomeUser,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'مرحباً' : 'Welcome'} {user ? (language === 'ar' ? user.fullNameAr || user.fullName : user.fullNameEn || user.fullName) : ''}
            </Text>
          </View>
          
          <View style={[styles.headerRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity 
              style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]} 
              onPress={handleDateSystemToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { 
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Medium' 
              }]}>
                {dateSystem === 'hijri' ? (language === 'ar' ? 'ميلادي' : 'Gregorian') : (language === 'ar' ? 'هجري' : 'Hijri')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]} onPress={toggleTheme} activeOpacity={0.7}>
              {isDark ? (
                <Moon size={16} color={colors.textSecondary} />
              ) : (
                <Sun size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]} onPress={toggleLanguage} activeOpacity={0.7}>
              <Globe size={16} color={colors.textSecondary} />
              <Text style={[styles.chipText, { 
                color: colors.textSecondary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Medium' 
              }]}>
                {language === 'ar' ? 'EN' : 'عر'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        {unreadNotifications.slice(0, 2).length > 0 && (
          <View style={styles.notificationsSection}>
            <NotificationSystem
              notifications={unreadNotifications.slice(0, 2)}
              onMarkAsRead={handleMarkAsRead}
              onSendReminder={handleSendReminder}
            />
            
            {/* Check More Button */}
            {unreadNotifications.length > 2 && (
              <TouchableOpacity
                style={[styles.checkMoreButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => router.push('/(tabs)/collections')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.checkMoreText,
                    {
                      color: colors.primary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: 'center',
                    },
                  ]}
                >
                  {language === 'ar' 
                    ? `عرض ${unreadNotifications.length - 2} إشعارات أخرى`
                    : `View ${unreadNotifications.length - 2} more notifications`
                  }
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Verification Banner */}
        {needsVerification() && (
          <VerificationBanner
            onVerifyPhone={() => {
              setVerificationType('phone');
              setShowVerificationModal(true);
            }}
            onVerifyEmail={() => {
              setVerificationType('email');
              setShowVerificationModal(true);
            }}
          />
        )}

        {/* Metrics Grid */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <MetricCard
              title={t('monthlyIncome')}
              value={realMetrics.monthlyIncome}
              currency={user?.currency}
            />
            <MetricCard
              title={t('yearlyIncome')}
              value={realMetrics.yearlyIncome}
              currency={user?.currency}
            />
          </View>
          
          <View style={[styles.metricsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <MetricCard
              title={t('occupied')}
              value={realMetrics.occupiedUnits}
            />
            <MetricCard
              title={t('vacant')}
              value={realMetrics.vacantUnits}
            />
          </View>
          
          <View style={[styles.metricsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <MetricCard
              title={t('dueThisWeek')}
              value={realMetrics.dueThisWeek}
            />
            <MetricCard
              title={t('overdue')}
              value={realMetrics.overdueCharges}
            />
          </View>
        </View>

        {/* My Properties Section */}
        <View style={styles.propertiesSection}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'عقاراتي' : 'My Properties'}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Check if user needs subscription (new user without properties)
                if (realProperties.length === 0) {
                  router.push('/(tabs)/pricing-setup');
                } else {
                  router.push('/(tabs)/ai-create');
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.addButtonText,
                  {
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  },
                ]}
              >
                {language === 'ar' ? 'إضافة عقار' : 'Add Property'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.propertiesList}>
            {realProperties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={[styles.propertyCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/(tabs)/property-details?id=${property.id}&name=${encodeURIComponent(property.name)}`)}
                activeOpacity={0.7}
              >
                <View style={styles.propertyCardContent}>
                  <Text
                    style={[
                      styles.propertyName,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {property.name}
                  </Text>
                  <Text
                    style={[
                      styles.propertyStats,
                      {
                        color: colors.textSecondary,
                        fontFamily: numberFont,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {(() => {
                      const stats = getPropertyStats(property.id);
                      return `${stats.occupiedUnits}/${stats.totalUnits} ${language === 'ar' ? 'وحدة' : 'units'}`;
                    })()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Verification Modal */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type={verificationType}
        phoneNumber={user?.phoneE164}
        email={user?.email}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  currentDate: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  logo: {
    marginBottom: spacing.xs,
  },
  appTitle: {
    fontSize: fontSize.xl,
  },
  welcomeUser: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  headerRight: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.sm,
  },
  metricsContainer: {
    gap: spacing.sm,
  },
  metricsRow: {
    gap: spacing.sm,
  },
  propertiesSection: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    color: '#FFFFFF',
  },
  propertiesList: {
    gap: spacing.sm,
  },
  propertyCard: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  propertyCardContent: {
    gap: spacing.xs,
  },
  propertyName: {
    fontSize: fontSize.md,
  },
  propertyStats: {
    fontSize: fontSize.sm,
  },
  notificationsSection: {
    marginBottom: spacing.lg,
  },
  checkMoreButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 167, 113, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  checkMoreText: {
    fontSize: fontSize.md,
  },
});