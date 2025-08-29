import { Gender, Language, StaffRole, Role } from '@/types';

/**
 * Gender-aware text rendering system for Arabic application
 * Handles dynamic pronoun adjustment based on user gender
 */

interface GenderAwareText {
  male: string;
  female: string;
}

// Centralized gender-aware text mappings
const genderAwareTexts = {
  ar: {
    // Role titles
    manager: { male: 'مدير', female: 'مديرة' },
    accountant: { male: 'محاسب', female: 'محاسبة' },
    viewer: { male: 'مشاهد', female: 'مشاهدة' },
    landlord: { male: 'مالك', female: 'مالكة' },
    resident: { male: 'مستأجر', female: 'مستأجرة' },
    staff: { male: 'موظف', female: 'موظفة' },
    
    // Status descriptions
    active: { male: 'نشط', female: 'نشطة' },
    inactive: { male: 'غير نشط', female: 'غير نشطة' },
    verified: { male: 'موثق', female: 'موثقة' },
    unverified: { male: 'غير موثق', female: 'غير موثقة' },
    
    // Action descriptions
    invited: { male: 'مدعو', female: 'مدعوة' },
    joined: { male: 'انضم', female: 'انضمت' },
    registered: { male: 'مسجل', female: 'مسجلة' },
    updated: { male: 'محدث', female: 'محدثة' },
    
    // Welcome messages
    welcome: { male: 'مرحباً بك', female: 'مرحباً بك' },
    welcomeBack: { male: 'مرحباً بعودتك', female: 'مرحباً بعودتك' },
    
    // Notification messages
    paymentReceived: { male: 'تم استلام دفعة من المستأجر', female: 'تم استلام دفعة من المستأجرة' },
    accountCreated: { male: 'تم إنشاء حساب المستخدم', female: 'تم إنشاء حساب المستخدمة' },
    profileUpdated: { male: 'تم تحديث الملف الشخصي', female: 'تم تحديث الملف الشخصي' },
    
    // Form labels
    newEmployee: { male: 'موظف جديد', female: 'موظفة جديدة' },
    currentEmployee: { male: 'الموظف الحالي', female: 'الموظفة الحالية' },
    formerEmployee: { male: 'موظف سابق', female: 'موظفة سابقة' },
  },
  en: {
    // English doesn't require gender-specific forms, but we maintain structure
    manager: { male: 'Manager', female: 'Manager' },
    accountant: { male: 'Accountant', female: 'Accountant' },
    viewer: { male: 'Viewer', female: 'Viewer' },
    landlord: { male: 'Landlord', female: 'Landlord' },
    resident: { male: 'Tenant', female: 'Tenant' },
    staff: { male: 'Staff', female: 'Staff' },
    
    active: { male: 'Active', female: 'Active' },
    inactive: { male: 'Inactive', female: 'Inactive' },
    verified: { male: 'Verified', female: 'Verified' },
    unverified: { male: 'Unverified', female: 'Unverified' },
    
    invited: { male: 'Invited', female: 'Invited' },
    joined: { male: 'Joined', female: 'Joined' },
    registered: { male: 'Registered', female: 'Registered' },
    updated: { male: 'Updated', female: 'Updated' },
    
    welcome: { male: 'Welcome', female: 'Welcome' },
    welcomeBack: { male: 'Welcome back', female: 'Welcome back' },
    
    paymentReceived: { male: 'Payment received from tenant', female: 'Payment received from tenant' },
    accountCreated: { male: 'User account created', female: 'User account created' },
    profileUpdated: { male: 'Profile updated', female: 'Profile updated' },
    
    newEmployee: { male: 'New Employee', female: 'New Employee' },
    currentEmployee: { male: 'Current Employee', female: 'Current Employee' },
    formerEmployee: { male: 'Former Employee', female: 'Former Employee' },
  },
};

/**
 * Get gender-appropriate text based on user gender and language
 */
export function getGenderAwareText(
  key: string,
  gender: Gender,
  language: Language = 'ar'
): string {
  const languageTexts = genderAwareTexts[language];
  const textOptions = languageTexts[key as keyof typeof languageTexts] as GenderAwareText;
  
  if (!textOptions) {
    console.warn(`Gender-aware text not found for key: ${key}`);
    return key; // Fallback to key if not found
  }
  
  return textOptions[gender];
}

/**
 * Get role title with gender awareness
 */
export function getGenderAwareRole(
  role: Role | StaffRole,
  gender: Gender,
  language: Language = 'ar'
): string {
  return getGenderAwareText(role, gender, language);
}

/**
 * Get status description with gender awareness
 */
export function getGenderAwareStatus(
  status: string,
  gender: Gender,
  language: Language = 'ar'
): string {
  return getGenderAwareText(status, gender, language);
}

/**
 * Format welcome message with gender awareness
 */
export function getGenderAwareWelcome(
  userName: string,
  gender: Gender,
  language: Language = 'ar',
  isReturning: boolean = false
): string {
  const welcomeText = getGenderAwareText(
    isReturning ? 'welcomeBack' : 'welcome',
    gender,
    language
  );
  
  return `${welcomeText} ${userName}`;
}

/**
 * Format notification message with gender awareness
 */
export function getGenderAwareNotification(
  messageKey: string,
  userName: string,
  gender: Gender,
  language: Language = 'ar'
): string {
  const messageTemplate = getGenderAwareText(messageKey, gender, language);
  
  // Replace placeholder with user name if needed
  return messageTemplate.replace('{userName}', userName);
}

/**
 * Get employee type description with gender awareness
 */
export function getGenderAwareEmployeeType(
  type: 'new' | 'current' | 'former',
  gender: Gender,
  language: Language = 'ar'
): string {
  const key = type === 'new' ? 'newEmployee' : 
             type === 'current' ? 'currentEmployee' : 
             'formerEmployee';
  
  return getGenderAwareText(key, gender, language);
}

/**
 * Validate gender value
 */
export function isValidGender(gender: any): gender is Gender {
  return gender === 'male' || gender === 'female';
}

/**
 * Get default gender (fallback)
 */
export function getDefaultGender(): Gender {
  return 'male'; // Default fallback
}

/**
 * Format user description with full gender awareness
 */
export function formatGenderAwareUserDescription(
  user: { fullName: string; gender: Gender; role: Role; staffRole?: StaffRole },
  language: Language = 'ar'
): string {
  const roleText = user.staffRole 
    ? getGenderAwareRole(user.staffRole, user.gender, language)
    : getGenderAwareRole(user.role, user.gender, language);
  
  if (language === 'ar') {
    return `${user.fullName} - ${roleText}`;
  } else {
    return `${user.fullName} - ${roleText}`;
  }
}