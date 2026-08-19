// index.tsx router
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { ProtectedRoute } from '../components/layouts/ProtectedRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage } from '../pages/PaymentPage';
import { DashboardPage } from '../pages/DashboardPage';
import { WalletsPage } from '../pages/WalletsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { BudgetsPage } from '../pages/BudgetsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AiAssistantPage } from '../pages/AiAssistantPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/:orderId" element={<PaymentPage />} />

      {/* Admin Portal Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      {/* Protected App Pages */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Wallets */}
        <Route path="/wallet" element={<WalletsPage />} />
        <Route path="/wallets" element={<Navigate to="/wallet" replace />} />

        {/* Transactions */}
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transaction" element={<Navigate to="/transactions" replace />} />

        {/* Budgets */}
        <Route path="/budget" element={<BudgetsPage />} />
        <Route path="/budgets" element={<Navigate to="/budget" replace />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/report" element={<Navigate to="/reports" replace />} />

        {/* AI Financial Assistant */}
        <Route path="/ai" element={<AiAssistantPage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
