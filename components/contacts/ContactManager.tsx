import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { Users, UserPlus, Search, Filter, Upload, Download, Phone, Mail, MessageSquare, CreditCard as Edit3, Trash2, X, Check, Star, Building, Calendar, Globe, FileText, Zap, Shield, Eye, Plus, ChevronDown, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

export interface Contact {
  id: string;
  type: 'tenant' | 'staff' | 'vendor' | 'emergency';
  fullName: string;
  email?: string;
  phoneE164: string;
  secondaryPhone?: string;
  company?: string;
  position?: string;
  address?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  lastContact?: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, string>;
}

export interface ContactGroup {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  contacts: Contact[];
  color: string;
  icon: any;
}

interface ContactManagerProps {
  onContactAdded?: (contact: Contact) => void;
  onContactUpdated?: (contact: Contact) => void;
  onContactDeleted?: (contactId: string) => void;
  initialContacts?: Contact[];
  allowBulkImport?: boolean;
  showAdvancedFeatures?: boolean;
}

export function ContactManager({ 
  onContactAdded,
  onContactUpdated,
  onContactDeleted,
  initialContacts = [],
  allowBulkImport = true,
  showAdvancedFeatures = true 
}: ContactManagerProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tenant' | 'staff' | 'vendor' | 'emergency'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Form state for adding/editing contacts
  const [contactForm, setContactForm] = useState({
    type: 'tenant' as Contact['type'],
    fullName: '',
    email: '',
    phoneE164: '',
    secondaryPhone: '',
    company: '',
    position: '',
    address: '',
    notes: '',
    tags: [] as string[],
    customFields: {} as Record<string, string>,
  });

  const contactTypes = [
    { 
      id: 'tenant', 
      label: language === 'ar' ? 'مستأجر' : 'Tenant',
      icon: Users,
      color: colors.primary,
    },
    { 
      id: 'staff', 
      label: language === 'ar' ? 'موظف' : 'Staff',
      icon: Shield,
      color: colors.warning,
    },
    { 
      id: 'vendor', 
      label: language === 'ar' ? 'مورد' : 'Vendor',
      icon: Building,
      color: colors.success,
    },
    { 
      id: 'emergency', 
      label: language === 'ar' ? 'طوارئ' : 'Emergency',
      icon: AlertCircle,
      color: colors.danger,
    },
  ];

  const quickAddTemplates = [
    {
      name: language === 'ar' ? 'مستأجر جديد' : 'New Tenant',
      type: 'tenant' as const,
      fields: ['fullName', 'phoneE164', 'email'],
    },
    {
      name: language === 'ar' ? 'موظف صيانة' : 'Maintenance Staff',
      type: 'staff' as const,
      fields: ['fullName', 'phoneE164', 'company', 'position'],
    },
    {
      name: language === 'ar' ? 'مورد خدمات' : 'Service Vendor',
      type: 'vendor' as const,
      fields: ['company', 'fullName', 'phoneE164', 'email'],
    },
  ];

  useEffect(() => {
    loadDemoContacts();
    loadStoredContacts();
  }, []);

  const loadStoredContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem('contactsData');
      if (stored) {
        const storedContacts = JSON.parse(stored);
        setContacts(prev => [...prev, ...storedContacts]);
      }
    } catch (error) {
      console.error('Failed to load stored contacts:', error);
    }
  };

  const saveContactsToStorage = async (contactsToSave: Contact[]) => {
    try {
      await AsyncStorage.setItem('contactsData', JSON.stringify(contactsToSave));
    } catch (error) {
      console.error('Failed to save contacts:', error);
      throw error;
    }
  };

  const loadDemoContacts = () => {
    const demoContacts: Contact[] = [
      {
        id: 'contact1',
        type: 'tenant',
        fullName: 'محمد أحمد السعيد',
        email: 'mohammed@example.com',
        phoneE164: '+966501234567',
        tags: ['مستأجر حالي', 'دفع منتظم'],
        isFavorite: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastContact: '2025-01-10T14:30:00Z',
      },
      {
        id: 'contact2',
        type: 'staff',
        fullName: 'أحمد علي الصيانة',
        phoneE164: '+966512345678',
        company: 'شركة الصيانة المتقدمة',
        position: 'فني كهرباء',
        tags: ['صيانة', 'كهرباء', 'طوارئ'],
        isFavorite: false,
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-02-01T09:00:00Z',
      },
      {
        id: 'contact3',
        type: 'vendor',
        fullName: 'سارة محمد التنظيف',
        email: 'sara.cleaning@example.com',
        phoneE164: '+966523456789',
        company: 'خدمات التنظيف الشاملة',
        position: 'مديرة العمليات',
        tags: ['تنظيف', 'خدمات'],
        isFavorite: true,
        createdAt: '2024-01-20T11:00:00Z',
        updatedAt: '2024-01-20T11:00:00Z',
      },
    ];
    
    setContacts(demoContacts);
  };

  const getFilteredContacts = () => {
    let filtered = contacts;
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(c => c.type === selectedFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.fullName.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phoneE164.includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const handleAddContact = () => {
    if (!contactForm.fullName.trim() || !contactForm.phoneE164.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'
      );
      return;
    }

    setIsSavingContact(true);

    const saveContact = async () => {
      try {
        // Validate phone number format
        if (!contactForm.phoneE164.startsWith('+') || contactForm.phoneE164.length < 10) {
          throw new Error(language === 'ar' ? 'تنسيق رقم الهاتف غير صحيح' : 'Invalid phone number format');
        }
        
        // Validate email if provided
        if (contactForm.email.trim() && !contactForm.email.includes('@')) {
          throw new Error(language === 'ar' ? 'تنسيق البريد الإلكتروني غير صحيح' : 'Invalid email format');
        }

        const newContact: Contact = {
          id: `contact_${Date.now()}`,
          ...contactForm,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedContacts = [...contacts, newContact];
        
        // Save to storage
        await saveContactsToStorage(updatedContacts);
        
        // Update local state
        setContacts(updatedContacts);
        onContactAdded?.(newContact);
        
        // Reset form
        setContactForm({
          type: 'tenant',
          fullName: '',
          email: '',
          phoneE164: '',
          secondaryPhone: '',
          company: '',
          position: '',
          address: '',
          notes: '',
          tags: [],
          customFields: {},
        });
        
        setShowAddModal(false);
        
        Alert.alert(
          language === 'ar' ? '✅ تم الحفظ' : '✅ Saved',
          language === 'ar' ? 'تم حفظ جهة الاتصال بنجاح في النظام' : 'Contact saved successfully to system'
        );
      } catch (error) {
        console.error('Contact save error:', error);
        Alert.alert(
          language === 'ar' ? 'خطأ في الحفظ' : 'Save Error',
          error instanceof Error ? error.message : (language === 'ar' ? 'فشل في حفظ جهة الاتصال' : 'Failed to save contact')
        );
      } finally {
        setIsSavingContact(false);
      }
    };
    saveContact();
  };

  const handleEditContact = (contact: Contact) => {
    setContactForm({
      type: contact.type,
      fullName: contact.fullName,
      email: contact.email || '',
      phoneE164: contact.phoneE164,
      secondaryPhone: contact.secondaryPhone || '',
      company: contact.company || '',
      position: contact.position || '',
      address: contact.address || '',
      notes: contact.notes || '',
      tags: contact.tags,
      customFields: contact.customFields || {},
    });
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleUpdateContact = () => {
    if (!editingContact) return;

    setIsSavingContact(true);

    const updateContact = async () => {
      try {
        const updatedContact: Contact = {
          ...editingContact,
          ...contactForm,
          updatedAt: new Date().toISOString(),
        };

        const updatedContacts = contacts.map(c => c.id === editingContact.id ? updatedContact : c);
        
        // Save to storage
        await saveContactsToStorage(updatedContacts);
        
        // Update local state
        setContacts(updatedContacts);
        onContactUpdated?.(updatedContact);
        
        setEditingContact(null);
        setShowAddModal(false);
        
        Alert.alert(
          language === 'ar' ? '✅ تم التحديث والحفظ' : '✅ Updated and Saved',
          language === 'ar' ? 'تم تحديث وحفظ جهة الاتصال بنجاح' : 'Contact updated and saved successfully'
        );
      } catch (error) {
        console.error('Contact update error:', error);
        Alert.alert(
          language === 'ar' ? 'خطأ في الحفظ' : 'Save Error',
          language === 'ar' ? 'فشل في حفظ تحديث جهة الاتصال' : 'Failed to save contact update'
        );
      } finally {
        setIsSavingContact(false);
      }
    };
    updateContact();
  };

  const handleDeleteContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    Alert.alert(
      language === 'ar' ? 'حذف جهة الاتصال' : 'Delete Contact',
      language === 'ar' ? `هل تريد حذف ${contact.fullName}؟` : `Delete ${contact.fullName}?`,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'ar' ? 'حذف' : 'Delete', 
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(c => c.id !== contactId));
            onContactDeleted?.(contactId);
          }
        },
      ]
    );
  };

  const handleBulkImport = () => {
    Alert.alert(
      language === 'ar' ? 'استيراد جماعي' : 'Bulk Import',
      language === 'ar' ? 'سيتم فتح نموذج الاستيراد الجماعي' : 'Bulk import form will open'
    );
  };

  const handleQuickAdd = (template: typeof quickAddTemplates[0]) => {
    setContactForm(prev => ({
      ...prev,
      type: template.type,
    }));
    setShowAddModal(true);
  };

  const toggleFavorite = (contactId: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const getContactTypeInfo = (type: Contact['type']) => {
    return contactTypes.find(t => t.id === type) || contactTypes[0];
  };

  const filteredContacts = getFilteredContacts();
  const contactStats = {
    total: contacts.length,
    tenants: contacts.filter(c => c.type === 'tenant').length,
    staff: contacts.filter(c => c.type === 'staff').length,
    vendors: contacts.filter(c => c.type === 'vendor').length,
    emergency: contacts.filter(c => c.type === 'emergency').length,
  };

  const renderAddContactModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setShowAddModal(false);
        setEditingContact(null);
      }}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={() => {
              setShowAddModal(false);
              setEditingContact(null);
            }}
            style={[styles.modalCloseButton, { backgroundColor: colors.surfaceSecondary }]}
          >
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.modalTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {editingContact 
              ? (language === 'ar' ? 'تعديل جهة الاتصال' : 'Edit Contact')
              : (language === 'ar' ? 'إضافة جهة اتصال جديدة' : 'Add New Contact')
            }
          </Text>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Card style={[styles.contactForm, { backgroundColor: colors.surface }]}>
            {/* Contact Type Selection */}
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
                {language === 'ar' ? 'نوع جهة الاتصال *' : 'Contact Type *'}
              </Text>
              <View style={styles.typeOptions}>
                {contactTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      contactForm.type === type.id && { backgroundColor: type.color + '20', borderColor: type.color }
                    ]}
                    onPress={() => setContactForm(prev => ({ ...prev, type: type.id as Contact['type'] }))}
                  >
                    <type.icon size={20} color={contactForm.type === type.id ? type.color : colors.textSecondary} />
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color: contactForm.type === type.id ? type.color : colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-Medium',
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                    {contactForm.type === type.id && <Check size={16} color={type.color} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Full Name */}
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
                placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                placeholderTextColor={colors.textMuted}
                value={contactForm.fullName}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, fullName: text }))}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.formGroup}>
              <PhoneInput
                value={contactForm.phoneE164}
                onChangeText={(phone) => setContactForm(prev => ({ ...prev, phoneE164: phone }))}
                label={language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                required
              />
            </View>

            {/* Email */}
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
                placeholder="example@email.com"
                placeholderTextColor={colors.textMuted}
                value={contactForm.email}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Company (for staff/vendors) */}
            {(contactForm.type === 'staff' || contactForm.type === 'vendor') && (
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
                  {language === 'ar' ? 'الشركة' : 'Company'}
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
                  placeholder={language === 'ar' ? 'اسم الشركة' : 'Company name'}
                  placeholderTextColor={colors.textMuted}
                  value={contactForm.company}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, company: text }))}
                />
              </View>
            )}

            {/* Position */}
            {(contactForm.type === 'staff' || contactForm.type === 'vendor') && (
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
                  {language === 'ar' ? 'المنصب' : 'Position'}
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
                  placeholder={language === 'ar' ? 'المنصب أو التخصص' : 'Position or specialization'}
                  placeholderTextColor={colors.textMuted}
                  value={contactForm.position}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, position: text }))}
                />
              </View>
            )}

            {/* Notes */}
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
                {language === 'ar' ? 'ملاحظات' : 'Notes'}
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
                placeholderTextColor={colors.textMuted}
                value={contactForm.notes}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Last Contact Date */}
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
                {language === 'ar' ? 'آخر تواصل' : 'Last Contact'}
              </Text>
              <DatePicker
                value={contactForm.customFields?.lastContactDate || ''}
                onDateChange={(date) => setContactForm(prev => ({ 
                  ...prev, 
                  customFields: { ...prev.customFields, lastContactDate: date }
                }))}
                placeholder={language === 'ar' ? 'اختر تاريخ آخر تواصل' : 'Select last contact date'}
                maxDate={new Date().toISOString().split('T')[0]}
              />
            </View>

            {/* Form Actions */}
            <View style={[styles.formActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Button
                title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingContact(null);
                }}
                variant="secondary"
                style={styles.formActionButton}
              />
              <Button
                title={editingContact 
                  ? (isSavingContact ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تحديث' : 'Update'))
                  : (isSavingContact ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'إضافة' : 'Add Contact'))
                }
                onPress={editingContact ? handleUpdateContact : handleAddContact}
                disabled={isSavingContact}
                variant="primary"
                style={styles.formActionButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Stats */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.headerLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
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
              {language === 'ar' ? 'إدارة جهات الاتصال' : 'Contact Management'}
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
              {language === 'ar' 
                ? `${contactStats.total} جهة اتصال • ${contactStats.tenants} مستأجر`
                : `${contactStats.total} contacts • ${contactStats.tenants} tenants`
              }
            </Text>
          </View>
          <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {allowBulkImport && (
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: colors.successLight }]}
                onPress={handleBulkImport}
                activeOpacity={0.7}
              >
                <Upload size={20} color={colors.success} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.headerActionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.7}
            >
              <UserPlus size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Add Templates */}
      <View style={styles.quickAddSection}>
        <Text
          style={[
            styles.quickAddTitle,
            {
              color: colors.textPrimary,
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'إضافة سريعة' : 'Quick Add'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
          <View style={[styles.templates, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {quickAddTemplates.map((template, index) => {
              const typeInfo = getContactTypeInfo(template.type);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.templateCard, { backgroundColor: colors.surface, borderColor: typeInfo.color }]}
                  onPress={() => handleQuickAdd(template)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.templateIcon, { backgroundColor: typeInfo.color + '20' }]}>
                    <typeInfo.icon size={24} color={typeInfo.color} />
                  </View>
                  <Text
                    style={[
                      styles.templateName,
                      {
                        color: colors.textPrimary,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {template.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={language === 'ar' ? 'البحث بالاسم، الهاتف، أو الشركة' : 'Search by name, phone, or company'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={[styles.filters, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedFilter === 'all' ? colors.primary : colors.surfaceSecondary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedFilter('all')}
              activeOpacity={0.8}
            >
              <Eye size={18} color={selectedFilter === 'all' ? colors.surface : colors.primary} />
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: selectedFilter === 'all' ? colors.surface : colors.primary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  },
                ]}
              >
                {language === 'ar' ? 'الكل' : 'All'} ({contactStats.total})
              </Text>
            </TouchableOpacity>
            
            {contactTypes.map((type) => {
              const count = contactStats[type.id as keyof typeof contactStats] || 0;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: selectedFilter === type.id ? type.color : colors.surfaceSecondary,
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() => setSelectedFilter(type.id as any)}
                  activeOpacity={0.8}
                >
                  <type.icon size={18} color={selectedFilter === type.id ? colors.surface : type.color} />
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color: selectedFilter === type.id ? colors.surface : type.color,
                        fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                      },
                    ]}
                  >
                    {type.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Contacts List */}
      <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={true}>
        {filteredContacts.map((contact) => {
          const typeInfo = getContactTypeInfo(contact.type);
          
          return (
            <Card key={contact.id} style={[styles.contactCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.contactHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.contactIcon, { backgroundColor: typeInfo.color + '20' }]}>
                  <typeInfo.icon size={24} color={typeInfo.color} />
                </View>
                <View style={styles.contactInfo}>
                  <View style={[styles.contactTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text
                      style={[
                        styles.contactName,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {contact.fullName}
                    </Text>
                    {contact.isFavorite && (
                      <Star size={16} color={colors.warning} />
                    )}
                  </View>
                  
                  <View style={[styles.contactDetails, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.contactDetailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Phone size={14} color={colors.textMuted} />
                      <Text
                        style={[
                          styles.contactDetailText,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                          },
                        ]}
                      >
                        {contact.phoneE164}
                      </Text>
                    </View>
                    {contact.email && (
                      <View style={[styles.contactDetailItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Mail size={14} color={colors.textMuted} />
                        <Text
                          style={[
                            styles.contactDetailText,
                            {
                              color: colors.textSecondary,
                              fontFamily: 'Nunito-Regular',
                            },
                          ]}
                        >
                          {contact.email}
                        </Text>
                      </View>
                    )}
                  </View>

                  {contact.company && (
                    <View style={[styles.companyInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Building size={14} color={colors.textMuted} />
                      <Text
                        style={[
                          styles.companyText,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {contact.company}
                        {contact.position && ` • ${contact.position}`}
                      </Text>
                    </View>
                  )}

                  {contact.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {contact.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: typeInfo.color + '15' }]}>
                          <Text
                            style={[
                              styles.tagText,
                              {
                                color: typeInfo.color,
                                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                              },
                            ]}
                          >
                            {tag}
                          </Text>
                        </View>
                      ))}
                      {contact.tags.length > 3 && (
                        <Text
                          style={[
                            styles.moreTags,
                            {
                              color: colors.textMuted,
                              fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            },
                          ]}
                        >
                          +{contact.tags.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={[styles.contactActionButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => toggleFavorite(contact.id)}
                    activeOpacity={0.7}
                  >
                    <Star size={16} color={contact.isFavorite ? colors.warning : colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.contactActionButton, { backgroundColor: colors.successLight }]}
                    onPress={() => handleEditContact(contact)}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={16} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.contactActionButton, { backgroundColor: colors.dangerLight }]}
                    onPress={() => handleDeleteContact(contact.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}

        {filteredContacts.length === 0 && (
          <Card style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Users size={48} color={colors.textMuted} />
            </View>
            <Text
              style={[
                styles.emptyStateTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: 'center',
                },
              ]}
            >
              {language === 'ar' ? 'لا توجد جهات اتصال' : 'No Contacts Found'}
            </Text>
            <Text
              style={[
                styles.emptyStateText,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: 'center',
                },
              ]}
            >
              {searchQuery 
                ? (language === 'ar' ? 'لا توجد نتائج للبحث' : 'No search results')
                : (language === 'ar' ? 'ابدأ بإضافة جهات الاتصال' : 'Start by adding contacts')
              }
            </Text>
            <Button
              title={language === 'ar' ? 'إضافة جهة اتصال' : 'Add Contact'}
              onPress={() => setShowAddModal(true)}
              variant="primary"
              size="sm"
            />
          </Card>
        )}
      </ScrollView>

      {/* Add Contact Modal */}
      {renderAddContactModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xxl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  headerActions: {
    gap: spacing.sm,
  },
  headerActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAddSection: {
    padding: spacing.md,
  },
  quickAddTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  templatesScroll: {
    flexGrow: 0,
  },
  templates: {
    gap: spacing.md,
  },
  templateCard: {
    width: 120,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  templateName: {
    fontSize: fontSize.sm,
  },
  searchSection: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    minHeight: 24,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  contactCard: {
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  contactHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitleRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contactName: {
    fontSize: fontSize.lg,
    flex: 1,
  },
  contactDetails: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  contactDetailItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactDetailText: {
    fontSize: fontSize.sm,
  },
  companyInfo: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  companyText: {
    fontSize: fontSize.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  contactActions: {
    gap: spacing.sm,
  },
  contactActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 167, 113, 0.2)',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalCloseButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  contactForm: {
    padding: spacing.lg,
    borderRadius: borderRadius.card,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
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
  typeOptions: {
    gap: spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  typeOptionText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  formActions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formActionButton: {
    flex: 1,
  },
});