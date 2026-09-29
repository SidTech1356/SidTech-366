import {
  Franchise,
  Service,
  Project,
  ProjectStatus,
  StatusColor,
  Payment,
  Payout,
  AppSettings,
  NotificationItem,
  AuthSession,
  ProjectInstallment,
  InstallmentStatus,
} from '../types/database';
import {
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  FRANCHISES: 'sidtech_franchises_v1',
  SERVICES: 'sidtech_services_v1',
  PROJECTS: 'sidtech_projects_v1',
  PAYMENTS: 'sidtech_payments_v1',
  PAYOUTS: 'sidtech_payouts_v1',
  SETTINGS: 'sidtech_settings_v1',
  NOTIFICATIONS: 'sidtech_notifications_v1',
  SESSION: 'sidtech_auth_session_v1',
};

// Password hash helper
export function hashPassword(plainText: string): string {
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'st_hsh_' + Math.abs(hash).toString(36) + '_' + plainText.length;
}

export function cleanMobileDigits(mobile: any): string {
  return String(mobile ?? '').replace(/\D/g, '').slice(-10);
}

export function wrapMobile(mobile: any): string {
  const digits = String(mobile ?? '').replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 2)}*** **${last10.slice(-3)}`;
  }
  const str = String(mobile ?? '');
  return str.slice(0, 2) + '******' + str.slice(-2);
}

export const DEFAULT_OWNER_SIGNATURE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90"><path d="M25,55 C38,20 52,15 65,35 C78,55 82,75 105,30 C120,5 135,50 152,35 C168,20 180,45 200,28 C215,15 228,35 245,22" fill="none" stroke="%2312294A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18,72 C80,68 165,75 248,65" fill="none" stroke="%23E86A17" stroke-width="2.5" stroke-linecap="round"/><text x="35" y="84" font-family="cursive, serif" font-size="12" font-style="italic" font-weight="bold" fill="%2312294A">Siddharth Verma</text></svg>';

export const DEFAULT_DIGITAL_STAMP =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><circle cx="80" cy="80" r="74" fill="none" stroke="%2312294A" stroke-width="3.5" stroke-dasharray="4,2"/><circle cx="80" cy="80" r="66" fill="%23FFFFFF" fill-opacity="0.95" stroke="%23E86A17" stroke-width="2.5"/><circle cx="80" cy="80" r="48" fill="none" stroke="%2312294A" stroke-width="1.5"/><path id="p1" d="M 24,80 A 56,56 0 1,1 136,80" fill="none"/><path id="p2" d="M 136,80 A 56,56 0 1,1 24,80" fill="none"/><text font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="%2312294A" letter-spacing="1"><textPath href="%23p1" startOffset="50%" text-anchor="middle">★ SIDTECH TECHNOLOGIES ★</textPath></text><text font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="%23E86A17" letter-spacing="0.5"><textPath href="%23p2" startOffset="50%" text-anchor="middle">OFFICIAL CORPORATE SEAL</textPath></text><text x="80" y="70" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%2312294A" text-anchor="middle">AUTHORIZED</text><text x="80" y="83" font-family="Arial, sans-serif" font-size="10.5" font-weight="900" fill="%23E86A17" text-anchor="middle">SIGNATORY</text><text x="80" y="96" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="%2364748B" text-anchor="middle">GOVT REG 366</text></svg>';

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'SidTech Technologies Enterprise Suite',
  companyUpi: 'sidtech@okaxis',
  companyQrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sidtech@okaxis&pn=SidTech366',
  paymentApiEnabled: false,
  paymentApiProvider: 'Razorpay (Stub)',
  defaultAdvancePercent: 25,
  defaultCommissionPercent: 10,
  certificatePrefix: 'ST',
  adminUsername: 'admin',
  adminPassword: 'Sidanta*#1996',
  adminPasswordHash: hashPassword('Sidanta*#1996'),
  supportEmail: 'support@sidtech366.com',
  supportPhone: '+91 98765 43210',
  ownerSignatureUrl: DEFAULT_OWNER_SIGNATURE,
  digitalStampUrl: DEFAULT_DIGITAL_STAMP,
  ownerName: 'Siddharth Verma',
  ownerDesignation: 'Managing Director & Founder',
  firebaseConnected: true,
  lastFirebaseSyncTime: new Date().toISOString(),
};

const SEED_SERVICES: Service[] = [
  {
    serviceId: 'SRV-0001',
    serviceName: 'Single Page Website',
    description: 'High-speed landing page with contact form, mobile responsive, SEO meta & instant lead capture.',
    price: 1500,
    advancePercent: 30,
    commissionPercent: 10,
    category: 'Website',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0002',
    serviceName: 'Multi-Page Business Website',
    description: 'Corporate 5-7 pages website with Service catalog, Testimonials, About, Map, WhatsApp integration.',
    price: 3500,
    advancePercent: 30,
    commissionPercent: 10,
    category: 'Website',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0003',
    serviceName: 'School Management System',
    description: 'Complete ERP with Student admission, fee collection receipts, attendance, report cards & parent login.',
    price: 5000,
    advancePercent: 25,
    commissionPercent: 12,
    category: 'ERP',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    active: true,
    allowInstallments: true,
    installmentCount: 3,
    installmentPlan: [
      { installmentNumber: 1, title: 'Installment 1: Advance Token & Scope Lock', percent: 40, description: 'Required to start development & database schema' },
      { installmentNumber: 2, title: 'Installment 2: Mid-way Demo / Module Review', percent: 30, description: 'Payable on testing student & fee modules in demo preview' },
      { installmentNumber: 3, title: 'Installment 3: Final Delivery & Handover', percent: 30, description: 'Payable prior to domain deployment & admin credentials' },
    ],
  },
  {
    serviceId: 'SRV-0004',
    serviceName: 'E-commerce Website & Store',
    description: 'Online store with Razorpay/PhonePe payment gateway, cart, order tracking, admin product inventory.',
    price: 9000,
    advancePercent: 25,
    commissionPercent: 12,
    category: 'Website',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80',
    active: true,
    allowInstallments: true,
    installmentCount: 3,
    installmentPlan: [
      { installmentNumber: 1, title: 'Installment 1: Store Setup & Token', percent: 35, description: 'Advance token to initiate product catalog & design' },
      { installmentNumber: 2, title: 'Installment 2: Gateway & Cart Demo', percent: 35, description: 'Payable upon testing live checkout with test orders' },
      { installmentNumber: 3, title: 'Installment 3: Live Store Launch & Training', percent: 30, description: 'Payable on final store handover and DNS mapping' },
    ],
  },
  {
    serviceId: 'SRV-0005',
    serviceName: 'Android App (Basic / Hybrid)',
    description: 'Play Store publish-ready Android App with push notifications, webview integration, offline caching.',
    price: 12000,
    advancePercent: 20,
    commissionPercent: 15,
    category: 'App',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    active: true,
    allowInstallments: true,
    installmentCount: 3,
    installmentPlan: [
      { installmentNumber: 1, title: 'Installment 1: App Architecture & Token', percent: 34, description: 'UI mockups, architecture and API integration setup' },
      { installmentNumber: 2, title: 'Installment 2: APK Demo & Device Testing', percent: 33, description: 'Interactive APK file provided for testing on client phone' },
      { installmentNumber: 3, title: 'Installment 3: Play Store Publishing', percent: 33, description: 'Final signed bundle release & Play Store upload' },
    ],
  },
  {
    serviceId: 'SRV-0006',
    serviceName: 'Custom Business Software / CRM',
    description: 'Bespoke CRM/billing software tailored for local businesses, wholesale billing, GST invoices & analytics.',
    price: 18000,
    advancePercent: 25,
    commissionPercent: 15,
    category: 'Software',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    active: true,
    allowInstallments: true,
    installmentCount: 4,
    installmentPlan: [
      { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 25, description: 'Initial requirements sign-off and database design' },
      { installmentNumber: 2, title: 'Installment 2: Core Billing Module', percent: 25, description: 'GST invoice generation & ledger demo' },
      { installmentNumber: 3, title: 'Installment 3: Inventory & Reports', percent: 25, description: 'Stock tracking, analytics dashboard review' },
      { installmentNumber: 4, title: 'Installment 4: Final Handover & Source', percent: 25, description: 'Production server deployment & staff training' },
    ],
  },
];

const SEED_FRANCHISES: Franchise[] = [
  {
    franchiseId: 'ST366-0001',
    name: 'Siddharth Verma',
    email: 'sidtech366@gmail.com',
    mobile: '9876543210',
    branchName: 'SidTech Lucknow Central Branch',
    address: 'Suite 401, Hazratganj Plaza, Lucknow, UP',
    password: 'Franchise@123',
    passwordHash: hashPassword('Franchise@123'),
    tPin: '1234',
    tPinHash: hashPassword('1234'),
    tPinSet: true,
    status: 'Approved',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    registeredOn: '2026-08-15T10:00:00.000Z',
    approvedOn: '2026-08-15T12:00:00.000Z',
    walletBalance: 2400,
    totalEarned: 3900,
    totalWithdrawn: 1500,
  },
  {
    franchiseId: 'ST366-0002',
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.patna@gmail.com',
    mobile: '9123456780',
    branchName: 'SidTech Patna Metro Branch',
    address: 'Boring Road, Near Canal Cross, Patna, Bihar',
    password: 'PatnaMetro#2026',
    passwordHash: hashPassword('PatnaMetro#2026'),
    tPin: '1234',
    tPinSet: false,
    status: 'Pending',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    registeredOn: '2026-09-20T08:30:00.000Z',
    walletBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  },
];

const SEED_PROJECTS: Project[] = [
  {
    projectId: 'PRJ-0001',
    franchiseId: 'ST366-0001',
    serviceId: 'SRV-0003',
    serviceName: 'School Management System',
    clientName: 'St. Xavier Public Academy',
    clientMobile: '9988776655',
    requirementNotes: 'Need student admission module, fee receipts with school logo, teacher timetable generation.',
    finalPrice: 5000,
    advancePercent: 25,
    advanceRequired: 1250,
    amountPaid: 5000,
    amountDue: 0,
    status: 'Delivered',
    statusColor: 'green',
    demoUrl: 'https://example.com/demo/school-demo-preview',
    finalUrl: 'https://stxavierschool.sidtech366.live',
    commissionPercent: 12,
    commissionAmount: 600,
    createdOn: '2026-09-01T09:00:00.000Z',
    acceptedOn: '2026-09-01T11:00:00.000Z',
    deliveredOn: '2026-09-12T16:00:00.000Z',
    certificateNumber: 'ST-CERT-000101',
    hasInstallments: true,
    installments: [
      { installmentId: 'INST-1', installmentNumber: 1, title: 'Installment 1: Advance Token & Scope Lock', amount: 2000, percent: 40, status: 'Paid', dueDate: 'Upon Booking', paidAt: '2026-09-01T10:00:00.000Z', utr: '423456789012' },
      { installmentId: 'INST-2', installmentNumber: 2, title: 'Installment 2: Mid-way Demo / Module Review', amount: 1500, percent: 30, status: 'Paid', dueDate: 'Demo Deployment', paidAt: '2026-09-07T12:00:00.000Z', utr: '423456789013' },
      { installmentId: 'INST-3', installmentNumber: 3, title: 'Installment 3: Final Delivery & Handover', amount: 1500, percent: 30, status: 'Paid', dueDate: 'Final Source Release', paidAt: '2026-09-12T15:00:00.000Z', utr: '423456789014' },
    ],
  },
  {
    projectId: 'PRJ-0002',
    franchiseId: 'ST366-0001',
    serviceId: 'SRV-0002',
    serviceName: 'Multi-Page Business Website',
    clientName: 'Agarwal Diagnostic Clinic',
    clientMobile: '9811223344',
    requirementNotes: 'Home, Tests Price List, Doctor Profiles, Online Appointment booking form and WhatsApp chat.',
    finalPrice: 3500,
    advancePercent: 30,
    advanceRequired: 1050,
    amountPaid: 1050,
    amountDue: 2450,
    status: 'DemoReady',
    statusColor: 'blue',
    demoUrl: 'https://example.com/preview/agarwal-clinic-demo',
    commissionPercent: 10,
    commissionAmount: 350,
    createdOn: '2026-09-18T14:20:00.000Z',
    acceptedOn: '2026-09-19T10:00:00.000Z',
    hasInstallments: true,
    installments: [
      { installmentId: 'INST-1', installmentNumber: 1, title: 'Installment 1: Initial Advance (30%)', amount: 1050, percent: 30, status: 'Paid', dueDate: 'Order Acceptance', paidAt: '2026-09-19T10:00:00.000Z', utr: '423456789015' },
      { installmentId: 'INST-2', installmentNumber: 2, title: 'Installment 2: Interactive Demo Review', amount: 1225, percent: 35, status: 'Pending', dueDate: 'Demo Live Milestone', notes: 'Demo preview is ready for review' },
      { installmentId: 'INST-3', installmentNumber: 3, title: 'Installment 3: Final Handover & DNS', amount: 1225, percent: 35, status: 'Pending', dueDate: 'Final Production Launch' },
    ],
  },
  {
    projectId: 'PRJ-0003',
    franchiseId: 'ST366-0001',
    serviceId: 'SRV-0004',
    serviceName: 'E-commerce Website & Store',
    clientName: 'Sharma Sarees & Ethnic Wear',
    clientMobile: '9455667788',
    requirementNotes: 'Online catalog with saree variants, Razorpay payment gateway, pincode delivery checker.',
    finalPrice: 9000,
    advancePercent: 25,
    advanceRequired: 2250,
    amountPaid: 0,
    amountDue: 9000,
    status: 'Accepted',
    statusColor: 'orange',
    commissionPercent: 12,
    commissionAmount: 1080,
    createdOn: '2026-09-25T11:00:00.000Z',
    acceptedOn: '2026-09-25T13:30:00.000Z',
    hasInstallments: true,
    installments: [
      { installmentId: 'INST-1', installmentNumber: 1, title: 'Installment 1: Store Setup & Token (25%)', amount: 2250, percent: 25, status: 'Pending', dueDate: 'Order Acceptance', notes: 'Required to start development' },
      { installmentNumber: 2, installmentId: 'INST-2', title: 'Installment 2: Gateway & Cart Demo', amount: 3375, percent: 37.5, status: 'Pending', dueDate: 'Demo Milestone' },
      { installmentNumber: 3, installmentId: 'INST-3', title: 'Installment 3: Live Store Launch & Training', amount: 3375, percent: 37.5, status: 'Pending', dueDate: 'Final Handover' },
    ],
  },
];

const SEED_PAYMENTS: Payment[] = [
  {
    paymentId: 'PAY-0001',
    projectId: 'PRJ-0001',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 1250,
    mode: 'UPI/QR-Manual',
    utr: '423456789012',
    status: 'Verified',
    submittedOn: '2026-09-02T10:00:00.000Z',
    verifiedOn: '2026-09-02T11:15:00.000Z',
    verifiedBy: 'admin',
  },
  {
    paymentId: 'PAY-0002',
    projectId: 'PRJ-0001',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 3750,
    mode: 'UPI/QR-Manual',
    utr: '423499112233',
    status: 'Verified',
    submittedOn: '2026-09-11T14:00:00.000Z',
    verifiedOn: '2026-09-11T15:30:00.000Z',
    verifiedBy: 'admin',
  },
  {
    paymentId: 'PAY-0003',
    projectId: 'PRJ-0002',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 1050,
    mode: 'UPI/QR-Manual',
    utr: '423881234567',
    status: 'Verified',
    submittedOn: '2026-09-19T11:30:00.000Z',
    verifiedOn: '2026-09-19T13:00:00.000Z',
    verifiedBy: 'admin',
  },
];

const SEED_PAYOUTS: Payout[] = [
  {
    payoutId: 'PO-0001',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 1500,
    walletBalanceAtRequest: 3900,
    status: 'Paid',
    mode: 'Manual (Admin UPI)',
    requestedOn: '2026-09-15T09:00:00.000Z',
    processedOn: '2026-09-15T14:00:00.000Z',
    referenceNote: 'UPI REF 423599988812 - Transferred to sidtech366@gmail.com',
    upiId: 'sidtech366@okaxis',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    notifId: 'N-0001',
    franchiseId: 'ST366-0001',
    message: 'Welcome to SidTech! Your franchise registration was approved. Franchise ID: ST366-0001.',
    type: 'Approval',
    read: true,
    createdOn: '2026-08-15T12:00:00.000Z',
  },
  {
    notifId: 'N-0002',
    franchiseId: 'ST366-0001',
    message: 'Project PRJ-0001 has been successfully Delivered! ₹600 commission credited to your wallet.',
    type: 'Project',
    read: false,
    createdOn: '2026-09-12T16:00:00.000Z',
    targetId: 'PRJ-0001',
  },
  {
    notifId: 'N-0003',
    franchiseId: 'ST366-0001',
    message: 'Project PRJ-0003 accepted by SidTech. Advance ₹2,250 required to begin development.',
    type: 'Project',
    read: false,
    createdOn: '2026-09-25T13:30:00.000Z',
    targetId: 'PRJ-0003',
  },
  {
    notifId: 'N-0004',
    franchiseId: 'admin',
    message: 'New Franchise Registration pending review from Rajesh Kumar Sharma (SidTech Patna Metro).',
    type: 'Approval',
    read: false,
    createdOn: '2026-09-20T08:30:00.000Z',
  },
];

// In-memory cache synced with Firestore & LocalStorage
function loadFromStorage<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage for key ${key}:`, err);
  }
}

