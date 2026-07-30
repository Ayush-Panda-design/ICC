import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/auth';
import { useAlertsSocket } from '../hooks/useAlertsSocket';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/notifications');
      const data = await res.json();
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useAlertsSocket({ onRefresh: load, silent: true });

  const markAll = async () => {
    await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
    load();
  };

  const markOne = async (id) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    load();
  };

  if (loading) return <div className="p-8">Loading notifications…</div>;

  return (
    <div className="page max-w-3xl space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bell className="shrink-0" /> Notifications
          </h1>
          <p className="text-text-muted text-sm">{unread} unread · openings, deadlines & coach check-ins</p>
        </div>
        <button
          type="button"
          onClick={markAll}
          className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-cream-dark self-start"
        >
          <CheckCheck size={16} /> Mark all read
        </button>
      </header>

      <div className="space-y-3">
        {items.map((n) => (
          <button
            key={n._id}
            type="button"
            onClick={() => markOne(n._id)}
            className={`w-full text-left card border-l-4 ${
              n.read ? 'border-border opacity-70' : 'border-accent-red'
            }`}
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold">{n.title}</p>
                {n.body && <p className="text-sm text-text-muted mt-1">{n.body}</p>}
                <p className="text-xs text-text-muted mt-2">
                  {new Date(n.createdAt).toLocaleString()} · {n.type}
                </p>
              </div>
              {n.url && (
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-accent-red text-sm flex items-center gap-1 shrink-0"
                >
                  Open <ExternalLink size={14} />
                </a>
              )}
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <p className="text-text-muted italic">No notifications yet. Coach check-ins and Sync Now will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
