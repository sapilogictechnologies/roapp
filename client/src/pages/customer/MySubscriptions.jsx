import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  useGetMySubscriptionsQuery,
  useGetProductsQuery,
  useCreateSubscriptionMutation,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
} from '../../services/api';

const freqLabel = {
  daily: 'Every day',
  alternate: 'Alternate days',
  weekly: 'Weekly',
  '15day': 'Every 15 days',
  monthly: 'Monthly',
};
const statusColor = { active: 'badge-green', paused: 'badge-yellow', cancelled: 'badge-red' };
const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'alternate', label: 'Alternate Days' },
  { value: 'weekly', label: 'Weekly' },
  { value: '15day', label: 'Every 15 Days' },
  { value: 'monthly', label: 'Monthly' },
];

export default function MySubscriptions() {
  const { data: subs, isLoading } = useGetMySubscriptionsQuery();
  const { data: productsData } = useGetProductsQuery({});
  const [createSub, { isLoading: creating }] = useCreateSubscriptionMutation();
  const [pauseSub] = usePauseSubscriptionMutation();
  const [resumeSub] = useResumeSubscriptionMutation();
  const [cancelSub] = useCancelSubscriptionMutation();
  const [updateSub, { isLoading: updating }] = useUpdateSubscriptionMutation();

  const [form, setForm] = useState({ product: '', quantity: 1, frequency: 'daily', address: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: 1, frequency: 'daily', address: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.product) return toast.error('Select a product');
    try {
      await createSub(form).unwrap();
      toast.success('Subscription created!');
      setShowForm(false);
      setForm({ product: '', quantity: 1, frequency: 'daily', address: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create subscription');
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setEditForm({ quantity: s.quantity, frequency: s.frequency, address: s.address || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateSub({ id: editId, ...editForm, quantity: Number(editForm.quantity) }).unwrap();
      toast.success('Subscription updated');
      setEditId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update');
    }
  };

  const handlePause = async (id) => {
    try { await pauseSub({ id }).unwrap(); toast.success('Subscription paused'); }
    catch { toast.error('Failed to pause'); }
  };

  const handleResume = async (id) => {
    try { await resumeSub(id).unwrap(); toast.success('Subscription resumed'); }
    catch { toast.error('Failed to resume'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription? This cannot be undone.')) return;
    try { await cancelSub(id).unwrap(); toast.success('Subscription cancelled'); }
    catch { toast.error('Failed to cancel'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>My Subscriptions</h1>
          <p>Recurring water delivery — pause, resume, edit, or cancel anytime.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }} className="btn-primary btn-sm">+ New Subscription</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <h2 className="font-semibold text-slate-800">New Subscription</h2>
          <div>
            <label className="label">Product</label>
            <select className="input" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} required>
              <option value="">Select a water product</option>
              {productsData?.products?.map(p => (
                <option key={p._id} value={p._id}>{p.name} — ₹{p.salePrice || p.price}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input className="input" type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Frequency</label>
              <select className="input" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Delivery Address</label>
            <textarea className="input" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full delivery address" />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" disabled={creating}>{creating ? 'Creating...' : 'Create Subscription'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading subscriptions...</div>
      ) : !subs?.length ? (
        <div className="empty-state">
          <div className="text-4xl mb-2">🔄</div>
          <p className="font-medium text-slate-600">No subscriptions yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Set up recurring water delivery to never run out.</p>
          <Link to="/products" className="btn-primary btn-sm">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map(s => (
            <div key={s._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">🔄</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{s.product?.name || 'Water Product'}</p>
                      <span className={`badge ${statusColor[s.status] || 'badge-gray'}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {freqLabel[s.frequency] || s.frequency} · Qty {s.quantity}
                    </p>
                    {s.nextDeliveryDate && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        Next: {new Date(s.nextDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {s.address && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{s.address}</p>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                  {s.status !== 'cancelled' && (
                    <button onClick={() => handleEdit(s)} className="btn-secondary btn-sm">Edit</button>
                  )}
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

              {editId === s._id && (
                <form onSubmit={handleUpdate} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Edit Subscription</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Quantity</label>
                      <input className="input" type="number" min="1" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Frequency</label>
                      <select className="input" value={editForm.frequency} onChange={e => setEditForm({ ...editForm, frequency: e.target.value })}>
                        {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Delivery Address</label>
                    <textarea className="input" rows={2} value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} placeholder="Delivery address" />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary btn-sm" disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" onClick={() => setEditId(null)} className="btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
