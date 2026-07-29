import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/auth';

const TASK_META = [
  { key: 'dsa', label: 'DSA (P0)', field: 'dsaFocus', color: 'bg-accent-yellow' },
  { key: 'coreCS', label: 'Core CS / SD', field: 'coreCS', color: 'bg-accent-green' },
  { key: 'techRevision', label: 'Tech / Setup', field: 'techRevision', color: 'bg-accent-green' },
  { key: 'application', label: 'Applications', field: 'applicationTask', color: 'bg-accent-red' },
  { key: 'english', label: 'English / Mock', field: 'englishTask', color: 'bg-accent-yellow' }
];

const DailyPlanner = () => {
  const [week, setWeek] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkpoints, setCheckpoints] = useState([]);

  const load = useCallback(async (w) => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        apiFetch(`/api/tasks?week=${w}`),
        apiFetch('/api/checkpoints')
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      setTasks(Array.isArray(tData) ? tData : []);
      setCheckpoints(cData.checkpoints || []);
      if (Array.isArray(tData) && tData.length) {
        setSelectedId(tData[0]._id);
      }
    } catch {
      toast.error('Failed to load planner');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(week);
  }, [week, load]);

  const selected = useMemo(
    () => tasks.find((t) => t._id === selectedId) || tasks[0],
    [tasks, selectedId]
  );

  const checkpoint = checkpoints.find((c) => c.weekNumber === week);

  const toggle = async (taskKey) => {
    if (!selected) return;
    const dateStr = format(parseISO(selected.date), 'yyyy-MM-dd');
    try {
      const res = await apiFetch(`/api/tasks/${dateStr}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ taskKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
      toast.success('Updated');
    } catch (e) {
      toast.error(e.message || 'Could not update');
    }
  };

  const done = (key) => (selected?.completed || []).includes(key);

  if (loading) return <div className="p-8">Loading PDF planner…</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Daily Planner</h1>
          <p className="text-text-muted flex items-center gap-2">
            <CalendarIcon size={16} />
            From your Complete Guide — Week {week}
            {selected?.phase ? ` · ${selected.phase}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={week <= 1}
            onClick={() => setWeek((w) => Math.max(1, w - 1))}
            className="p-2 rounded-lg border border-border disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-border bg-cream-bg font-bold"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={week >= 20}
            onClick={() => setWeek((w) => Math.min(20, w + 1))}
            className="p-2 rounded-lg border border-border disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {checkpoint && (
        <section className="card border-l-4 border-accent-yellow">
          <div className="flex items-start gap-3">
            <Flag className="text-accent-yellow mt-1" size={20} />
            <div>
              <h2 className="font-bold text-lg">{checkpoint.theme || `Week ${week} checkpoint`}</h2>
              <p className="text-sm text-text-muted mb-2">
                DSA target {checkpoint.dsaTarget}/474 · You: {checkpoint.dsaActual}/474 ·{' '}
                <span className={checkpoint.onTrack ? 'text-accent-green font-bold' : 'text-accent-red font-bold'}>
                  {checkpoint.onTrack ? 'ON TRACK' : 'BEHIND'}
                </span>
              </p>
              <p className="text-sm"><span className="font-bold">Must-have:</span> {(checkpoint.mustHaveDone || []).join(' · ')}</p>
              <p className="text-sm text-accent-red mt-1"><span className="font-bold">Red flags:</span> {(checkpoint.redFlags || []).join(' · ')}</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-text-muted uppercase tracking-wide">Days this week</h3>
          {tasks.length === 0 && <p className="text-text-muted italic">No days for this week.</p>}
          {tasks.map((t) => {
            const progress = (t.completed || []).length;
            return (
              <button
                key={t._id}
                type="button"
                onClick={() => setSelectedId(t._id)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selected?._id === t._id ? 'border-accent-red bg-cream-card shadow-sm' : 'border-border bg-cream-dark/40 hover:bg-cream-dark'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{t.dayLabel || format(parseISO(t.date), 'EEE MMM d')}</span>
                  <span className="text-xs text-text-muted">{progress}/5</span>
                </div>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{t.dsaFocus}</p>
                {t.isRest && <span className="text-[10px] font-bold text-accent-green">REST</span>}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <section className="card">
                <h2 className="text-xl font-bold mb-1">
                  {selected.dayLabel || format(parseISO(selected.date), 'EEEE, MMM d')}
                </h2>
                <p className="text-sm text-text-muted mb-3">{selected.theme} · {selected.phase}</p>
                <p className="text-sm p-3 rounded-xl bg-cream-bg border border-border">{selected.rawPlan}</p>
              </section>

              <section className="space-y-3">
                {TASK_META.map((meta) => (
                  <div
                    key={meta.key}
                    className={`card flex justify-between items-start gap-4 ${done(meta.key) ? 'opacity-70' : ''}`}
                  >
                    <div>
                      <h3 className={`font-bold flex items-center gap-2 ${done(meta.key) ? 'line-through' : ''}`}>
                        <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                        {meta.label}
                      </h3>
                      <p className="text-sm text-text-muted mt-1">{selected[meta.field]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(meta.key)}
                      className={`p-2 rounded-lg cursor-pointer ${
                        done(meta.key)
                          ? 'text-accent-green bg-accent-green-soft'
                          : 'text-text-muted hover:text-accent-green hover:bg-accent-green-soft'
                      }`}
                    >
                      <CheckCircle size={22} />
                    </button>
                  </div>
                ))}
              </section>

              <p className="text-xs text-text-muted">
                Tip: College free blocks stay as in the PDF timetable (Mon 12–3, Wed 11–2, etc.). Evening P0 = DSA — never skip.
              </p>
            </>
          ) : (
            <p className="text-text-muted">Select a day</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
