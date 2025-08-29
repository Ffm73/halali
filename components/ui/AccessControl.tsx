import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize } from '@/constants/theme';
import { Permission } from '@/types';
import { Shield, Eye, Lock } from 'lucide-react-native';

interface AccessControlProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: 'landlord' | 'resident' | 'staff';
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export function AccessControl({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback,
  showAccessDenied = true 
}: AccessControlProps) {
  const { user } = useAuth();
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();

  // Check role access
  if (requiredRole && user?.role !== requiredRole) {
    if (fallback) return <>{fallback}</>;
    if (!showAccessDenied) return null;
    
    return (
      <View style={styles.accessDenied}>
        <Lock size={24} color={colors.textMuted} />
        <Text style={[styles.accessDeniedText, { 
          color: colors.textMuted,
          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
          textAlign: isRTL ? 'right' : 'left' 
        }]}>
          {language === 'ar' ? 'غير مصرح لك بالوصول' : 'Access denied'}
        </Text>
      </View>
    );
  }

  // Check permission access for staff
  if (requiredPermission && user?.role === 'staff') {
    const hasPermission = user.permissions?.permissions.includes(requiredPermission);
    
    if (!hasPermission) {
      if (fallback) return <>{fallback}</>;
      if (!showAccessDenied) return null;
      
      return (
        <View style={styles.accessDenied}>
          <Shield size={24} color={colors.textMuted} />
          <Text style={[styles.accessDeniedText, { 
            color: colors.textMuted,
            fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
            textAlign: isRTL ? 'right' : 'left' 
          }]}>
            {language === 'ar' ? 'صلاحية غير كافية' : 'Insufficient permissions'}
          </Text>
        </View>
      );
    }
  }

  return <>{children}</>;
}

interface PermissionBadgeProps {
  permission: Permission;
  size?: 'sm' | 'md';
}

export function PermissionBadge({ permission, size = 'md' }: PermissionBadgeProps) {
  const { language } = useLocalization();
  const { colors } = useTheme();
  
  const isEditPermission = permission.includes('edit') || permission.includes('manage');
  const icon = isEditPermission ? 
    <Shield size={size === 'sm' ? 12 : 16} color={colors.success} /> :
    <Eye size={size === 'sm' ? 12 : 16} color={colors.primary} />;

  const getPermissionLabel = (perm: Permission) => {
    const labels = {
      view_dashboard: { ar: 'عرض الرئيسية', en: 'Dashboard' },
      view_properties: { ar: 'عرض العقارات', en: 'Properties' },
      edit_properties: { ar: 'تعديل العقارات', en: 'Edit Properties' },
      view_units: { ar: 'عرض الوحدات', en: 'Units' },
      edit_units: { ar: 'تعديل الوحدات', en: 'Edit Units' },
      view_tenants: { ar: 'عرض المستأجرين', en: 'Tenants' },
      edit_tenants: { ar: 'تعديل المستأجرين', en: 'Edit Tenants' },
      view_contracts: { ar: 'عرض العقود', en: 'Contracts' },
      edit_contracts: { ar: 'تعديل العقود', en: 'Edit Contracts' },
      view_payments: { ar: 'عرض المدفوعات', en: 'Payments' },
      edit_payments: { ar: 'تعديل المدفوعات', en: 'Edit Payments' },
      view_collections: { ar: 'عرض التحصيلات', en: 'Collections' },
      manage_collections: { ar: 'إدارة التحصيلات', en: 'Manage Collections' },
      view_reports: { ar: 'عرض التقارير', en: 'Reports' },
      manage_staff: { ar: 'إدارة الموظفين', en: 'Manage Staff' },
    };
    
    return labels[perm]?.[language] || perm;
  };

  return (
    <View style={[
      styles.permissionBadge,
      size === 'sm' && styles.permissionBadgeSm,
      { backgroundColor: isEditPermission ? colors.successLight : colors.primaryLight }
    ]}>
      {icon}
      <Text style={[
        styles.permissionBadgeText,
        size === 'sm' && styles.permissionBadgeTextSm,
        { 
          color: isEditPermission ? colors.success : colors.primary,
          fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Medium'
        }
      ]}>
        {getPermissionLabel(permission)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  accessDeniedText: {
    fontSize: fontSize.md,
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  permissionBadgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  permissionBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  permissionBadgeTextSm: {
    fontSize: 10,
  },
});