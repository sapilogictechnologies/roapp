import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from '../../services/api';

const init = { code: '', type: 'flat', value: '', minOrder: 0, maxDiscount: 0, isActive: true, usageLimit: 0 };

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useGetCouponsQuery();
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [form, setForm] = useState(init);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, value: +form.value, minOrder: +form.minOrder, maxDiscount: +form.maxDiscount, usageLimit: +form.usageLimit };
      if (editId) { await updateCoupon({ id: editId, ...data }).unwrap(); toast.success('Updated'); }
      else { await createCoupon(data).unwrap(); toast.success('Created'); }
      setForm(init); setEditId(null); setShowForm(false);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Coupons</h1>
          <p>Create flat or percent discount codes with usage limits and minimum order rules.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(init); }} className="btn-primary btn-sm">+ Add Coupon</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h2 className="font-semibold">{editId ? 'Edit' : 'Add'} Coupon</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="label">Code</label><input className="input uppercase" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required /></div>
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="flat">Flat (₹)</option><option value="percent">Percent (%)</option>
              </select>
            </div>
            <div><label className="label">Value</label><input className="input" type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} required /></div>
            <div><label className="label">Min Order (₹)</label><input className="input" type="number" value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})} /></div>
            <div><label className="label">Max Discount (₹)</label><input className="input" type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} /></div>
            <div><label className="label">Usage Limit (0=unlimited)</label><input className="input" type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Active</label>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm">{editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}
      {isLoading ? <p>Loading...</p> : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons?.map(c => (
                <tr key={c._id}>
                  <td className="font-mono font-bold text-sm">{c.code}</td>
                  <td className="text-sm">{c.type}</td>
                  <td>{c.type==='flat'?`₹${c.value}`:`${c.value}%`}</td>
                  <td>₹{c.minOrder}</td>
                  <td>{c.usedCount} / {c.usageLimit || '∞'}</td>
                  <td><span className={`badge ${c.isActive?'badge-green':'badge-red'}`}>{c.isActive?'Active':'Off'}</span></td>
                  <td className="flex gap-1">
                    <button onClick={() => { setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount||0, isActive: c.isActive, usageLimit: c.usageLimit||0 }); setEditId(c._id); setShowForm(true); }} className="btn-secondary btn-sm">Edit</button>
                    <button onClick={async () => { if(confirm('Delete?')) { await deleteCoupon(c._id); toast.success('Deleted'); } }} className="btn-danger btn-sm">Del</button>
                  </td>
                </tr>
              ))}
              {!coupons?.length && <tr><td colSpan={7} className="text-center py-4 text-slate-500">No coupons</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
