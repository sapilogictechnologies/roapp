import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetPricingRulesQuery, useCreatePricingRuleMutation, useUpdatePricingRuleMutation, useDeletePricingRuleMutation } from '../../services/api';

const init = { minDistance: '', maxDistance: '', deliveryFee: '', minimumOrder: '', etaMinutes: '', isActive: true };

export default function AdminPricing() {
  const { data: rules, isLoading } = useGetPricingRulesQuery();
  const [createRule] = useCreatePricingRuleMutation();
  const [updateRule] = useUpdatePricingRuleMutation();
  const [deleteRule] = useDeletePricingRuleMutation();
  const [form, setForm] = useState(init);
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, minDistance: +form.minDistance, maxDistance: +form.maxDistance, deliveryFee: +form.deliveryFee, minimumOrder: +form.minimumOrder, etaMinutes: +form.etaMinutes };
      if (editId) { await updateRule({ id: editId, ...data }).unwrap(); toast.success('Updated'); }
      else { await createRule(data).unwrap(); toast.success('Created'); }
      setForm(init); setEditId(null);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Pricing Rules</h1>
          <p>Distance-based delivery fee slabs. Haversine formula calculates exact distance from GPS coordinates.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-semibold">{editId ? 'Edit' : 'Add'} Rule</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div><label className="label">Min Km</label><input className="input" type="number" step="0.1" value={form.minDistance} onChange={e => setForm({...form, minDistance: e.target.value})} required /></div>
          <div><label className="label">Max Km</label><input className="input" type="number" step="0.1" value={form.maxDistance} onChange={e => setForm({...form, maxDistance: e.target.value})} required /></div>
          <div><label className="label">Delivery Fee (₹)</label><input className="input" type="number" value={form.deliveryFee} onChange={e => setForm({...form, deliveryFee: e.target.value})} required /></div>
          <div><label className="label">Min Order (₹)</label><input className="input" type="number" value={form.minimumOrder} onChange={e => setForm({...form, minimumOrder: e.target.value})} required /></div>
          <div><label className="label">ETA (min)</label><input className="input" type="number" value={form.etaMinutes} onChange={e => setForm({...form, etaMinutes: e.target.value})} required /></div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary btn-sm">{editId ? 'Update' : 'Add Rule'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(init); }} className="btn-secondary btn-sm">Cancel</button>}
        </div>
      </form>
      {isLoading ? <p>Loading...</p> : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead><tr><th>Distance</th><th>Delivery Fee</th><th>Min Order</th><th>ETA</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {rules?.map(r => (
                <tr key={r._id}>
                  <td className="font-medium text-sm">{r.minDistance} - {r.maxDistance} km</td>
                  <td>₹{r.deliveryFee}</td>
                  <td>₹{r.minimumOrder}</td>
                  <td>{r.etaMinutes} min</td>
                  <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Off'}</span></td>
                  <td className="flex gap-1">
                    <button onClick={() => { setForm({ minDistance: r.minDistance, maxDistance: r.maxDistance, deliveryFee: r.deliveryFee, minimumOrder: r.minimumOrder, etaMinutes: r.etaMinutes, isActive: r.isActive }); setEditId(r._id); }} className="btn-secondary btn-sm">Edit</button>
                    <button onClick={async () => { if(confirm('Delete?')) { await deleteRule(r._id); toast.success('Deleted'); } }} className="btn-danger btn-sm">Del</button>
                  </td>
                </tr>
              ))}
              {!rules?.length && <tr><td colSpan={6} className="text-center py-4 text-slate-500">No rules</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
