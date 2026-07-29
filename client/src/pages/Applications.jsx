import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, ExternalLink } from 'lucide-react';
import { apiFetch } from '../api/auth';
import { useAlertsSocket } from '../hooks/useAlertsSocket';

const COLUMNS = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

const Applications = () => {
  const [kanban, setKanban] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', category: '' });

  const fetchApps = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.category) params.set('category', filters.category);
      const res = await apiFetch(`/api/applications?${params}`);
      const data = await res.json();
      setKanban(data.kanban || {});
      setStats(data.stats || {});
    } catch (e) {
      console.error(e);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    fetchApps();
  }, [fetchApps]);

  useAlertsSocket({ onRefresh: fetchApps, silent: true });

  const moveStatus = async (appId, status) => {
    try {
      const res = await apiFetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Moved to ${status}`);
      fetchApps();
    } catch {
      toast.error('Could not update application');
    }
  };

  if (loading) return <div className="p-8">Loading Applications...</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <Briefcase /> Application Tracker
        </h1>
        <p className="text-text-muted">
          {stats.total || 0} tracked · {stats.interview || 0} interviews · {stats.offer || 0} offers
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Search company"
          className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
        >
          <option value="">All categories</option>
          <option value="Startup">Startup</option>
          <option value="Service">Service</option>
          <option value="Product">Product</option>
          <option value="FAANG">FAANG</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div key={col} className="bg-cream-dark rounded-xl border border-border p-3 min-h-[320px]">
            <h2 className="font-bold mb-3 text-sm uppercase tracking-wide text-text-muted">
              {col} ({(kanban[col] || []).length})
            </h2>
            <div className="space-y-3">
              {(kanban[col] || []).map((app) => {
                const c = app.companyId;
                const link = c?.applyUrl || c?.url;
                return (
                  <div key={app._id} className="bg-cream-card border border-border rounded-xl p-3 space-y-2">
                    <div className="font-bold text-sm">{c?.name || 'Unknown'}</div>
                    <div className="text-xs text-text-muted">{c?.role}</div>
                    <div className="text-xs text-text-muted">{c?.category} · {c?.platform}</div>
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent-red flex items-center gap-1"
                      >
                        Apply link <ExternalLink size={12} />
                      </a>
                    )}
                    <select
                      value={app.status}
                      onChange={(e) => moveStatus(app._id, e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded border border-border bg-cream-bg"
                    >
                      {COLUMNS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications;
