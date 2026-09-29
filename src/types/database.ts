export type FranchiseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export interface Franchise {
  franchiseId: string;       // ST366-0001
  name: string;              // Owner Name
  email: string;             // Gmail / Login ID
  mobile: string;            // 10 digits
  branchName: string;        // Display name on ID card
  address: string;
  password?: string;         // Plain text login password for admin visibility & management
  passwordHash: string;      // Secure hash
  tPin?: string;             // Plain 4-digit Transaction Security PIN
  tPinHash?: string;         // 4-digit Transaction Security PIN hash
  tPinSet?: boolean;         // Whether T-PIN has been initialized on first login
  status: FranchiseStatus;
  rejectionReason?: string;
  photoUrl: string;          // Compressed image (<= 50KB data URL)
  registeredOn: string;
  approvedOn?: string;
  walletBalance: number;     // INR
  totalEarned: number;       // Lifetime INR
  totalWithdrawn: number;    // Lifetime INR
}

export type ServiceCategory = 'Website' | 'App' | 'Software' | 'ERP' | 'Other';

export interface ServiceInstallmentPlanItem {
  installmentNumber: number;
  title: string;
  percent: number;
  description?: string;
}

export interface Service {
  serviceId: string;         // SRV-0001
  serviceName: string;
  description: string;
  price: number;             // Base price INR
  advancePercent: number;    // e.g. 25%
  commissionPercent: number; // e.g. 10%
  category: ServiceCategory;
  imageUrl: string;          // Compressed thumbnail
  active: boolean;
  allowInstallments?: boolean;
  installmentCount?: number;
  installmentPlan?: ServiceInstallmentPlanItem[];
}

export type ProjectStatus = 'New' | 'Accepted' | 'Processing' | 'DemoReady' | 'Delivered' | 'Rejected';
export type StatusColor = 'grey' | 'orange' | 'blue' | 'green' | 'red';
export type InstallmentStatus = 'Pending' | 'Paid' | 'Processing';

export interface ProjectInstallment {
  installmentId: string;       // e.g. "INST-1", "INST-2"
  installmentNumber: number;   // 1, 2, 3...
  title: string;               // e.g. "Installment 1: Advance Token"
  amount: number;              // exact INR amount
  percent?: number;            // percent of final price
  status: InstallmentStatus;
  dueDate?: string;            // target date or milestone name
  paidAt?: string;             // ISO date when payment was verified
  utr?: string;                // UTR reference from verified payment
  paymentId?: string;          // FK -> Payment
  notes?: string;              // Deliverable notes or milestone condition
}

export interface Project {
  projectId: string;         // PRJ-0001
  franchiseId: string;       // FK -> Franchises
  serviceId: string;         // FK -> Services
  serviceName: string;
  clientName: string;
  clientMobile: string;
  requirementNotes: string;
  finalPrice: number;
  advancePercent: number;
  advanceRequired: number;   // FinalPrice * AdvancePercent / 100
  amountPaid: number;        // Running total of verified payments
  amountDue: number;         // FinalPrice - AmountPaid
  status: ProjectStatus;
  statusColor: StatusColor;
  demoUrl?: string;          // Rendered via iframe in franchise view, hidden raw link
  finalUrl?: string;         // Revealed & copyable only after Delivered
  commissionPercent: number;
  commissionAmount: number;  // FinalPrice * CommissionPercent / 100
  createdOn: string;
  acceptedOn?: string;
  deliveredOn?: string;
  certificateUrl?: string;
  certificateNumber?: string; // ST-CERT-XXXXXX
  rejectionReason?: string;
  hasInstallments?: boolean;
  installments?: ProjectInstallment[];
}

export type PaymentMode = 'UPI/QR-Manual' | 'Payment Gateway (API)';
export type PaymentStatus = 'Submitted' | 'Verified' | 'Rejected';

export interface Payment {
  paymentId: string;         // PAY-0001
  projectId: string;         // FK -> Projects
  franchiseId: string;
  franchiseName: string;
  amount: number;
  mode: PaymentMode;
  utr: string;               // 12-digit or alphanumeric reference
  paymentGatewayRef?: string;
  status: PaymentStatus;
  submittedOn: string;
  verifiedOn?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  installmentId?: string;     // FK -> ProjectInstallment
  installmentNumber?: number;
}

export type PayoutStatus = 'Requested' | 'Processing' | 'Paid' | 'Rejected';

export interface Payout {
  payoutId: string;          // PO-0001
  franchiseId: string;       // FK -> Franchises
  franchiseName: string;
  amount: number;
  walletBalanceAtRequest: number;
  status: PayoutStatus;
  mode: 'Manual (Admin UPI)' | 'API Payout';
  requestedOn: string;
  processedOn?: string;
  referenceNote?: string;    // Admin UTR / Ref
  rejectionReason?: string;
  upiId?: string;
}

export interface AppSettings {
  companyUpi: string;
  companyQrImageUrl: string;
  paymentApiEnabled: boolean;
  paymentApiProvider: string;
  defaultAdvancePercent: number;
  defaultCommissionPercent: number;
  certificatePrefix: string;
  adminUsername: string;
  adminPassword?: string;
  adminPasswordHash: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  ownerSignatureUrl?: string; // Digital signature image of company owner/director
  digitalStampUrl?: string;   // Digital Stamp / Corporate Seal image
  ownerName?: string;         // Company Owner/Authority Name (e.g., "Siddharth Verma")
  ownerDesignation?: string;  // e.g., "Managing Director & Founder"
  databaseConnected?: boolean;
  lastDatabaseSyncTime?: string;
  firebaseConnected?: boolean;
  lastFirebaseSyncTime?: string;
  // Optional Google Sheets backward compatibility for user convenience
  googleAppsScriptUrl?: string;
  googleSheetUrl?: string;
  googleSheetsSyncEnabled?: boolean;
  autoSyncToSheets?: boolean;
  lastSheetsSyncTime?: string;
  lastSheetsSyncStatus?: 'success' | 'failed' | 'idle';
}

export interface NotificationItem {
  notifId: string;           // N-0001
  franchiseId: string;       // Blank = broadcast to all franchises, or 'admin'
  message: string;
  type: 'Approval' | 'Project' | 'Payment' | 'Payout' | 'System';
  read: boolean;
  createdOn: string;
  targetId?: string;         // ID to deep-link to (e.g. PRJ-0001 or PAY-0001)
}

export interface AuthSession {
  role: 'admin' | 'franchise';
  franchise?: Franchise;
  token: string;
}
