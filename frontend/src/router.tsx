import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { UserManagementPage } from './features/admin/UserManagementPage';
import { ContactsPage } from './features/contacts/ContactsPage';
import { ProductsPage } from './features/products/ProductsPage';
import { ChartOfAccountsPage } from './features/accounts/ChartOfAccountsPage';
import { JournalsPage } from './features/journals/JournalsPage';
import { AnalyticAccountsPage } from './features/analytics/AnalyticAccountsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'accounting/overview',
        element: <DashboardPage />,
      },
      // Master Data Routes
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'sales/customers',
        element: <ContactsPage />,
      },
      {
        path: 'purchases/vendors',
        element: <ContactsPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/categories',
        element: <ProductsPage />,
      },
      {
        path: 'accounting/chart-of-accounts',
        element: <ChartOfAccountsPage />,
      },
      {
        path: 'accounting/journals',
        element: <JournalsPage />,
      },
      {
        path: 'accounting/analytic-accounts',
        element: <AnalyticAccountsPage />,
      },
      // Admin Routes
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      // Placeholders for subsequent phases
      {
        path: '*',
        element: (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <h2 className="text-xl font-bold text-gray-800">Module Under Construction</h2>
            <p className="text-gray-500 text-sm mt-1">This module is part of the ongoing implementation phases.</p>
          </div>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
