import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, DateSystem } from '@/types';
import { Currency } from '@/types';
import { 
  dateToHijri, 
  hijriToDate, 
  formatHijriDate, 
  formatGregorianDate, 
  getCurrentDates, 
  isCurrentlyRamadan, 
  getDaysUntilRamadan,
  getRelativeDateDescription,
  convertSystemDate,
  GREGORIAN_MONTHS,
  DAY_NAMES,
  ConversionResult,
  HijriDate,
  GregorianDate,
  testConversionAccuracy,
  runValidationSuite,
  benchmarkConversions
} from '@/utils/dateConversion';

export interface LocalizationState {
  language: Language;
  dateSystem: DateSystem;
  currency: Currency;
  isRTL: boolean;
}

// Add state change listener type
type DateSystemChangeListener = (newSystem: DateSystem) => void;
type DateSystemUpdateCallback = () => void;
type CurrencyChangeListener = (newCurrency: Currency) => void;

// Exchange rates (in a real app, fetch from API)
const EXCHANGE_RATES: Record<Currency, number> = {
  SAR: 1.0,      // Base currency
  AED: 1.02,     // 1 SAR = 1.02 AED
  KWD: 0.12,     // 1 SAR = 0.12 KWD
  QAR: 0.97,     // 1 SAR = 0.97 QAR
  BHD: 0.10,     // 1 SAR = 0.10 BHD
  OMR: 0.10,     // 1 SAR = 0.10 OMR
  USD: 0.27,     // 1 SAR = 0.27 USD
  EUR: 0.25,     // 1 SAR = 0.25 EUR
  GBP: 0.21,     // 1 SAR = 0.21 GBP
};

