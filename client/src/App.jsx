import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home, Calendar as CalendarIcon, Bell, Code, Briefcase, Inbox, Flag, LogOut } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import Alerts from './pages/Alerts';
import DSATracker from './pages/DSATracker';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Checkpoints from './pages/Checkpoints';
import LoginGate from './pages/LoginGate';
import { useAlertsSocket } from './hooks/useAlertsSocket';
import { checkAuthStatus, clearToken, getToken } from './api/auth';

const Layout = ({ children, onLogout }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const onRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const { badgeCount, clearBadge, connected } = useAlertsSocket({ onRefresh });

  return (
    <div className="flex h-screen bg-cream-bg text-text-primary" data-refresh={refreshKey}>
      <aside className="w-64 bg-cream-dark border-r border-border p-4 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-accent-red">ICC</h2>
          <span
            className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green' : 'bg-text-muted'}`}
            title={connected ? 'Live alerts connected' : 'Socket offline'}
          />
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}>
                <Home size={20} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/planner" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}>
                <CalendarIcon size={20} /> Daily Planner
              </NavLink>
            </li>
            <li>
              <NavLink to="/checkpoints" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}>
                <Flag size={20} /> Checkpoints
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/alerts"
                onClick={clearBadge}
                className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}
              >
                <span className="relative">
                  <Bell size={20} />
                  {badgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </span>
                Alerts
              </NavLink>
            </li>
            <li>
              <NavLink to="/applications" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}>
                <Briefcase size={20} /> Applications
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/notifications"
                onClick={clearBadge}
                className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}
              >
                <Inbox size={20} /> Notifications
              </NavLink>
            </li>
            <li>
              <NavLink to="/dsa" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition ${isActive ? 'bg-cream-bg font-bold text-accent-red shadow-sm' : 'text-text-muted hover:bg-cream-bg'}`}>
                <Code size={20} /> DSA Tracker
              </NavLink>
            </li>
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
      </aside>
      <main className="flex-1 overflow-auto">
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
        </Routes>
      </Layout>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
