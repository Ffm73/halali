import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { HowToPay } from '@/types';
import { ArrowLeft, ArrowRight, CreditCard, Building, User, Phone, Plus, Trash2, CreditCard as Edit3, Save, X } from 'lucide-react-native';

export default function PaymentMethodsScreen() {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const { paymentMethods, savePaymentMethods, isLoading } = usePaymentMethods();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedMethods, setEditedMethods] = useState<HowToPay | null>(null);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: '',
    iban: '',
    accountName: '',
  });
  const [showAddBank, setShowAddBank] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (paymentMethods) {
      setEditedMethods({ ...paymentMethods });
    }
  }, [paymentMethods]);

  const handleSave = async () => {
    if (!editedMethods) return;

    setIsSaving(true);

    try {
      // Validate required fields
      if (!editedMethods.title.trim()) {
        throw new Error(language === 'ar' ? 'العنوان مطلوب' : 'Title is required');
      }
      
      if (!editedMethods.instructionsRichText.trim()) {
        throw new Error(language === 'ar' ? 'تعليمات الدفع مطلوبة' : 'Payment instructions are required');
      }
      
      // Validate bank accounts
      for (const account of editedMethods.bankAccounts) {
        if (!account.bankName.trim() || !account.iban.trim() || !account.accountName.trim()) {
          throw new Error(language === 'ar' ? 'جميع حقول الحساب البنكي مطلوبة' : 'All bank account fields are required');
        }
      }
      
      // Save to persistent storage
      await savePaymentMethods(editedMethods);
      
      // Additional backup save
      await AsyncStorage.setItem('paymentMethodsBackup', JSON.stringify(editedMethods));
      
      setIsEditing(false);
      
      Alert.alert(
        language === 'ar' ? 'تم الحفظ' : 'Saved',
        language === 'ar' ? 'تم حفظ طرق الدفع بنجاح وتحديث النظام' : 'Payment methods saved successfully and system updated'
      );
    } catch (error) {
      console.error('Payment methods save error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        error instanceof Error ? error.message : (language === 'ar' ? 'فشل في حفظ طرق الدفع' : 'Failed to save payment methods')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (paymentMethods) {
      setEditedMethods({ ...paymentMethods });
    }
    setIsEditing(false);
    setShowAddBank(false);
    setNewBankAccount({ bankName: '', iban: '', accountName: '' });
  };

  const handleAddBankAccount = () => {
    if (!newBankAccount.bankName.trim() || !newBankAccount.iban.trim() || !newBankAccount.accountName.trim()) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'
      );
      return;
    }

    // Validate IBAN format
    if (!newBankAccount.iban.match(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/)) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'تنسيق IBAN غير صحيح' : 'Invalid IBAN format'
      );
      return;
    }
    if (editedMethods) {
      const updatedMethods = {
        ...editedMethods,
        bankAccounts: [...editedMethods.bankAccounts, newBankAccount],
      };
      setEditedMethods(updatedMethods);
      setNewBankAccount({ bankName: '', iban: '', accountName: '' });
      setShowAddBank(false);
      
      Alert.alert(
        language === 'ar' ? 'تم الإضافة' : 'Added',
        language === 'ar' ? 'تم إضافة الحساب البنكي. لا تنس حفظ التغييرات.' : 'Bank account added. Don\'t forget to save changes.'
      );
    }
  };

  const handleRemoveBankAccount = (index: number) => {
    if (editedMethods) {
      const updatedMethods = {
        ...editedMethods,
        bankAccounts: editedMethods.bankAccounts.filter((_, i) => i !== index),
      };
      setEditedMethods(updatedMethods);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { 
            color: colors.textSecondary,
            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
          }]}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!paymentMethods || !editedMethods) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { 
            color: colors.danger,
            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular' 
          }]}>
            {language === 'ar' ? 'فشل في تحميل طرق الدفع' : 'Failed to load payment methods'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/settings')}
          activeOpacity={0.7}
        >
          {isRTL ? (
            <ArrowRight size={24} color={colors.textSecondary} />
          ) : (
            <ArrowLeft size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
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
          {language === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
        </Text>
        <View style={styles.headerActions}>
          {isEditing ? (
            <View style={[styles.editActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.danger }]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <X size={20} color={colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <Text style={[styles.savingText, { color: colors.surface }]}>...</Text>
                ) : (
                  <Save size={20} color={colors.surface} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Edit3 size={20} color={colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Instructions */}
        <Card style={[styles.instructionsCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.instructionsTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {language === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
          </Text>
          
          {isEditing ? (
            <TextInput
              style={[
                styles.instructionsInput,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={language === 'ar' ? 'أدخل تعليمات الدفع' : 'Enter payment instructions'}
              placeholderTextColor={colors.textMuted}
              value={editedMethods.instructionsRichText}
              onChangeText={(text) => setEditedMethods(prev => prev ? { ...prev, instructionsRichText: text } : null)}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text
              style={[
                styles.instructionsText,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {paymentMethods.instructionsRichText}
            </Text>
          )}
        </Card>

        {/* Bank Accounts */}
        <View style={styles.bankAccountsSection}>
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
              {language === 'ar' ? 'الحسابات البنكية' : 'Bank Accounts'}
            </Text>
            {isEditing && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddBank(true)}
                activeOpacity={0.7}
              >
                <Plus size={16} color={colors.surface} />
                <Text
                  style={[
                    styles.addButtonText,
                    {
                      color: colors.surface,
                      fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    },
                  ]}
                >
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {editedMethods.bankAccounts.map((account, index) => (
            <Card key={index} style={[styles.bankCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.bankHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.bankIcon, { backgroundColor: colors.primaryLight }]}>
                  <Building size={20} color={colors.primary} />
                </View>
                <View style={styles.bankInfo}>
                  {isEditing ? (
                    <View style={styles.editBankForm}>
                      <TextInput
                        style={[
                          styles.editInput,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                        placeholder={language === 'ar' ? 'اسم البنك' : 'Bank Name'}
                        placeholderTextColor={colors.textMuted}
                        value={account.bankName}
                        onChangeText={(text) => {
                          const updated = { ...editedMethods };
                          updated.bankAccounts[index].bankName = text;
                          setEditedMethods(updated);
                        }}
                      />
                      <TextInput
                        style={[
                          styles.editInput,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            fontFamily: 'monospace',
                            textAlign: 'left',
                          },
                        ]}
                        placeholder="SA1234567890123456789012"
                        placeholderTextColor={colors.textMuted}
                        value={account.iban}
                        onChangeText={(text) => {
                          const updated = { ...editedMethods };
                          updated.bankAccounts[index].iban = text.toUpperCase();
                          setEditedMethods(updated);
                        }}
                      />
                      <TextInput
                        style={[
                          styles.editInput,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                        placeholder={language === 'ar' ? 'اسم صاحب الحساب' : 'Account Holder Name'}
                        placeholderTextColor={colors.textMuted}
                        value={account.accountName}
                        onChangeText={(text) => {
                          const updated = { ...editedMethods };
                          updated.bankAccounts[index].accountName = text;
                          setEditedMethods(updated);
                        }}
                      />
                    </View>
                  ) : (
                    <View style={styles.bankDetails}>
                      <Text
                        style={[
                          styles.bankName,
                          {
                            color: colors.textPrimary,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {account.bankName}
                      </Text>
                      <Text
                        style={[
                          styles.accountName,
                          {
                            color: colors.textSecondary,
                            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {account.accountName}
                      </Text>
                      <Text
                        style={[
                          styles.iban,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {account.iban}
                      </Text>
                    </View>
                  )}
                </View>
                {isEditing && (
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: colors.dangerLight }]}
                    onPress={() => handleRemoveBankAccount(index)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}

          {/* Add Bank Account Form */}
          {showAddBank && (
            <Card style={[styles.addBankCard, { backgroundColor: colors.primaryLight }]}>
              <Text
                style={[
                  styles.addBankTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'إضافة حساب بنكي جديد' : 'Add New Bank Account'}
              </Text>
              
              <View style={styles.addBankForm}>
                <TextInput
                  style={[
                    styles.addBankInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  placeholder={language === 'ar' ? 'اسم البنك' : 'Bank Name'}
                  placeholderTextColor={colors.textMuted}
                  value={newBankAccount.bankName}
                  onChangeText={(text) => setNewBankAccount(prev => ({ ...prev, bankName: text }))}
                />
                
                <TextInput
                  style={[
                    styles.addBankInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontFamily: 'monospace',
                      textAlign: 'left',
                    },
                  ]}
                  placeholder="SA1234567890123456789012"
                  placeholderTextColor={colors.textMuted}
                  value={newBankAccount.iban}
                  onChangeText={(text) => setNewBankAccount(prev => ({ ...prev, iban: text.toUpperCase() }))}
                />
                
                <TextInput
                  style={[
                    styles.addBankInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  placeholder={language === 'ar' ? 'اسم صاحب الحساب' : 'Account Holder Name'}
                  placeholderTextColor={colors.textMuted}
                  value={newBankAccount.accountName}
                  onChangeText={(text) => setNewBankAccount(prev => ({ ...prev, accountName: text }))}
                />
              </View>
              
              <View style={[styles.addBankActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Button
                  title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                  onPress={() => {
                    setShowAddBank(false);
                    setNewBankAccount({ bankName: '', iban: '', accountName: '' });
                  }}
                  variant="secondary"
                  size="sm"
                />
                <Button
                  title={language === 'ar' ? 'إضافة' : 'Add'}
                  onPress={handleAddBankAccount}
                  variant="primary"
                  size="sm"
                />
              </View>
            </Card>
          )}
        </View>

        {/* STC Pay */}
        <Card style={[styles.stcCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.stcHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.stcIcon, { backgroundColor: colors.successLight }]}>
              <Phone size={20} color={colors.success} />
            </View>
            <View style={styles.stcInfo}>
              <Text
                style={[
                  styles.stcTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {language === 'ar' ? 'STC Pay' : 'STC Pay'}
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.stcInput,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontFamily: 'monospace',
                      textAlign: 'left',
                    },
                  ]}
                  placeholder="+966XXXXXXXXX"
                  placeholderTextColor={colors.textMuted}
                  value={editedMethods.stcBankHandle || ''}
                  onChangeText={(text) => setEditedMethods(prev => prev ? { ...prev, stcBankHandle: text } : null)}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text
                  style={[
                    styles.stcNumber,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'monospace',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {paymentMethods.stcBankHandle || (language === 'ar' ? 'غير محدد' : 'Not set')}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Save Button for Edit Mode */}
        {isEditing && (
          <View style={styles.saveButtonContainer}>
            <Button
              title={isSaving 
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
              }
              onPress={handleSave}
              disabled={isSaving}
              variant="primary"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.md,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
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
  title: {
    fontSize: fontSize.xl,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editActions: {
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  instructionsCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  instructionsText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  instructionsInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bankAccountsSection: {
    marginBottom: spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    fontSize: fontSize.sm,
  },
  bankCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
  },
  bankHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfo: {
    flex: 1,
  },
  bankDetails: {
    gap: spacing.xs,
  },
  bankName: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  accountName: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  iban: {
    fontSize: fontSize.sm,
  },
  editBankForm: {
    gap: spacing.sm,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
  },
  removeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  addBankCard: {
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: '#4CA771',
    borderStyle: 'dashed',
  },
  addBankTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  addBankForm: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  addBankInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
  },
  addBankActions: {
    gap: spacing.sm,
  },
  stcCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
  },
  stcHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  stcIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stcInfo: {
    flex: 1,
  },
  stcTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  stcNumber: {
    fontSize: fontSize.sm,
  },
  stcInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 48,
  },
  saveButtonContainer: {
    marginTop: spacing.lg,
  },
  savingText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});