const translations = {
  ar: {
    // Navigation
    dashboard: 'الرئيسية',
    collections: 'التحصيلات',
    properties: 'العقارات',
    settings: 'الإعدادات',
    invitations: 'الدعوات',
    tenants: 'المستأجرين',
    reports: 'التقارير',
    
    // Dashboard
    welcome: 'مرحباً',
    occupied: 'مؤجر',
    vacant: 'شاغر',
    dueThisWeek: 'مستحق هذا الأسبوع',
    overdue: 'متأخر',
    upcomingCharges: 'المستحقات القادمة',
    monthlyIncome: 'الدخل الشهري',
    yearlyIncome: 'الدخل السنوي',
    addProperty: 'إضافة عقار',
    myProperties: 'عقاراتي',
    currentDate: 'التاريخ الحالي',
    totalUnits: 'إجمالي الوحدات',
    collectionRate: 'معدل التحصيل',
    pendingAmount: 'المبلغ المعلق',
    totalDue: 'إجمالي المستحقات',
    
    // Common
    notifications: 'الإشعارات',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    back: 'العودة',
    next: 'التالي',
    previous: 'السابق',
    continue: 'متابعة',
    confirm: 'تأكيد',
    close: 'إغلاق',
    done: 'تم',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    info: 'معلومات',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    retry: 'إعادة المحاولة',
    refresh: 'تحديث',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    view: 'عرض',
    hide: 'إخفاء',
    show: 'إظهار',
    select: 'اختيار',
    clear: 'مسح',
    reset: 'إعادة تعيين',
    apply: 'تطبيق',
    submit: 'إرسال',
    send: 'إرسال',
    receive: 'استلام',
    copy: 'نسخ',
    paste: 'لصق',
    cut: 'قص',
    undo: 'تراجع',
    redo: 'إعادة',
    print: 'طباعة',
    export: 'تصدير',
    import: 'استيراد',
    download: 'تحميل',
    upload: 'رفع',
    share: 'مشاركة',
    help: 'مساعدة',
    about: 'حول',
    contact: 'اتصال',
    support: 'دعم',
    feedback: 'ملاحظات',
    version: 'الإصدار',
    update: 'تحديث',
    upgrade: 'ترقية',
    premium: 'مميز',
    free: 'مجاني',
    trial: 'تجريبي',
    expired: 'منتهي الصلاحية',
    active: 'نشط',
    inactive: 'غير نشط',
    enabled: 'مفعل',
    disabled: 'معطل',
    online: 'متصل',
    offline: 'غير متصل',
    available: 'متاح',
    unavailable: 'غير متاح',
    public: 'عام',
    private: 'خاص',
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',
    deleted: 'محذوف',
    pending: 'معلق',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    failed: 'فشل',
    processing: 'قيد المعالجة',
    scheduled: 'مجدول',
    overdue: 'متأخر',
    due: 'مستحق',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    partial: 'جزئي',
    full: 'كامل',
    empty: 'فارغ',
    total: 'إجمالي',
    subtotal: 'المجموع الفرعي',
    tax: 'ضريبة',
    discount: 'خصم',
    fee: 'رسوم',
    commission: 'عمولة',
    deposit: 'تأمين',
    balance: 'رصيد',
    credit: 'دائن',
    debit: 'مدين',
    income: 'دخل',
    expense: 'مصروف',
    profit: 'ربح',
    loss: 'خسارة',
    revenue: 'إيرادات',
    cost: 'تكلفة',
    price: 'سعر',
    amount: 'مبلغ',
    quantity: 'كمية',
    rate: 'معدل',
    percentage: 'نسبة مئوية',
    currency: 'عملة',
    exchange: 'صرف',
    conversion: 'تحويل',
    calculation: 'حساب',
    privacy: 'الخصوصية',
    security: 'الأمان',
    account: 'الحساب',
    profile: 'الملف الشخصي',
    preferences: 'التفضيلات',
    
    // Time and Date
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذا العام',
    lastWeek: 'الأسبوع الماضي',
    lastMonth: 'الشهر الماضي',
    lastYear: 'العام الماضي',
    nextWeek: 'الأسبوع القادم',
    nextMonth: 'الشهر القادم',
    nextYear: 'العام القادم',
    
    // Missing translations for complete coverage
    residents: 'المستأجرين',
    payments: 'المدفوعات',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    contracts: 'العقود',
    units: 'الوحدات',
    floor: 'الطابق',
    size: 'المساحة',
    amenities: 'المرافق',
    status: 'الحالة',
    rent: 'الإيجار',
    deposit: 'التأمين',
    vat: 'ضريبة القيمة المضافة',
    total: 'الإجمالي',
    month: 'شهر',
    months: 'أشهر',
    year: 'سنة',
    years: 'سنوات',
    day: 'يوم',
    days: 'أيام',
    week: 'أسبوع',
    weeks: 'أسابيع',
    bedrooms: 'غرف النوم',
    bathrooms: 'دورات المياه',
    kitchen: 'مطبخ',
    livingRoom: 'صالة',
    parking: 'موقف سيارة',
    airConditioning: 'مكيف',
    balcony: 'شرفة',
    elevator: 'مصعد',
    security: 'أمن',
    gym: 'صالة رياضية',
    pool: 'مسبح',
    garden: 'حديقة',
    
    // Payment related
    paymentHistory: 'تاريخ المدفوعات',
    paymentMethods: 'طرق الدفع',
    bankTransfer: 'تحويل بنكي',
    cash: 'نقداً',
    stcPay: 'STC Pay',
    
    // Contract related
    contractDetails: 'تفاصيل العقد',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    duration: 'المدة',
    monthlyRent: 'الإيجار الشهري',
    securityDeposit: 'مبلغ التأمين',
    
    // Status messages
    current: 'حالي',
    former: 'سابق',
    new: 'جديد',
    verified: 'موثق',
    unverified: 'غير موثق',
    
    // Actions
    view: 'عرض',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    create: 'إنشاء',
    update: 'تحديث',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    submit: 'إرسال',
    send: 'إرسال',
    call: 'اتصال',
    message: 'رسالة',
    whatsapp: 'واتساب',
    sms: 'رسالة نصية',
    
    // Status Messages
    loginSuccessful: 'تم تسجيل الدخول بنجاح',
    logoutSuccessful: 'تم تسجيل الخروج بنجاح',
    saveSuccessful: 'تم الحفظ بنجاح',
    updateSuccessful: 'تم التحديث بنجاح',
    deleteSuccessful: 'تم الحذف بنجاح',
    operationFailed: 'فشلت العملية',
    networkError: 'خطأ في الشبكة',
    invalidInput: 'مدخل غير صحيح',
    accessDenied: 'تم رفض الوصول',
    sessionExpired: 'انتهت صلاحية الجلسة',
    
    // Units
    bedrooms: 'غرف النوم',
    bathrooms: 'دورات المياه',
    kitchen: 'مطبخ',
    livingRoom: 'صالة',
    floor: 'الطابق',
    
    // Payments
    payNow: 'ادفع الآن',
    markAsPaid: 'تسجيل كمدفوع',
    uploadReceipt: 'رفع الإيصال',
    contactLandlord: 'اتصال بالمالك',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    collections: 'Collections',
    properties: 'Properties',
    settings: 'Settings',
    invitations: 'Invitations',
    tenants: 'Tenants',
    reports: 'Reports',
    
    // Dashboard
    welcome: 'Welcome',
    occupied: 'Occupied',
    vacant: 'Vacant',
    dueThisWeek: 'Due This Week',
    overdue: 'Overdue',
    upcomingCharges: 'Upcoming Charges',
    monthlyIncome: 'Monthly Income',
    yearlyIncome: 'Yearly Income',
    addProperty: 'Add Property',
    myProperties: 'My Properties',
    totalUnits: 'Total Units',
    collectionRate: 'Collection Rate',
    pendingAmount: 'Pending Amount',
    totalDue: 'Total Due',
    
    // Common
    notifications: 'Notifications',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    confirm: 'Confirm',
    close: 'Close',
    done: 'Done',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    retry: 'Retry',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    copy: 'Copy',
    share: 'Share',
    export: 'Export',
    import: 'Import',
    upload: 'Upload',
    download: 'Download',
    send: 'Send',
    receive: 'Receive',
    create: 'Create',
    update: 'Update',
    remove: 'Remove',
    select: 'Select',
    clear: 'Clear',
    reset: 'Reset',
    
    // Units
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    kitchen: 'Kitchen',
    livingRoom: 'Living Room',
    floor: 'Floor',
    unit: 'Unit',
    units: 'Units',
    size: 'Size',
    amenities: 'Amenities',
    status: 'Status',
    type: 'Type',
    available: 'Available',
    unavailable: 'Unavailable',
    maintenance: 'Maintenance',
    
    // Payments
    payNow: 'Pay Now',
    markAsPaid: 'Mark as Paid',
    uploadReceipt: 'Upload Receipt',
    contactLandlord: 'Contact Landlord',
    payment: 'Payment',
    payments: 'Payments',
    amount: 'Amount',
    dueDate: 'Due Date',
    paidDate: 'Paid Date',
    paymentMethod: 'Payment Method',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    unpaid: 'Unpaid',
    partial: 'Partial',
    due: 'Due',
    late: 'Late',
    
    // Contracts
    contract: 'Contract',
    contracts: 'Contracts',
    tenant: 'Tenant',
    landlord: 'Landlord',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration',
    monthlyRent: 'Monthly Rent',
    deposit: 'Deposit',
    active: 'Active',
    inactive: 'Inactive',
    expired: 'Expired',
    cancelled: 'Cancelled',
    
    // Personal Information
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    country: 'Country',
    nationality: 'Nationality',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    dateOfBirth: 'Date of Birth',
    nationalId: 'National ID',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    currency: 'Currency',
    dateSystem: 'Date System',
    notifications: 'Notifications',
    privacy: 'Privacy',
    security: 'Security',
    account: 'Account',
    profile: 'Profile',
    preferences: 'Preferences',
    
    // Time and Date
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    lastYear: 'Last Year',
    nextWeek: 'Next Week',
    nextMonth: 'Next Month',
    nextYear: 'Next Year',
    
    // Missing translations for complete coverage
    residents: 'Residents',
    payments: 'Payments',
    notifications: 'Notifications',
    profile: 'Profile',
    contracts: 'Contracts',
    units: 'Units',
    floor: 'Floor',
    size: 'Size',
    amenities: 'Amenities',
    status: 'Status',
    rent: 'Rent',
    deposit: 'Deposit',
    vat: 'VAT',
    total: 'Total',
    month: 'Month',
    months: 'Months',
    year: 'Year',
    years: 'Years',
    day: 'Day',
    days: 'Days',
    week: 'Week',
    weeks: 'Weeks',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    kitchen: 'Kitchen',
    livingRoom: 'Living Room',
    parking: 'Parking',
    airConditioning: 'Air Conditioning',
    balcony: 'Balcony',
    elevator: 'Elevator',
    security: 'Security',
    gym: 'Gym',
    pool: 'Pool',
    garden: 'Garden',
    
    // Payment related
    paymentHistory: 'Payment History',
    paymentMethods: 'Payment Methods',
    bankTransfer: 'Bank Transfer',
    cash: 'Cash',
    stcPay: 'STC Pay',
    
    // Contract related
    contractDetails: 'Contract Details',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration',
    monthlyRent: 'Monthly Rent',
    securityDeposit: 'Security Deposit',
    
    // Status messages
    current: 'Current',
    former: 'Former',
    new: 'New',
    verified: 'Verified',
    unverified: 'Unverified',
    
    // Actions
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    submit: 'Submit',
    send: 'Send',
    call: 'Call',
    message: 'Message',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    
    // Status Messages
    loginSuccessful: 'Login successful',
    logoutSuccessful: 'Logout successful',
    saveSuccessful: 'Saved successfully',
    updateSuccessful: 'Updated successfully',
    deleteSuccessful: 'Deleted successfully',
    operationFailed: 'Operation failed',
    networkError: 'Network error',
    invalidInput: 'Invalid input',
    accessDenied: 'Access denied',
    sessionExpired: 'Session expired',
  },
};

