import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetTimeSlotsQuery, useCreateTimeSlotMutation, useUpdateTimeSlotMutation, useDeleteTimeSlotMutation } from '../../services/api';

const init = { name: '', startTime: '', endTime: '', maxOrders: 50, cutoffTime: '', isActive: true };

export default function AdminTimeSlots() {
  const { data: slots, isLoading } = useGetTimeSlotsQuery();
  const [createSlot] = useCreateTimeSlotMutation();
  const [updateSlot] = useUpdateTimeSlotMutation();
  const [deleteSlot] = useDeleteTimeSlotMutation();
  const [form, setForm] = useState(init);
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await updateSlot({ id: editId, ...form }).unwrap(); toast.success('Updated'); }
      else { await createSlot(form).unwrap(); toast.success('Created'); }
      setForm(init); setEditId(null);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page max-w-2xl">
      <div className="page-heading">
        <div>
          <h1>Time Slots</h1>
          <p>Configure delivery windows customers can pick during checkout.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-semibold">{editId ? 'Edit' : 'Add'} Slot</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="label">Max Orders</label><input className="input" type="number" value={form.maxOrders} onChange={e => setForm({...form, maxOrders: +e.target.value})} /></div>
          <div><label className="label">Start Time</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required /></div>
          <div><label className="label">End Time</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required /></div>
          <div><label className="label">Cutoff Time</label><input className="input" type="time" value={form.cutoffTime} onChange={e => setForm({...form, cutoffTime: e.target.value})} /></div>
          <div className="flex items-center mt-5"><label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Active</label></div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary btn-sm">{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(init); }} className="btn-secondary btn-sm">Cancel</button>}
        </div>
      </form>
      {isLoading ? <p>Loading...</p> : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead><tr><th>Name</th><th>Time</th><th>Max Orders</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {slots?.map(s => (
                <tr key={s._id}>
                  <td className="font-medium text-sm">{s.name}</td>
                  <td className="text-sm">{s.startTime} - {s.endTime}</td>
                  <td>{s.maxOrders}</td>
                  <td><span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Off'}</span></td>
                  <td className="flex gap-1">
                    <button onClick={() => { setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime, maxOrders: s.maxOrders, cutoffTime: s.cutoffTime||'', isActive: s.isActive }); setEditId(s._id); }} className="btn-secondary btn-sm">Edit</button>
                    <button onClick={async () => { if(confirm('Delete?')) { await deleteSlot(s._id); toast.success('Deleted'); } }} className="btn-danger btn-sm">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
