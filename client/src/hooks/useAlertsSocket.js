import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_BASE } from '../api/auth';

/** Empty string = same origin (production single-service deploy). */
const SOCKET_URL = API_BASE || undefined;

let sharedSocket = null;

export function getSocket() {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });
  }
  return sharedSocket;
}

export function useAlertsSocket({ onRefresh, silent = false } = {}) {
  const [badgeCount, setBadgeCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const bump = useCallback((n = 1) => {
    setBadgeCount((c) => c + n);
  }, []);

  const clearBadge = useCallback(() => setBadgeCount(0), []);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onDaily = (payload) => {
      const red = payload?.redCount || 0;
      if (red > 0 && !silent) {
        setBadgeCount(red);
        toast(`Daily alerts: ${red} critical deadline(s)`, {
          icon: '🚨',
          duration: 6000
        });
      } else if (red > 0) {
        setBadgeCount(red);
      }
      onRefresh?.();
    };

    const onDeadline = (payload) => {
      if (!silent) {
        bump(1);
        const name = payload?.top?.name || 'a company';
        toast.error(`Deadline alert: ${name}`, { duration: 5000 });
      }
      onRefresh?.();
    };

    const onOpeningNew = (payload) => {
      if (!silent) {
        bump(1);
        const name = payload?.company?.name || 'Company';
        const title = payload?.role?.title || 'new role';
        toast.success(`Open now: ${name} — ${title}`, { duration: 5000 });
      }
      onRefresh?.();
    };

    const onOpeningClosed = (payload) => {
      if (!silent) {
        toast(`${payload?.company?.name || 'A role'} listing closed`, { icon: '📭' });
      }
      onRefresh?.();
    };

    const onNotification = (n) => {
      if (!silent) {
        bump(1);
        const title = n?.title || 'New notification';
        if (n?.type === 'url:broken') toast.error(title, { duration: 5000 });
        else if (n?.type === 'opening:new') toast.success(title, { duration: 5000 });
        else toast(title, { duration: 4500 });
      } else {
        bump(1);
      }
      onRefresh?.();
    };

    const onAppUpdated = () => onRefresh?.();
    const onSyncComplete = (summary) => {
      if (!silent && summary?.opened > 0) {
        toast.success(`Sync found ${summary.opened} open role(s)`, { duration: 4000 });
      }
      if (!silent && summary?.repaired > 0) {
        toast(`Repaired ${summary.repaired} apply links`, { icon: '🔗' });
      }
      onRefresh?.();
    };

    const onCoachAlert = (m) => {
      if (!silent) {
        bump(1);
        toast(m?.title || 'Coach check-in', {
          icon: m?.type === 'missed_day' || m?.type === 'streak_break' ? '⚠️' : '🎯',
          duration: 7000
        });
      } else {
        bump(1);
      }
      onRefresh?.();
    };

    const onCoachDaily = () => onRefresh?.();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('alert:daily', onDaily);
    socket.on('alert:deadline', onDeadline);
    socket.on('opening:new', onOpeningNew);
    socket.on('opening:closed', onOpeningClosed);
    socket.on('notification:new', onNotification);
    socket.on('application:updated', onAppUpdated);
    socket.on('sync:complete', onSyncComplete);
    socket.on('coach:alert', onCoachAlert);
    socket.on('coach:daily', onCoachDaily);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('alert:daily', onDaily);
      socket.off('alert:deadline', onDeadline);
      socket.off('opening:new', onOpeningNew);
      socket.off('opening:closed', onOpeningClosed);
      socket.off('notification:new', onNotification);
      socket.off('application:updated', onAppUpdated);
      socket.off('sync:complete', onSyncComplete);
      socket.off('coach:alert', onCoachAlert);
      socket.off('coach:daily', onCoachDaily);
    };
  }, [bump, onRefresh, silent]);

  return { badgeCount, clearBadge, connected };
}

export default useAlertsSocket;
