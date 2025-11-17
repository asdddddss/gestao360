import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppDataProvider } from './contexts/AppDataContext';
import { useAppData } from './hooks/useAppData';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { ServicesPage } from './pages/dashboard/ServicesPage';
import { ProfessionalsPage } from './pages/dashboard/ProfessionalsPage';
import { PublicSitePage } from './pages/public/PublicSitePage';
import { MySitePage } from './pages/dashboard/MySitePage';
import { AppointmentsPage } from './pages/dashboard/AppointmentsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { FinancePage } from './pages/dashboard/FinancePage'; // Import new page
import { ClientsPage } from './pages/dashboard/ClientsPage';
import { InactiveClientsPage } from './pages/dashboard/InactiveClientsPage'; 
import { PlansPage } from './pages/dashboard/PlansPage';
import { AutomationsPage } from './pages/dashboard/AutomationsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UpgradePage } from './pages/dashboard/UpgradePage';
import { SubscriptionsPage } from './pages/dashboard/SubscriptionsPage';
import { PricingPage } from './pages/PricingPage';
import { StorePage } from './pages/dashboard/StorePage';

const ProtectedRoute: React.FC = () => {
    const { user, negocio, isLoading } = useAppData();

    if (isLoading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-brand-dark text-white">Carregando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (user.email !== 'admin@admin.com' && negocio?.status !== 'active') {
        return <Navigate to="/pending-approval" replace />;
    }

    return <Outlet />;
};

const PublicRoute: React.FC = () => {
    const { user, isLoading } = useAppData();
    if (isLoading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-brand-dark text-white">Carregando...</div>;
    }
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
};

const AdminRoute: React.FC = () => {
    const { user, isLoading } = useAppData();
    if (isLoading) {
      return <div className="h-screen w-screen flex items-center justify-center bg-brand-dark text-white">Carregando...</div>;
    }
    if (user?.email !== 'admin@admin.com') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/:slug" element={<PublicSitePage />} />
          
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHomePage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="store" element={<StorePage />} />
                  <Route path="professionals" element={<ProfessionalsPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="inactive-clients" element={<InactiveClientsPage />} />
                  <Route path="plans" element={<PlansPage />} />
                  <Route path="subscriptions" element={<SubscriptionsPage />} />
                  <Route path="my-site" element={<MySitePage />} />
                  <Route path="automations" element={<AutomationsPage />} />
                  <Route path="upgrade" element={<UpgradePage />} />
                  
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="finance" element={<FinancePage />} />

                  <Route element={<AdminRoute />}>
                      <Route path="admin" element={<AdminDashboardPage />} />
                  </Route>
              </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
        <AppDataProvider>
            <AppRoutes />
        </AppDataProvider>
    </Router>
  );
}

export default App;