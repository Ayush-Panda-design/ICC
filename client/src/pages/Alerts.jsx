import React, { useState, useEffect, useCallback } from 'react';
import { differenceInDays } from 'date-fns';
import {
  AlertCircle, Clock, CheckCircle, ExternalLink, RefreshCw,
  Search, Filter, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applyToCompany, buildCompanyQuery, API_BASE, getWorkingApplyUrl } from '../api/companies';
import { useAlertsSocket } from '../hooks/useAlertsSocket';

const Alerts = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    status: '',
    isOpen: '',
    deadline: '',
    matchMin: '',
    platform: '',
    sort: 'deadline'
  });

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(buildCompanyQuery(filters));
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    fetchCompanies();
  }, [fetchCompanies]);

  useAlertsSocket({ onRefresh: fetchCompanies, silent: true });

  const handleApply = async (company) => {
    try {
      const result = await applyToCompany(company);
      if (result.warned) {
        toast('Original link was broken — opened a working platform hub instead', { icon: '⚠️' });
      } else {
        toast.success(`Applied to ${company.name}`);
      }
      fetchCompanies();
    } catch (e) {
      toast.error(e.message || 'Failed to update status');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/api/companies/sync`, { method: 'POST' });
      const summary = await res.json();
      if (!res.ok) throw new Error(summary.message);
      toast.success(
        `Synced · ${summary.opened || 0} openings · repaired ${summary.repaired || 0} links` +
        (summary.health ? ` · health ok ${summary.health.ok}/${summary.health.checked}` : '')
      );
      fetchCompanies();
    } catch (e) {
      toast.error(e.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/companies/health-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50 })
      });
      const summary = await res.json();
      if (!res.ok) throw new Error(summary.message);
      toast.success(`Checked ${summary.checked}: ${summary.ok} ok, ${summary.fixed} fixed, ${summary.broken} broken`);
      fetchCompanies();
    } catch (e) {
      toast.error(e.message || 'Health check failed');
    } finally {
      setChecking(false);
    }
  };

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const today = new Date();
  const getAlertCategory = (company) => {
    if (['Applied', 'OA', 'Interview', 'Offer', 'Rejected'].includes(company.status)) {
      return 'TRACKED';
    }
    if (!company.deadline) return 'YELLOW';
    const daysLeft = differenceInDays(new Date(company.deadline), today);
    if (daysLeft <= 7) return 'RED';
    if (daysLeft <= 14) return 'YELLOW';
    return 'GREEN';
  };

  const redAlerts = companies.filter((c) => getAlertCategory(c) === 'RED');
  const yellowAlerts = companies.filter((c) => getAlertCategory(c) === 'YELLOW');
  const greenAlerts = companies.filter((c) => getAlertCategory(c) === 'GREEN');
  const tracked = companies.filter((c) => getAlertCategory(c) === 'TRACKED');

  const CompanyCard = ({ company, type }) => {
    const isTracked = type === 'TRACKED';
    let borderColor = 'border-border';
    let bgBadge = 'bg-cream-dark text-text-primary';
    if (type === 'RED') { borderColor = 'border-accent-red'; bgBadge = 'bg-accent-red-soft text-accent-red'; }
    if (type === 'YELLOW') { borderColor = 'border-accent-yellow'; bgBadge = 'bg-accent-yellow-soft text-accent-yellow'; }
    if (type === 'GREEN') { borderColor = 'border-accent-green'; bgBadge = 'bg-accent-green-soft text-accent-green'; }

    const link = getWorkingApplyUrl(company);
    const urlBadge =
      company.urlStatus === 'ok'
        ? 'bg-accent-green-soft text-accent-green'
        : company.urlStatus === 'fallback'
          ? 'bg-accent-yellow-soft text-accent-yellow'
          : company.urlStatus === 'broken'
            ? 'bg-accent-red-soft text-accent-red'
            : 'bg-cream-dark text-text-muted';

    return (
      <div className={`card ${!isTracked && `border-l-4 ${borderColor}`} flex flex-col md:flex-row justify-between gap-4`}>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{company.name}</h3>
            {company.matchScore >= 90 && (
              <span className="bg-accent-green text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {company.matchScore}% Match
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${bgBadge}`}>{company.category}</span>
            {company.isOpen && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-accent-green-soft text-accent-green">
                Open now
              </span>
            )}
            {company.urlStatus && company.urlStatus !== 'unknown' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${urlBadge}`}>
                Link: {company.urlStatus}
              </span>
            )}
          </div>
          <p className="font-medium text-text-muted mb-2">{company.role} • {company.mode || '—'}</p>
          <div className="flex flex-wrap gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {company.deadline
                ? new Date(company.deadline).toLocaleDateString()
                : company.window || 'Rolling'}
            </span>
            <span>{company.stipend || 'Undisclosed'}</span>
            <span>{company.platform}</span>
          </div>
          {company.openRoles?.length > 0 && (
            <p className="text-xs text-accent-green mt-2">
              Live: {company.openRoles[0].title}
            </p>
          )}
          {company.notes && (
            <p className="text-sm mt-2 p-2 bg-cream-bg rounded-lg border border-border">{company.notes}</p>
          )}
        </div>

        <div className="flex flex-col justify-center gap-2 md:items-end">
          {isTracked ? (
            <>
              <div className="px-4 py-2 bg-cream-dark rounded-lg font-bold text-text-muted border border-border">
                Status: {company.status}
              </div>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent-red flex items-center gap-1 hover:underline"
                >
                  Open listing <ExternalLink size={14} />
                </a>
              )}
            </>
          ) : (
            <button
              onClick={() => handleApply(company)}
              className="px-6 py-2 bg-text-primary text-white rounded-lg font-medium shadow-sm hover:bg-text-primary/90 transition flex items-center justify-center gap-2"
            >
              Apply Now <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8">Loading Alerts...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="border-b border-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Internship Alerts</h1>
          <p className="text-text-muted">
            Targeting {companies.length} companies (filtered). Live sync via ATS + Remotive.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleHealthCheck}
            disabled={checking}
            className="px-4 py-2 border border-border rounded-lg font-medium flex items-center gap-2 disabled:opacity-60 bg-cream-card"
          >
            {checking ? 'Checking…' : 'Check Links'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-accent-red text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </header>

      {/* Filters */}
      <section className="card space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-text-muted">
          <Filter size={16} /> Filters
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
              placeholder="Search company or role"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-cream-bg"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
          >
            <option value="">All categories</option>
            <option value="Startup">Startup</option>
            <option value="Service">Service</option>
            <option value="Product">Product</option>
            <option value="FAANG">FAANG</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
          >
            <option value="">All statuses</option>
            <option value="Not Applied">Not Applied</option>
            <option value="Applied">Applied</option>
            <option value="OA">OA</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filters.deadline}
            onChange={(e) => setFilter('deadline', e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
          >
            <option value="">All deadlines</option>
            <option value="red">Critical ≤7d</option>
            <option value="yellow">This week / rolling</option>
            <option value="green">Later</option>
            <option value="tracked">Pipeline only</option>
          </select>
          <select
            value={filters.isOpen}
            onChange={(e) => setFilter('isOpen', e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
          >
            <option value="">Open + closed</option>
            <option value="true">Open now only</option>
          </select>
          <select
            value={filters.matchMin}
            onChange={(e) => setFilter('matchMin', e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
          >
            <option value="">Any match %</option>
            <option value="90">≥ 90% match</option>
            <option value="95">≥ 95% match</option>
          </select>
          <input
            value={filters.platform}
            onChange={(e) => setFilter('platform', e.target.value)}
            placeholder="Platform"
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg w-36"
          />
          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg"
          >
            <option value="deadline">Sort: deadline</option>
            <option value="matchScore">Sort: match</option>
            <option value="name">Sort: name</option>
            <option value="updated">Sort: last synced</option>
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent-red">
          <AlertCircle /> Critical Deadline (≤ 7 days) — {redAlerts.length}
        </h2>
        <div className="space-y-4">
          {redAlerts.map((c) => <CompanyCard key={c._id} company={c} type="RED" />)}
          {redAlerts.length === 0 && <p className="text-text-muted italic">No critical deadlines right now.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent-yellow">
          <Clock /> Apply This Week — {yellowAlerts.length}
        </h2>
        <div className="space-y-4">
          {yellowAlerts.map((c) => <CompanyCard key={c._id} company={c} type="YELLOW" />)}
          {yellowAlerts.length === 0 && <p className="text-text-muted italic">All caught up here.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent-green">
          <CheckCircle /> Eligible Now — {greenAlerts.length}
        </h2>
        <div className="space-y-4">
          {greenAlerts.map((c) => <CompanyCard key={c._id} company={c} type="GREEN" />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-muted">
          <Briefcase /> Tracked / Pipeline — {tracked.length}
        </h2>
        <div className="space-y-4">
          {tracked.map((c) => <CompanyCard key={c._id} company={c} type="TRACKED" />)}
          {tracked.length === 0 && <p className="text-text-muted italic">No applications tracked yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default Alerts;
