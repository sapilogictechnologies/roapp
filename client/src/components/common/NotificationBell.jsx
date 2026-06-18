import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from '../../services/notificationApi';

const LAST_PLAYED_KEY = 'admin_last_played_notification_id';
const PLAYED_IDS_KEY = 'admin_played_notification_ids';

const getPlayedIds = () => {
  try {
    const value = JSON.parse(localStorage.getItem(PLAYED_IDS_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const playAdminNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const play = () => {
      const now = ctx.currentTime;
      [
        { freq: 880, start: 0, dur: 0.45 },
        { freq: 660, start: 0.35, dur: 0.55 },
      ].forEach(({ freq, start, dur }, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.18, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
        if (i === 1) osc.onended = () => ctx.close();
      });
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => { try { ctx.close(); } catch {} });
    } else {
      play();
    }
  } catch {}
};

const typeIcon = (type) => {
  if (!type) return '🔔';
  if (type.includes('order')) return '📦';
  if (type.includes('payment')) return '💳';
  if (type.includes('jar')) return '🫙';
  if (type.includes('event')) return '🎉';
  if (type.includes('subscription')) return '🔄';
  return '🔔';
};

export default function NotificationBell({ enableSound = false, soundMuted = false }) {
  const [open, setOpen] = useState(false);
  const { data } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const notifications = data?.notifications || [];
  const unread = data?.unread || 0;
  const latestUnread = notifications.find((item) => !item.isRead);

  useEffect(() => {
    if (!enableSound || soundMuted || !latestUnread?._id) return;
    const lastPlayed = localStorage.getItem(LAST_PLAYED_KEY);
    const playedIds = getPlayedIds();
    if (lastPlayed === latestUnread._id) return;
    if (playedIds.includes(latestUnread._id)) return;
    localStorage.setItem(LAST_PLAYED_KEY, latestUnread._id);
    localStorage.setItem(PLAYED_IDS_KEY, JSON.stringify([latestUnread._id, ...playedIds].slice(0, 50)));
    playAdminNotificationSound();
  }, [enableSound, soundMuted, latestUnread?._id]);

  const handleRead = (item) => {
    if (!item.isRead) markRead(item._id);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all"
        style={{ color: '#64748B' }}
        onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#1e40af'; }}
        onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#64748B'; }}
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={unread > 0 ? { animation: 'bellRing 2.5s ease-in-out infinite' } : {}}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center"
            style={{ boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] z-50 overflow-hidden animate-scale-in"
            style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.15),0 4px 16px rgba(0,0,0,0.08)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5" style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderBottom: '1px solid #BFDBFE' }}>
              <div>
                <p className="font-black text-slate-800 text-sm">Notifications</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: unread > 0 ? '#2563EB' : '#94A3B8' }}>
                  {unread > 0 ? `${unread} unread` : 'All caught up!'}
                </p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification items */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {notifications.slice(0, 8).map((item) => {
                const content = (
                  <div
                    className="flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
                    style={!item.isRead ? { background: 'rgba(239,246,255,0.7)' } : {}}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ background: !item.isRead ? 'rgba(37,99,235,0.1)' : '#F8FAFC' }}
                    >
                      {typeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-tight text-slate-800 ${!item.isRead ? 'text-slate-900' : ''}`}>
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-blue-500" style={{ boxShadow: '0 0 6px rgba(37,99,235,0.5)' }} />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{item.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );

                return item.link ? (
                  <Link key={item._id} to={item.link} onClick={() => handleRead(item)} className="block">
                    {content}
                  </Link>
                ) : (
                  <button key={item._id} type="button" onClick={() => handleRead(item)} className="block w-full text-left">
                    {content}
                  </button>
                );
              })}

              {!notifications.length && (
                <div className="px-4 py-10 text-center">
                  <div className="text-3xl mb-3">🔔</div>
                  <p className="font-semibold text-slate-700 text-sm">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">Order and payment updates will appear here.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
              style={{ borderTop: '1px solid #E2E8F0' }}
            >
              View all notifications →
            </Link>
          </div>
        </>
      )}

      {/* Bell ring keyframe */}
      <style>{`
        @keyframes bellRing {
          0%,100%{transform:rotate(0)}
          10%{transform:rotate(14deg)}
          20%{transform:rotate(-12deg)}
          30%{transform:rotate(10deg)}
          40%{transform:rotate(-8deg)}
          50%{transform:rotate(0)}
        }
      `}</style>
    </div>
  );
}
