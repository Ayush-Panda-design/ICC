import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle, AlertTriangle, Clock, Target, Calendar, Award, Briefcase, ChevronRight, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { applyToCompany } from '../api/companies';
import { apiFetch } from '../api/auth';
import { useAlertsSocket } from '../hooks/useAlertsSocket';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = async () => {
    const response = await apiFetch('/api/dashboard/today');
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `API ${response.status}`);
    }
    return response.json();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const payload = await loadDashboard();
        setData(payload);
        setLoadError('');
        setLoading(false);
        if (payload.urgentCompanies && payload.urgentCompanies.length > 0) {
          toast(`Today's priority: Apply to ${payload.urgentCompanies[0].name}`, {
            icon: '🚀',
            duration: 5000
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoadError(error.message || 'Failed to load');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useAlertsSocket({
    silent: true,
    onRefresh: () => {
      loadDashboard().then(setData).catch(() => {});
    }
  });

  const handleUrgentApply = async () => {
    const company = data?.urgentCompanies?.[0];
    if (!company) return;
    try {
      await applyToCompany(company);
      toast.success(`Marked applied: ${company.name}`);
      setData(await loadDashboard());
    } catch {
      toast.error('Failed to apply');
    }
  };

  const toggleTask = async (taskKey) => {
    try {
      const res = await apiFetch('/api/dashboard/today/complete', {
        method: 'PATCH',
        body: JSON.stringify({ taskKey })
      });
      const payload = await res.json();
      setData((prev) => ({
        ...prev,
        task: payload.task,
        userProgress: payload.userProgress || prev.userProgress
      }));
      const done = payload.task?.completed?.includes(taskKey);
      toast.success(done ? 'Task marked done' : 'Task unmarked');
    } catch {
      toast.error('Could not update task');
    }
  };

  const markDayDone = async () => {
    try {
      const res = await apiFetch('/api/dashboard/today/complete-all', { method: 'PATCH' });
      const payload = await res.json();
      setData((prev) => ({
        ...prev,
        task: payload.task,
        userProgress: payload.userProgress || prev.userProgress
      }));
      toast.success('Day marked complete — streak updated');
    } catch {
      toast.error('Could not mark day done');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-accent-yellow font-bold text-xl">Loading Command Center...</div></div>;
  }

  if (!data) {
    return (
      <div className="p-8 max-w-xl space-y-3">
        <p className="font-bold text-accent-red">Couldn’t load dashboard data</p>
        <p className="text-sm text-text-muted">{loadError || 'API request failed.'}</p>
        <p className="text-sm text-text-muted">
          If this is Render: Atlas is likely blocking the server IP. In MongoDB Atlas →{' '}
          <b>Network Access</b> → add <code>0.0.0.0/0</code> (Allow from anywhere), then set{' '}
          <code>MONGO_URI</code> with database name <code>interview-command-center</code>, restart, and run{' '}
          <code>cd server && npm run seed</code> once.
        </p>
      </div>
    );
  }

  const { userProgress, task, urgentCompanies, onTrackStatus, quote, performance } = data;
  const completed = task?.completed || [];
  const isDone = (key) => completed.includes(key);

  const getStatusColor = (status) => {
    if (status === 'GREEN') return 'bg-accent-green text-white';
    if (status === 'YELLOW') return 'bg-accent-yellow text-white';
    if (status === 'RED') return 'bg-accent-red text-white';
    return 'bg-cream-dark text-text-primary';
  };
  
  const getOnTrackMessage = (status) => {
    if (status === 'GREEN') return 'You are on track. Keep it up!';
    if (status === 'YELLOW') return 'Slightly behind. Catch up today.';
    if (status === 'RED') return 'Warning! Urgent action required to stay on track.';
    return '';
  };

  const progressData = [
    { name: 'Completed', value: userProgress?.dsaCompleted || 0, color: '#2A9D8F' },
    { name: 'Remaining', value: 474 - (userProgress?.dsaCompleted || 0), color: '#F5EDE0' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-end pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-1">Good evening, Ayush</h1>
          <p className="text-text-muted flex items-center gap-2">
            <Calendar size={16} />
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Phase {performance?.phase || userProgress?.currentPhase || 1}
            {performance?.theme ? ` • W${performance.weekNumber}: ${performance.theme}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-text-muted">Current Streak</p>
            <p className="text-2xl font-bold text-accent-yellow flex items-center gap-1">
              🔥 {userProgress?.streak || 0} days
            </p>
          </div>
        </div>
      </header>

      {/* Urgent Deadline Banner */}
      {urgentCompanies && urgentCompanies.length > 0 && (
        <div className="bg-accent-red-soft border-l-4 border-accent-red p-4 rounded-r-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-accent-red" />
            <div>
              <p className="font-bold text-accent-red">Urgent Deadline: {urgentCompanies[0].name}</p>
              <p className="text-sm text-accent-red/80">
                {urgentCompanies[0].role} — {differenceInDays(new Date(urgentCompanies[0].deadline), new Date())} days left
              </p>
            </div>
          </div>
          <button
            onClick={handleUrgentApply}
            className="px-4 py-2 bg-accent-red text-white rounded-lg font-medium shadow-sm hover:bg-accent-red/90 transition"
          >
            Apply Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Tasks & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Task Alert Card */}
          <section className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="text-accent-yellow" /> Today's Priority Tasks
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(onTrackStatus)}`}>
                {onTrackStatus}
              </span>
            </div>
            
            <div className="space-y-4">
              {/* DSA Task */}
              <div className={`p-4 bg-cream-bg rounded-xl border border-border flex justify-between items-start ${isDone('dsa') ? 'opacity-70' : ''}`}>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDone('dsa') ? 'line-through' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-accent-yellow"></span> Data Structures & Algorithms
                  </h3>
                  <ul className="text-sm space-y-1 text-text-muted ml-4 list-disc dsa-font">
                    {task?.dsaFocus ? (
                      <li>{task.dsaFocus}</li>
                    ) : task?.dsaProblems && task.dsaProblems.length > 0 ? (
                      task.dsaProblems.map((prob, i) => <li key={i}>{prob.name || 'Problem'}</li>)
                    ) : (
                      <li>No specific DSA problems assigned today.</li>
                    )}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTask('dsa')}
                  title={isDone('dsa') ? 'Unmark DSA' : 'Mark DSA done'}
                  className={`p-2 rounded-lg transition cursor-pointer ${isDone('dsa') ? 'text-accent-green bg-accent-green-soft' : 'text-text-muted hover:text-accent-green hover:bg-accent-green-soft'}`}
                >
                  <CheckCircle size={20} />
                </button>
              </div>

              {/* Core CS */}
              <div className={`p-4 bg-cream-bg rounded-xl border border-border flex justify-between items-center ${isDone('coreCS') ? 'opacity-70' : ''}`}>
                <div>
                  <h3 className={`font-bold flex items-center gap-2 ${isDone('coreCS') ? 'line-through' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-accent-green"></span> Core CS: {task?.coreCS || 'Review'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTask('coreCS')}
                  title={isDone('coreCS') ? 'Unmark Core CS' : 'Mark Core CS done'}
                  className={`p-2 rounded-lg transition cursor-pointer ${isDone('coreCS') ? 'text-accent-green bg-accent-green-soft' : 'text-text-muted hover:text-accent-green hover:bg-accent-green-soft'}`}
                >
                  <CheckCircle size={20} />
                </button>
              </div>

              {/* Tech Stack */}
              <div className={`p-4 bg-cream-bg rounded-xl border border-border flex justify-between items-center ${isDone('techRevision') ? 'opacity-70' : ''}`}>
                <div>
                  <h3 className={`font-bold flex items-center gap-2 ${isDone('techRevision') ? 'line-through' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-accent-green"></span> Tech Revision: {task?.techRevision || 'Review'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTask('techRevision')}
                  title={isDone('techRevision') ? 'Unmark Tech' : 'Mark Tech done'}
                  className={`p-2 rounded-lg transition cursor-pointer ${isDone('techRevision') ? 'text-accent-green bg-accent-green-soft' : 'text-text-muted hover:text-accent-green hover:bg-accent-green-soft'}`}
                >
                  <CheckCircle size={20} />
                </button>
              </div>
              
              {/* Application */}
              <div className={`p-4 bg-cream-bg rounded-xl border border-border flex justify-between items-center ${isDone('application') ? 'opacity-70' : ''}`}>
                <div>
                  <h3 className={`font-bold flex items-center gap-2 ${isDone('application') ? 'line-through' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-accent-red"></span> App/Network: {task?.applicationTask || 'Apply to 1 Startup'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTask('application')}
                  title={isDone('application') ? 'Unmark Applications' : 'Mark Applications done'}
                  className={`p-2 rounded-lg transition cursor-pointer ${isDone('application') ? 'text-accent-green bg-accent-green-soft' : 'text-text-muted hover:text-accent-green hover:bg-accent-green-soft'}`}
                >
                  <CheckCircle size={20} />
                </button>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="https://leetcode.com/" target="_blank" rel="noreferrer" className="card p-4 hover:shadow-md transition text-center group cursor-pointer">
              <div className="w-10 h-10 mx-auto bg-cream-dark rounded-full flex items-center justify-center mb-2 group-hover:bg-accent-yellow-soft transition">
                <ExternalLink size={18} className="text-text-primary" />
              </div>
              <span className="text-sm font-medium">LeetCode</span>
            </a>
            <a href="https://internshala.com/" target="_blank" rel="noreferrer" className="card p-4 hover:shadow-md transition text-center group cursor-pointer">
              <div className="w-10 h-10 mx-auto bg-cream-dark rounded-full flex items-center justify-center mb-2 group-hover:bg-accent-green-soft transition">
                <Briefcase size={18} className="text-text-primary" />
              </div>
              <span className="text-sm font-medium">Internshala</span>
            </a>
            <a href="https://ayushdev-five.vercel.app/" target="_blank" rel="noreferrer" className="card p-4 hover:shadow-md transition text-center group cursor-pointer">
              <div className="w-10 h-10 mx-auto bg-cream-dark rounded-full flex items-center justify-center mb-2 group-hover:bg-accent-red-soft transition">
                <ExternalLink size={18} className="text-text-primary" />
              </div>
              <span className="text-sm font-medium">Portfolio</span>
            </a>
            <button
              type="button"
              onClick={markDayDone}
              className="card p-4 hover:shadow-md transition text-center group cursor-pointer border-none w-full"
            >
              <div className="w-10 h-10 mx-auto bg-cream-dark rounded-full flex items-center justify-center mb-2 group-hover:bg-accent-green-soft transition">
                <CheckCircle size={18} className="text-accent-green" />
              </div>
              <span className="text-sm font-medium">Mark Day Done</span>
            </button>
          </section>

        </div>

        {/* Right Column: Progress & Motivation */}
        <div className="space-y-6">
          
          {/* On Track Widget */}
          <section className="card">
            <h3 className="font-bold mb-4">Weekly Checkpoint</h3>
            <div className={`p-4 rounded-xl border ${onTrackStatus === 'GREEN' ? 'bg-accent-green-soft border-accent-green/30' : onTrackStatus === 'YELLOW' ? 'bg-accent-yellow-soft border-accent-yellow/30' : 'bg-accent-red-soft border-accent-red/30'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(onTrackStatus)} shadow-sm`}></div>
                <h4 className="font-bold text-lg">Status: {onTrackStatus}</h4>
              </div>
              <p className="text-sm text-text-muted mb-2">{getOnTrackMessage(onTrackStatus)}</p>
              {performance && (
                <div className="text-sm space-y-1 mt-3 pt-3 border-t border-border/50">
                  <p><b>DSA:</b> {performance.dsaCompleted}/{performance.dsaTarget} (week target)</p>
                  <p><b>Week tasks done:</b> {performance.weekTasksDone}/{performance.weekTasksTotal}</p>
                  <p><b>Apps:</b> {performance.applicationsSent} · <b>Mocks:</b> {performance.mocksCompleted}</p>
                  {performance.mustHaveDone?.length > 0 && (
                    <p className="text-xs text-text-muted mt-2"><b>Must-have:</b> {performance.mustHaveDone.join(' · ')}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Progress Rings */}
          <section className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Award className="text-accent-green"/> DSA Progress</h3>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-text-primary">{userProgress?.dsaCompleted || 0}</span>
                <span className="text-xs text-text-muted">/ 474</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
               <div className="bg-cream-bg p-3 rounded-xl text-center border border-border">
                 <p className="text-xs text-text-muted mb-1">Mocks Done</p>
                 <p className="font-bold text-lg">{userProgress?.mocksCompleted || 0}</p>
               </div>
               <div className="bg-cream-bg p-3 rounded-xl text-center border border-border">
                 <p className="text-xs text-text-muted mb-1">Apps Sent</p>
                 <p className="font-bold text-lg">{userProgress?.applicationsSent || 0}</p>
               </div>
            </div>
          </section>

          {/* Motivation Quote */}
          <section className="card bg-gradient-to-br from-cream-dark to-cream-bg border-none">
             <p className="italic text-text-primary mb-3">"{quote?.text}"</p>
             <p className="text-sm text-text-muted font-bold text-right">— {quote?.author}</p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
