import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalization } from '@/hooks/useLocalization';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Info, TriangleAlert as AlertTriangle, X, Zap, Bell } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirmation';
  dismissible?: boolean;
  autoClose?: number; // Auto close after X milliseconds
  showIcon?: boolean;
  customIcon?: React.ReactNode;
}

interface CustomAlertProps {
  visible: boolean;
  config: AlertConfig;
  onClose: () => void;
}

// Toast notification interface
export interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Loading overlay interface
export interface LoadingConfig {
  visible: boolean;
  title?: string;
  message?: string;
  progress?: number; // 0-100 for progress bar
  cancellable?: boolean;
  onCancel?: () => void;
}

export function CustomAlert({ visible, config, onClose }: CustomAlertProps) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Auto close functionality
  useEffect(() => {
    if (visible && config.autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, config.autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [visible, config.autoClose]);

  const getAlertIcon = () => {
    if (config.customIcon) return config.customIcon;
    if (config.showIcon === false) return null;
    
    switch (config.type) {
      case 'success':
        return <CheckCircle size={32} color={colors.success} />;
      case 'warning':
        return <AlertTriangle size={32} color={colors.warning} />;
      case 'error':
        return <AlertCircle size={32} color={colors.danger} />;
      case 'confirmation':
        return <AlertTriangle size={32} color={colors.primary} />;
      default:
        return <Info size={32} color={colors.primary} />;
    }
  };

  const getAlertColor = () => {
    switch (config.type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.danger;
      case 'confirmation':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  const getAlertBackgroundColor = () => {
    switch (config.type) {
      case 'success':
        return colors.successLight;
      case 'warning':
        return colors.warningLight;
      case 'error':
        return colors.dangerLight;
      case 'confirmation':
        return colors.primaryLight;
      default:
        return colors.primaryLight;
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const handleBackdropPress = () => {
    if (config.dismissible !== false) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <Animated.View
            style={[
              styles.alertContainer,
              {
                backgroundColor: colors.surface,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Alert Header */}
              <View style={[
                styles.alertHeader, 
                { 
                  borderBottomColor: colors.borderLight,
                  backgroundColor: getAlertBackgroundColor(),
                }
              ]}>
                <View style={styles.headerContent}>
                  {getAlertIcon() && (
                    <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                      {getAlertIcon()}
                    </View>
                  )}
                  <View style={styles.headerText}>
                    <Text
                      style={[
                        styles.alertTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {config.title}
                    </Text>
                  </View>
                </View>
                
                {/* Dismiss button for dismissible alerts */}
                {config.dismissible !== false && (
                  <TouchableOpacity
                    style={[styles.dismissButton, { backgroundColor: colors.surface }]}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Alert Message */}
              {config.message && (
                <View style={styles.alertBody}>
                  <Text
                    style={[
                      styles.alertMessage,
                      {
                        color: colors.textSecondary,
                        fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {config.message}
                  </Text>
                </View>
              )}

              {/* Alert Buttons */}
              <View style={[
                styles.alertButtons, 
                { 
                  flexDirection: config.buttons.length > 2 ? 'column' : (isRTL ? 'row-reverse' : 'row'),
                  gap: config.buttons.length > 2 ? spacing.sm : spacing.md,
                }
              ]}>
                {config.buttons.map((button, index) => {
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.alertButton,
                        config.buttons.length > 2 && styles.alertButtonStacked,
                        {
                          backgroundColor: isDestructive 
                            ? colors.danger 
                            : isCancel 
                            ? colors.surfaceSecondary 
                            : colors.primary,
                          borderColor: isDestructive 
                            ? colors.danger 
                            : isCancel 
                            ? colors.border 
                            : colors.primary,
                        },
                      ]}
                      onPress={() => handleButtonPress(button)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.alertButtonText,
                          {
                            color: isCancel ? colors.textPrimary : colors.surface,
                            fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                          },
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

// Toast Notification Component
export function ToastNotification({ toast, onDismiss }: { toast: ToastConfig; onDismiss: (id: string) => void }) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    if (toast.duration) {
      const timer = setTimeout(() => {
        dismissToast();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={24} color={colors.success} />;
      case 'error':
        return <AlertCircle size={24} color={colors.danger} />;
      case 'warning':
        return <AlertTriangle size={24} color={colors.warning} />;
      default:
        return <Info size={24} color={colors.primary} />;
    }
  };

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: colors.surface,
          borderLeftColor: getToastColor(),
          transform: [
            { translateY: slideAnim },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toastContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        onPress={toast.action?.onPress}
        activeOpacity={toast.action ? 0.7 : 1}
      >
        <View style={[styles.toastIcon, { backgroundColor: `${getToastColor()}15` }]}>
          {getToastIcon()}
        </View>
        <View style={styles.toastText}>
          <Text
            style={[
              styles.toastTitle,
              {
                color: colors.textPrimary,
                fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {toast.title}
          </Text>
          {toast.message && (
            <Text
              style={[
                styles.toastMessage,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {toast.message}
            </Text>
          )}
          {toast.action && (
            <Text
              style={[
                styles.toastAction,
                {
                  color: getToastColor(),
                  fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {toast.action.label}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.toastDismiss, { backgroundColor: colors.surfaceSecondary }]}
          onPress={dismissToast}
          activeOpacity={0.7}
        >
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Loading Overlay Component
export function LoadingOverlay({ config }: { config: LoadingConfig }) {
  const { language, isRTL } = useLocalization();
  const { colors } = useTheme();
  const [spinAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (config.visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Continuous spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => spinAnimation.stop();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [config.visible]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!config.visible) return null;

  return (
    <Modal
      transparent
      visible={config.visible}
      animationType="none"
      onRequestClose={config.onCancel}
    >
      <Animated.View
        style={[
          styles.loadingOverlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              {
                backgroundColor: colors.primary,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Zap size={24} color={colors.surface} />
          </Animated.View>
          
          {config.title && (
            <Text
              style={[
                styles.loadingTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: language === 'ar' ? 'Tajawal-Bold' : 'Nunito-Bold',
                  textAlign: 'center',
                },
              ]}
            >
              {config.title}
            </Text>
          )}
          
          {config.message && (
            <Text
              style={[
                styles.loadingMessage,
                {
                  color: colors.textSecondary,
                  fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
                  textAlign: 'center',
                },
              ]}
            >
              {config.message}
            </Text>
          )}

          {/* Progress Bar */}
          {typeof config.progress === 'number' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.max(0, Math.min(100, config.progress))}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                {Math.round(config.progress)}%
              </Text>
            </View>
          )}

          {/* Cancel Button */}
          {config.cancellable && config.onCancel && (
            <TouchableOpacity
              style={[styles.loadingCancelButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={config.onCancel}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.loadingCancelText,
                  {
                    color: colors.textPrimary,
                    fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
                  },
                ]}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

// Global alert manager
class AlertManager {
  private static instance: AlertManager;
  private alertQueue: AlertConfig[] = [];
  private currentAlert: AlertConfig | null = null;
  private listeners: Array<(alert: AlertConfig | null) => void> = [];
  private toasts: ToastConfig[] = [];
  private toastListeners: Array<(toasts: ToastConfig[]) => void> = [];
  private loadingConfig: LoadingConfig = { visible: false };
  private loadingListeners: Array<(config: LoadingConfig) => void> = [];

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  show(
    title: string, 
    message: string, 
    buttons: AlertButton[] = [], 
    type: AlertConfig['type'] = 'info',
    options: Partial<AlertConfig> = {}
  ) {
    const alert: AlertConfig = {
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [{ text: 'موافق', style: 'default' }],
      type,
      dismissible: options.dismissible !== false,
      autoClose: options.autoClose,
      showIcon: options.showIcon !== false,
      customIcon: options.customIcon,
    };

    if (this.currentAlert) {
      this.alertQueue.push(alert);
    } else {
      this.currentAlert = alert;
      this.notifyListeners();
    }
  }

  // Enhanced alert methods
  showSuccess(title: string, message: string, buttons: AlertButton[] = []) {
    this.show(title, message, buttons, 'success');
  }

  showError(title: string, message: string, buttons: AlertButton[] = []) {
    this.show(title, message, buttons, 'error');
  }

  showWarning(title: string, message: string, buttons: AlertButton[] = []) {
    this.show(title, message, buttons, 'warning');
  }

  showConfirmation(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) {
    const buttons: AlertButton[] = [
      { 
        text: 'إلغاء', 
        style: 'cancel',
        onPress: onCancel 
      },
      { 
        text: 'تأكيد', 
        style: 'destructive',
        onPress: onConfirm 
      },
    ];
    this.show(title, message, buttons, 'confirmation');
  }

  // Toast methods
  showToast(config: Omit<ToastConfig, 'id'>) {
    // For settings changes, remove existing toasts of the same type to prevent stacking
    if (config.title.includes('Theme') || config.title.includes('Currency') || config.title.includes('Language') || 
        config.title.includes('المظهر') || config.title.includes('العملة') || config.title.includes('اللغة')) {
      this.toasts = this.toasts.filter(t => 
        !t.title.includes('Theme') && !t.title.includes('Currency') && !t.title.includes('Language') &&
        !t.title.includes('المظهر') && !t.title.includes('العملة') && !t.title.includes('اللغة')
      );
    }

    const toast: ToastConfig = {
      ...config,
      id: `toast_${Date.now()}_${Math.random()}`,
      duration: config.duration || 4000,
    };

    this.toasts = [...this.toasts, toast];
    this.notifyToastListeners();

    // Auto remove after duration
    if (toast.duration) {
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, toast.duration);
    }
  }

  dismissToast(toastId: string) {
    this.toasts = this.toasts.filter(t => t.id !== toastId);
    this.notifyToastListeners();
  }

  // Loading methods
  showLoading(config: Omit<LoadingConfig, 'visible'>) {
    this.loadingConfig = { ...config, visible: true };
    this.notifyLoadingListeners();
  }

  hideLoading() {
    this.loadingConfig = { visible: false };
    this.notifyLoadingListeners();
  }

  updateLoadingProgress(progress: number) {
    this.loadingConfig = { ...this.loadingConfig, progress };
    this.notifyLoadingListeners();
  }

  hide() {
    this.currentAlert = null;
    
    if (this.alertQueue.length > 0) {
      this.currentAlert = this.alertQueue.shift() || null;
    }
    
    this.notifyListeners();
  }

  subscribe(listener: (alert: AlertConfig | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToasts(listener: (toasts: ToastConfig[]) => void) {
    this.toastListeners.push(listener);
    return () => {
      this.toastListeners = this.toastListeners.filter(l => l !== listener);
    };
  }

  subscribeLoading(listener: (config: LoadingConfig) => void) {
    this.loadingListeners.push(listener);
    return () => {
      this.loadingListeners = this.loadingListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentAlert));
  }

  private notifyToastListeners() {
    this.toastListeners.forEach(listener => listener(this.toasts));
  }

  private notifyLoadingListeners() {
    this.loadingListeners.forEach(listener => listener(this.loadingConfig));
  }

  getCurrentAlert() {
    return this.currentAlert;
  }

  getToasts() {
    return this.toasts;
  }

  getLoadingConfig() {
    return this.loadingConfig;
  }
}

// Hook for using custom alerts
export function useCustomAlert() {
  const [currentAlert, setCurrentAlert] = useState<AlertConfig | null>(null);
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [loadingConfig, setLoadingConfig] = useState<LoadingConfig>({ visible: false });
  const alertManager = AlertManager.getInstance();

  useEffect(() => {
    const unsubscribe = alertManager.subscribe(setCurrentAlert);
    const unsubscribeToasts = alertManager.subscribeToasts(setToasts);
    const unsubscribeLoading = alertManager.subscribeLoading(setLoadingConfig);
    
    return () => {
      unsubscribe();
      unsubscribeToasts();
      unsubscribeLoading();
    };
  }, []);

  const showAlert = (
    title: string, 
    message: string, 
    buttons: AlertButton[] = [], 
    type: AlertConfig['type'] = 'info',
    options: Partial<AlertConfig> = {}
  ) => {
    alertManager.show(title, message, buttons, type, options);
  };

  const showSuccess = (title: string, message: string, buttons: AlertButton[] = []) => {
    alertManager.showSuccess(title, message, buttons);
  };

  const showError = (title: string, message: string, buttons: AlertButton[] = []) => {
    alertManager.showError(title, message, buttons);
  };

  const showWarning = (title: string, message: string, buttons: AlertButton[] = []) => {
    alertManager.showWarning(title, message, buttons);
  };

  const showConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    alertManager.showConfirmation(title, message, onConfirm, onCancel);
  };

  const showToast = (config: Omit<ToastConfig, 'id'>) => {
    alertManager.showToast(config);
  };

  const showLoading = (config: Omit<LoadingConfig, 'visible'>) => {
    alertManager.showLoading(config);
  };

  const hideLoading = () => {
    alertManager.hideLoading();
  };

  const updateLoadingProgress = (progress: number) => {
    alertManager.updateLoadingProgress(progress);
  };

  const dismissToast = (toastId: string) => {
    alertManager.dismissToast(toastId);
  };

  const hideAlert = () => {
    alertManager.hide();
  };

  return {
    currentAlert,
    toasts,
    loadingConfig,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirmation,
    showToast,
    showLoading,
    hideLoading,
    updateLoadingProgress,
    dismissToast,
    hideAlert,
  };
}

// Toast Container Component
function ToastContainer() {
  const { toasts, dismissToast } = useCustomAlert();

  return (
    <View style={styles.toastStack} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </View>
  );
}

// Loading Container Component
function LoadingContainer() {
  const { loadingConfig } = useCustomAlert();

  return <LoadingOverlay config={loadingConfig} />;
}

// Enhanced Custom Alert Provider
export function CustomAlertProvider({ children }: { children: React.ReactNode }) {
  const { currentAlert, hideAlert } = useCustomAlert();

  return (
    <>
      {children}
      {currentAlert && (
        <CustomAlert
          visible={!!currentAlert}
          config={currentAlert}
          onClose={hideAlert}
        />
      )}
      <ToastContainer />
      <LoadingContainer />
    </>
  );
}

// Utility functions for common alert patterns
export const AlertUtils = {
  confirmDelete: (
    itemName: string,
    onConfirm: () => void,
    language: 'ar' | 'en' = 'ar'
  ) => {
    const alertManager = AlertManager.getInstance();
    alertManager.showConfirmation(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar' 
        ? `هل أنت متأكد من حذف ${itemName}؟ لا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      onConfirm
    );
  },

  confirmLogout: (onConfirm: () => void, language: 'ar' | 'en' = 'ar') => {
    const alertManager = AlertManager.getInstance();
    alertManager.showConfirmation(
      language === 'ar' ? 'تسجيل الخروج' : 'Sign Out',
      language === 'ar' 
        ? 'هل أنت متأكد من تسجيل الخروج؟'
        : 'Are you sure you want to sign out?',
      onConfirm
    );
  },

  showSaveSuccess: (language: 'ar' | 'en' = 'ar') => {
    const alertManager = AlertManager.getInstance();
    alertManager.showToast({
      type: 'success',
      title: language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved Successfully',
      duration: 3000,
    });
  },

  showNetworkError: (language: 'ar' | 'en' = 'ar') => {
    const alertManager = AlertManager.getInstance();
    alertManager.showError(
      language === 'ar' ? 'خطأ في الشبكة' : 'Network Error',
      language === 'ar' 
        ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
        : 'Check your internet connection and try again'
    );
  },
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '100%',
    maxWidth: Math.min(400, screenWidth * 0.9),
    minWidth: 280,
    borderRadius: borderRadius.card,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  alertHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
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
  headerText: {
    flex: 1,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertTitle: {
    fontSize: fontSize.lg,
    lineHeight: 24,
  },
  alertBody: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  alertMessage: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  alertButtons: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  alertButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertButtonStacked: {
    flex: 0,
    width: '100%',
  },
  alertButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  // Toast styles
  toastStack: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toastContainer: {
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: spacing.sm,
  },
  toastContent: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  toastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flex: 1,
  },
  toastTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  toastMessage: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  toastAction: {
    fontSize: fontSize.sm,
  },
  toastDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Loading styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingContainer: {
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    minWidth: 200,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: fontSize.lg,
  },
  loadingMessage: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.sm,
  },
  loadingCancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  loadingCancelText: {
    fontSize: fontSize.md,
  },
});

export { AlertManager };