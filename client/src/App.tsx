import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { PersonaBanner } from './components/common/PersonaBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ServiceGrid } from './components/customer/ServiceGrid';
import { CustomerBookingsList } from './components/customer/CustomerBookingsList';
import { BookingDetailsView } from './components/customer/BookingDetailsView';
import { CooperativeMapView } from './components/customer/CooperativeMapView';
import { CustomerComplaintsView } from './components/customer/CustomerComplaintsView';
import { FavoriteWorkersView } from './components/customer/FavoriteWorkersView';
import { WorkerTrustProfileModal } from './components/customer/WorkerTrustProfileModal';
import { WorkerMatchingModal } from './components/customer/WorkerMatchingModal';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { WorkerWelfareView } from './components/worker/WorkerWelfareView';
import { CooperativeDashboard } from './components/cooperative/CooperativeDashboard';
import { WorkerVerificationTable } from './components/cooperative/WorkerVerificationTable';
import { ComplaintsManager } from './components/cooperative/ComplaintsManager';
import { AIDemandForecastView } from './components/cooperative/AIDemandForecastView';
import { JobAllocationMonitor } from './components/cooperative/JobAllocationMonitor';
import { SocietyAnnouncementsManager } from './components/cooperative/SocietyAnnouncementsManager';
import { FederationDashboard } from './components/federation/FederationDashboard';
import { EscalatedDisputesDesk } from './components/federation/EscalatedDisputesDesk';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { ServiceCategory, Worker } from './types';