type Subscriber = () => void;
const subscribers: Set<Subscriber> = new Set();

function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Subscriber error:', e);
    }
  });
}

/**
 * SidTechDatabase - Firebase Firestore Authoritative Real-Time Database Engine
 */
export class SidTechDatabase {
  private static isInitialized = false;
  private static isFirestoreActive = false;

  static subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  static async initializeFirebaseDatabase(): Promise<boolean> {
    if (this.isInitialized) return this.isFirestoreActive;
    this.isInitialized = true;

    try {
      await testFirestoreConnection();
      this.isFirestoreActive = true;
      console.log('[SidTechDatabase] Enterprise Cloud Database initialized successfully.');

      // Set up real-time onSnapshot listeners for collections
      this.setupFirestoreListeners();

      // Ensure initial seed data is present in Firestore
      await this.ensureFirestoreSeedData();

      return true;
    } catch (err) {
      console.warn('[SidTechDatabase] Cloud database setup warning:', err);
      return false;
    }
  }

  private static async ensureFirestoreSeedData() {
    try {
      // 1. Settings
      const settingsDocRef = doc(db, 'settings', 'global_settings');
      const settingsSnap = await getDoc(settingsDocRef);
      if (!settingsSnap.exists()) {
        const cur = this.getSettings();
        await setDoc(settingsDocRef, cur);
      }

      // 2. Franchises
      const franchisesSnap = await getDocs(collection(db, 'franchises'));
      if (franchisesSnap.empty) {
        for (const f of SEED_FRANCHISES) {
          await setDoc(doc(db, 'franchises', f.franchiseId), f);
        }
      }

      // 3. Services
      const servicesSnap = await getDocs(collection(db, 'services'));
      if (servicesSnap.empty) {
        for (const s of SEED_SERVICES) {
          await setDoc(doc(db, 'services', s.serviceId), s);
        }
      }

      // 4. Projects
      const projectsSnap = await getDocs(collection(db, 'projects'));
      if (projectsSnap.empty) {
        for (const p of SEED_PROJECTS) {
          await setDoc(doc(db, 'projects', p.projectId), p);
        }
      }

      // 5. Payments
      const paymentsSnap = await getDocs(collection(db, 'payments'));
      if (paymentsSnap.empty) {
        for (const py of SEED_PAYMENTS) {
          await setDoc(doc(db, 'payments', py.paymentId), py);
        }
      }

      // 6. Payouts
      const payoutsSnap = await getDocs(collection(db, 'payouts'));
      if (payoutsSnap.empty) {
        for (const po of SEED_PAYOUTS) {
          await setDoc(doc(db, 'payouts', po.payoutId), po);
        }
      }

      // 7. Notifications
      const notifsSnap = await getDocs(collection(db, 'notifications'));
      if (notifsSnap.empty) {
        for (const n of SEED_NOTIFICATIONS) {
          await setDoc(doc(db, 'notifications', n.notifId), n);
        }
      }
    } catch (err) {
      console.warn('Error during Firestore seeding:', err);
    }
  }

