import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  Home, Calendar as CalendarIcon, Bell, Code, Briefcase, Inbox, Flag, LogOut, Menu, X, Swords, Megaphone
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import Alerts from './pages/Alerts';
import DSATracker from './pages/DSATracker';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Checkpoints from './pages/Checkpoints';
import Dojo from './pages/Dojo';
import Notices from './pages/Notices';
import LoginGate from './pages/LoginGate';
import { useAlertsSocket } from './hooks/useAlertsSocket';
import { checkAuthStatus, clearToken, getToken } from './api/auth';

const NAV = [
  { to: '/', end: true, label: 'Dashboard', icon: Home },
  { to: '/planner', label: 'Daily Planner', icon: CalendarIcon },
  { to: '/checkpoints', label: 'Checkpoints', icon: Flag },
  { to: '/dsa', label: 'DSA Tracker', icon: Code },
  { to: '/dojo', label: 'Dojo', icon: Swords },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/notifications', label: 'Notifications', icon: Inbox, badge: true }
];

const SidebarNav = ({ badgeCount, clearBadge, onNavigate, onLogout, connected }) => (
  <>
    <div className="flex items-center justify-between mb-6 md:mb-8">
      <h2 className="text-xl font-bold text-accent-red">ICC</h2>
      <span
        className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green' : 'bg-text-muted'}`}
        title={connected ? 'Live alerts connected' : 'Socket offline'}
      />
    </div>
    <nav className="flex-1 overflow-y-auto">
      <ul className="space-y-1.5">
        {NAV.map(({ to, end, label, icon: Icon, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={() => {
                if (badge) clearBadge();
                onNavigate?.();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition ${
                  isActive
                    ? 'bg-cream-bg font-bold text-accent-red shadow-sm'
                    : 'text-text-muted hover:bg-cream-bg'
                }`
              }
            >
              <span className="relative shrink-0">
                <Icon size={20} />
                {badge && badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
    {onLogout && (
      <button
        type="button"
        onClick={onLogout}
        className="mt-4 flex items-center gap-2 p-3 text-sm text-text-muted hover:text-accent-red transition"
      >
        <LogOut size={16} /> Lock
      </button>
    )}
  </>
);

const Layout = ({ children, onLogout }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const { badgeCount, clearBadge, connected } = useAlertsSocket({ onRefresh });

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-cream-bg text-text-primary overflow-hidden" data-refresh={refreshKey}>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-cream-dark border-b border-border safe-top">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="p-2 -ml-1 rounded-lg hover:bg-cream-bg"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-accent-red text-lg">ICC</span>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green' : 'bg-text-muted'}`} />
        </div>
        <div className="w-9" />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-cream-dark border-r border-border p-4 flex-col h-full">
        <SidebarNav
          badgeCount={badgeCount}
          clearBadge={clearBadge}
          onLogout={onLogout}
          connected={connected}
        />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/40"
            onClick={closeMenu}
          />
          <aside className="relative z-10 w-[min(18rem,85vw)] max-w-full h-full bg-cream-dark border-r border-border p-4 flex flex-col shadow-xl animate-slide-in">
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="absolute top-3 right-3 p-2 rounded-lg hover:bg-cream-bg"
            >
              <X size={20} />
            </button>
            <SidebarNav
              badgeCount={badgeCount}
              clearBadge={clearBadge}
              onNavigate={closeMenu}
              onLogout={onLogout}
              connected={connected}
            />
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const status = await checkAuthStatus();
      setAuthRequired(Boolean(status.required));
      if (!status.required) {
        setAuthed(true);
      } else {
        setAuthed(Boolean(getToken()));
      }
    } catch {
      setAuthRequired(false);
      setAuthed(true);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    const onNeed = () => setAuthed(false);
    window.addEventListener('icc:auth-required', onNeed);
    return () => window.removeEventListener('icc:auth-required', onNeed);
  }, [refreshAuth]);

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
  };

  if (!authReady) {
    return <div className="min-h-screen bg-cream-bg flex items-center justify-center text-text-muted">Loading…</div>;
  }

  if (authRequired && !authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={authRequired ? handleLogout : null}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<DailyPlanner />} />
          <Route path="/checkpoints" element={<Checkpoints />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dsa" element={<DSATracker />} />
          <Route path="/dojo" element={<Dojo />} />
          <Route path="/notices" element={<Notices />} />
        </Routes>
      </Layout>
      <Toaster position="bottom-center" containerStyle={{ bottom: 16 }} />
    </BrowserRouter>
  );
}

export default App;
