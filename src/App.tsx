import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, AuthLayout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { CharactersPage } from './pages/CharactersPage';
import { PersonasPage } from './pages/PersonasPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAuditLogPage } from './pages/AdminAuditLogPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public landing — character explore (no auth required) */}
          <Route path="/" element={<ExplorePage />} />
          <Route path="/explore" element={<ExplorePage />} />

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected app routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/personas" element={<PersonasPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