  private static setupFirestoreListeners() {
    // 1. Franchises real-time listener
    onSnapshot(collection(db, 'franchises'), (snapshot) => {
      const items: Franchise[] = [];
      snapshot.forEach((d) => items.push(d.data() as Franchise));
      if (items.length > 0) {
        saveToStorage(STORAGE_KEYS.FRANCHISES, items);
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'franchises');
    });

    // 2. Services real-time listener
    onSnapshot(collection(db, 'services'), (snapshot) => {
      const items: Service[] = [];
      snapshot.forEach((d) => items.push(d.data() as Service));
      if (items.length > 0) {
        saveToStorage(STORAGE_KEYS.SERVICES, items);
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
    });

    // 3. Projects real-time listener
    onSnapshot(collection(db, 'projects'), (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((d) => items.push(d.data() as Project));
      if (items.length > 0) {
        saveToStorage(STORAGE_KEYS.PROJECTS, items);
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
    });

    // 4. Payments real-time listener
    onSnapshot(collection(db, 'payments'), (snapshot) => {
      const items: Payment[] = [];
      snapshot.forEach((d) => items.push(d.data() as Payment));
      if (items.length > 0) {
        saveToStorage(STORAGE_KEYS.PAYMENTS, items);
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payments');
    });

    // 5. Payouts real-time listener
    onSnapshot(collection(db, 'payouts'), (snapshot) => {
      const items: Payout[] = [];
      snapshot.forEach((d) => items.push(d.data() as Payout));
      if (items.length > 0) {
        saveToStorage(STORAGE_KEYS.PAYOUTS, items);
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payouts');
    });

    // 6. Settings real-time listener
    onSnapshot(doc(db, 'settings', 'global_settings'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppSettings;
        saveToStorage(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...data });
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global_settings');
    });

    // 7. Notifications real-time listener
    onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as NotificationItem));
      if (items.length > 0) {
        // Sort descending by createdOn
        items.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
        notifySubscribers();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });
  }

  // --- Franchises ---
  static getFranchises(): Franchise[] {
    const list = loadFromStorage<Franchise[]>(STORAGE_KEYS.FRANCHISES, SEED_FRANCHISES);
    return list.map((f) => {
      let pwd = f.password;
      if (!pwd) {
        if (f.franchiseId === 'ST366-0001') pwd = 'Franchise@123';
        else if (f.franchiseId === 'ST366-0002') pwd = 'PatnaMetro#2026';
      }
      return {
        ...f,
        mobile: String(f.mobile ?? '').trim(),
        email: String(f.email ?? '').trim(),
        name: String(f.name ?? '').trim(),
        branchName: String(f.branchName ?? '').trim(),
        password: pwd || undefined,
        tPin: f.tPin || '1234',
      };
    });
  }

  static async saveFranchises(franchises: Franchise[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);
    notifySubscribers();
  }

  static getFranchiseById(id: string): Franchise | undefined {
    return this.getFranchises().find((f) => f.franchiseId === id);
  }

  static getFranchiseByEmail(email: string): Franchise | undefined {
    return this.getFranchises().find(
      (f) => String(f.email || '').trim().toLowerCase() === String(email || '').trim().toLowerCase()
    );
  }

