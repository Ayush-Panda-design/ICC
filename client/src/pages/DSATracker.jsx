import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Search, CheckCircle, Circle, PlayCircle, RefreshCw, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/auth';

const TRACKS = [
  { id: 'startup_service', label: 'Sep Interview Ready' },
  { id: 'faang', label: 'FAANG Path' },
  { id: 'full', label: 'Full Sheet' },
  { id: 'week', label: 'This Week' }
];

const STATUS_CYCLE = ['Todo', 'In Progress', 'Done', 'Revisit'];

const DSATracker = () => {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('startup_service');
  const [expandedTopics, setExpandedTopics] = useState({});
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    setLoading(true);
    fetchDSAData();
  }, [fetchDSAData]);

  const toggleTopic = (id) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cycleStatus = async (problem) => {
    const idx = STATUS_CYCLE.indexOf(problem.status);
    const newStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    try {
      await apiFetch(`/api/dsa/problems/${problem._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`${problem.name.slice(0, 40)} → ${newStatus}`);
      fetchDSAData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleStatusChange = async (problemId, newStatus) => {
    try {
      await apiFetch(`/api/dsa/problems/${problemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Marked as ${newStatus}`);
      fetchDSAData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading && !stats) return <div className="p-8">Loading DSA sheet…</div>;

  const filteredTopics = topics
    .map((t) => ({
      ...t,
      problems: (t.problems || []).filter(
        (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())
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
            <p className="text-text-muted">
              Progress checklist on ICC — {stats?.done || 0} / {stats?.total || 480} done
              {stats?.interviewReady ? ' · Interview Ready' : ''}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search step or problem…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-cream-card border border-border rounded-lg focus:outline-none focus:border-accent-yellow transition w-full md:w-64"
            />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card p-3">
              <p className="text-xs text-text-muted">Done</p>
              <p className="text-xl font-bold">
                {stats.done}
                <span className="text-sm text-text-muted font-normal"> / {stats.total}</span>
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">Easy / Med / Hard</p>
              <p className="text-sm font-bold mt-1">
                {stats.easy?.done}/{stats.easy?.total} · {stats.medium?.done}/{stats.medium?.total} · {stats.hard?.done}/{stats.hard?.total}
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">Track A (Sep)</p>
              <p className="text-xl font-bold">
                {stats.sepTrack?.percentage || 0}%
                <span className="text-xs text-text-muted font-normal ml-1">
                  {stats.sepTrack?.done}/{stats.sepTrack?.total}
                </span>
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-text-muted">Track B (FAANG)</p>
              <p className="text-xl font-bold">
                {stats.faangTrack?.percentage || 0}%
                <span className="text-xs text-text-muted font-normal ml-1">
                  {stats.faangTrack?.done}/{stats.faangTrack?.total}
                </span>
              </p>
            </div>
            <div className="card p-3 flex items-center gap-2">
              {stats.interviewReady ? (
                <>
                  <Award className="text-accent-green" size={22} />
                  <div>
                    <p className="text-xs text-accent-green font-bold">Interview Ready</p>
                    <p className="text-xs text-text-muted">Sep track milestone</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs text-text-muted">Week {stats.currentWeek}</p>
                  <p className="text-sm font-bold">{stats.weekCount} tagged this week</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
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
        </div>
        <p className="text-xs text-text-muted">
          Showing {visibleCount} problems
          {track === 'startup_service' && ' · Startup + service interview path (by Sep 28)'}
          {track === 'faang' && ' · Product / FAANG foundation (through full sheet)'}
          {track === 'full' && ' · All sheet steps'}
          {track === 'week' && ` · Planner targetWeek ${stats?.currentWeek || ''}`}
        </p>
      </header>

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
                <span className="text-sm font-medium text-text-muted hidden md:inline">
                  Phase {topic.month} · Week {topic.week}
                </span>
                <div className="flex items-center gap-2">
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
                      <button
                        type="button"
                        onClick={() => cycleStatus(problem)}
                        className="shrink-0"
                        title="Cycle status"
                      >
                        {getStatusIcon(problem.status)}
                      </button>
                      <div className="text-text-muted text-sm w-5 shrink-0 hidden sm:block">{pIndex + 1}.</div>
                      <span
                        className={`font-medium dsa-font text-sm sm:text-base break-words ${
                          problem.status === 'Done' ? 'line-through text-text-muted' : ''
                        }`}
                      >
                        {problem.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pl-7 sm:pl-0">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      {problem.track === 'faang' && (
                        <span className="text-[10px] uppercase tracking-wide text-text-muted">FAANG</span>
                      )}
                      <select
                        value={problem.status}
                        onChange={(e) => handleStatusChange(problem._id, e.target.value)}
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
                {topic.problems.length === 0 && (
                  <div className="p-4 text-center text-text-muted text-sm italic">No problems match your search in this step.</div>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredTopics.length === 0 && (
          <div className="card p-8 text-center text-text-muted">No problems for this filter.</div>
        )}
      </div>
    </div>
  );
};

export default DSATracker;
