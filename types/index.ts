export type Language = 'ar' | 'en';
export type Role = 'landlord' | 'resident' | 'staff';
export type StaffRole = 'manager' | 'accountant';
export type DateSystem = 'gregorian' | 'hijri';
export type Currency = 'SAR' | 'AED' | 'KWD' | 'QAR' | 'BHD' | 'OMR' | 'USD' | 'EUR' | 'GBP';
export type UnitStatus = 'vacant' | 'occupied' | 'inactive';
export type ContractType = 'residential' | 'commercial';
export type ContractStatus = 'draft' | 'active' | 'paused' | 'ended' | 'cancelled' | 'expired' | 'completed';
export type ChargeStatus = 'due' | 'overdue' | 'partiallyPaid' | 'paid' | 'canceled';
export type PaymentMethod = 'manualBank' | 'cash';
export type PaymentStatus = 'reported' | 'verified' | 'rejected';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Gender = 'male' | 'female';

export type Permission = 
  | 'view_dashboard'
  | 'view_properties' 
  | 'edit_properties'
  | 'view_units'
  | 'edit_units'
  | 'view_tenants'
  | 'edit_tenants'
  | 'view_contracts'
  | 'edit_contracts'
  | 'view_payments'
  | 'edit_payments'
  | 'view_collections'
  | 'manage_collections'
  | 'view_reports'
  | 'manage_staff'
  | 'view_audit_log';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: StaffRole;
  action: 'payment_accepted' | 'payment_declined' | 'contract_edited' | 'property_updated' | 'unit_updated' | 'tenant_updated' | 'discount_applied' | 'rent_adjusted';
  entityType: 'payment' | 'contract' | 'property' | 'unit' | 'tenant';
  entityId: string;
  entityName: string;
  details: {
    before?: any;
    after?: any;
    amount?: number;
    reason?: string;
    notes?: string;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface StaffPermissions {
  properties: string[]; // Property IDs they can access
  permissions: Permission[];
  restrictions: {
    canViewFinancials: boolean;
    canEditRentAmounts: boolean;
    canDeleteRecords: boolean;
    canInviteTenants: boolean;
    canManageContracts: boolean;
  };
}

export interface User {
  id: string;
  role: Role;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  email: string;
  phoneE164: string;
  language: Language;
  country: string;
  timeZone: string;
  status: 'active' | 'disabled';
  currency: Currency;
  dateSystem: DateSystem;
  gender: Gender;
  gender?: Gender;
  staffRole?: StaffRole;
  propertyScopes?: string[];
  permissions?: StaffPermissions;
  invitedBy?: string; // Landlord ID who invited this staff member
  joinedAt?: string;
}

export interface LandlordProfile {
  id: string;
  ownerUserId: string;
  displayName: string;
  legalName: string;
  logoUrl?: string;
  defaultCurrency: Currency;
  dateSystem: DateSystem;
  lateReminderPolicy: {
    daysBefore: number[];
    daysAfter: number[];
    quietHours: { start: string; end: string };
  };
  whatsappOptInDefault: boolean;
}

export interface Property {
  id: string;
  landlordId: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  address: string;
  city: string;
  notes?: string;
  photos: string[];
}

export interface Unit {
  id: string;
  propertyId: string;
  unitLabel: string;
  bedrooms: number;
  bathrooms: number;
  hasKitchen: boolean;
  hasLivingRoom: boolean;
  floor: number;
  sizeSqm?: number;
  status: UnitStatus;
  amenities: string[];
  photos: string[];
}

export interface Contract {
  id: string;
  unitId: string;
  residentUserId: string;
  type: ContractType;
  startDate: string;
  endDate?: string;
  durationMonths?: number;
  depositAmount: number;
  commissionAmount: number;
  vatRate: number;
  paymentFrequency: PaymentFrequency;
  status: ContractStatus;
  attachments: string[];
  signedAt?: string;
}

export interface Charge {
  id: string;
  contractId: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  label: string;
  status: ChargeStatus;
  balanceRemaining: number;
}

export interface Payment {
  id: string;
  chargeId: string;
  method: PaymentMethod;
  amount: number;
  paidAt: string;
  reference?: string;
  evidenceUrl: string[];
  reportedBy: 'resident' | 'landlord' | 'staff';
  status: PaymentStatus;
}

export interface HowToPay {
  id: string;
  scope: 'landlord' | 'property';
  title: string;
  instructionsRichText: string;
  bankAccounts: {
    bankName: string;
    iban: string;
    accountName: string;
  }[];
  stcBankHandle?: string;
}

export interface DashboardMetrics {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  dueThisWeek: number;
  overdueCharges: number;
}

export interface UpcomingCharge {
  id: string;
  residentName: string;
  unitLabel: string;
  dueDate: string;
  amount: number;
  status: ChargeStatus;
  contractId: string;
  remainingAmount: number;
}

export interface PaymentNotification {
  id: string;
  chargeId: string;
  residentName: string;
  unitLabel: string;
  amount: number;
  paymentType: 'full' | 'partial';
  timestamp: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface TenantInvitation {
  id: string;
  landlordId: string;
  landlordName: string;
  invitationCode: string;
  phoneNumber: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
  propertyName?: string;
  unitLabel?: string;
  contractDraft?: {
    type: ContractType;
    startDate: string;
    durationMonths: number;
    monthlyRent: number;
    depositAmount: number;
    vatRate: number;
    paymentFrequency: PaymentFrequency;
    notes?: string;
  };
}

export interface TenantProfile {
  id: string;
  userId: string;
  landlordId: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  currentUnit?: string;
  currentProperty?: string;
}