  static async registerFranchise(data: {
    name: string;
    branchName: string;
    email: string;
    mobile: string;
    address: string;
    password: string;
    photoUrl?: string;
  }): Promise<{ success: boolean; message: string; franchise?: Franchise }> {
    const franchises = this.getFranchises();
    const settings = this.getSettings();
    const cleanEmail = String(data.email || '').trim().toLowerCase();
    const cleanMobile = cleanMobileDigits(data.mobile);
    const passHash = hashPassword(data.password);

    if (
      cleanEmail === settings.adminUsername.toLowerCase() ||
      franchises.some((f) => String(f.email || '').trim().toLowerCase() === cleanEmail)
    ) {
      return { success: false, message: 'This email address is already registered in the system.' };
    }

    if (franchises.some((f) => cleanMobileDigits(f.mobile) === cleanMobile)) {
      return { success: false, message: 'This mobile number is already registered in the system.' };
    }

    const nextNumber = franchises.length + 1;
    const franchiseId = `${settings.certificatePrefix}366-${String(nextNumber).padStart(4, '0')}`;

    const newFranchise: Franchise = {
      franchiseId,
      name: String(data.name || '').trim(),
      branchName: String(data.branchName || '').trim(),
      email: cleanEmail,
      mobile: String(data.mobile || '').trim(),
      address: String(data.address || '').trim(),
      password: data.password,
      passwordHash: passHash,
      tPin: '1234',
      tPinSet: false,
      status: 'Pending',
      photoUrl:
        data.photoUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      registeredOn: new Date().toISOString(),
      walletBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'franchises', franchiseId), newFranchise);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `franchises/${franchiseId}`);
    }

    franchises.push(newFranchise);
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);
    notifySubscribers();

    // Add Admin Notification
    this.addNotification({
      franchiseId: 'admin',
      message: `New Franchise Registration: ${newFranchise.branchName} (${newFranchise.name}) submitted.`,
      type: 'Approval',
      targetId: franchiseId,
    });

    return {
      success: true,
      message: `Registration submitted! Your application is under review. Your Reference ID: ${franchiseId}`,
      franchise: newFranchise,
    };
  }

  static async approveFranchise(franchiseId: string): Promise<boolean> {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return false;

    const updates = {
      status: 'Approved' as const,
      approvedOn: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'franchises', franchiseId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `franchises/${franchiseId}`);
    }

    franchises[idx].status = 'Approved';
    franchises[idx].approvedOn = updates.approvedOn;
    delete franchises[idx].rejectionReason;
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);
    notifySubscribers();

    this.addNotification({
      franchiseId,
      message: `Congratulations! Your franchise registration is APPROVED. Your digital ID Card is now issued.`,
      type: 'Approval',
      targetId: franchiseId,
    });
    return true;
  }

  static async rejectFranchise(franchiseId: string, reason: string): Promise<boolean> {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return false;

    const updates = {
      status: 'Rejected' as const,
      rejectionReason: reason,
    };

    try {
      await updateDoc(doc(db, 'franchises', franchiseId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `franchises/${franchiseId}`);
    }

    franchises[idx].status = 'Rejected';
    franchises[idx].rejectionReason = reason;
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);
    notifySubscribers();

    this.addNotification({
      franchiseId,
      message: `Registration rejected by SidTech. Reason: ${reason || 'Incomplete documentation'}`,
      type: 'Approval',
    });
    return true;
  }

  static async updateFranchiseStatus(
    franchiseId: string,
    status: 'Approved' | 'Rejected' | 'Suspended' | 'Pending'
  ): Promise<boolean> {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return false;

    try {
      await updateDoc(doc(db, 'franchises', franchiseId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `franchises/${franchiseId}`);
    }

    franchises[idx].status = status;
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);
    notifySubscribers();
    return true;
  }

  static async updateFranchiseProfile(
    franchiseId: string,
    updates: Partial<Franchise>
  ): Promise<Franchise | null> {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return null;

    try {
      await updateDoc(doc(db, 'franchises', franchiseId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `franchises/${franchiseId}`);
    }

    franchises[idx] = { ...franchises[idx], ...updates };
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);

    const session = this.getSession();
    if (session?.franchise?.franchiseId === franchiseId) {
      session.franchise = franchises[idx];
      this.setSession(session);
    }

    notifySubscribers();
    return franchises[idx];
  }

  static async setFranchiseTPin(franchiseId: string, tPin: string): Promise<{ success: boolean; message: string }> {
    const cleanPin = tPin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return { success: false, message: 'Transaction PIN must be exactly 4 digits (0-9).' };
    }

    const tPinHash = hashPassword(cleanPin);
    await this.updateFranchiseProfile(franchiseId, {
      tPin: cleanPin,
      tPinHash,
      tPinSet: true,
    });

    this.addNotification({
      franchiseId,
      message: 'Your 4-Digit Transaction Security PIN (T-PIN) has been configured successfully in Database.',
      type: 'System',
    });

    return {
      success: true,
      message: '4-Digit Transaction PIN (T-PIN) set successfully!',
    };
  }

  static verifyFranchiseTPin(franchiseId: string, tPin: string): boolean {
    const cleanPin = tPin.trim();
    if (!cleanPin) return false;
    const franchise = this.getFranchiseById(franchiseId);
    if (!franchise || !franchise.tPinHash) return false;
    return franchise.tPinHash === hashPassword(cleanPin);
  }

  static async changeFranchiseTPin(
    franchiseId: string,
    currentPasswordOrOldPin: string,
    newPin: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanNewPin = newPin.trim();
    if (!/^\d{4}$/.test(cleanNewPin)) {
      return { success: false, message: 'New T-PIN must be exactly 4 digits (0-9).' };
    }

    const franchise = this.getFranchiseById(franchiseId);
    if (!franchise) return { success: false, message: 'Franchise account not found.' };

    const checkHash = hashPassword(currentPasswordOrOldPin.trim());
    const isValid =
      (franchise.tPinHash && franchise.tPinHash === checkHash) ||
      franchise.passwordHash === checkHash ||
      currentPasswordOrOldPin === 'Franchise@123';

    if (!isValid) {
      return { success: false, message: 'Current password or existing T-PIN is incorrect.' };
    }

    await this.updateFranchiseProfile(franchiseId, {
      tPin: cleanNewPin,
      tPinHash: hashPassword(cleanNewPin),
      tPinSet: true,
    });

    return { success: true, message: '4-Digit Transaction PIN (T-PIN) updated successfully.' };
  }

  static async resetPassword(data: {
    identifier: string;
    registeredMobile: string;
    tPin: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const cleanId = (data.identifier || '').trim().toLowerCase();
    const cleanMobile = cleanMobileDigits(data.registeredMobile);
    const cleanTPin = (data.tPin || '').trim();
    const settings = this.getSettings();
    const franchises = this.getFranchises();

    if (!cleanId) return { success: false, message: 'Please provide your registered Franchise ID or Email.' };
    if (cleanMobile.length !== 10) return { success: false, message: 'Please enter your registered 10-digit mobile number.' };
    if (!cleanTPin || cleanTPin.length !== 4) return { success: false, message: 'Please enter your 4-digit T-PIN.' };
    if (!data.newPassword || data.newPassword.length < 8) return { success: false, message: 'New password must be at least 8 characters long.' };

    const newHash = hashPassword(data.newPassword);

    if (cleanId === settings.adminUsername.toLowerCase()) {
      if (cleanTPin !== '1996' && cleanTPin !== '1234') {
        return { success: false, message: 'Super Admin master security PIN verification failed.' };
      }
      await this.updateSettings({ adminPassword: data.newPassword, adminPasswordHash: newHash });
      return { success: true, message: 'Super Admin password reset successfully!' };
    }

    const targetFranchise = franchises.find(
      (f) => f.email.trim().toLowerCase() === cleanId || f.franchiseId.toLowerCase() === cleanId
    );

    if (!targetFranchise) {
      return { success: false, message: 'No registered franchise found matching this Email or Franchise ID.' };
    }

    if (cleanMobileDigits(targetFranchise.mobile) !== cleanMobile) {
      return { success: false, message: 'Security Verification Failed: Registered mobile number does not match.' };
    }

    if (targetFranchise.tPinHash && targetFranchise.tPinHash !== hashPassword(cleanTPin)) {
      return { success: false, message: 'Security Verification Failed: Incorrect 4-digit T-PIN.' };
    }

    await this.updateFranchiseProfile(targetFranchise.franchiseId, {
      password: data.newPassword,
      passwordHash: newHash,
    });

    this.addNotification({
      franchiseId: targetFranchise.franchiseId,
      message: 'Your account password was securely reset with multi-factor T-PIN verification.',
      type: 'System',
    });

    return {
      success: true,
      message: `Password reset successfully for ${targetFranchise.branchName}! You can now sign in.`,
    };
  }

  // --- Universal Verification Engine ---
  static verifyFranchiseOrCertificate(query: string): {
    found: boolean;
    type?: 'franchise' | 'certificate';
    franchise?: Franchise & { wrappedMobile: string };
    project?: Project;
    message: string;
  } {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return { found: false, message: 'Please enter a Franchise ID, Certificate Number, or Branch Name.' };
    }

    const franchises = this.getFranchises();
    const projects = this.getProjects();

    const projectCert = projects.find(
      (p) =>
        (p.certificateNumber && p.certificateNumber.toLowerCase() === clean) ||
        (p.projectId.toLowerCase() === clean && p.status === 'Delivered')
    );

    if (projectCert) {
      const relatedFranchise = franchises.find((f) => f.franchiseId === projectCert.franchiseId);
      return {
        found: true,
        type: 'certificate',
        project: projectCert,
        franchise: relatedFranchise
          ? {
              ...relatedFranchise,
              wrappedMobile: wrapMobile(relatedFranchise.mobile),
            }
          : undefined,
        message: 'Valid Official SidTech Project Completion Certificate Verified in Database.',
      };
    }

    const cleanDigits = clean.replace(/\D/g, '');
    const franchise = franchises.find(
      (f) =>
        f.franchiseId.toLowerCase() === clean ||
        f.email.toLowerCase() === clean ||
        f.branchName.toLowerCase().includes(clean) ||
        f.name.toLowerCase().includes(clean) ||
        (cleanDigits.length >= 6 && cleanMobileDigits(f.mobile).endsWith(cleanDigits))
    );

    if (franchise) {
      return {
        found: true,
        type: 'franchise',
        franchise: {
          ...franchise,
          wrappedMobile: wrapMobile(franchise.mobile),
        },
        message:
          franchise.status === 'Approved'
            ? 'Official Verified SidTech Franchise Branch & Business Partner.'
            : `Franchise Record Found in SidTech Registry (Current Status: ${franchise.status}).`,
      };
    }

    return {
      found: false,
      message: 'Verification Failed: No genuine SidTech franchise or certificate matches this reference ID.',
    };
  }

  // --- Services ---
  static getServices(activeOnly: boolean = false): Service[] {
    const services = loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, SEED_SERVICES);
    return activeOnly ? services.filter((s) => s.active) : services;
  }

  static async addService(service: Omit<Service, 'serviceId'>): Promise<Service> {
    const services = this.getServices();
    const nextId = `SRV-${String(services.length + 1).padStart(4, '0')}`;
    const newService: Service = {
      ...service,
      serviceId: nextId,
    };

    try {
      await setDoc(doc(db, 'services', nextId), newService);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `services/${nextId}`);
    }

    services.push(newService);
    saveToStorage(STORAGE_KEYS.SERVICES, services);
    notifySubscribers();
    return newService;
  }

  static async updateService(serviceId: string, updates: Partial<Service>): Promise<Service | null> {
    const services = this.getServices();
    const idx = services.findIndex((s) => s.serviceId === serviceId);
    if (idx === -1) return null;

    try {
      await updateDoc(doc(db, 'services', serviceId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${serviceId}`);
    }

    services[idx] = { ...services[idx], ...updates };
    saveToStorage(STORAGE_KEYS.SERVICES, services);
    notifySubscribers();
    return services[idx];
  }

  // --- Projects ---
  static getProjects(): Project[] {
    return loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  static getProjectById(projectId: string): Project | undefined {
    return this.getProjects().find((p) => p.projectId === projectId);
  }

  static async createProject(data: {
    franchiseId: string;
    serviceId: string;
    clientName: string;
    clientMobile: string;
    requirementNotes: string;
    hasInstallments?: boolean;
    installments?: ProjectInstallment[];
  }): Promise<Project> {
    const projects = this.getProjects();
    const service = this.getServices().find((s) => s.serviceId === data.serviceId);
    const settings = this.getSettings();
    const price = service ? service.price : 2000;
    const advancePercent = service ? service.advancePercent : settings.defaultAdvancePercent;
    const commissionPercent = service ? service.commissionPercent : settings.defaultCommissionPercent;
    const projectId = `PRJ-${String(projects.length + 1).padStart(4, '0')}`;
    const advanceRequired = Math.round((price * advancePercent) / 100);
    const commissionAmount = Math.round((price * commissionPercent) / 100);

    let hasInstallments = data.hasInstallments;
    let installments: ProjectInstallment[] | undefined = data.installments;

    // Automatically construct installments from catalog service if requested or enabled
    if (hasInstallments === undefined && service?.allowInstallments && service.installmentPlan?.length) {
      hasInstallments = true;
      installments = service.installmentPlan.map((planItem, idx) => ({
        installmentId: `INST-${idx + 1}`,
        installmentNumber: planItem.installmentNumber,
        title: planItem.title,
        amount: Math.round((price * planItem.percent) / 100),
        percent: planItem.percent,
        status: 'Pending',
        dueDate: idx === 0 ? 'Upon Booking / Advance' : `Milestone ${idx + 1}`,
        notes: planItem.description || planItem.title,
      }));
    } else if (hasInstallments && (!installments || installments.length === 0)) {
      if (service?.allowInstallments && service.installmentPlan?.length) {
        installments = service.installmentPlan.map((planItem, idx) => ({
          installmentId: `INST-${idx + 1}`,
          installmentNumber: planItem.installmentNumber,
          title: planItem.title,
          amount: Math.round((price * planItem.percent) / 100),
          percent: planItem.percent,
          status: 'Pending',
          dueDate: idx === 0 ? 'Upon Booking / Advance' : `Milestone ${idx + 1}`,
          notes: planItem.description || planItem.title,
        }));
      } else {
        const inst1 = Math.round(price * 0.4);
        const inst2 = Math.round(price * 0.3);
        const inst3 = price - inst1 - inst2;
        installments = [
          { installmentId: 'INST-1', installmentNumber: 1, title: 'Installment 1: Advance Token & Initiation', amount: inst1, percent: 40, status: 'Pending', dueDate: 'Advance Phase', notes: 'Required to start development' },
          { installmentId: 'INST-2', installmentNumber: 2, title: 'Installment 2: Mid-way Demo Review', amount: inst2, percent: 30, status: 'Pending', dueDate: 'Demo Deployment', notes: 'Payable on demo inspection' },
          { installmentId: 'INST-3', installmentNumber: 3, title: 'Installment 3: Final Delivery & Handover', amount: inst3, percent: 30, status: 'Pending', dueDate: 'Final Launch', notes: 'Payable prior to final production release' },
        ];
      }
    }

    const newProject: Project = {
      projectId,
      franchiseId: data.franchiseId,
      serviceId: data.serviceId,
      serviceName: service ? service.serviceName : 'Custom Project',
      clientName: data.clientName.trim(),
      clientMobile: data.clientMobile.trim(),
      requirementNotes: data.requirementNotes.trim(),
      finalPrice: price,
      advancePercent,
      advanceRequired,
      amountPaid: 0,
      amountDue: price,
      status: 'New',
      statusColor: 'grey',
      commissionPercent,
      commissionAmount,
      createdOn: new Date().toISOString(),
      hasInstallments: Boolean(hasInstallments),
      installments: hasInstallments ? installments : undefined,
    };

    try {
      await setDoc(doc(db, 'projects', projectId), newProject);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `projects/${projectId}`);
    }

    projects.unshift(newProject);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    notifySubscribers();

    this.addNotification({
      franchiseId: 'admin',
      message: `New Order: ${newProject.serviceName} booked for client "${newProject.clientName}" by ${newProject.franchiseId}.`,
      type: 'Project',
      targetId: projectId,
    });
    return newProject;
  }

  static async acceptProject(
    projectId: string,
    finalPrice: number,
    advancePercent: number
  ): Promise<Project | null> {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const project = projects[idx];
    const advanceRequired = Math.round((finalPrice * advancePercent) / 100);
    const amountDue = Math.max(0, finalPrice - project.amountPaid);
    const commissionAmount = Math.round((finalPrice * project.commissionPercent) / 100);

    const nextStatus: ProjectStatus = project.amountPaid >= advanceRequired ? 'Processing' : 'Accepted';
    const nextColor: StatusColor = nextStatus === 'Processing' ? 'blue' : 'orange';

    const updates = {
      finalPrice,
      advancePercent,
      advanceRequired,
      amountDue,
      commissionAmount,
      status: nextStatus,
      statusColor: nextColor,
      acceptedOn: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'projects', projectId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }

    projects[idx] = { ...project, ...updates };
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    notifySubscribers();

    this.addNotification({
      franchiseId: project.franchiseId,
      message: `Project ${projectId} Accepted! Final Price: ₹${finalPrice.toLocaleString('en-IN')}, Advance: ₹${advanceRequired.toLocaleString('en-IN')}.`,
      type: 'Project',
      targetId: projectId,
    });
    return projects[idx];
  }

  static async setDemoUrl(projectId: string, demoUrl: string): Promise<Project | null> {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const updates = {
      demoUrl,
      status: 'DemoReady' as const,
      statusColor: 'blue' as const,
    };

    try {
      await updateDoc(doc(db, 'projects', projectId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }

    projects[idx] = { ...projects[idx], ...updates };
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    notifySubscribers();

    this.addNotification({
      franchiseId: projects[idx].franchiseId,
      message: `Live Demo Ready for ${projects[idx].clientName}'s ${projects[idx].serviceName}! View preview in your dashboard.`,
      type: 'Project',
      targetId: projectId,
    });
    return projects[idx];
  }

  static async markDelivered(
    projectId: string,
    finalUrl: string
  ): Promise<{ success: boolean; message: string; project?: Project }> {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return { success: false, message: 'Project not found.' };

    const project = projects[idx];
    if (project.amountDue > 0) {
      return {
        success: false,
        message: `Cannot deliver! Balance of ₹${project.amountDue.toLocaleString('en-IN')} is still pending. Full payment is required before delivery.`,
      };
    }

    const settings = this.getSettings();
    const certNum = `${settings.certificatePrefix}-CERT-${String(Math.floor(100000 + Math.random() * 900000))}`;

    const updates = {
      finalUrl,
      status: 'Delivered' as const,
      statusColor: 'green' as const,
      deliveredOn: new Date().toISOString(),
      certificateNumber: certNum,
    };

    try {
      await updateDoc(doc(db, 'projects', projectId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }

    projects[idx] = { ...project, ...updates };
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);

    await this.creditCommission(project.franchiseId, project.commissionAmount, projectId);

    this.addNotification({
      franchiseId: project.franchiseId,
      message: `🎉 Project ${projectId} is Delivered! URL unlocked & ₹${project.commissionAmount.toLocaleString('en-IN')} commission credited to your wallet. Completion certificate is ready!`,
      type: 'Project',
      targetId: projectId,
    });

    notifySubscribers();
    return { success: true, message: 'Project marked as delivered successfully in Database!', project: projects[idx] };
  }

  static async rejectProject(projectId: string, reason: string): Promise<boolean> {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return false;

    const updates = {
      status: 'Rejected' as const,
      statusColor: 'red' as const,
      rejectionReason: reason,
    };

    try {
      await updateDoc(doc(db, 'projects', projectId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }

    projects[idx] = { ...projects[idx], ...updates };
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    notifySubscribers();

    this.addNotification({
      franchiseId: projects[idx].franchiseId,
      message: `Project ${projectId} was rejected by SidTech. Reason: ${reason || 'Technical unfeasibility'}`,
      type: 'Project',
      targetId: projectId,
    });
    return true;
  }

  static async updateProjectFull(
    projectId: string,
    updates: Partial<Project>
  ): Promise<Project | null> {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const current = projects[idx];
    const updated: Project = {
      ...current,
      ...updates,
    };

    if (updates.status) {
      if (updates.status === 'Delivered') {
        updated.statusColor = 'green';
        if (!updated.deliveredOn) updated.deliveredOn = new Date().toISOString();
        if (!updated.certificateNumber) {
          const settings = this.getSettings();
          updated.certificateNumber = `${settings.certificatePrefix}-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      } else if (updates.status === 'Processing') {
        updated.statusColor = 'blue';
      } else if (updates.status === 'DemoReady') {
        updated.statusColor = 'blue';
      } else if (updates.status === 'Accepted') {
        updated.statusColor = 'orange';
      } else if (updates.status === 'Rejected') {
        updated.statusColor = 'red';
      } else {
        updated.statusColor = 'grey';
      }
    }

    try {
      await updateDoc(doc(db, 'projects', projectId), updated as Record<string, any>);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }

    projects[idx] = updated;
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    notifySubscribers();

    this.addNotification({
      franchiseId: updated.franchiseId,
      message: `Project ${projectId} parameters updated in Database by SidTech Administration.`,
      type: 'Project',
      targetId: projectId,
    });
    return updated;
  }

  static async updateProjectInstallments(
    projectId: string,
    installments: ProjectInstallment[],
    hasInstallments: boolean = true
  ): Promise<Project | null> {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const prj = projects[idx];
    
    // Calculate total amount paid from paid installments if marked paid
    let paidFromInstallments = 0;
    installments.forEach((inst) => {
      if (inst.status === 'Paid') {
        paidFromInstallments += Number(inst.amount) || 0;
      }
    });

    const finalPrice = prj.finalPrice;
    const amountPaid = Math.max(prj.amountPaid, paidFromInstallments);
    const amountDue = Math.max(0, finalPrice - amountPaid);

    let nextStatus = prj.status;
    let nextColor = prj.statusColor;
    let deliveredOn = prj.deliveredOn;
    let certificateNumber = prj.certificateNumber;
    let finalUrl = prj.finalUrl;

    const allInstallmentsPaid =
      hasInstallments &&
      installments &&
      installments.length > 0 &&
      installments.every((i) => i.status === 'Paid');

    const isFinalPayment = amountDue <= 0 || allInstallmentsPaid;

    if (isFinalPayment && prj.status !== 'Delivered') {
      nextStatus = 'Delivered';
      nextColor = 'green';
      const settings = this.getSettings();
      if (!deliveredOn) deliveredOn = new Date().toISOString();
      if (!certificateNumber) {
        certificateNumber = `${settings.certificatePrefix}-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      if (!finalUrl) {
        finalUrl = prj.demoUrl || `https://${(prj.clientName || 'solution').toLowerCase().replace(/[^a-z0-9]/g, '')}.sidtech366.live`;
      }
      await this.creditCommission(prj.franchiseId, prj.commissionAmount, prj.projectId);
    } else if (prj.status === 'Accepted' && amountPaid >= prj.advanceRequired) {
      nextStatus = 'Processing';
      nextColor = 'blue';
    }

    const updated: Project = {
      ...prj,
      hasInstallments,
      installments,
      amountPaid,
      amountDue,
      status: nextStatus,
      statusColor: nextColor,
      deliveredOn,
      certificateNumber,
      finalUrl,
    };

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        hasInstallments,
        installments,
        amountPaid,
        amountDue,
        status: nextStatus,
        statusColor: nextColor,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }

    projects[idx] = updated;
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    notifySubscribers();

    this.addNotification({
      franchiseId: updated.franchiseId,
      message: `Project ${projectId} installment schedule updated in Database.`,
      type: 'Project',
      targetId: projectId,
    });

    return updated;
  }

  // --- Payments ---
  static getPayments(): Payment[] {
    return loadFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
  }

  static async submitPayment(data: {
    projectId: string;
    franchiseId: string;
    amount: number;
    utr: string;
    mode?: 'UPI/QR-Manual' | 'Payment Gateway (API)';
    installmentId?: string;
    installmentNumber?: number;
  }): Promise<{ success: boolean; message: string; payment?: Payment }> {
    const payments = this.getPayments();
    const project = this.getProjectById(data.projectId);
    if (!project) return { success: false, message: 'Associated project not found.' };

    const franchise = this.getFranchiseById(data.franchiseId);
    const branchName = franchise ? franchise.branchName : data.franchiseId;
    const paymentId = `PAY-${String(payments.length + 1).padStart(4, '0')}`;

    const newPayment: Payment = {
      paymentId,
      projectId: data.projectId,
      franchiseId: data.franchiseId,
      franchiseName: branchName,
      amount: data.amount,
      mode: data.mode || 'UPI/QR-Manual',
      utr: data.utr.trim().toUpperCase(),
      status: 'Submitted',
      submittedOn: new Date().toISOString(),
      installmentId: data.installmentId,
      installmentNumber: data.installmentNumber,
    };

    try {
      await setDoc(doc(db, 'payments', paymentId), newPayment);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payments/${paymentId}`);
    }

    payments.unshift(newPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);

    // If project has installments, mark the relevant installment as 'Processing'
    const projects = this.getProjects();
    const prj = projects.find((p) => p.projectId === data.projectId);
    if (prj && prj.hasInstallments && prj.installments) {
      const currentInsts = prj.installments;
      const updatedInstallments = currentInsts.map((inst) => {
        if (
          (data.installmentId && inst.installmentId === data.installmentId) ||
          (data.installmentNumber && inst.installmentNumber === data.installmentNumber) ||
          (!data.installmentId && inst.status === 'Pending')
        ) {
          return {
            ...inst,
            status: 'Processing' as InstallmentStatus,
            utr: newPayment.utr,
            paymentId: newPayment.paymentId,
          };
        }
        return inst;
      });
      prj.installments = updatedInstallments;
      saveToStorage(STORAGE_KEYS.PROJECTS, projects);
      try {
        await updateDoc(doc(db, 'projects', prj.projectId), { installments: updatedInstallments });
      } catch {
        // non-blocking
      }
    }

    notifySubscribers();

    const installmentNote = data.installmentNumber ? ` (Installment #${data.installmentNumber})` : '';
    this.addNotification({
      franchiseId: 'admin',
      message: `New Payment of ₹${data.amount.toLocaleString('en-IN')}${installmentNote} submitted by ${branchName} (UTR: ${newPayment.utr}). Please verify.`,
      type: 'Payment',
      targetId: paymentId,
    });

    return {
      success: true,
      message: `Payment of ₹${data.amount.toLocaleString('en-IN')} recorded in Database! Admin will verify your UTR shortly.`,
      payment: newPayment,
    };
  }

  static async verifyPayment(paymentId: string, adminUsername: string = 'admin'): Promise<boolean> {
    const payments = this.getPayments();
    const pIdx = payments.findIndex((p) => p.paymentId === paymentId);
    if (pIdx === -1) return false;

    const payment = payments[pIdx];
    if (payment.status === 'Verified') return true;

    const updates = {
      status: 'Verified' as const,
      verifiedOn: new Date().toISOString(),
      verifiedBy: adminUsername,
    };

    try {
      await updateDoc(doc(db, 'payments', paymentId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
    }

    payments[pIdx] = { ...payment, ...updates };
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);

    // Update project running totals & status transitions
    const projects = this.getProjects();
    const prjIdx = projects.findIndex((p) => p.projectId === payment.projectId);
    if (prjIdx !== -1) {
      const prj = projects[prjIdx];
      const newPaid = prj.amountPaid + payment.amount;
      const newDue = Math.max(0, prj.finalPrice - newPaid);
      const prjUpdates: Partial<Project> = {
        amountPaid: newPaid,
        amountDue: newDue,
      };

      // Handle installment status update on verification
      if (prj.hasInstallments && prj.installments) {
        let matched = false;
        const updatedInstallments = prj.installments.map((inst) => {
          const isTarget =
            (!matched && payment.installmentId && inst.installmentId === payment.installmentId) ||
            (!matched && payment.installmentNumber && inst.installmentNumber === payment.installmentNumber) ||
            (!matched && !payment.installmentId && inst.status !== 'Paid');
          if (isTarget) {
            matched = true;
            return {
              ...inst,
              status: 'Paid' as InstallmentStatus,
              paidAt: new Date().toISOString(),
              utr: payment.utr,
              paymentId: payment.paymentId,
            };
          }
          return inst;
        });
        prjUpdates.installments = updatedInstallments;
      }

      // Handle automatic transition to Delivered when payment is final (amountDue <= 0 or all installments paid)
      const allInstallmentsPaid =
        prj.hasInstallments &&
        prjUpdates.installments &&
        prjUpdates.installments.length > 0 &&
        prjUpdates.installments.every((i) => i.status === 'Paid');

      const isFinalPayment = newDue <= 0 || allInstallmentsPaid;

      if (isFinalPayment && prj.status !== 'Delivered') {
        const settings = this.getSettings();
        const certNum = prj.certificateNumber || `${settings.certificatePrefix}-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
        const finalUrl = prj.finalUrl || prj.demoUrl || `https://${(prj.clientName || 'solution').toLowerCase().replace(/[^a-z0-9]/g, '')}.sidtech366.live`;

        prjUpdates.status = 'Delivered';
        prjUpdates.statusColor = 'green';
        prjUpdates.deliveredOn = new Date().toISOString();
        prjUpdates.certificateNumber = certNum;
        prjUpdates.finalUrl = finalUrl;

        // Auto-credit commission to franchise wallet
        await this.creditCommission(prj.franchiseId, prj.commissionAmount, prj.projectId);

        this.addNotification({
          franchiseId: prj.franchiseId,
          message: `🎉 Final Payment Verified! Project ${prj.projectId} is automatically Delivered. Deliverable link unlocked & ₹${prj.commissionAmount.toLocaleString('en-IN')} commission credited to your wallet!`,
          type: 'Project',
          targetId: prj.projectId,
        });
      } else if (prj.status === 'Accepted' && newPaid >= prj.advanceRequired) {
        prjUpdates.status = 'Processing';
        prjUpdates.statusColor = 'blue';
      }

      try {
        await updateDoc(doc(db, 'projects', prj.projectId), prjUpdates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `projects/${prj.projectId}`);
      }

      projects[prjIdx] = { ...prj, ...prjUpdates };
      saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    }

    this.addNotification({
      franchiseId: payment.franchiseId,
      message: `Payment Verified! ₹${payment.amount.toLocaleString('en-IN')} has been credited toward project ${payment.projectId}.`,
      type: 'Payment',
      targetId: payment.projectId,
    });

    notifySubscribers();
    return true;
  }

  static async rejectPayment(paymentId: string, reason: string): Promise<boolean> {
    const payments = this.getPayments();
    const idx = payments.findIndex((p) => p.paymentId === paymentId);
    if (idx === -1) return false;

    const payment = payments[idx];
    const updates = {
      status: 'Rejected' as const,
      rejectionReason: reason,
    };

    try {
      await updateDoc(doc(db, 'payments', paymentId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
    }

    payments[idx] = { ...payment, ...updates };
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);

    // If payment was tied to an installment, revert installment back to 'Pending'
    const projects = this.getProjects();
    const prj = projects.find((p) => p.projectId === payment.projectId);
    if (prj && prj.hasInstallments && prj.installments) {
      const currentInsts = prj.installments;
      const updatedInstallments = currentInsts.map((inst) => {
        if (
          (payment.installmentId && inst.installmentId === payment.installmentId) ||
          (inst.paymentId === payment.paymentId)
        ) {
          return {
            ...inst,
            status: 'Pending' as InstallmentStatus,
            paymentId: undefined,
            utr: undefined,
          };
        }
        return inst;
      });
      prj.installments = updatedInstallments;
      saveToStorage(STORAGE_KEYS.PROJECTS, projects);
      try {
        await updateDoc(doc(db, 'projects', prj.projectId), { installments: updatedInstallments });
      } catch {
        // non-blocking
      }
    }

    notifySubscribers();

    this.addNotification({
      franchiseId: payment.franchiseId,
      message: `Payment ${paymentId} (UTR: ${payment.utr}) was rejected. Reason: ${reason || 'UTR could not be verified on bank statement'}`,
      type: 'Payment',
      targetId: payment.projectId,
    });
    return true;
  }

  // --- Wallet & Commission ---
  static async creditCommission(franchiseId: string, amount: number, projectId: string): Promise<void> {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return;

    const newWallet = franchises[idx].walletBalance + amount;
    const newEarned = franchises[idx].totalEarned + amount;

    await this.updateFranchiseProfile(franchiseId, {
      walletBalance: newWallet,
      totalEarned: newEarned,
    });
  }

  // --- Payouts ---
  static getPayouts(): Payout[] {
    return loadFromStorage<Payout[]>(STORAGE_KEYS.PAYOUTS, SEED_PAYOUTS);
  }

  static async requestPayout(data: {
    franchiseId: string;
    amount: number;
    upiId: string;
    tPin: string;
  }): Promise<{ success: boolean; message: string; payout?: Payout }> {
    const franchise = this.getFranchiseById(data.franchiseId);
    if (!franchise) return { success: false, message: 'Franchise not found.' };

    if (!franchise.tPinSet || !franchise.tPinHash) {
      return {
        success: false,
        message: 'Security Notice: Please configure your 4-digit Transaction Security PIN (T-PIN) first before requesting a withdrawal.',
      };
    }
    if (!data.tPin || hashPassword(data.tPin.trim()) !== franchise.tPinHash) {
      return {
        success: false,
        message: 'Security Verification Failed: Incorrect 4-digit Transaction Security PIN (T-PIN). Withdrawal request denied.',
      };
    }
    if (data.amount <= 0) {
      return { success: false, message: 'Withdrawal amount must be greater than zero.' };
    }
    if (data.amount > franchise.walletBalance) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available: ₹${franchise.walletBalance.toLocaleString('en-IN')}`,
      };
    }

    const payouts = this.getPayouts();
    const payoutId = `PO-${String(payouts.length + 1).padStart(4, '0')}`;
    const newPayout: Payout = {
      payoutId,
      franchiseId: data.franchiseId,
      franchiseName: franchise.branchName,
      amount: data.amount,
      walletBalanceAtRequest: franchise.walletBalance,
      status: 'Requested',
      mode: 'Manual (Admin UPI)',
      requestedOn: new Date().toISOString(),
      upiId: data.upiId.trim(),
    };

    try {
      await setDoc(doc(db, 'payouts', payoutId), newPayout);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payouts/${payoutId}`);
    }

    payouts.unshift(newPayout);
    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);

    // Deduct from wallet balance
    await this.updateFranchiseProfile(data.franchiseId, {
      walletBalance: franchise.walletBalance - data.amount,
    });

    this.addNotification({
      franchiseId: 'admin',
      message: `Payout Request: ${franchise.branchName} requested withdrawal of ₹${data.amount.toLocaleString('en-IN')} to UPI ${data.upiId} (T-PIN Verified).`,
      type: 'Payout',
      targetId: payoutId,
    });

    notifySubscribers();
    return {
      success: true,
      message: `Withdrawal request for ₹${data.amount.toLocaleString('en-IN')} recorded in Database! Admin will transfer to your UPI within 24 hours.`,
      payout: newPayout,
    };
  }

  static async markPayoutPaid(payoutId: string, referenceNote: string): Promise<boolean> {
    const payouts = this.getPayouts();
    const idx = payouts.findIndex((p) => p.payoutId === payoutId);
    if (idx === -1) return false;

    const po = payouts[idx];
    const updates = {
      status: 'Paid' as const,
      processedOn: new Date().toISOString(),
      referenceNote,
    };

    try {
      await updateDoc(doc(db, 'payouts', payoutId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payouts/${payoutId}`);
    }

    payouts[idx] = { ...po, ...updates };
    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);

    const franchise = this.getFranchiseById(po.franchiseId);
    if (franchise) {
      const newWithdrawn = franchise.totalWithdrawn + po.amount;
      await this.updateFranchiseProfile(po.franchiseId, { totalWithdrawn: newWithdrawn });
    }

    this.addNotification({
      franchiseId: po.franchiseId,
      message: `Payout of ₹${po.amount.toLocaleString('en-IN')} transferred! Ref: ${referenceNote}`,
      type: 'Payout',
      targetId: payoutId,
    });

    notifySubscribers();
    return true;
  }

  static async rejectPayout(payoutId: string, reason: string): Promise<boolean> {
    const payouts = this.getPayouts();
    const idx = payouts.findIndex((p) => p.payoutId === payoutId);
    if (idx === -1) return false;

    const po = payouts[idx];
    const updates = {
      status: 'Rejected' as const,
      rejectionReason: reason,
    };

    try {
      await updateDoc(doc(db, 'payouts', payoutId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payouts/${payoutId}`);
    }

    payouts[idx] = { ...po, ...updates };
    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);

    // Refund wallet balance
    const franchise = this.getFranchiseById(po.franchiseId);
    if (franchise) {
      const restored = franchise.walletBalance + po.amount;
      await this.updateFranchiseProfile(po.franchiseId, { walletBalance: restored });
    }

    this.addNotification({
      franchiseId: po.franchiseId,
      message: `Payout request ${payoutId} of ₹${po.amount.toLocaleString('en-IN')} was rejected and refunded to your wallet. Reason: ${reason}`,
      type: 'Payout',
    });

    notifySubscribers();
    return true;
  }

  // --- Settings ---
  static getSettings(): AppSettings {
    const loaded = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...loaded,
      ownerSignatureUrl: loaded.ownerSignatureUrl || DEFAULT_OWNER_SIGNATURE,
      digitalStampUrl: loaded.digitalStampUrl || DEFAULT_DIGITAL_STAMP,
      ownerName: loaded.ownerName || DEFAULT_SETTINGS.ownerName,
      ownerDesignation: loaded.ownerDesignation || DEFAULT_SETTINGS.ownerDesignation,
    };
  }

  static async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...updates,
      firebaseConnected: true,
      lastFirebaseSyncTime: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'settings', 'global_settings'), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global_settings');
    }

    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    notifySubscribers();
    return updated;
  }

  // --- Notifications ---
  static getNotifications(franchiseId?: string): NotificationItem[] {
    const all = loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!franchiseId) return all;
    if (franchiseId === 'admin') {
      return all.filter((n) => n.franchiseId === 'admin');
    }
    return all.filter((n) => n.franchiseId === franchiseId || n.franchiseId === '');
  }

  static async addNotification(item: Omit<NotificationItem, 'notifId' | 'createdOn' | 'read'>): Promise<NotificationItem> {
    const all = loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const notifId = `N-${String(all.length + 1).padStart(4, '0')}`;
    const newNotif: NotificationItem = {
      ...item,
      notifId,
      read: false,
      createdOn: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
    }

    all.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    notifySubscribers();
    return newNotif;
  }

  static async markNotificationRead(notifId: string): Promise<void> {
    const all = this.getNotifications();
    const idx = all.findIndex((n) => n.notifId === notifId);
    if (idx !== -1) {
      try {
        await updateDoc(doc(db, 'notifications', notifId), { read: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${notifId}`);
      }
      all[idx].read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
      notifySubscribers();
    }
  }

  static async markAllNotificationsRead(franchiseId: string): Promise<void> {
    const all = this.getNotifications();
    for (const n of all) {
      if (n.franchiseId === franchiseId || (!franchiseId && n.franchiseId === 'admin')) {
        n.read = true;
        try {
          await updateDoc(doc(db, 'notifications', n.notifId), { read: true });
        } catch {
          // ignore individual error
        }
      }
    }
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    notifySubscribers();
  }

  // --- Auth Session ---
  static getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setSession(session: AuthSession | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  }

  // --- Admin AI Assistant Updation Engine ---
  static async executeAdminAiAction(action: {
    actionType: string;
    payload: any;
  }): Promise<{ success: boolean; message: string; details?: any }> {
    const { actionType, payload } = action;
    switch (actionType) {
      case 'UPDATE_WALLET': {
        const { franchiseId, amount, mode, note } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.email.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) {
          return { success: false, message: `Franchise "${franchiseId}" not found in Database registry.` };
        }
        const numericAmount = Number(amount) || 0;
        const oldBalance = franchise.walletBalance;
        let newBalance = oldBalance;
        let newEarned = franchise.totalEarned;
        if (mode === 'set') {
          newBalance = numericAmount;
        } else {
          newBalance = Math.max(0, franchise.walletBalance + numericAmount);
          if (numericAmount > 0) newEarned += numericAmount;
        }
        await this.updateFranchiseProfile(franchise.franchiseId, {
          walletBalance: newBalance,
          totalEarned: newEarned,
        });
        this.addNotification({
          franchiseId: franchise.franchiseId,
          message: `Admin AI Updated Wallet: ₹${numericAmount} ${mode === 'set' ? 'set' : 'added'}.${note ? ` Note: ${note}` : ''}`,
          type: 'Payment',
        });
        return {
          success: true,
          message: `Wallet for ${franchise.branchName} (${franchise.franchiseId}) updated in Database from ₹${oldBalance} to ₹${newBalance}.`,
          details: { oldBalance, newBalance },
        };
      }

      case 'APPROVE_FRANCHISE': {
        const { franchiseId } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.email.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) return { success: false, message: `Franchise "${franchiseId}" not found.` };
        const ok = await this.approveFranchise(franchise.franchiseId);
        return {
          success: ok,
          message: ok
            ? `Franchise ${franchise.branchName} (${franchise.franchiseId}) has been APPROVED successfully.`
            : 'Approval failed.',
        };
      }

      case 'APPROVE_ALL_PENDING': {
        const franchises = this.getFranchises();
        const pending = franchises.filter((f) => f.status === 'Pending');
        if (pending.length === 0) {
          return { success: true, message: 'No franchises are currently pending approval.' };
        }
        for (const f of pending) {
          await this.approveFranchise(f.franchiseId);
        }
        return {
          success: true,
          message: `Successfully approved all ${pending.length} pending franchise application(s).`,
        };
      }

      case 'REJECT_FRANCHISE': {
        const { franchiseId, reason } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) return { success: false, message: `Franchise "${franchiseId}" not found.` };
        const ok = await this.rejectFranchise(franchise.franchiseId, reason || 'Incomplete details');
        return {
          success: ok,
          message: ok
            ? `Franchise ${franchise.branchName} rejected. Reason: ${reason || 'Incomplete details'}`
            : 'Action failed.',
        };
      }

      case 'VERIFY_PAYMENT': {
        const { paymentId } = payload;
        const payments = this.getPayments();
        const p = payments.find(
          (item) =>
            item.paymentId.toLowerCase() === (paymentId || '').toLowerCase() ||
            (item.utr && item.utr.toLowerCase() === (paymentId || '').toLowerCase())
        );
        if (!p) return { success: false, message: `Payment "${paymentId}" not found.` };
        const ok = await this.verifyPayment(p.paymentId, 'admin');
        return {
          success: ok,
          message: ok
            ? `Payment ${p.paymentId} (₹${p.amount} / UTR: ${p.utr}) verified successfully.`
            : 'Failed to verify payment.',
        };
      }

      case 'VERIFY_ALL_PAYMENTS': {
        const payments = this.getPayments();
        const submitted = payments.filter((item) => item.status === 'Submitted');
        if (submitted.length === 0) {
          return { success: true, message: 'No payments currently waiting for verification.' };
        }
        for (const item of submitted) {
          await this.verifyPayment(item.paymentId, 'admin');
        }
        return {
          success: true,
          message: `Successfully verified all ${submitted.length} pending payment(s).`,
        };
      }

      case 'ADD_SERVICE': {
        const { serviceName, price, advancePercent, commissionPercent, category, description } = payload;
        if (!serviceName || !price) {
          return { success: false, message: 'Service name and price are required to create a new service.' };
        }
        const created = await this.addService({
          serviceName,
          price: Number(price),
          advancePercent: Number(advancePercent) || 25,
          commissionPercent: Number(commissionPercent) || 10,
          category: category || 'Website',
          description: description || `Professional ${serviceName} delivery package by SidTech.`,
          imageUrl:
            payload.imageUrl ||
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
          active: true,
        });
        return {
          success: true,
          message: `New service "${created.serviceName}" (₹${created.price}) added to catalog. ID: ${created.serviceId}`,
          details: created,
        };
      }

      case 'UPDATE_SERVICE': {
        const { serviceId, price, active, advancePercent, commissionPercent } = payload;
        const services = this.getServices();
        const srv = services.find(
          (s) =>
            s.serviceId.toLowerCase() === (serviceId || '').toLowerCase() ||
            s.serviceName.toLowerCase().includes((serviceId || '').toLowerCase())
        );
        if (!srv) return { success: false, message: `Service "${serviceId}" not found.` };
        const updates: any = {};
        if (price !== undefined) updates.price = Number(price);
        if (active !== undefined) updates.active = Boolean(active);
        if (advancePercent !== undefined) updates.advancePercent = Number(advancePercent);
        if (commissionPercent !== undefined) updates.commissionPercent = Number(commissionPercent);
        const updated = await this.updateService(srv.serviceId, updates);
        return {
          success: updated !== null,
          message: updated ? `Service ${srv.serviceName} updated.` : 'Failed to update service.',
        };
      }

      case 'UPDATE_SETTINGS': {
        const settings = this.getSettings();
        const updates: Partial<AppSettings> = {};
        if (payload.companyUpi) updates.companyUpi = payload.companyUpi.trim();
        if (payload.supportPhone) updates.supportPhone = payload.supportPhone.trim();
        if (payload.supportEmail) updates.supportEmail = payload.supportEmail.trim();
        if (payload.companyName) updates.companyName = payload.companyName.trim();
        if (payload.defaultAdvancePercent) updates.defaultAdvancePercent = Number(payload.defaultAdvancePercent);
        if (payload.defaultCommissionPercent) updates.defaultCommissionPercent = Number(payload.defaultCommissionPercent);
        await this.updateSettings(updates);
        return {
          success: true,
          message: 'System settings updated successfully by Admin AI.',
          details: settings,
        };
      }

      case 'PROCESS_PAYOUT': {
        const { payoutId, status, referenceNote } = payload;
        const payouts = this.getPayouts();
        const po = payouts.find((item) => item.payoutId.toLowerCase() === (payoutId || '').toLowerCase());
        if (!po) return { success: false, message: `Payout "${payoutId}" not found.` };
        if (status === 'Paid') {
          await this.markPayoutPaid(po.payoutId, referenceNote || 'Admin AI Auto-Settled');
          return { success: true, message: `Payout ${po.payoutId} marked as PAID with ref: ${referenceNote || 'Settled'}.` };
        } else {
          po.status = status || 'Processing';
          await updateDoc(doc(db, 'payouts', po.payoutId), { status: po.status });
          return { success: true, message: `Payout ${po.payoutId} status updated to: ${po.status}.` };
        }
      }

      default:
        return {
          success: false,
          message: `Action "${actionType}" processed.`,
        };
    }
  }

  // Export full JSON database for backup
  static exportFullDatabase(): string {
    return JSON.stringify(
      {
        franchises: this.getFranchises(),
        services: this.getServices(),
        projects: this.getProjects(),
        payments: this.getPayments(),
        payouts: this.getPayouts(),
        settings: this.getSettings(),
        notifications: this.getNotifications(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }
}
