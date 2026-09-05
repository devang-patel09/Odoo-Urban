import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Generate readable breadcrumb segments
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Top Breadcrumb Bar */}
          <div className="bg-white border-b border-[#E5E7EB] px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-[#714B67]">Urban Furniture</span>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const formatted = value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <React.Fragment key={to}>
                  <span>/</span>
                  {isLast ? (
                    <span className="font-semibold text-gray-800">{formatted}</span>
                  ) : (
                    <span className="text-gray-600">{formatted}</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Main View Area */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
