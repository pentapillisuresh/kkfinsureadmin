import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages - Authentication
import Login from './pages/Login';

// Pages - Dashboard
import Dashboard from './pages/Dashboard';

// Pages - Users
import UsersList from './pages/Users/UsersList';
import UserDetails from './pages/Users/UserDetails';

// Pages - Investments
import InvestmentsList from './pages/Investments/InvestmentsList';
import InvestmentDetails from './pages/Investments/InvestmentDetails';

// Pages - Plans
import PlansList from './pages/Plans/PlansList';

// Pages - Offers
import OffersList from './pages/Offers/OffersList';

// Pages - Referrals
import ReferralsList from './pages/Referrals/ReferralsList';

// Pages - Tickets
import TicketsList from './pages/Tickets/TicketsList';

// Pages - Documents
import DocumentsList from './pages/Documents/DocumentsList';

// Pages - Nominees
import NomineesList from './pages/Nominees/NomineesList';

// Pages - Returns
import ReturnsList from './pages/Returns/ReturnsList';

// Pages - Commissions
import CommissionsList from './pages/Commissions/CommissionsList';

// Pages - Balance Sheets
import BalanceSheetsList from './pages/BalanceSheets/BalanceSheetsList';

// Pages - Points
import PointsList from './pages/Points/PointsList';

// Layout
import DashboardLayout from './components/layouts/DashboardLayout';

// Styles
import './styles/index.css';

// ============================================================
// Loading Component
// ============================================================
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// ============================================================
// Protected Route Component
// ============================================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ============================================================
// Public Route Component (for login page)
// ============================================================
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user && user.role === 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// ============================================================
// App Routes Component - FIXED
// ============================================================
const AppRoutes = () => {
  const { loading } = useAuth();

  // Show global loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // All routes are defined unconditionally
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home */}
        <Route index element={<Dashboard />} />
        
        {/* User Management */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/:id" element={<UserDetails />} />
        
        {/* Investment Management */}
        <Route path="investments" element={<InvestmentsList />} />
        <Route path="investments/:id" element={<InvestmentDetails />} />
        
        {/* Plan Management */}
        <Route path="plans" element={<PlansList />} />
        
        {/* Offer Management */}
        <Route path="offers" element={<OffersList />} />
        
        {/* Referral Management */}
        <Route path="referrals" element={<ReferralsList />} />
        
        {/* Ticket Management */}
        <Route path="tickets" element={<TicketsList />} />
        
        {/* Document Management */}
        <Route path="documents" element={<DocumentsList />} />
        
        {/* Nominee Management */}
        <Route path="nominees" element={<NomineesList />} />
        
        {/* Return Management */}
        <Route path="returns" element={<ReturnsList />} />
        
        {/* Commission Management */}
        <Route path="commissions" element={<CommissionsList />} />
        
        {/* Balance Sheet Management */}
        <Route path="balance-sheets" element={<BalanceSheetsList />} />
        
        {/* Points Management */}
        <Route path="points" element={<PointsList />} />
      </Route>
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ============================================================
// Main App Component
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;