import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/Clients/ClientsList';
import AddClient from './pages/Clients/AddClient';
import ViewClient from './pages/Clients/ViewClient';
import InvestmentsList from './pages/Investments/InvestmentsList';
import AddInvestment from './pages/Investments/AddInvestment';
import MonthlyROI from './pages/MonthlyROI/MonthlyROI';
import Offers from './pages/Offers/Offers';
import Partners from './pages/Partners/Partners';
import Notifications from './pages/Notifications/Notifications';
import Reports from './pages/Reports/Reports';
import CompanyDocuments from './pages/CompanyDocuments/CompanyDocuments';
import CompanyInfo from './pages/CompanyInfo/CompanyInfo';
import FundSettings from './pages/FundSettings/FundSettings';
import Settings from './pages/Settings/Settings';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/add" element={<AddClient />} />
            <Route path="clients/:id" element={<ViewClient />} />
            <Route path="investments" element={<InvestmentsList />} />
            <Route path="investments/add" element={<AddInvestment />} />
            <Route path="monthly-roi" element={<MonthlyROI />} />
            <Route path="offers" element={<Offers />} />
            <Route path="partners" element={<Partners />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="company-documents" element={<CompanyDocuments />} />
            <Route path="company-info" element={<CompanyInfo />} />
            <Route path="fund-settings" element={<FundSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;