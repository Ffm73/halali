import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DateSelector, DateSelection } from '@/components/contracts/DateSelector';
import { TenantSelector } from '@/components/tenants/TenantSelector';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useTenants, TenantRecord } from '@/hooks/useTenants';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { ContractType, PaymentFrequency, Gender } from '@/types';
import { ArrowLeft, ArrowRight, FileText, User, Calendar, DollarSign, Check, ChevronDown, Users, Plus, Building2, CreditCard } from 'lucide-react-native';

export default function ContractFormScreen() {
  const { language, isRTL, formatCurrency, currency } = useLocalization();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { createOrUpdateTenant, createContract, isUnitOccupied } = useTenants();
  const router = useRouter();
  const { unitId, unitLabel, propertyName, propertyId } = useLocalSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [showContractTypeDropdown, setShowContractTypeDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // New tenant form data
  const [newTenantForm, setNewTenantForm] = useState({
    fullName: '',
    email: '',
    phoneE164: '',
    nationalId: '',
    dateOfBirth: '',
    nationality: 'SA',
    gender: 'male' as Gender,
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  // Contract form data
  const [contractForm, setContractForm] = useState({
    type: 'residential' as ContractType,
    notes: '',
  });

  // Date selection
  const [dateSelection, setDateSelection] = useState<DateSelection>({
    mode: 'duration',
    startDate: new Date().toISOString().split('T')[0],
    durationMonths: 12,
    durationUnit: 'months' as const,
  });

  // Pricing structure
  const [basicPricing, setBasicPricing] = useState({
    monthlyRent: 2500,
    depositAmount: 5000,
    vatRate: 15,
    paymentFrequency: 'monthly' as PaymentFrequency,
  });

  const contractTypes = [
    { 
      id: 'residential', 
      label: language === 'ar' ? 'سكني' : 'Residential',
      description: language === 'ar' ? 'عقد إيجار سكني' : 'Residential lease contract',
    },
    { 
      id: 'commercial', 
      label: language === 'ar' ? 'تجاري' : 'Commercial',
      description: language === 'ar' ? 'عقد إيجار تجاري' : 'Commercial lease contract',
    },
  ];

  // Force refresh when date system changes
  const { dateSystem, addDateSystemUpdateCallback } = useLocalization();
  
  React.useEffect(() => {
    const cleanup = addDateSystemUpdateCallback(() => {
      setRefreshKey(prev => prev + 1);
    });
    return cleanup;
  }, [addDateSystemUpdateCallback]);
  // Check if unit is already occupied
  useEffect(() => {
    if (unitId && isUnitOccupied(unitId as string)) {
      Alert.alert(
        language === 'ar' ? 'وحدة مؤجرة' : 'Unit Occupied',
        language === 'ar' ? 'هذه الوحدة مؤجرة بالفعل' : 'This unit is already occupied',
        [
          {
            text: language === 'ar' ? 'موافق' : 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [unitId]);

  const validateTenantForm = () => {
    if (!newTenantForm.fullName.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter full name'
      );
      return false;
    }

    if (!newTenantForm.phoneE164.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number'
      );
      return false;
    }

    if (!newTenantForm.phoneE164.startsWith('+') || newTenantForm.phoneE164.length < 10) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number format'
      );
      return false;
    }

    if (newTenantForm.email.trim() && !newTenantForm.email.includes('@')) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'
      );
      return false;
    }

    return true;
  };

  const validateContractForm = () => {
    if (!dateSelection.startDate) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى اختيار تاريخ البداية' : 'Please select start date'
      );
      return false;
    }

    if (dateSelection.mode === 'duration' && (!dateSelection.durationMonths || dateSelection.durationMonths <= 0)) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى اختيار مدة العقد' : 'Please select contract duration'
      );
      return false;
    }

    if (dateSelection.mode === 'manual' && !dateSelection.endDate) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى اختيار تاريخ النهاية' : 'Please select end date'
      );
      return false;
    }

    if (!basicPricing.monthlyRent || basicPricing.monthlyRent <= 0) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال مبلغ الإيجار' : 'Please enter rent amount'
      );
      return false;
    }

    return true;
  };

  const handleSaveContract = async () => {
    console.log('💾 CONTRACT SAVE INITIATED');
    console.log('📋 Form validation starting...');
    
    // Validate forms
    if (!selectedTenant && !validateTenantForm()) {
      console.log('❌ Tenant form validation failed');
      return;
    }

    if (!validateContractForm()) {
      console.log('❌ Contract form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    setIsLoading(true);

    try {
      let tenantRecord: TenantRecord;

      // Step 1: Create or get tenant
      if (selectedTenant) {
        console.log('👤 Using existing tenant:', selectedTenant.fullName);
        tenantRecord = selectedTenant;
      } else {
        console.log('👤 Creating new tenant...');
        console.log('📝 New tenant data:', {
          fullName: newTenantForm.fullName,
          phoneE164: newTenantForm.phoneE164,
          email: newTenantForm.email,
          nationalId: newTenantForm.nationalId,
        });

        tenantRecord = await createOrUpdateTenant({
          userId: `user_${Date.now()}`,
          landlordId: user?.id || 'landlord1',
          fullName: newTenantForm.fullName,
          email: newTenantForm.email,
          phoneE164: newTenantForm.phoneE164,
          nationalId: newTenantForm.nationalId,
          dateOfBirth: newTenantForm.dateOfBirth,
          nationality: newTenantForm.nationality,
          gender: newTenantForm.gender,
          emergencyContact: newTenantForm.emergencyContact.name ? newTenantForm.emergencyContact : undefined,
          status: 'active',
        });

        console.log('✅ Tenant created/updated:', tenantRecord.id);
      }

      // Step 2: Calculate contract end date
      let endDate = dateSelection.endDate;
      if (dateSelection.mode === 'duration' && dateSelection.durationMonths) {
        const startDate = new Date(dateSelection.startDate);
        const calculatedEndDate = new Date(startDate);
        
        if (dateSelection.durationMonths < 1) {
          // For periods less than a month, use days
          const days = Math.round(dateSelection.durationMonths * 30);
          calculatedEndDate.setDate(calculatedEndDate.getDate() + days);
        } else {
          calculatedEndDate.setMonth(calculatedEndDate.getMonth() + dateSelection.durationMonths);
        }
        
        endDate = calculatedEndDate.toISOString().split('T')[0];
      }

      console.log('📅 Contract dates calculated:', {
        startDate: dateSelection.startDate,
        endDate,
        durationMonths: dateSelection.durationMonths,
      });

      // Step 3: Create contract
      console.log('📄 Creating contract...');
      const contractData = {
        tenantId: tenantRecord.id,
        unitId: unitId as string,
        propertyId: '1', // Default property ID
        type: contractForm.type,
        startDate: dateSelection.startDate,
        endDate,
        durationMonths: dateSelection.durationMonths || 12,
        monthlyRent: basicPricing.monthlyRent,
        depositAmount: basicPricing.depositAmount,
        vatRate: basicPricing.vatRate,
        paymentFrequency: basicPricing.paymentFrequency,
        notes: contractForm.notes,
        attachments: [],
      };

      console.log('📋 Contract data prepared:', contractData);

      const contract = await createContract(contractData);
      console.log('✅ Contract created successfully:', contract.id);

      // Step 4: Show success and navigate
      Alert.alert(
        language === 'ar' ? '🎉 تم إنشاء العقد' : '🎉 Contract Created',
        language === 'ar' 
          ? `تم إنشاء عقد الوحدة ${unitLabel} مع ${tenantRecord.fullName} بنجاح.\n\nالإيجار الشهري: ${basicPricing.monthlyRent.toLocaleString()} ريال\nمدة العقد: ${dateSelection.durationMonths} ${dateSelection.durationMonths === 1 ? 'شهر' : 'أشهر'}`
          : `Contract for unit ${unitLabel} with ${tenantRecord.fullName} created successfully.\n\nMonthly rent: ${basicPricing.monthlyRent.toLocaleString()} SAR\nDuration: ${dateSelection.durationMonths} ${dateSelection.durationMonths === 1 ? 'month' : 'months'}`,
        [
          {
            text: language === 'ar' ? 'موافق' : 'OK',
            onPress: () => {
              console.log('🏠 Navigating back to property details');
              // Force refresh the property details page
              router.replace({
                pathname: '/(tabs)/property-details',
                params: {
                  id: propertyId || '1',
                  name: propertyName || 'Property',
                  refresh: Date.now().toString(), // Force refresh
                },
              });
            },
          },
        ]
      );

    } catch (error) {
      console.error('💥 Contract creation failed:', error);
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        tenantData: selectedTenant || newTenantForm,
        contractData: contractForm,
        dateSelection,
        basicPricing,
      });

      Alert.alert(
        language === 'ar' ? 'خطأ في إنشاء العقد' : 'Contract Creation Error',
        language === 'ar' 
          ? 'فشل في إنشاء العقد. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
          : 'Failed to create contract. Please check the data and try again.',
        [
          {
            text: language === 'ar' ? 'موافق' : 'OK',
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSelected = (tenant: TenantRecord) => {
    console.log('👤 Tenant selected:', tenant.fullName);
    setSelectedTenant(tenant);
    setShowTenantSelector(false);
  };

  const handleCreateNewTenant = () => {
    console.log('👤 Creating new tenant selected');
    setSelectedTenant(null);
    setShowTenantSelector(false);
  };

  const resetNewTenantForm = () => {
    setNewTenantForm({
      fullName: '',
      email: '',
      phoneE164: '',
      nationalId: '',
      dateOfBirth: '',
      nationality: 'SA',
      gender: 'male',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push({
              pathname: '/(tabs)/property-details',
              params: {
                id: propertyId || '1',
                name: propertyName || 'Property',
              },
            })}
            activeOpacity={0.7}
          >
            {isRTL ? (
              <ArrowRight size={24} color={colors.textSecondary} />
            ) : (
              <ArrowLeft size={24} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'عقد جديد' : 'New Contract'}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {propertyName} - {unitLabel}
            </Text>
          </View>
        </View>

        {/* Tenant Selection */}
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Card style={[styles.tenantSection, { backgroundColor: colors.surface }]}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primaryLight }]}>
                <User size={24} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'المستأجر' : 'Tenant'}
              </Text>
            </View>

            {selectedTenant ? (
              <View style={[styles.selectedTenant, { backgroundColor: colors.successLight }]}>
                <View style={[styles.selectedTenantContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.selectedTenantIcon, { backgroundColor: colors.success }]}>
                    <User size={20} color={colors.surface} />
                  </View>
                  <View style={styles.selectedTenantInfo}>
                    <Text
                      style={[
                        styles.selectedTenantName,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {selectedTenant.fullName}
                    </Text>
                    <Text
                      style={[
                        styles.selectedTenantPhone,
                        {
                          color: colors.textSecondary,
                          fontFamily: 'monospace',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {selectedTenant.phoneE164}
                    </Text>
                    {selectedTenant.nationalId && (
                      <Text
                        style={[
                          styles.selectedTenantId,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {language === 'ar' ? 'الهوية: ' : 'ID: '}{selectedTenant.nationalId}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.changeTenantButton, { backgroundColor: colors.warningLight }]}
                    onPress={() => {
                      setSelectedTenant(null);
                      resetNewTenantForm();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.changeTenantText,
                        {
                          color: colors.warning,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.tenantSelectionOptions}>
                <Button
                  title={language === 'ar' ? 'اختيار مستأجر موجود' : 'Select Existing Tenant'}
                  onPress={() => setShowTenantSelector(true)}
                  variant="secondary"
                  style={styles.tenantOptionButton}
                />
                
                <Text
                  style={[
                    styles.orText,
                    {
                      color: colors.textMuted,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: 'center',
                    },
                  ]}
                >
                  {language === 'ar' ? 'أو' : 'OR'}
                </Text>

                {/* New Tenant Form */}
                <View style={[styles.newTenantForm, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text
                    style={[
                      styles.newTenantTitle,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar' ? 'إضافة مستأجر جديد' : 'Add New Tenant'}
                  </Text>

                  <View style={styles.formGroup}>
                    <Text
                      style={[
                        styles.formLabel,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                      placeholder={language === 'ar' ? 'محمد أحمد السعيد' : 'Mohammed Ahmed Alsaeed'}
                      placeholderTextColor={colors.textMuted}
                      value={newTenantForm.fullName}
                      onChangeText={(text) => setNewTenantForm(prev => ({ ...prev, fullName: text }))}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <PhoneInput
                      value={newTenantForm.phoneE164}
                      onChangeText={(phone) => setNewTenantForm(prev => ({ ...prev, phoneE164: phone }))}
                      label={language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                      required
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text
                      style={[
                        styles.formLabel,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                          fontFamily: 'Nunito-Regular',
                          textAlign: 'left',
                        },
                      ]}
                      placeholder="mohammed@example.com"
                      placeholderTextColor={colors.textMuted}
                      value={newTenantForm.email}
                      onChangeText={(text) => setNewTenantForm(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text
                      style={[
                        styles.formLabel,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'رقم الهوية' : 'National ID'}
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                          fontFamily: 'monospace',
                          textAlign: 'center',
                        },
                      ]}
                      placeholder="1234567890"
                      placeholderTextColor={colors.textMuted}
                      value={newTenantForm.nationalId}
                      onChangeText={(text) => setNewTenantForm(prev => ({ ...prev, nationalId: text }))}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text
                      style={[
                        styles.formLabel,
                        {
                          color: colors.textSecondary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {language === 'ar' ? 'الجنس *' : 'Gender *'}
                    </Text>
                    <View style={styles.genderOptions}>
                      <TouchableOpacity
                        style={[
                          styles.genderOption,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          newTenantForm.gender === 'male' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                        ]}
                        onPress={() => setNewTenantForm(prev => ({ ...prev, gender: 'male' }))}
                      >
                        <Text style={[styles.genderText, { 
                          color: newTenantForm.gender === 'male' ? colors.primary : colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
                        }]}>
                          {language === 'ar' ? 'ذكر' : 'Male'}
                        </Text>
                        {newTenantForm.gender === 'male' && <Check size={16} color={colors.primary} />}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.genderOption,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          newTenantForm.gender === 'female' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                        ]}
                        onPress={() => setNewTenantForm(prev => ({ ...prev, gender: 'female' }))}
                      >
                        <Text style={[styles.genderText, { 
                          color: newTenantForm.gender === 'female' ? colors.primary : colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium' 
                        }]}>
                          {language === 'ar' ? 'أنثى' : 'Female'}
                        </Text>
                        {newTenantForm.gender === 'female' && <Check size={16} color={colors.primary} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* Contract Type */}
          <Card style={[styles.contractTypeSection, { backgroundColor: colors.surface }]}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.warningLight }]}>
                <FileText size={24} color={colors.warning} />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'نوع العقد' : 'Contract Type'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.contractTypeSelector,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
              ]}
              onPress={() => setShowContractTypeDropdown(!showContractTypeDropdown)}
            >
              <View style={[styles.contractTypeSelectorContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Building2 size={20} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.contractTypeText,
                    {
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    },
                  ]}
                >
                  {contractTypes.find(t => t.id === contractForm.type)?.label}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {showContractTypeDropdown && (
              <View style={[styles.contractTypeDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {contractTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.contractTypeOption,
                      contractForm.type === type.id && { backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => {
                      setContractForm(prev => ({ ...prev, type: type.id as ContractType }));
                      setShowContractTypeDropdown(false);
                    }}
                  >
                    <View style={styles.contractTypeOptionContent}>
                      <Text
                        style={[
                          styles.contractTypeOptionLabel,
                          {
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text
                        style={[
                          styles.contractTypeOptionDescription,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                          },
                        ]}
                      >
                        {type.description}
                      </Text>
                    </View>
                    {contractForm.type === type.id && (
                      <Check size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Contract Dates */}
          <DateSelector
            value={dateSelection}
            onChange={setDateSelection}
            minStartDate={new Date().toISOString().split('T')[0]}
          />

          {/* Pricing */}
          <Card style={[styles.basicPricingSection, { backgroundColor: colors.surface }]}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.successLight }]}>
                <DollarSign size={24} color={colors.success} />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'التسعير الأساسي' : 'Basic Pricing'}
              </Text>
            </View>

            <View style={styles.basicPricingInputs}>
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.formLabel,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'الإيجار الشهري *' : 'Monthly Rent *'}
                </Text>
                <View style={styles.currencyInputWrapper}>
                  <TextInput
                    style={[
                      styles.currencyInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: 'monospace',
                      },
                    ]}
                    placeholder="2500"
                    placeholderTextColor={colors.textMuted}
                    value={basicPricing.monthlyRent.toString()}
                    onChangeText={(text) => {
                      const amount = parseInt(text) || 0;
                      setBasicPricing(prev => ({ ...prev, monthlyRent: amount }));
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                    {currency}
                  </Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.formLabel,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'مبلغ التأمين' : 'Security Deposit'}
                </Text>
                <View style={styles.currencyInputWrapper}>
                  <TextInput
                    style={[
                      styles.currencyInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: 'monospace',
                      },
                    ]}
                    placeholder="5000"
                    placeholderTextColor={colors.textMuted}
                    value={basicPricing.depositAmount.toString()}
                    onChangeText={(text) => {
                      const amount = parseInt(text) || 0;
                      setBasicPricing(prev => ({ ...prev, depositAmount: amount }));
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                    {currency}
                  </Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.formLabel,
                    {
                      color: colors.textSecondary,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {language === 'ar' ? 'ضريبة القيمة المضافة (%)' : 'VAT Rate (%)'}
                </Text>
                <View style={styles.currencyInputWrapper}>
                  <TextInput
                    style={[
                      styles.currencyInput,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: 'monospace',
                      },
                    ]}
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                    value={basicPricing.vatRate.toString()}
                    onChangeText={(text) => {
                      const rate = parseFloat(text) || 0;
                      setBasicPricing(prev => ({ ...prev, vatRate: Math.min(100, Math.max(0, rate)) }));
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>%</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Contract Notes */}
          <Card style={[styles.notesSection, { backgroundColor: colors.surface }]}>
            <Text
              style={[
                styles.notesTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {language === 'ar' ? 'ملاحظات العقد' : 'Contract Notes'}
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={language === 'ar' ? 'ملاحظات إضافية حول العقد...' : 'Additional contract notes...'}
              placeholderTextColor={colors.textMuted}
              value={contractForm.notes}
              onChangeText={(text) => setContractForm(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <Button
              title={isLoading 
                ? (language === 'ar' ? 'جاري إنشاء العقد...' : 'Creating Contract...') 
                : (language === 'ar' ? 'إنشاء العقد' : 'Create Contract')
              }
              onPress={handleSaveContract}
              disabled={isLoading}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>

        {/* Tenant Selector Modal */}
        <TenantSelector
          visible={showTenantSelector}
          onClose={() => setShowTenantSelector(false)}
          onTenantSelected={handleTenantSelected}
          onCreateNew={handleCreateNewTenant}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  tenantSection: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  selectedTenant: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(76, 167, 113, 0.3)',
  },
  selectedTenantContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedTenantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTenantInfo: {
    flex: 1,
  },
  selectedTenantName: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  selectedTenantPhone: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  selectedTenantId: {
    fontSize: fontSize.sm,
  },
  changeTenantButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  changeTenantText: {
    fontSize: fontSize.sm,
  },
  tenantSelectionOptions: {
    gap: spacing.lg,
  },
  tenantOptionButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  orText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  newTenantForm: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(76, 167, 113, 0.3)',
    gap: spacing.md,
  },
  newTenantTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  formGroup: {
    gap: spacing.sm,
  },
  formLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  formInput: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.md,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  genderText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  contractTypeSection: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contractTypeSelector: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contractTypeSelectorContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  contractTypeText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  contractTypeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    zIndex: 99999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 200,
  },
  contractTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contractTypeOptionContent: {
    flex: 1,
  },
  contractTypeOptionLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  contractTypeOptionDescription: {
    fontSize: fontSize.sm,
  },
  notesSection: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  notesTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  notesInput: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.md,
    minHeight: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  saveButtonContainer: {
    marginTop: spacing.lg,
  },
  saveButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  basicPricingSection: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  basicPricingInputs: {
    gap: spacing.lg,
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
});