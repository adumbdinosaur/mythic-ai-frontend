import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Navbar />
      <main
        id="main-content"
        className="flex-1 overflow-auto lg:ml-0 pt-14 lg:pt-0"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/** Redirects auth-only pages; if already logged in go to dashboard */
export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated()) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};
