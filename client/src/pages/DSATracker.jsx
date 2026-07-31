import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Search, CheckCircle, Circle, PlayCircle,
  RefreshCw, Award, X, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/auth';

const TRACKS = [
  { id: 'full', label: 'Full TUF+ (all)' },
  { id: 'startup_service', label: 'Sep path' },
  { id: 'faang', label: 'FAANG path' },
  { id: 'core', label: 'OA / Core staples' },
  { id: 'google_hard', label: 'Google Hard' },
  { id: 'revisit', label: 'Spaced revisit' },
  { id: 'week', label: 'This Week' }
];

const STATUS_CYCLE = ['Todo', 'In Progress', 'Done', 'Revisit'];

const emptyGate = {
  timeSpentMin: '',
  timeComplexity: '',
  spaceComplexity: '',
  approachQuality: 'optimal',
  confidence: 3,
  explainNote: ''
};

const DSATracker = () => {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('full');
  const [expandedTopics, setExpandedTopics] = useState({});
  const [search, setSearch] = useState('');
  const [gateModal, setGateModal] = useState(null); // { problem, nextStatus }
  const [gateForm, setGateForm] = useState(emptyGate);
  const [showPatterns, setShowPatterns] = useState(false);

  const fetchDSAData = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/dsa?track=${track}`);
      const data = await res.json();
      setTopics(data.topics || []);
      setStats(data.stats || null);
      if ((data.topics || []).length > 0) {
        setExpandedTopics((prev) => {
          if (Object.keys(prev).length) return prev;
          return { [data.topics[0]._id]: true };
        });
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error('Failed to load DSA sheet');
    }
  }, [track]);

  const fetchPatterns = useCallback(async () => {
    try {
      const res = await apiFetch('/api/dsa/patterns');
      const data = await res.json();
      setPatterns(data.patterns || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDSAData();
  }, [fetchDSAData]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const toggleTopic = (id) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openGate = (problem, nextStatus) => {
    setGateForm({
      timeSpentMin: problem.timeSpentMin || '',
      timeComplexity: problem.timeComplexity || '',
      spaceComplexity: problem.spaceComplexity || '',
      approachQuality: problem.approachQuality && problem.approachQuality !== 'unknown'
        ? problem.approachQuality
        : 'optimal',
      confidence: problem.confidence || 3,
      explainNote: problem.explainNote || ''
    });
    setGateModal({ problem, nextStatus });
  };

  const requestStatus = (problem, newStatus) => {
    if (newStatus === 'Done') {
      openGate(problem, 'Done');
      return;
    }
    patchStatus(problem._id, { status: newStatus });
  };

  const cycleStatus = (problem) => {
    const idx = STATUS_CYCLE.indexOf(problem.status);
    const newStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    requestStatus(problem, newStatus);
  };

  const patchStatus = async (id, body) => {
    try {
      const res = await apiFetch(`/api/dsa/problems/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      if (data.autoRevisit) {
        toast(data.autoRevisit, { icon: '🔁', duration: 6000 });
      } else {
        const name = data.problem?.name || 'Problem';
        toast.success(`${name.slice(0, 36)} → ${data.problem?.status}`);
      }
      setGateModal(null);
      fetchDSAData();
      fetchPatterns();
    } catch (e) {
      toast.error(e.message || 'Failed to update');
    }
  };

  const submitGate = () => {
    if (!gateModal) return;
    const mins = Number(gateForm.timeSpentMin);
    if (!mins || mins < 1) {
      toast.error('Enter time spent (minutes)');
      return;
    }
    if (!gateForm.timeComplexity.trim() || !gateForm.spaceComplexity.trim()) {
      toast.error('Write time & space complexity');
      return;
    }
    patchStatus(gateModal.problem._id, {
      status: 'Done',
      timeSpentMin: mins,
      timeComplexity: gateForm.timeComplexity.trim(),
      spaceComplexity: gateForm.spaceComplexity.trim(),
      approachQuality: gateForm.approachQuality,
      confidence: Number(gateForm.confidence),
      explainNote: gateForm.explainNote
    });
  };

  if (loading && !stats) return <div className="p-8">Loading DSA sheet…</div>;

  const filteredTopics = topics
    .map((t) => ({
      ...t,
      problems: (t.problems || []).filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.pattern || '').toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter((t) => t.problems.length > 0 || (!search && t.problems));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle size={18} className="text-accent-green" />;
      case 'In Progress':
        return <PlayCircle size={18} className="text-accent-yellow" />;
      case 'Revisit':
        return <RefreshCw size={18} className="text-accent-red" />;
      default:
        return <Circle size={18} className="text-text-muted" />;
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-accent-green bg-accent-green-soft';
    if (diff === 'Medium') return 'text-accent-yellow bg-accent-yellow-soft';
    if (diff === 'Hard') return 'text-accent-red bg-accent-red-soft';
    return 'text-text-muted bg-gray-100';
  };

  const visibleCount = filteredTopics.reduce((n, t) => n + t.problems.length, 0);

  return (
    <div className="page max-w-7xl space-y-6">
      <header className="pb-4 border-b border-border space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">DSA Tracker (TUF+)</h1>
            <p className="text-text-muted text-sm">
              Solve on TUF / LeetCode — log here. <strong>Finish every TUF+ problem</strong>
              {' '}({stats?.done || 0} / {stats?.total || '—'}). Patterns & OA filters prioritize order, not shortcuts.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search problem or pattern…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-cream-card border border-border rounded-lg focus:outline-none focus:border-accent-yellow transition w-full md:w-64"
            />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="card p-3">
              <p className="text-xs text-text-muted">Full TUF+ sheet</p>
              <p className="text-xl font-bold">
                {stats.done}
                <span className="text-sm text-text-muted font-normal"> / {stats.total}</span>
              </p>
              {stats.sheetComplete && <p className="text-xs text-accent-green font-bold">Sheet complete</p>}
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">Easy / Med / Hard</p>
              <p className="text-sm font-bold mt-1">
                {stats.easy?.done}/{stats.easy?.total} · {stats.medium?.done}/{stats.medium?.total} · {stats.hard?.done}/{stats.hard?.total}
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">Sep path</p>
              <p className="text-xl font-bold">{stats.sepTrack?.percentage || 0}%</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">OA / Core staples</p>
              <p className="text-xl font-bold">
                {stats.coreTrack?.done || 0}
                <span className="text-xs text-text-muted font-normal"> / {stats.coreTrack?.total || 0}</span>
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted flex items-center gap-1"><Flame size={12} /> Google Hard</p>
              <p className="text-xl font-bold">
                {stats.googleHardTrack?.done || 0}
                <span className="text-xs text-text-muted font-normal"> / {stats.googleHardTrack?.total || 0}</span>
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">Revisit due</p>
              <p className="text-xl font-bold text-accent-red">{stats.revisitDue || 0}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTrack(t.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                track === t.id
                  ? 'bg-accent-yellow text-white border-accent-yellow'
                  : 'bg-cream-card border-border text-text-primary hover:border-accent-yellow'
              }`}
            >
              {t.label}
              {t.id === 'week' && stats?.currentWeek ? ` (W${stats.currentWeek})` : ''}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowPatterns((v) => !v)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-cream-card"
          >
            {showPatterns ? 'Hide patterns' : 'Pattern mastery'}
          </button>
        </div>
        <p className="text-xs text-text-muted">
          Showing {visibleCount} · Hardness gate on Done: time + complexity required; &gt;45 min or wrong approach → auto Revisit.
        </p>
      </header>

      {showPatterns && (
        <section className="card space-y-3">
          <h2 className="font-bold">Pattern mastery (across full TUF+)</h2>
          <p className="text-xs text-text-muted">
            Hit targets for interview fluency — still complete every sheet problem in Full TUF+.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patterns.map((p) => (
              <div key={p.id} className="border border-border rounded-lg p-3 bg-cream-bg">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-xs font-bold">{p.percentage}%</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{p.done}/{p.total} done · target {p.masteryTarget}</p>
                <div className="mt-2 h-1.5 bg-cream-dark rounded-full overflow-hidden">
                  <div className="h-full bg-accent-green" style={{ width: `${p.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <div key={topic._id} className="card p-0 overflow-hidden">
            <div
              className={`p-3 sm:p-4 flex items-center justify-between gap-2 cursor-pointer transition hover:bg-cream-bg ${
                expandedTopics[topic._id] ? 'border-b border-border' : ''
              }`}
              onClick={() => toggleTopic(topic._id)}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {expandedTopics[topic._id] ? (
                  <ChevronDown size={20} className="text-text-muted shrink-0" />
                ) : (
                  <ChevronRight size={20} className="text-text-muted shrink-0" />
                )}
                <h2 className="font-bold text-base sm:text-lg truncate">
                  Step {topic.sheetStep || topic.order}: {topic.name}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold">
                  {topic.progress?.completed || 0} / {topic.progress?.total || topic.problems.length}
                </span>
                <div className="w-24 h-2 bg-cream-dark rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-accent-green"
                    style={{ width: `${topic.progress?.percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {expandedTopics[topic._id] && (
              <div className="bg-cream-bg divide-y divide-border">
                {topic.problems.map((problem, pIndex) => (
                  <div
                    key={problem._id}
                    className={`p-3 pl-4 sm:pl-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cream-card transition ${
                      problem.status === 'Done' ? 'opacity-80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <button type="button" onClick={() => cycleStatus(problem)} className="shrink-0" title="Cycle status">
                        {getStatusIcon(problem.status)}
                      </button>
                      <div className="text-text-muted text-sm w-5 shrink-0 hidden sm:block">{pIndex + 1}.</div>
                      <div className="min-w-0">
                        <span
                          className={`font-medium dsa-font text-sm sm:text-base break-words ${
                            problem.status === 'Done' ? 'line-through text-text-muted' : ''
                          }`}
                        >
                          {problem.name}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {problem.pattern && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream-dark text-text-muted">{problem.pattern}</span>
                          )}
                          {problem.isCore && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-yellow-soft text-accent-yellow font-bold">CORE</span>
                          )}
                          {problem.googleHard && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-red-soft text-accent-red font-bold">G-HARD</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pl-7 sm:pl-0">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <select
                        value={problem.status}
                        onChange={(e) => requestStatus(problem, e.target.value)}
                        className={`text-sm border border-border rounded-lg px-2 py-1 bg-cream-card focus:outline-none
                          ${
                            problem.status === 'Done'
                              ? 'text-accent-green border-accent-green'
                              : problem.status === 'In Progress'
                                ? 'text-accent-yellow border-accent-yellow'
                                : problem.status === 'Revisit'
                                  ? 'text-accent-red border-accent-red'
                                  : 'text-text-primary'
                          }`}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Revisit">Revisit</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {filteredTopics.length === 0 && (
          <div className="card p-8 text-center text-text-muted">No problems for this filter.</div>
        )}
      </div>

      {gateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-cream-card border border-border rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-lg">Hardness gate</h3>
                <p className="text-sm text-text-muted">{gateModal.problem.name}</p>
                <p className="text-xs text-text-muted mt-1">Solved on TUF/LeetCode? Log rigor here.</p>
              </div>
              <button type="button" onClick={() => setGateModal(null)} className="p-1 rounded hover:bg-cream-bg">
                <X size={18} />
              </button>
            </div>
            <label className="block text-sm">
              Time spent (min) *
              <input
                type="number"
                min={1}
                value={gateForm.timeSpentMin}
                onChange={(e) => setGateForm((f) => ({ ...f, timeSpentMin: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Time complexity *
                <input
                  placeholder="O(n)"
                  value={gateForm.timeComplexity}
                  onChange={(e) => setGateForm((f) => ({ ...f, timeComplexity: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
                />
              </label>
              <label className="block text-sm">
                Space complexity *
                <input
                  placeholder="O(1)"
                  value={gateForm.spaceComplexity}
                  onChange={(e) => setGateForm((f) => ({ ...f, spaceComplexity: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
                />
              </label>
            </div>
            <label className="block text-sm">
              Approach quality
              <select
                value={gateForm.approachQuality}
                onChange={(e) => setGateForm((f) => ({ ...f, approachQuality: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
              >
                <option value="optimal">Optimal</option>
                <option value="suboptimal">Suboptimal</option>
                <option value="wrong">Wrong / needed solution</option>
              </select>
            </label>
            <label className="block text-sm">
              Confidence (1–5)
              <input
                type="range"
                min={1}
                max={5}
                value={gateForm.confidence}
                onChange={(e) => setGateForm((f) => ({ ...f, confidence: e.target.value }))}
                className="mt-1 w-full"
              />
            </label>
            <label className="block text-sm">
              Explain in ~2 min (optional)
              <textarea
                rows={3}
                value={gateForm.explainNote}
                onChange={(e) => setGateForm((f) => ({ ...f, explainNote: e.target.value }))}
                placeholder="Brute → optimal idea, edge cases…"
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
              />
            </label>
            <p className="text-xs text-accent-red">
              If time &gt; 45 min or approach = wrong → status becomes Revisit (spaced queue).
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setGateModal(null)} className="px-4 py-2 rounded-lg border border-border">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitGate}
                className="px-4 py-2 rounded-lg bg-accent-green text-white font-medium flex items-center gap-1"
              >
                <Award size={16} /> Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSATracker;
