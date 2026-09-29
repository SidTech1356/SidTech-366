import React, { useState, useEffect } from 'react';
import {
  AuthSession,
  Franchise,
  Service,
  Project,
  Payment,
  Payout,
  AppSettings,
  NotificationItem,
} from './types/database';
import { SidTechDatabase } from './services/storage';

// Common components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { IDVerificationModal } from './components/common/IDVerificationModal';
import { FirebaseLiveBanner } from './components/common/FirebaseLiveBanner';

// Public Landing
import { LandingPage } from './components/landing/LandingPage';

// Auth Modals
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { SetTPinModal } from './components/franchise/SetTPinModal';

// Franchise views
import { FranchiseOverview } from './components/franchise/FranchiseOverview';
import { FranchiseCatalog } from './components/franchise/FranchiseCatalog';
import { FranchiseProjects } from './components/franchise/FranchiseProjects';
import { FranchisePayments } from './components/franchise/FranchisePayments';
import { FranchiseWallet } from './components/franchise/FranchiseWallet';
import { FranchiseIDCard } from './components/franchise/FranchiseIDCard';
import { FranchiseCertificates } from './components/franchise/FranchiseCertificates';
import { FranchiseProfile } from './components/franchise/FranchiseProfile';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAICopilot } from './components/admin/AdminAICopilot';
import { AdminFranchiseApprovals } from './components/admin/AdminFranchiseApprovals';
import { AdminFranchiseList } from './components/admin/AdminFranchiseList';
import { AdminServiceCatalog } from './components/admin/AdminServiceCatalog';
import { AdminProjectsManager } from './components/admin/AdminProjectsManager';
import { AdminPaymentsVerification } from './components/admin/AdminPaymentsVerification';
import { AdminPaymentSettings } from './components/admin/AdminPaymentSettings';
import { AdminPayoutsManager } from './components/admin/AdminPayoutsManager';
import { AdminFirestoreViewer } from './components/admin/AdminFirestoreViewer';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => SidTechDatabase.getSession());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [filterFranchiseId, setFilterFranchiseId] = useState<string | undefined>();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyQuery, setVerifyQuery] = useState<string>('');

  // Database reactive state
  const [franchises, setFranchises] = useState<Franchise[]>(() => SidTechDatabase.getFranchises());
  const [services, setServices] = useState<Service[]>(() => SidTechDatabase.getServices());
  const [projects, setProjects] = useState<Project[]>(() => SidTechDatabase.getProjects());
  const [payments, setPayments] = useState<Payment[]>(() => SidTechDatabase.getPayments());
  const [payouts, setPayouts] = useState<Payout[]>(() => SidTechDatabase.getPayouts());
  const [settings, setSettings] = useState<AppSettings>(() => SidTechDatabase.getSettings());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => SidTechDatabase.getNotifications());

  const reloadData = () => {
    const f = SidTechDatabase.getFranchises();
    const s = SidTechDatabase.getServices();
    const p = SidTechDatabase.getProjects();
    const py = SidTechDatabase.getPayments();
    const po = SidTechDatabase.getPayouts();
    const st = SidTechDatabase.getSettings();
    const n = SidTechDatabase.getNotifications();

    setFranchises(f);
    setServices(s);
    setProjects(p);
    setPayments(py);
    setPayouts(po);
    setSettings(st);
    setNotifications(n);

    // Update active franchise in session if needed
    const currentSession = SidTechDatabase.getSession();
    if (currentSession?.role === 'franchise' && currentSession.franchise) {
      const refreshed = f.find((item) => item.franchiseId === currentSession.franchise?.franchiseId);
      if (refreshed) {
        currentSession.franchise = refreshed;
        setSession({ ...currentSession });
      }
    }
  };

  useEffect(() => {
    // 1. Initial local load
    reloadData();

    // 2. Initialize Firebase Firestore and real-time listeners
    SidTechDatabase.initializeFirebaseDatabase().then(() => {
      reloadData();
    });

    // 3. Subscribe to real-time updates from Firebase
    const unsubscribe = SidTechDatabase.subscribe(() => {
      reloadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle URL hash changes (e.g. #verify?id=ST366-0001 from scanned HD QR code)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify')) {
        const match = hash.match(/[?&]id=([^&]+)/);
        const queryId = match ? decodeURIComponent(match[1]) : '';
        setVerifyQuery(queryId);
        setShowVerifyModal(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogout = () => {
    SidTechDatabase.setSession(null);
    setSession(null);
    setActiveTab('overview');
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setActiveTab('overview');
    reloadData();
  };

  const handleOpenVerify = (query?: string) => {
    setVerifyQuery(query || '');
    setShowVerifyModal(true);
  };

  // Franchise specific subsets
  const franchiseProjects = session?.franchise
    ? projects.filter((p) => p.franchiseId === session.franchise?.franchiseId)
    : [];

  const franchisePayments = session?.franchise
    ? payments.filter((p) => p.franchiseId === session.franchise?.franchiseId)
    : [];

  const franchisePayouts = session?.franchise
    ? payouts.filter((p) => p.franchiseId === session.franchise?.franchiseId)
    : [];

  // Admin counts
  const pendingApprovalsCount = franchises.filter((f) => f.status === 'Pending').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'Submitted').length;
  const pendingPayoutsCount = payouts.filter((p) => p.status === 'Requested').length;

  // Scroll to top whenever active tab changes for smooth navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Firebase Database Live Sync Status Strip (Strictly Admin Panel Only) */}
      {session?.role === 'admin' && (
        <FirebaseLiveBanner onRefreshData={reloadData} />
      )}

      {/* Top Navbar */}
      <Navbar
        session={session}
        notifications={notifications}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenRegister={() => setShowRegisterModal(true)}
        onLogout={handleLogout}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedProjectId(undefined);
          setFilterFranchiseId(undefined);
        }}
        onRefreshNotifications={reloadData}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenVerify={() => handleOpenVerify()}
      />

      {/* Main View Router */}
      {!session ? (
        /* Public Landing Page */
        <LandingPage
          services={services}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenRegister={() => setShowRegisterModal(true)}
          onOpenVerify={(q) => handleOpenVerify(q)}
        />
      ) : (
        /* Authenticated App Shell (Admin or Franchise) - Full fluid window scroll */
        <div className="flex-1 flex w-full min-w-0">
          {/* Left Sidebar */}
          <Sidebar
            session={session}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setSelectedProjectId(undefined);
              setFilterFranchiseId(undefined);
            }}
            pendingApprovalsCount={pendingApprovalsCount}
            pendingPaymentsCount={pendingPaymentsCount}
            pendingPayoutsCount={pendingPayoutsCount}
            isOpenMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 sm:pb-24">
            {/* Franchise Views */}
            {session.role === 'franchise' && session.franchise && (
              <>
                {activeTab === 'overview' && (
                  <FranchiseOverview
                    franchise={session.franchise}
                    projects={franchiseProjects}
                    onSelectTab={(tab) => setActiveTab(tab)}
                    onSelectProject={(projectId) => {
                      setSelectedProjectId(projectId);
                      setActiveTab('projects');
                    }}
                  />
                )}

                {activeTab === 'catalog' && (
                  <FranchiseCatalog
                    services={services}
                    franchiseId={session.franchise.franchiseId}
                    onProjectCreated={(projectId) => {
                      reloadData();
                      setSelectedProjectId(projectId);
                      setActiveTab('projects');
                    }}
                  />
                )}

                {activeTab === 'projects' && (
                  <FranchiseProjects
                    projects={franchiseProjects}
                    franchise={session.franchise}
                    settings={settings}
                    selectedProjectId={selectedProjectId}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'payments' && (
                  <FranchisePayments payments={franchisePayments} />
                )}

                {activeTab === 'wallet' && (
                  <FranchiseWallet
                    franchise={session.franchise}
                    projects={franchiseProjects}
                    payouts={franchisePayouts}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'idcard' && (
                  <FranchiseIDCard franchise={session.franchise} />
                )}

                {activeTab === 'certificates' && (
                  <FranchiseCertificates
                    projects={franchiseProjects}
                    franchise={session.franchise}
                  />
                )}

                {activeTab === 'profile' && (
                  <FranchiseProfile
                    franchise={session.franchise}
                    onRefresh={reloadData}
                  />
                )}
              </>
            )}

            {/* Admin Views */}
            {session.role === 'admin' && (
              <>
                <AdminAICopilot
                  currentModule={activeTab}
                  onRefresh={reloadData}
                />

                {activeTab === 'overview' && (
                  <AdminDashboard
                    franchises={franchises}
                    projects={projects}
                    payments={payments}
                    payouts={payouts}
                    notifications={notifications}
                    onSelectTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'approvals' && (
                  <AdminFranchiseApprovals
                    franchises={franchises}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'franchises' && (
                  <AdminFranchiseList
                    franchises={franchises}
                    projects={projects}
                    onRefresh={reloadData}
                    onFilterProjectsByFranchise={(fId) => {
                      setFilterFranchiseId(fId);
                      setActiveTab('projects');
                    }}
                  />
                )}

                {activeTab === 'services' && (
                  <AdminServiceCatalog
                    services={services}
                    settings={settings}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'projects' && (
                  <AdminProjectsManager
                    projects={projects}
                    franchises={franchises}
                    filterFranchiseId={filterFranchiseId}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'payments' && (
                  <AdminPaymentsVerification
                    payments={payments}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'settings' && (
                  <AdminPaymentSettings
                    settings={settings}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'payouts' && (
                  <AdminPayoutsManager
                    payouts={payouts}
                    onRefresh={reloadData}
                  />
                )}

                {activeTab === 'firestore' && (
                  <AdminFirestoreViewer onRefresh={reloadData} />
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Auth Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onOpenLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Universal ID & Certificate Verification Modal */}
      {showVerifyModal && (
        <IDVerificationModal
          initialQuery={verifyQuery}
          onClose={() => {
            setShowVerifyModal(false);
            setVerifyQuery('');
            if (window.location.hash.startsWith('#verify')) {
              history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      )}

      {/* Mandatory First-Time Login T-PIN Setup Modal for Franchise */}
      {session?.role === 'franchise' &&
        session.franchise &&
        (!session.franchise.tPinSet || !session.franchise.tPinHash) && (
          <SetTPinModal
            franchise={session.franchise}
            onSuccess={() => {
              reloadData();
            }}
            onLogout={handleLogout}
          />
        )}
    </div>
  );
}
