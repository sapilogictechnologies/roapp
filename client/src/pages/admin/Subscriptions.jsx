import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAllSubscriptionsQuery,
  useProcessDueSubscriptionsMutation,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
} from '../../services/api';

const freqLabel = { daily: 'Daily', alternate: 'Alternate', weekly: 'Weekly', '15day': '15 Days', monthly: 'Monthly' };
const statusColor = { active: 'badge-green', paused: 'badge-yellow', cancelled: 'badge-red' };

export default function AdminSubscriptions() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useGetAllSubscriptionsQuery({ page, limit: 20, status });
  const [processDue, { isLoading: processing }] = useProcessDueSubscriptionsMutation();
  const [pauseSub] = usePauseSubscriptionMutation();
  const [resumeSub] = useResumeSubscriptionMutation();
  const [cancelSub] = useCancelSubscriptionMutation();

  const handleProcess = async () => {
    try {
      const res = await processDue().unwrap();
      toast.success(`Processed ${res.processed} subscriptions`);
    } catch { toast.error('Failed to process'); }
  };

  const handlePause = async (id) => {
    try { await pauseSub({ id }).unwrap(); toast.success('Paused'); }
    catch { toast.error('Failed to pause'); }
  };

  const handleResume = async (id) => {
    try { await resumeSub(id).unwrap(); toast.success('Resumed'); }
    catch { toast.error('Failed to resume'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try { await cancelSub(id).unwrap(); toast.success('Cancelled'); }
    catch { toast.error('Failed to cancel'); }
  };

  const subs = data?.subscriptions || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / 20) || 1;

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Subscriptions</h1>
          <p>Monitor recurring orders and process due deliveries.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleProcess} disabled={processing} className="btn-success btn-sm">
            {processing ? 'Processing...' : '▶ Process Due Orders'}
          </button>
        </div>
      </div>

      {total > 0 && (
        <div className="flex gap-4 text-sm text-slate-500 px-1">
          Showing {subs.length} of {total} subscriptions
        </div>
      )}

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading subscriptions...</div>
      ) : !subs.length ? (
        <div className="empty-state">
          <div className="text-4xl mb-2">🔄</div>
          <p className="font-medium text-slate-600">No subscriptions found</p>
          <p className="text-xs text-slate-400 mt-1">
            {status ? `No ${status} subscriptions` : 'Customers haven\'t set up recurring deliveries yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map(s => (
            <div key={s._id} className="card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">🔄</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{s.user?.name || s.user?.email || 'Unknown'}</p>
                      <span className={`badge ${statusColor[s.status] || 'badge-gray'}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {s.product?.name || 'Product'} · Qty {s.quantity} · {freqLabel[s.frequency] || s.frequency}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {s.user?.email && s.user?.name ? s.user.email : ''}
                      {s.nextDeliveryDate && (
                        <span className="text-blue-600 ml-1">
                          Next: {new Date(s.nextDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </p>
                    {s.address && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{s.address}</p>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {s.status === 'active' && (
                    <button onClick={() => handlePause(s._id)} className="btn-secondary btn-sm">Pause</button>
                  )}
                  {s.status === 'paused' && (
                    <button onClick={() => handleResume(s._id)} className="btn-success btn-sm">Resume</button>
                  )}
                  {s.status !== 'cancelled' && (
                    <button onClick={() => handleCancel(s._id)} className="btn-danger btn-sm">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-sm">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-sm">Next →</button>
        </div>
      )}
    </div>
  );
}
