import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllBillsQuery, useMarkBillPaidMutation, useGenerateBillMutation, useGetAllCustomersQuery } from '../../services/api';

const statusColor = { paid: 'badge-green', partial: 'badge-yellow', unpaid: 'badge-red' };

export default function AdminBills() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useGetAllBillsQuery({ page, limit: 20, status });
  const { data: customersData } = useGetAllCustomersQuery({ limit: 200 });
  const [markPaid] = useMarkBillPaidMutation();
  const [generateBill, { isLoading: generating }] = useGenerateBillMutation();
  const [genForm, setGenForm] = useState({ userId: '', orderIds: '', dueDate: '', notes: '' });
  const [showGenForm, setShowGenForm] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genForm.userId) return toast.error('Select a customer');
    try {
      const orderIds = genForm.orderIds.split(',').map(s => s.trim()).filter(Boolean);
      await generateBill({ userId: genForm.userId, orderIds, dueDate: genForm.dueDate, notes: genForm.notes }).unwrap();
      toast.success('Bill generated!');
      setShowGenForm(false);
      setGenForm({ userId: '', orderIds: '', dueDate: '', notes: '' });
    } catch (err) { toast.error(err?.data?.message || 'Failed to generate'); }
  };

  const handleMarkPaid = async (id) => {
    try { await markPaid(id).unwrap(); toast.success('Marked as paid'); }
    catch { toast.error('Failed to update'); }
  };

  const bills = data?.bills || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Bills</h1>
          <p>Generate and settle customer billing records.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <button onClick={() => setShowGenForm(!showGenForm)} className="btn-primary btn-sm">+ Generate Bill</button>
        </div>
      </div>

      {showGenForm && (
        <form onSubmit={handleGenerate} className="card space-y-3">
          <h2 className="font-semibold text-slate-800">Generate Bill</h2>
          <div>
            <label className="label">Customer</label>
            <select className="input" value={genForm.userId} onChange={e => setGenForm({ ...genForm, userId: e.target.value })} required>
              <option value="">Select customer</option>
              {customersData?.customers?.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Order IDs (comma separated, optional)</label>
            <input className="input font-mono text-sm" value={genForm.orderIds} onChange={e => setGenForm({ ...genForm, orderIds: e.target.value })} placeholder="Leave blank to include all unpaid orders" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" value={genForm.dueDate} onChange={e => setGenForm({ ...genForm, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <input className="input" value={genForm.notes} onChange={e => setGenForm({ ...genForm, notes: e.target.value })} placeholder="Internal note" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" disabled={generating}>{generating ? 'Generating...' : 'Generate Bill'}</button>
            <button type="button" onClick={() => setShowGenForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading bills...</div>
      ) : !bills.length ? (
        <div className="empty-state">
          <div className="text-4xl mb-2">🧾</div>
          <p className="font-medium text-slate-600">No bills found</p>
          <p className="text-xs text-slate-400 mt-1">
            {status ? `No ${status} bills` : 'Generate bills for customers to track payments.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map(b => (
            <div key={b._id} className="card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">🧾</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{b.billNumber}</p>
                      <span className={`badge ${statusColor[b.status] || 'badge-gray'}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{b.user?.name || b.user?.email || 'Unknown'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {b.billingPeriodStart ? `Period: ${new Date(b.billingPeriodStart).toLocaleDateString('en-IN')}` : 'Ad-hoc bill'}
                      {b.dueDate && ` · Due: ${new Date(b.dueDate).toLocaleDateString('en-IN')}`}
                    </p>
                    {b.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{b.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{b.subtotal}</p>
                    {b.pendingAmount > 0 && <p className="text-xs text-red-600 font-semibold">₹{b.pendingAmount} pending</p>}
                    {b.paidAmount > 0 && <p className="text-xs text-emerald-600">₹{b.paidAmount} paid</p>}
                  </div>
                  {b.status !== 'paid' && (
                    <button onClick={() => handleMarkPaid(b._id)} className="btn-success btn-sm shrink-0">Mark Paid</button>
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
