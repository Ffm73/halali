import { AlertManager } from '@/components/ui/CustomAlert';

// Replacement for React Native's Alert.alert
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    options?: {
      dismissible?: boolean;
      autoClose?: number;
      showIcon?: boolean;
      customIcon?: React.ReactNode;
    }
  ) => {
    const alertManager = AlertManager.getInstance();
    
    const alertButtons = buttons || [{ text: 'موافق', style: 'default' as const }];
    
    // Determine alert type based on title or button styles
    let type: 'info' | 'success' | 'warning' | 'error' = 'info';
    
    if (title.includes('خطأ') || title.includes('Error')) {
      type = 'error';
    } else if (title.includes('تحذير') || title.includes('Warning')) {
      type = 'warning';
    } else if (title.includes('نجح') || title.includes('Success') || title.includes('✅') || title.includes('🎉')) {
      type = 'success';
    } else if (buttons?.some(b => b.style === 'destructive')) {
      type = 'confirmation';
    }
    
    alertManager.show(title, message || '', alertButtons, type, options || {});
  },

  // Enhanced methods for better UX
  success: (title: string, message?: string, buttons?: any[]) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showSuccess(title, message || '', buttons || []);
  },

  error: (title: string, message?: string, buttons?: any[]) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showError(title, message || '', buttons || []);
  },

  warning: (title: string, message?: string, buttons?: any[]) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showWarning(title, message || '', buttons || []);
  },

  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showConfirmation(title, message, onConfirm, onCancel);
  },
};

// Toast notifications for quick feedback
export const Toast = {
  success: (title: string, message?: string, buttons?: any[], duration?: number) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showToast({
      type: 'success',
      title,
      message,
      duration: duration || 3000,
    });
  },

  error: (title: string, message?: string, buttons?: any[], duration?: number) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showToast({
      type: 'error',
      title,
      message,
      duration: duration || 4000,
    });
  },

  warning: (title: string, message?: string, buttons?: any[], duration?: number) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showToast({
      type: 'warning',
      title,
      message,
      duration: duration || 3500,
    });
  },

  info: (title: string, message?: string, buttons?: any[], duration?: number) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showToast({
      type: 'info',
      title,
      message,
      duration: duration || 3000,
    });
  },
};

// Loading overlay for async operations
export const Loading = {
  show: (title?: string, message?: string, cancellable?: boolean, onCancel?: () => void) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showLoading({
      title,
      message,
      cancellable,
      onCancel,
    });
  },

  showWithProgress: (title: string, message?: string, progress?: number) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showLoading({
      title,
      message,
      progress,
    });
  },

  updateProgress: (progress: number) => {
    const alertManager = AlertManager.getInstance();
    alertManager.updateLoadingProgress(progress);
  },

  hide: () => {
    const alertManager = AlertManager.getInstance();
    alertManager.hideLoading();
  },
};

// Utility functions for common alert patterns
export const AlertUtils = {
  confirmDelete: (
    itemName: string,
    onConfirm: () => void,
    language: string = 'ar'
  ) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showConfirmation(
      language === 'ar' ? `حذف ${itemName}` : `Delete ${itemName}`,
      language === 'ar' 
        ? `هل أنت متأكد من حذف ${itemName}؟ لا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      onConfirm
    );
  },

  confirmLogout: (
    onConfirm: () => void,
    language: string = 'ar'
  ) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showConfirmation(
      language === 'ar' ? 'تسجيل الخروج' : 'Sign Out',
      language === 'ar' 
        ? 'هل أنت متأكد من تسجيل الخروج؟'
        : 'Are you sure you want to sign out?',
      onConfirm
    );
  },

  confirmAction: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showConfirmation(title, message, onConfirm, onCancel);
  },
};