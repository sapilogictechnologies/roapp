import React from 'react';
import { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '../../services/api';
import toast from 'react-hot-toast';

export default function MyNotifications() {
  const { data, isLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 10000, refetchOnMountOrArgChange: true });
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Notifications {data?.unread > 0 && <span className="badge badge-blue ml-2">{data.unread} new</span>}</h1>
          <p>Order, payment, event, and service updates from AquaFlow.</p>
        </div>
        {data?.unread > 0 && <button onClick={() => markAllRead()} className="btn-secondary btn-sm">Mark all read</button>}
      </div>
      {isLoading ? <div className="card text-sm text-slate-500">Loading notifications...</div> : (
        <div className="space-y-2">
          {data?.notifications?.map(n => (
            <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} className={`card cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50 border-blue-200 border' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm">{n.title}</div>
                <div className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</div>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
            </div>
          ))}
          {!data?.notifications?.length && <div className="empty-state">No notifications yet.</div>}
        </div>
      )}
    </div>
  );
}
