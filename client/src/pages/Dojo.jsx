import React, { useState, useEffect, useCallback } from 'react';
import {
  Swords, Mic2, Boxes, MessageSquare, BookOpen, Timer, Plus, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/auth';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Swords },
  { id: 'mocks', label: 'Mocks', icon: Mic2 },
  { id: 'oa', label: 'OA packs', icon: Timer },
  { id: 'design', label: 'LLD / HLD', icon: Boxes },
  { id: 'star', label: 'STAR', icon: MessageSquare },
  { id: 'core', label: 'Core CS', icon: BookOpen }
];

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Meta'];

const Dojo = () => {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [mocks, setMocks] = useState([]);
  const [oaPack, setOaPack] = useState(null);
  const [oaCompany, setOaCompany] = useState('Google');
  const [oaSessions, setOaSessions] = useState([]);
  const [design, setDesign] = useState([]);
  const [designKind, setDesignKind] = useState('');
  const [star, setStar] = useState([]);
  const [drillStory, setDrillStory] = useState(null);
  const [core, setCore] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mockForm, setMockForm] = useState({
    company: '',
    stage: 'Peer',
    type: 'Startup',
    scoreCode: 3,
    scoreComms: 3,
    scoreComplexity: 3,
    notes: '',
    durationMin: 45
  });
  const [oaForm, setOaForm] = useState({ company: 'Google', problemNames: '', durationMin: 90 });
  const [activeOa, setActiveOa] = useState(null);
  const [oaLeft, setOaLeft] = useState(0);

  const loadOverview = useCallback(async () => {
    const res = await apiFetch('/api/prep/overview');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Dojo API failed (${res.status}). Restart the server.`);
    }
    setOverview(data);
  }, []);

  const loadMocks = useCallback(async () => {
    const res = await apiFetch('/api/prep/mocks');
    setMocks(await res.json());
  }, []);

  const loadOa = useCallback(async () => {
    const [packRes, sessRes] = await Promise.all([
      apiFetch(`/api/dsa/oa-pack?company=${oaCompany}`),
      apiFetch('/api/prep/oa-sessions')
    ]);
    setOaPack(await packRes.json());
    setOaSessions(await sessRes.json());
  }, [oaCompany]);

  const loadDesign = useCallback(async () => {
    const q = designKind ? `?kind=${designKind}` : '';
    const res = await apiFetch(`/api/prep/design${q}`);
    setDesign(await res.json());
  }, [designKind]);

  const loadStar = useCallback(async () => {
    const res = await apiFetch('/api/prep/star');
    setStar(await res.json());
  }, []);

  const loadCore = useCallback(async () => {
    const res = await apiFetch('/api/prep/core-cs');
    setCore(await res.json());
  }, []);

  useEffect(() => {
    loadOverview().catch(() => toast.error('Failed to load dojo'));
  }, [loadOverview]);

  useEffect(() => {
    if (tab === 'mocks') loadMocks().catch(() => {});
    if (tab === 'oa') loadOa().catch(() => {});
    if (tab === 'design') loadDesign().catch(() => {});
    if (tab === 'star') loadStar().catch(() => {});
    if (tab === 'core') loadCore().catch(() => {});
  }, [tab, loadMocks, loadOa, loadDesign, loadStar, loadCore]);

  useEffect(() => {
    if (!activeOa?.endsAt) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(activeOa.endsAt) - Date.now()) / 1000));
      setOaLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeOa]);

  const submitMock = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/prep/mocks', {
        method: 'POST',
        body: JSON.stringify(mockForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Mock logged');
      loadMocks();
      loadOverview();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startOaSession = async () => {
    const names = oaForm.problemNames
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await apiFetch('/api/prep/oa-sessions', {
        method: 'POST',
        body: JSON.stringify({
          company: oaForm.company,
          problemNames: names.length ? names : ['Problem 1', 'Problem 2'],
          durationMin: Number(oaForm.durationMin) || 90
        })
      });
      const session = await res.json();
      if (!res.ok) throw new Error(session.message);
      const endsAt = new Date(Date.now() + (session.durationMin || 90) * 60000).toISOString();
      setActiveOa({ ...session, endsAt });
      toast.success('OA timer started — solve on LeetCode/TUF');
      loadOa();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const finishOa = async (solvedCount) => {
    if (!activeOa?._id) return;
    await apiFetch(`/api/prep/oa-sessions/${activeOa._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed', solvedCount })
    });
    setActiveOa(null);
    toast.success('OA session saved');
    loadOa();
  };

  const patchDesign = async (id, body) => {
    await apiFetch(`/api/prep/design/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    loadDesign();
  };

  const randomStar = async () => {
    const res = await apiFetch('/api/prep/star/random');
    const story = await res.json();
    setDrillStory(story);
  };

  const markStarDrilled = async () => {
    if (!drillStory) return;
    await apiFetch(`/api/prep/star/${drillStory._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ drilled: true })
    });
    toast.success('STAR drill counted');
    loadStar();
  };

  const pullQuiz = async (subject = '') => {
    const q = subject ? `?subject=${subject}` : '';
    const res = await apiFetch(`/api/prep/core-cs/quiz${q}`);
    setQuiz(await res.json());
    setShowAnswer(false);
  };

  const scoreQuiz = async (selfScore) => {
    if (!quiz) return;
    await apiFetch(`/api/prep/core-cs/${quiz._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ selfScore })
    });
    toast.success(`Scored ${selfScore}/4`);
    setQuiz(null);
    loadCore();
  };

  const fmtTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="page max-w-5xl space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Interview Dojo</h1>
        <p className="text-text-muted text-sm">
          Mocks, OA timers, design, STAR, Core CS — code still on TUF/LeetCode. Full TUF+ sheet stays mandatory in DSA Tracker.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-sm rounded-lg border flex items-center gap-1.5 ${
              tab === id ? 'bg-accent-red text-white border-accent-red' : 'bg-cream-card border-border'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && overview && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`card p-4 ${overview.mockPressure ? 'border-accent-red' : ''}`}>
              <p className="text-xs text-text-muted">Mocks this week</p>
              <p className="text-2xl font-bold">
                {overview.mocksThisWeek} / {overview.mockTarget || 0}
              </p>
              <p className="text-xs mt-1">
                Phase {overview.phase}
                {overview.mockTarget >= 2 ? ' · Dec target: 2/week' : overview.mockTarget ? ' · build habit' : ' · ramp later'}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-text-muted">Design drills</p>
              <p className="text-2xl font-bold">{overview.design?.done}/{overview.design?.total}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-text-muted">STAR ready</p>
              <p className="text-2xl font-bold">{overview.star?.ready}/{overview.star?.total}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-text-muted">Core CS strong</p>
              <p className="text-2xl font-bold">{overview.coreCs?.strong}/{overview.coreCs?.total}</p>
            </div>
          </div>
          <div className="card p-4 text-sm text-text-muted space-y-2">
            <p className="font-bold text-text-primary">6-month bar</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>100% TUF+ sheet with hardness gate (no skipping)</li>
              <li>OA staples + company packs for Google/MS/Amazon/Meta</li>
              <li>Weekly Google Hard day (graphs / hard DP / tries)</li>
              <li>Startup apps now (portfolio fit) → FAANG when sheet + mocks ready</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'mocks' && (
        <div className="space-y-6">
          <form onSubmit={submitMock} className="card space-y-3">
            <h2 className="font-bold flex items-center gap-2"><Plus size={16} /> Log mock</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                placeholder="Company / peer"
                value={mockForm.company}
                onChange={(e) => setMockForm((f) => ({ ...f, company: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-cream-bg"
              />
              <select
                value={mockForm.stage}
                onChange={(e) => setMockForm((f) => ({ ...f, stage: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-cream-bg"
              >
                {['OA', 'Phone', 'Onsite', 'Behavioral', 'System Design', 'Peer'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={mockForm.type}
                onChange={(e) => setMockForm((f) => ({ ...f, type: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-cream-bg"
              >
                {['Startup', 'Service', 'Product', 'FAANG'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Duration min"
                value={mockForm.durationMin}
                onChange={(e) => setMockForm((f) => ({ ...f, durationMin: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-cream-bg"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                ['scoreCode', 'Code 1–4'],
                ['scoreComms', 'Comms 1–4'],
                ['scoreComplexity', 'Complexity 1–4']
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={mockForm[key]}
                    onChange={(e) => setMockForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
                  />
                </label>
              ))}
            </div>
            <textarea
              placeholder="Notes / weak topics"
              value={mockForm.notes}
              onChange={(e) => setMockForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
              rows={2}
            />
            <button type="submit" className="px-4 py-2 bg-accent-red text-white rounded-lg font-medium">
              Save mock
            </button>
          </form>
          <div className="space-y-2">
            {mocks.map((m) => (
              <div key={m._id} className="card p-3 text-sm flex flex-wrap justify-between gap-2">
                <div>
                  <span className="font-bold">{m.company || 'Mock'}</span>
                  <span className="text-text-muted"> · {m.stage} · {m.type}</span>
                  <p className="text-xs text-text-muted">{new Date(m.date).toLocaleString()}</p>
                </div>
                <div className="font-mono text-xs">
                  C{m.scoreCode} / Comm{m.scoreComms} / X{m.scoreComplexity}
                </div>
              </div>
            ))}
            {!mocks.length && <p className="text-text-muted italic">No mocks yet — Pramp / peer / self timed.</p>}
          </div>
        </div>
      )}

      {tab === 'oa' && (
        <div className="space-y-6">
          {activeOa && (
            <div className="card p-4 border-accent-red space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Live OA · {activeOa.company}</h2>
                <span className="text-2xl font-mono font-bold">{fmtTimer(oaLeft)}</span>
              </div>
              <ul className="text-sm list-disc pl-5">
                {(activeOa.problemNames || []).map((n) => <li key={n}>{n}</li>)}
              </ul>
              <div className="flex gap-2">
                <button type="button" onClick={() => finishOa(2)} className="px-3 py-1.5 bg-accent-green text-white rounded-lg text-sm">
                  Done (2+)
                </button>
                <button type="button" onClick={() => finishOa(1)} className="px-3 py-1.5 border border-border rounded-lg text-sm">
                  Done (1)
                </button>
                <button type="button" onClick={() => finishOa(0)} className="px-3 py-1.5 border border-border rounded-lg text-sm">
                  Abort
                </button>
              </div>
            </div>
          )}

          <div className="card space-y-3">
            <h2 className="font-bold">Start 90-min OA (solve externally)</h2>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setOaCompany(c); setOaForm((f) => ({ ...f, company: c })); }}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${oaCompany === c ? 'bg-accent-yellow text-white border-accent-yellow' : 'border-border'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Paste 2–3 problem names (one per line) from pack below"
              value={oaForm.problemNames}
              onChange={(e) => setOaForm((f) => ({ ...f, problemNames: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-cream-bg"
              rows={3}
            />
            <button type="button" onClick={startOaSession} className="px-4 py-2 bg-text-primary text-white rounded-lg">
              Start timer
            </button>
          </div>

          {oaPack && (
            <div className="space-y-2">
              <h2 className="font-bold">{oaPack.company} OA pack · {oaPack.count} (frequency-ordered)</h2>
              <p className="text-xs text-text-muted">{oaPack.mockHint}</p>
              {oaPack.items?.map((item) => (
                <div key={item.name} className="card p-3 text-sm flex flex-wrap justify-between gap-2">
                  <div>
                    <span className="font-medium">{item.order}. {item.name}</span>
                    <span className="text-text-muted"> · {item.pattern} · {item.priority}</span>
                    <p className="text-xs text-text-muted mt-1">{item.why}</p>
                  </div>
                  <div className="text-xs font-bold">
                    {item.status}
                    {!item.onSheet && <span className="text-accent-yellow"> · gap</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {oaSessions.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Recent OA sessions</h3>
              {oaSessions.slice(0, 5).map((s) => (
                <div key={s._id} className="text-sm text-text-muted py-1">
                  {s.company} · {s.status} · {s.solvedCount}/{s.totalCount} · {new Date(s.startedAt).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'design' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['', 'LLD', 'HLD'].map((k) => (
              <button
                key={k || 'all'}
                type="button"
                onClick={() => setDesignKind(k)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${designKind === k ? 'bg-accent-yellow text-white border-accent-yellow' : 'border-border'}`}
              >
                {k || 'All'}
              </button>
            ))}
          </div>
          {design.map((d) => (
            <div key={d._id} className="card p-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-bold">{d.title} <span className="text-xs font-normal text-text-muted">{d.kind}</span></h3>
                <select
                  value={d.status}
                  onChange={(e) => patchDesign(d._id, { status: e.target.value })}
                  className="text-sm border border-border rounded-lg px-2 py-1 bg-cream-bg"
                >
                  {['Todo', 'In Progress', 'Done', 'Revisit'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <p className="text-sm text-text-muted">{d.prompt}</p>
              <ul className="text-xs list-disc pl-5 text-text-muted">
                {(d.checklist || []).map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'star' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={randomStar} className="px-4 py-2 bg-accent-red text-white rounded-lg flex items-center gap-2">
              <RefreshCw size={14} /> Random 2-min drill
            </button>
            {drillStory && (
              <button type="button" onClick={markStarDrilled} className="px-4 py-2 border border-border rounded-lg">
                Mark drilled
              </button>
            )}
          </div>
          {drillStory && (
            <div className="card p-4 border-accent-yellow space-y-2">
              <h3 className="font-bold">{drillStory.title}</h3>
              <p className="text-xs text-text-muted">{drillStory.theme} · {drillStory.projectHint}</p>
              <p><strong>S:</strong> {drillStory.situation}</p>
              <p><strong>T:</strong> {drillStory.task}</p>
              <p><strong>A:</strong> {drillStory.action}</p>
              <p><strong>R:</strong> {drillStory.result}</p>
              <p className="text-xs text-text-muted">
                Google: {(drillStory.googleValues || []).join(', ')} · MS: {(drillStory.microsoftValues || []).join(', ')} · Amazon: {(drillStory.amazonLPs || []).join(', ')}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {star.map((s) => (
              <div key={s._id} className="card p-3 text-sm flex justify-between gap-2">
                <span className="font-medium">{s.title}</span>
                <span className="text-xs text-text-muted">{s.status} · drilled {s.drillCount || 0}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'core' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => pullQuiz('')} className="px-4 py-2 bg-accent-red text-white rounded-lg">
              Oral quiz
            </button>
            {['OS', 'DBMS', 'CN', 'OOP'].map((s) => (
              <button key={s} type="button" onClick={() => pullQuiz(s)} className="px-3 py-2 border border-border rounded-lg text-sm">
                {s}
              </button>
            ))}
          </div>
          {quiz && (
            <div className="card p-4 space-y-3">
              <p className="text-xs font-bold text-text-muted">{quiz.subject} · {quiz.difficulty}</p>
              <p className="font-bold text-lg">{quiz.question}</p>
              {!showAnswer ? (
                <button type="button" onClick={() => setShowAnswer(true)} className="px-3 py-1.5 border border-border rounded-lg text-sm">
                  Reveal answer key
                </button>
              ) : (
                <p className="text-sm bg-cream-bg p-3 rounded-lg border border-border">{quiz.answerKey}</p>
              )}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => scoreQuiz(n)}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm"
                  >
                    {n}/4
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-2">
            {core.map((c) => (
              <div key={c._id} className="border border-border rounded-lg p-2 text-xs bg-cream-card">
                <span className="font-bold">{c.subject}</span> · {c.status}
                <p className="text-text-muted mt-1 line-clamp-2">{c.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dojo;