const formatNumber = (number: number) => {
  return number.toLocaleString();
};

export function useLocalization() {
  const [state, setState] = useState<LocalizationState>({
    language: 'ar',
    dateSystem: 'hijri',
    currency: 'SAR',
    isRTL: true,
  });
  
  // State for tracking date system changes
  const [isChangingDateSystem, setIsChangingDateSystem] = useState(false);
  const [dateSystemChangeListeners, setDateSystemChangeListeners] = useState<DateSystemChangeListener[]>([]);
  const [updateCallbacks, setUpdateCallbacks] = useState<DateSystemUpdateCallback[]>([]);
  const [currencyChangeListeners, setCurrencyChangeListeners] = useState<CurrencyChangeListener[]>([]);
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from user-specific storage first, then fallback to general storage
        const language = (await AsyncStorage.getItem('userLanguage')) || 
                         (await AsyncStorage.getItem('language')) as Language || 'ar';
        const dateSystem = (await AsyncStorage.getItem('userDateSystem')) || 
                          (await AsyncStorage.getItem('dateSystem')) as DateSystem || 'hijri';
        const currency = (await AsyncStorage.getItem('userCurrency')) || 
                        (await AsyncStorage.getItem('currency')) as Currency || 'SAR';
        
        setState({
          language,
          dateSystem,
          currency,
          isRTL: language === 'ar',
        });
        
        console.log('📅 Localization settings loaded:', { language, dateSystem, currency });
      } catch (error) {
        console.error('Failed to load localization settings:', error);
      }
    };

    loadSettings();
  }, []);

  const setLanguage = async (language: Language) => {
    try {
      console.log('🌐 Setting language to:', language);
      
      // Save to both storage locations
      await AsyncStorage.setItem('language', language);
      await AsyncStorage.setItem('userLanguage', language);
      
      // Update state immediately
      setState(prev => ({
        ...prev,
        language,
        isRTL: language === 'ar',
      }));
      
      console.log('✅ Language changed to:', language);
      
      // Trigger any registered callbacks for language changes
      updateCallbacks.forEach(callback => callback());
      
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to save language:', error);
      throw error;
    }
  };

  const setDateSystem = async (dateSystem: DateSystem) => {
    try {
      setIsChangingDateSystem(true);
      console.log('📅 Setting date system to:', dateSystem);
      
      // Save to both storage locations
      await AsyncStorage.setItem('dateSystem', dateSystem);
      await AsyncStorage.setItem('userDateSystem', dateSystem);
      
      // Update state immediately
      setState(prev => ({ ...prev, dateSystem }));
      
      // Notify all listeners about the change
      dateSystemChangeListeners.forEach(listener => listener(dateSystem));
      
      // Trigger all update callbacks to refresh components
      updateCallbacks.forEach(callback => callback());
      
      console.log('✅ Date system changed to:', dateSystem);
      
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save date system:', error);
      throw error;
    } finally {
      setIsChangingDateSystem(false);
    }
  };

  const setCurrency = async (currency: Currency) => {
    try {
      setIsChangingCurrency(true);
      console.log('💰 Setting currency to:', currency);
      
      // Save to both storage locations
      await AsyncStorage.setItem('currency', currency);
      await AsyncStorage.setItem('userCurrency', currency);
      
      // Update state immediately
      setState(prev => ({ ...prev, currency }));
      
      // Notify all listeners about the change
      currencyChangeListeners.forEach(listener => listener(currency));
      
      // Trigger all update callbacks to refresh components
      updateCallbacks.forEach(callback => callback());
      
      console.log('✅ Currency changed to:', currency);
      
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save currency:', error);
      throw error;
    } finally {
      setIsChangingCurrency(false);
    }
  };

  // Add listener for currency changes
  const addCurrencyChangeListener = useCallback((listener: CurrencyChangeListener) => {
    setCurrencyChangeListeners(prev => [...prev, listener]);
    
    // Return cleanup function
    return () => {
      setCurrencyChangeListeners(prev => prev.filter(l => l !== listener));
    };
  }, []);

  // Currency conversion functions
  const convertCurrency = useCallback((amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to SAR first (base currency), then to target currency
    const amountInSAR = fromCurrency === 'SAR' ? amount : amount / EXCHANGE_RATES[fromCurrency];
    const convertedAmount = toCurrency === 'SAR' ? amountInSAR : amountInSAR * EXCHANGE_RATES[toCurrency];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }, []);

  const getCurrencySymbol = useCallback((currency: Currency = state.currency): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'د.إ';
      case 'KWD': return 'د.ك';
      case 'QAR': return 'ر.ق';
      case 'BHD': return 'د.ب';
      case 'OMR': return 'ر.ع';
      case 'SAR':
      default: return '﷼';
    }
  }, [state.currency]);

  // Add toggle function for easy switching between date systems
  const toggleDateSystem = async () => {
    try {
      const newDateSystem = state.dateSystem === 'hijri' ? 'gregorian' : 'hijri';
      console.log('🔄 Toggling date system from', state.dateSystem, 'to', newDateSystem);
      
      // Perform the actual system switch with proper date conversion
      await setDateSystem(newDateSystem);
      
      // Trigger system-wide date updates
      dateSystemChangeListeners.forEach(listener => listener(newDateSystem));
      updateCallbacks.forEach(callback => callback());
      
      console.log('✅ Date system toggle successful:', newDateSystem);
      
      return { success: true, newDateSystem };
    } catch (error) {
      console.error('Date system toggle failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Toggle failed' };
    }
  };

  // Add listener for date system changes
  const addDateSystemChangeListener = useCallback((listener: DateSystemChangeListener) => {
    setDateSystemChangeListeners(prev => [...prev, listener]);
    
    // Return cleanup function
    return () => {
      setDateSystemChangeListeners(prev => prev.filter(l => l !== listener));
    };
  }, []);

  // Add update callback for components that need to refresh
  const addDateSystemUpdateCallback = useCallback((callback: DateSystemUpdateCallback) => {
    setUpdateCallbacks(prev => [...prev, callback]);
    
    // Return cleanup function
    return () => {
      setUpdateCallbacks(prev => prev.filter(c => c !== callback));
    };
  }, []);

  const t = useCallback((key: string): string => {
    return translations[state.language][key as keyof typeof translations.ar] || key;
  }, [state.language]);

  const formatDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate date object
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDate:', date);
      return state.language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid Date';
    }
    
    // Use the selected date system consistently
    if (state.dateSystem === 'hijri') {
      try {
        const hijriResult = dateToHijri(dateObj);
        if (hijriResult.success && hijriResult.date) {
          const hijriDate = hijriResult.date as HijriDate;
          return formatHijriDate(hijriDate, 'short', state.language);
        }
      } catch (error) {
        console.warn('Hijri conversion failed, using Gregorian fallback');
      }
    }
    
    // Gregorian formatting
    if (state.language === 'ar') {
      // Arabic Gregorian formatting
      return dateObj.toLocaleDateString('ar-SA-u-ca-gregory', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    } else {
      // English Gregorian formatting
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
  }, [state.dateSystem, state.language]);

  const formatDateTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate date object
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDateTime:', date);
      return state.language === 'ar' ? 'تاريخ ووقت غير صحيح' : 'Invalid Date and Time';
    }
    
    // Format date part using selected system
    if (state.dateSystem === 'hijri') {
      try {
        const hijriResult = dateToHijri(dateObj);
        if (hijriResult.success && hijriResult.date) {
          const hijriDate = hijriResult.date as HijriDate;
          const hijriDateStr = formatHijriDate(hijriDate, 'short', state.language);
          const time = dateObj.toLocaleTimeString(state.language === 'ar' ? 'ar-SA' : 'en-US', {
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          });
          return `${hijriDateStr} ${time}`;
        }
      } catch (error) {
        console.warn('Hijri conversion failed for dateTime');
      }
    }
    
    // Gregorian formatting with time
    return dateObj.toLocaleDateString(state.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [state.dateSystem, state.language]);

  const formatRelativeDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return state.language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid Date';
    }
    
    try {
      if (state.dateSystem === 'hijri') {
        const hijriResult = dateToHijri(dateObj);
        if (hijriResult.success && hijriResult.date) {
          const hijriDate = hijriResult.date as HijriDate;
          return getRelativeDateDescription(
            { year: hijriDate.year, month: hijriDate.month, day: hijriDate.day },
            'hijri',
            state.language
          );
        }
      } else {
        return getRelativeDateDescription(
          { year: dateObj.getFullYear(), month: dateObj.getMonth() + 1, day: dateObj.getDate() },
          'gregorian',
          state.language
        );
      }
    } catch (error) {
      console.error('Relative date formatting error:', error);
    }
    
    // Fallback to regular date formatting
    return dateObj.toLocaleDateString(state.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [state.dateSystem, state.language]);

  const getHijriToday = useCallback((): string => {
    const { hijri } = getCurrentDates();
    return formatHijriDate(hijri, 'full', state.language);
  }, [state.language]);

  // Enhanced date system switching with proper state management
  const switchDateSystem = async (newDateSystem: DateSystem): Promise<{
    success: boolean;
    message?: string;
    formattedDate?: string;
    error?: string;
  }> => {
    try {
      if (state.dateSystem === newDateSystem) {
        return {
          success: true,
          message: 'Date system is already set to ' + newDateSystem,
        };
      }
      
      const currentDate = new Date();
      const { gregorian, hijri } = getCurrentDates();
      
      let formattedDate: string;
      let message: string;
      
      if (newDateSystem === 'hijri') {
        // Convert current Gregorian date to Hijri equivalent
        const conversionResult = convertSystemDate(currentDate, 'gregorian', 'hijri');
        if (conversionResult.success && conversionResult.formattedDate) {
          formattedDate = conversionResult.formattedDate;
        } else {
          formattedDate = formatHijriDate(hijri, 'full', state.language);
        }
        message = state.language === 'ar' 
          ? `تم التبديل إلى التقويم الهجري: ${formattedDate}`
          : `Switched to Hijri calendar: ${formattedDate}`;
      } else {
        // Convert current Hijri date to Gregorian equivalent
        const conversionResult = convertSystemDate(currentDate, 'hijri', 'gregorian');
        if (conversionResult.success && conversionResult.formattedDate) {
          formattedDate = conversionResult.formattedDate;
        } else {
          formattedDate = formatGregorianDate(gregorian, 'full', state.language);
        }
        message = state.language === 'ar'
          ? `تم التبديل إلى التقويم الميلادي: ${formattedDate}`
          : `Switched to Gregorian calendar: ${formattedDate}`;
      }
      
      console.log('📅 Date system switching:', message);
      
      await setDateSystem(newDateSystem);
      
      return {
        success: true,
        message,
        formattedDate,
      };
    } catch (error) {
      console.error('Date system switch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Switch failed',
      };
    }
  };

  // Get current date in both systems
  const getCurrentBothDates = () => {
    return getCurrentDates();
  };

  // Convert date between systems
  const convertDate = (
    date: Date,
    targetSystem: 'hijri' | 'gregorian'
  ): ConversionResult => {
    // Determine current system (opposite of target)
    const currentSystem = targetSystem === 'hijri' ? 'gregorian' : 'hijri';
    
    // Use the comprehensive conversion system
    const result = convertSystemDate(date, currentSystem, targetSystem);
    
    if (result.success && result.convertedDate) {
      // Convert back to ConversionResult format
      if (targetSystem === 'hijri') {
        const hijriResult = dateToHijri(result.convertedDate);
        return hijriResult;
      } else {
        const gregorianDate = {
          year: result.convertedDate.getFullYear(),
          month: result.convertedDate.getMonth() + 1,
          day: result.convertedDate.getDate(),
          monthName: GREGORIAN_MONTHS[result.convertedDate.getMonth()].name,
          monthNameAr: GREGORIAN_MONTHS[result.convertedDate.getMonth()].nameAr,
          dayOfWeek: result.convertedDate.getDay(),
          dayOfWeekName: DAY_NAMES[result.convertedDate.getDay()].name,
          dayOfWeekNameAr: DAY_NAMES[result.convertedDate.getDay()].nameAr,
          isValid: true,
        };
        return { success: true, date: gregorianDate };
      }
    }
    
    return {
      success: false,
      error: result.error || 'Date conversion failed',
    };
  };

  // Test and validation utilities
  const runDateSystemTests = () => {
    console.log('🧪 Running date system tests...');
    
    const accuracyResults = testConversionAccuracy();
    const validationResults = runValidationSuite();
    const benchmarkResults = benchmarkConversions(100);
    
    console.log('📊 Test Results:', {
      accuracy: accuracyResults,
      validation: validationResults,
      performance: benchmarkResults,
    });
    
    return {
      accuracy: accuracyResults,
      validation: validationResults,
      performance: benchmarkResults,
    };
  };

  // Enhanced formatCurrency that uses current user currency and conversion
  const formatCurrency = useCallback((amount: number, sourceCurrency: Currency = 'SAR', targetCurrency?: Currency): string => {
    const finalCurrency = targetCurrency || state.currency;
    const convertedAmount = convertCurrency(amount, sourceCurrency, finalCurrency);
    const symbol = getCurrencySymbol(finalCurrency);
    return `${convertedAmount.toLocaleString()} ${symbol}`;
  }, [state.currency, convertCurrency, getCurrencySymbol]);

  return {
    ...state,
    isChangingDateSystem,
    isChangingCurrency,
    setLanguage,
    setDateSystem,
    setCurrency,
    toggleDateSystem,
    switchDateSystem,
    addDateSystemChangeListener,
    addDateSystemUpdateCallback,
    addCurrencyChangeListener,
    convertCurrency,
    getCurrencySymbol,
    t,
    formatDate,
    formatDateTime,
    formatRelativeDate,
    formatCurrency,
    formatNumber,
    getHijriToday,
    getCurrentBothDates,
    convertDate,
    runDateSystemTests,
    gregorianToHijri: dateToHijri,
    formatHijriDate,
    // Export accurate Hijri utilities
    isRamadan: isCurrentlyRamadan(),
    getDaysUntilRamadan,
  };
}