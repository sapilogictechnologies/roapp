import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetServiceAreasQuery, useCreateServiceAreaMutation, useUpdateServiceAreaMutation, useDeleteServiceAreaMutation } from '../../services/api';

const init = { areaName: '', pincode: '', city: '', state: '', isServiceable: true, deliveryFee: '', minimumOrder: '', etaMinutes: '', notes: '' };

export default function AdminServiceAreas() {
  const [search, setSearch] = useState('');
  const { data: areas, isLoading } = useGetServiceAreasQuery({ search });
  const [createArea] = useCreateServiceAreaMutation();
  const [updateArea] = useUpdateServiceAreaMutation();
  const [deleteArea] = useDeleteServiceAreaMutation();
  const [form, setForm] = useState(init);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, deliveryFee: +form.deliveryFee, minimumOrder: +form.minimumOrder, etaMinutes: +form.etaMinutes };
    try {
      if (editId) { await updateArea({ id: editId, ...data }).unwrap(); toast.success('Updated'); }
      else { await createArea(data).unwrap(); toast.success('Created'); }
      setForm(init); setEditId(null); setShowForm(false);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  const handleEdit = (a) => {
    setForm({ areaName: a.areaName, pincode: a.pincode, city: a.city||'', state: a.state||'', isServiceable: a.isServiceable, deliveryFee: a.deliveryFee, minimumOrder: a.minimumOrder, etaMinutes: a.etaMinutes, notes: a.notes||'' });
    setEditId(a._id); setShowForm(true);
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Service Areas</h1>
          <p>Define serviceable pincodes, delivery fees, minimum orders, and ETAs.</p>
        </div>
        <div className="flex gap-2">
          <input className="input w-44" placeholder="Search pincode/area" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(init); }} className="btn-primary btn-sm">+ Add Area</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h2 className="font-semibold">{editId ? 'Edit' : 'Add'} Service Area</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="label">Area Name</label><input className="input" value={form.areaName} onChange={e => setForm({...form, areaName: e.target.value})} required /></div>
            <div><label className="label">Pincode</label><input className="input" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required /></div>
            <div><label className="label">City</label><input className="input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
            <div><label className="label">State</label><input className="input" value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
            <div><label className="label">Delivery Fee (₹)</label><input className="input" type="number" value={form.deliveryFee} onChange={e => setForm({...form, deliveryFee: e.target.value})} required /></div>
            <div><label className="label">Min Order (₹)</label><input className="input" type="number" value={form.minimumOrder} onChange={e => setForm({...form, minimumOrder: e.target.value})} required /></div>
            <div><label className="label">ETA (min)</label><input className="input" type="number" value={form.etaMinutes} onChange={e => setForm({...form, etaMinutes: e.target.value})} required /></div>
            <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isServiceable} onChange={e => setForm({...form, isServiceable: e.target.checked})} /> Serviceable</label>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm">{editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <p>Loading...</p> : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead><tr><th>Area</th><th>Pincode</th><th>City</th><th>Fee</th><th>Min Order</th><th>ETA</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {areas?.map(a => (
                <tr key={a._id}>
                  <td className="font-medium text-sm">{a.areaName}</td>
                  <td className="font-mono text-sm">{a.pincode}</td>
                  <td className="text-sm">{a.city}</td>
                  <td>₹{a.deliveryFee}</td>
                  <td>₹{a.minimumOrder}</td>
                  <td>{a.etaMinutes} min</td>
                  <td><span className={`badge ${a.isServiceable ? 'badge-green' : 'badge-red'}`}>{a.isServiceable ? 'Active' : 'Off'}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(a)} className="btn-secondary btn-sm">Edit</button>
                      <button onClick={async () => { if(confirm('Delete?')) { await deleteArea(a._id); toast.success('Deleted'); } }} className="btn-danger btn-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!areas?.length && <tr><td colSpan={8} className="text-center py-4 text-slate-500">No service areas</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