export const App: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('services');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Modals
  const [trustModalWorkerId, setTrustModalWorkerId] = useState<string | null>(null);
  const [matchingCategory, setMatchingCategory] = useState<ServiceCategory | null>(null);
  const [matchingIsEmergency, setMatchingIsEmergency] = useState<boolean>(false);
  const [matchingPreselectedWorker, setMatchingPreselectedWorker] = useState<Worker | null>(null);

  // Keep track of active booking for seamless multi-role simulation
  const [latestActiveBookingId, setLatestActiveBookingId] = useState<string | null>(null);

  // Switch default tab when persona role changes
  React.useEffect(() => {
    if (!user) return;
    if (user.role === 'worker') {
      setActiveTab('worker-dashboard');
    } else if (user.role === 'cooperative_admin') {
      setActiveTab('coop-dashboard');
    } else if (user.role === 'federation_admin') {
      setActiveTab('federation-dashboard');
    } else {
      // Customer: if there is an active booking, resume live tracking view!
      if (latestActiveBookingId) {
        setSelectedBookingId(latestActiveBookingId);
        setActiveTab('bookings');
      } else {
        setActiveTab('services');
      }
    }
  }, [user?.role, user?.email]);

  const handleSelectCategory = (category: ServiceCategory) => {
    setMatchingCategory(category);
    setMatchingIsEmergency(false);
    setMatchingPreselectedWorker(null);
  };

  const handleEmergencyClick = () => {
    const emergencyCategory: ServiceCategory = {
      id: 'cat-plumbing',
      name: 'Emergency Plumbing & Water Leakage',
      slug: 'plumbing',
      icon: 'Droplets',
      description: 'Rapid 15-minute dispatch for burst pipes, flooding, or tap failure',
      base_price: 450,
      unit: 'per emergency dispatch',
      is_emergency_supported: 1,
      services: [
        {
          id: 'srv-plumb-2',
          category_id: 'cat-plumbing',
          name: 'Burst Pipe & Major Leak Emergency',
          description: 'Instant shutoff valve access, copper/PVC pipe brazing and replacement',
          estimated_time: '30-45 mins',
          base_price: 450,
          emergency_multiplier: 1.5,
        },
      ],
    };
    setMatchingCategory(emergencyCategory);
    setMatchingIsEmergency(true);
    setMatchingPreselectedWorker(null);
  };

  const handleSelectWorkerForBooking = (worker: Worker) => {
    const defaultCat: ServiceCategory = {
      id: worker.skills?.[0]?.category_id || 'cat-plumbing',
      name: worker.skills?.[0]?.category_name || 'Plumbing',
      slug: 'plumbing',
      icon: 'Wrench',
      description: 'Service with verified craftsman',
      base_price: 350,
      unit: 'per service',
      is_emergency_supported: 1,
      services: [
        {
          id: 'srv-plumb-1',
          category_id: 'cat-plumbing',
          name: 'General Service & Overhaul',
          description: 'Standard repair and diagnosis',
          estimated_time: '1 hour',
          base_price: 350,
          emergency_multiplier: 1.4,
        },
      ],
    };
    setMatchingCategory(defaultCat);
    setMatchingIsEmergency(false);
    setMatchingPreselectedWorker(worker);
  };

  const handleBookingSuccess = (bookingId: string) => {
    setMatchingCategory(null);
    setSelectedBookingId(bookingId);
    setLatestActiveBookingId(bookingId);
    setActiveTab('bookings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* 1-Click Interactive Demo Persona Switcher */}
      <PersonaBanner />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedBookingId(null);
          setActiveTab(tab);
        }}
        onEmergencyClick={handleEmergencyClick}
      />

      {/* Main Content Area with RBAC View Rendering */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {/* ===================================================
            ROLE 1: CUSTOMER VIEWS
            =================================================== */}
        {activeTab === 'services' && (
          <ServiceGrid
            onSelectCategory={handleSelectCategory}
            onEmergencyClick={handleEmergencyClick}
            onViewTrustProfile={(w) => setTrustModalWorkerId(w.id)}
            onSelectWorkerForBooking={handleSelectWorkerForBooking}
          />
        )}

        {activeTab === 'bookings' && (
          <>
            {selectedBookingId ? (
              <BookingDetailsView
                bookingId={selectedBookingId}
                onBack={() => setSelectedBookingId(null)}
              />
            ) : (
              <CustomerBookingsList
                onSelectBooking={(id) => {
                  setSelectedBookingId(id);
                  setLatestActiveBookingId(id);
                }}
                onNewBookingClick={() => setActiveTab('services')}
              />
            )}
          </>
        )}

        {activeTab === 'map' && (
          <CooperativeMapView
            onSelectWorkerForBooking={handleSelectWorkerForBooking}
            onViewTrustProfile={(w) => setTrustModalWorkerId(w.id)}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoriteWorkersView
            onSelectWorkerForBooking={handleSelectWorkerForBooking}
            onViewTrustProfile={(w) => setTrustModalWorkerId(w.id)}
          />
        )}

        {activeTab === 'complaints' && <CustomerComplaintsView />}

        {/* ===================================================
            ROLE 2: WORKER VIEWS
            =================================================== */}
        {activeTab === 'worker-dashboard' && <WorkerDashboard />}
        {activeTab === 'worker-welfare' && <WorkerWelfareView />}
        {activeTab === 'announcements' && <SocietyAnnouncementsManager />}

        {/* ===================================================
            ROLE 3: COOPERATIVE ADMIN VIEWS
            =================================================== */}
        {activeTab === 'coop-dashboard' && (
          <CooperativeDashboard
            onNavigateToVerification={() => setActiveTab('coop-verification')}
            onNavigateToComplaints={() => setActiveTab('coop-complaints')}
            onNavigateToForecast={() => setActiveTab('ai-forecast')}
          />
        )}
        {activeTab === 'coop-verification' && <WorkerVerificationTable />}
        {activeTab === 'coop-allocation' && <JobAllocationMonitor />}
        {activeTab === 'ai-forecast' && <AIDemandForecastView />}
        {activeTab === 'coop-complaints' && <ComplaintsManager />}
        {activeTab === 'coop-announcements' && <SocietyAnnouncementsManager />}

        {/* ===================================================
            ROLE 4: FEDERATION ADMIN VIEWS (STATE APEX & MASTER GOVERNANCE)
            =================================================== */}
        {activeTab === 'federation-dashboard' && <FederationDashboard />}
        {activeTab === 'federation-rebalancing' && <AIDemandForecastView />}
        {activeTab === 'federation-disputes' && <EscalatedDisputesDesk />}
        {activeTab === 'federation-categories' && <SuperAdminDashboard />}

      </main>

      {/* Worker Trust Profile Modal */}
      <WorkerTrustProfileModal
        workerId={trustModalWorkerId}
        onClose={() => setTrustModalWorkerId(null)}
        onBookNow={(worker) => handleSelectWorkerForBooking(worker)}
      />

      {/* Smart Worker Matching & Booking Modal */}
      {matchingCategory && (
        <WorkerMatchingModal
          category={matchingCategory}
          initialIsEmergency={matchingIsEmergency}
          preselectedWorker={matchingPreselectedWorker}
          onClose={() => setMatchingCategory(null)}
          onBookingSuccess={handleBookingSuccess}
          onViewTrustProfile={(w) => setTrustModalWorkerId(w.id)}
        />
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
};
