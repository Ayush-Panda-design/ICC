import React, { useCallback, useEffect, useState } from 'react';
import {
  Megaphone, ExternalLink, RefreshCw, CalendarDays, Flame, Sparkles, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/auth';
import { markCompanyApplied } from '../api/companies';

function dateLine(c) {
  const opens = c.opensLabel || (c.opensAround && new Date(c.opensAround).toLocaleDateString());
  const closes =
    c.closesLabel ||
    (c.deadline && new Date(c.deadline).toLocaleDateString()) ||
    (c.closesAround && new Date(c.closesAround).toLocaleDateString());
  if (opens || closes) {
    return `Opens: ${opens || '—'} · Closes: ${closes || '—'}`;
  }
  if (c.window) return c.window;
  return 'Open/close dates not listed — check portal';
}

const Notices = () => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/notices');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      setBoard(data);
    } catch (e) {
      toast.error(e.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await apiFetch('/api/notices/refresh', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBoard(data.board);
      toast.success('Synced openings + refreshed status brief');
    } catch (e) {
      toast.error(e.message || 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const openLink = (url, label) => {
    if (!url) {
      toast.error('No link');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    toast(`Opened ${label || 'apply page'}`, { icon: '🔗' });
  };

  if (loading) return <div className="p-8">Loading Notice Board…</div>;
  if (!board) return <div className="p-8 text-text-muted">Could not load notices.</div>;

  const { brief, calendar, openings, hubs, season, year, tip } = board;
  const openNow = (openings || []).filter((o) => o.isOpen && o.cycleStatus !== 'closed');
  const closedCycle = (openings || []).filter((o) => o.cycleStatus === 'closed');
  const watchlist = (openings || []).filter((o) => !o.isOpen && o.cycleStatus !== 'closed');

  return (
    <div className="page max-w-5xl space-y-6">
      <header className="border-b border-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
            <Megaphone className="text-accent-red" /> Notice Board
          </h1>
          <p className="text-text-muted text-sm">
            Top tech internship / SDE application waves · live opens · {year} status for your profile
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="px-4 py-2 bg-accent-red text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Sync + AI status'}
        </button>
      </header>

      <section className="card space-y-3 border-l-4 border-accent-yellow">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles size={16} className="text-accent-yellow" />
          <h2 className="font-bold">{brief?.headline || 'Hiring status'}</h2>
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-cream-dark text-text-muted">
            {brief?.source === 'gemini' ? 'Gemini' : 'Rules'} · {brief?.asOf ? new Date(brief.asOf).toLocaleString() : '—'}
          </span>
        </div>
        <p className="text-sm text-text-primary whitespace-pre-wrap">{brief?.body}</p>
        {brief?.focusNow?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-text-muted mb-1">Focus now</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {brief.focusNow.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}
        {brief?.bullets?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-text-muted mb-1">Notes (typical 70–100 top tech apps)</p>
            <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
              {brief.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-text-muted">{season}</p>
      </section>

      <section>
        <h2 className="font-bold mb-2 flex items-center gap-2"><Link2 size={16} /> Platforms</h2>
        <div className="flex flex-wrap gap-2">
          {(hubs || []).map((h) => (
            <button
              key={h.name}
              type="button"
              onClick={() => openLink(h.url, h.name)}
              className="px-3 py-1.5 text-sm rounded-lg border border-border bg-cream-card hover:border-accent-yellow flex items-center gap-1"
            >
              {h.name} <ExternalLink size={12} />
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold flex items-center gap-2 text-accent-green">
          <Flame size={18} /> Live / high-fit opens — {openNow.length}
        </h2>
        <p className="text-xs text-text-muted">Only companies flagged truly open. Closed cycles are listed separately below.</p>
        <div className="space-y-3">
          {openNow.map((c) => (
            <div key={c._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{c.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-green-soft text-accent-green font-bold">
                    {c.liveDetected ? 'LIVE' : 'Open'}
                  </span>
                  {c.matchScore != null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cream-dark">{c.matchScore}% fit</span>
                  )}
                  <span className="text-xs text-text-muted">{c.category}</span>
                </div>
                <p className="text-sm text-text-muted">{c.role} · {c.platform || 'careers'}</p>
                <p className="text-xs text-text-muted mt-1 font-medium">{dateLine(c)}</p>
                {c.openRoles?.[0]?.title && (
                  <p className="text-xs text-accent-green mt-1">Live role: {c.openRoles[0].title}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openLink(c.applyLink, c.name)}
                  className="px-4 py-2 bg-text-primary text-white rounded-lg text-sm font-medium flex items-center gap-1"
                >
                  {c.applyCta || 'Apply now'} <ExternalLink size={14} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await markCompanyApplied(c);
                      toast.success(`Marked Applied: ${c.name}`);
                      load();
                    } catch (e) {
                      toast.error(e.message);
                    }
                  }}
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                >
                  Mark Applied
                </button>
              </div>
            </div>
          ))}
          {openNow.length === 0 && (
            <p className="text-text-muted italic text-sm">No live opens flagged — hit Sync + AI status.</p>
          )}
        </div>
      </section>

      {closedCycle.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-accent-red">Closed this cycle — {closedCycle.length}</h2>
          <p className="text-xs text-text-muted">Do not treat these as open applications. Careers pages may still load.</p>
          <div className="space-y-2">
            {closedCycle.map((c) => (
              <div key={c._id} className="card border-l-4 border-accent-red flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red-soft text-accent-red font-bold">Closed</span>
                  </div>
                  <p className="text-sm text-text-muted">{c.role}</p>
                  <p className="text-xs text-text-muted mt-1 font-medium">{dateLine(c)}</p>
                  {c.window && <p className="text-xs text-text-muted">{c.window}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => openLink(c.applyLink, c.name)}
                  className="px-3 py-2 border border-border rounded-lg text-sm flex items-center gap-1"
                >
                  View careers <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {watchlist.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-text-muted">Watchlist (high fit, not flagged open) — {watchlist.length}</h2>
          <div className="space-y-2">
            {watchlist.slice(0, 15).map((c) => (
              <div key={c._id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border text-sm">
                <span>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-text-muted"> · {c.role} · {c.matchScore}%</span>
                  <span className="block text-xs text-text-muted font-medium">{dateLine(c)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => openLink(c.applyLink, c.name)}
                  className="text-accent-red flex items-center gap-1 hover:underline"
                >
                  View <ExternalLink size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-bold flex items-center gap-2">
          <CalendarDays size={18} /> {year} open / close windows
        </h2>
        <p className="text-xs text-text-muted">
          Estimated typical windows + <strong>live careers watch</strong>. If a mid-cycle JD appears, status flips to LIVE OPEN on Sync.
        </p>
        <div className="space-y-3">
          {(calendar || []).map((row) => (
            <div
              key={row.id}
              className={`card ${
                row.cycleStatus === 'closed'
                  ? 'border-l-4 border-accent-red'
                  : row.inPeak
                    ? 'border-l-4 border-accent-green'
                    : ''
              }`}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-bold">{row.company}</p>
                  <p className="text-xs text-text-muted">{(row.roles || []).join(' · ')} · {row.tier}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full h-fit ${
                    row.cycleStatus === 'closed'
                      ? 'bg-accent-red-soft text-accent-red'
                      : row.inPeak
                        ? 'bg-accent-green-soft text-accent-green'
                        : 'bg-cream-dark text-text-muted'
                  }`}
                >
                  {row.status}
                </span>
              </div>
              <p className="text-sm mt-2 font-medium">
                Opens: {row.opensLabel || '—'} · Closes: {row.closesLabel || (row.cycleStatus === 'rolling' ? 'Rolling' : '—')}
              </p>
              {row.nextWindow && (
                <p className="text-xs text-text-muted mt-1">Next: {row.nextWindow}</p>
              )}
              {row.liveDetected && row.liveUrl && (
                <p className="text-xs text-accent-green mt-1">
                  Live listing detected — open careers from Sync / company card.
                </p>
              )}
              {row.lastSyncedAt && (
                <p className="text-[10px] text-text-muted mt-1">
                  Watched: {new Date(row.lastSyncedAt).toLocaleString()}
                </p>
              )}
              <p className="text-xs text-text-muted mt-1">Typical: {row.typicalWindow}</p>
              <p className="text-xs text-text-muted mt-1">{row.notes}</p>
              <p className="text-xs text-text-muted mt-1">Platform: {row.platform}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-text-muted pb-6">{tip}</p>
    </div>
  );
};

export default Notices;
