import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
      // Placeholders for subsequent phases
      {
        path: '*',
        element: (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <h2 className="text-xl font-bold text-gray-800">Module Initializing</h2>
            <p className="text-gray-500 text-sm mt-1">This module is part of the ongoing implementation phases.</p>
          </div>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
