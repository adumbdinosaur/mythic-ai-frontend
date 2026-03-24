import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const DashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: DashIcon },
  { to: '/chat', label: 'Chat', icon: ChatIcon },
  { to: '/demos', label: 'Demo Models', icon: SparkleIcon },
  { to: '/training', label: 'Training', icon: TrainIcon },
  { to: '/conversations', label: 'History', icon: HistoryIcon },
  { to: '/subscription', label: 'Subscription', icon: SubIcon },
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-purple-600/20 text-purple-400'
        : 'text-gray-400 hover:text-white hover:bg-white/5',
    ].join(' ');

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex flex-col w-64 shrink-0 bg-gray-900 border-r border-white/10 min-h-screen"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mythic AI
          </span>
        </div>

        {/* Nav links */}
        <ul className="flex flex-col gap-1 p-3 flex-1" role="list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={linkClass}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          {user && (
            <div className="mb-3 px-1">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span className="mt-1 inline-block text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                {user.tier}
              </span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </Button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-white/10 flex items-center justify-between px-4 h-14">
        <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mythic AI
        </span>
        <button
          className="text-gray-400 hover:text-white p-1"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden fixed inset-0 z-30 flex"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="relative w-64 bg-gray-900 border-r border-white/10 flex flex-col pt-14">
            <ul className="flex flex-col gap-1 p-3 flex-1" role="list">
              {navItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={linkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                Log out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
