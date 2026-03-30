import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { TIER_LABELS } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}



const DashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);



const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// TrainIcon removed — training hidden until TRAINING_ENABLED=true

const PersonaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const navItems: NavItem[] = [
  { to: '/', label: 'Explore', icon: DashIcon },
  { to: '/characters', label: 'Characters', icon: UserCircleIcon },
  // Personas hidden — merged into character chat settings
  // Chat & Demo hidden — restore when LoRA / demo work is prioritised
  // { to: '/chat', label: 'Chat', icon: ChatIcon },
  // { to: '/demos', label: 'Demo Models', icon: SparkleIcon },
  // Training hidden — restore when TRAINING_ENABLED=true on backend
  // { to: '/training', label: 'Training', icon: TrainIcon },
  { to: '/conversations', label: 'History', icon: HistoryIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const adminItems: NavItem[] = [
  { to: '/admin', label: 'Admin', icon: ShieldIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/audit-log', label: 'Audit Log', icon: ClipboardIcon },
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-red-700/20 text-red-400'
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
          <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">
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

          {/* Admin section */}
          {isAdmin && (
            <>
              <li className="mt-4 mb-1 px-3">
                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Admin</span>
              </li>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={linkClass} end={to === '/admin'}>
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          {user && (
            <div className="mb-3 px-1">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-700/20 text-red-400">
                  {TIER_LABELS[user.tier]}
                </span>
                {user.tier === 'free' && (
                  <NavLink
                    to="/subscription"
                    className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                  >
                    Upgrade
                  </NavLink>
                )}
              </div>
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
        <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">
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

              {/* Admin section (mobile) */}
              {isAdmin && (
                <>
                  <li className="mt-4 mb-1 px-3">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Admin</span>
                  </li>
                  {adminItems.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        className={linkClass}
                        onClick={() => setMobileOpen(false)}
                        end={to === '/admin'}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </>
              )}
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
