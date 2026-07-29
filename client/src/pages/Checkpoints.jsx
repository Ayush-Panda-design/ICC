import React, { useEffect, useState } from 'react';
import { Flag, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../api/companies';

const Checkpoints = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/checkpoints`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error('Failed to load checkpoints'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading checkpoints…</div>;
  if (!data) return <div className="p-8">No checkpoint data</div>;

  const { checkpoints, stats, current } = data;
  const pct = Math.min(100, Math.round((stats.dsaCompleted / (stats.dsaTotal || 474)) * 100));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <Flag className="text-accent-red" /> Am I On The Right Path?
        </h1>
        <p className="text-text-muted">Weekly checkpoints from your Complete Guide (PDF §16)</p>
      </header>

      <section className="card grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-text-muted">DSA</p>
          <p className="text-2xl font-bold">{stats.dsaCompleted}/{stats.dsaTotal || 474}</p>
          <div className="h-2 bg-cream-dark rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent-green" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <p className="text-xs text-text-muted">Apps sent</p>
          <p className="text-2xl font-bold">{stats.applicationsSent}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Mocks</p>
          <p className="text-2xl font-bold">{stats.mocksCompleted}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Current week</p>
          <p className="text-2xl font-bold">W{stats.currentWeek}</p>
          <p className="text-xs text-text-muted">{stats.theme}</p>
        </div>
      </section>

      {current && (
        <section className={`card border-l-4 ${current.onTrack ? 'border-accent-green' : 'border-accent-red'}`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Target size={18} /> This checkpoint — Week {current.weekNumber}
          </h2>
          <p className="text-sm text-text-muted mb-2">{current.theme} · Target {current.dsaTarget}/{stats.dsaTotal || 474}</p>
          <p className="text-sm"><b>Must-have:</b> {(current.mustHaveDone || []).join(' · ')}</p>
          <p className="text-sm text-accent-red mt-1"><b>Red flag if:</b> {(current.redFlags || []).join(' · ')}</p>
        </section>
      )}

      <div className="space-y-3">
        {checkpoints.map((cp) => (
          <div
            key={cp.weekNumber}
            className={`p-4 rounded-xl border ${
              cp.weekNumber === stats.currentWeek ? 'border-accent-red bg-cream-card' : 'border-border bg-cream-bg'
            }`}
          >
            <div className="flex flex-wrap justify-between gap-2 items-center">
              <div>
                <p className="font-bold">W{cp.weekNumber} · {cp.theme || cp.phase}</p>
                <p className="text-xs text-text-muted">
                  Due {cp.date ? new Date(cp.date).toLocaleDateString() : '—'} · DSA target {cp.dsaTarget}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${cp.onTrack ? 'bg-accent-green-soft text-accent-green' : 'bg-accent-red-soft text-accent-red'}`}>
                {cp.onTrack ? 'ON TRACK' : 'BEHIND'}
              </span>
            </div>
            <p className="text-sm mt-2">{(cp.mustHaveDone || []).join(' · ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checkpoints;
