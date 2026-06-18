import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAddressesQuery, useAddAddressMutation, useDeleteAddressMutation } from '../../services/api';

const init = { label: 'Home', fullAddress: '', area: '', landmark: '', city: '', state: '', pincode: '', latitude: '', longitude: '', locationSource: 'manual', isDefault: false };

export default function SavedAddresses() {
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [addAddress, { isLoading: adding }] = useAddAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [form, setForm] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
      else delete payload.latitude;
      if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
      else delete payload.longitude;
      await addAddress(payload).unwrap();
      toast.success('Address added!');
      setForm(init); setShowForm(false);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Saved Addresses</h1>
          <p>Manage your delivery locations for faster checkout.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">+ Add Address</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Label</label><input className="input" value={form.label} onChange={e => set('label', e.target.value)} /></div>
            <div><label className="label">Pincode</label><input className="input" value={form.pincode} onChange={e => set('pincode', e.target.value)} /></div>
          </div>
          <div><label className="label">Full Address</label><textarea className="input" rows={2} value={form.fullAddress} onChange={e => set('fullAddress', e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Area / Locality</label><input className="input" value={form.area} onChange={e => set('area', e.target.value)} /></div>
            <div><label className="label">Landmark</label><input className="input" value={form.landmark} onChange={e => set('landmark', e.target.value)} /></div>
            <div><label className="label">City</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div><label className="label">State</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} /></div>
            <div><label className="label">Latitude (optional)</label><input className="input" type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} /></div>
            <div><label className="label">Longitude (optional)</label><input className="input" type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} /></div>
          </div>
          <div><label className="label">Location Source</label>
            <select className="input" value={form.locationSource} onChange={e => set('locationSource', e.target.value)}>
              <option value="manual">Manual</option>
              <option value="gps">GPS</option>
              <option value="pincode">Pincode</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} /> Set as default</label>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" disabled={adding}>{adding ? '...' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading addresses...</div>
      ) : !addresses?.length ? (
        <div className="empty-state">
          <div className="text-4xl mb-2">📍</div>
          <p className="font-medium text-slate-600 mb-1">No addresses saved</p>
          <p className="text-xs text-slate-400">Add an address for faster checkout</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map(a => (
            <div key={a._id} className="card flex justify-between items-start gap-3">
              <div className="flex gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">📍</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{a.label}</span>
                    {a.isDefault && <span className="badge badge-blue">Default</span>}
                    <span className="badge badge-gray">{a.locationSource}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{a.fullAddress}</p>
                  {a.area && <p className="text-xs text-slate-500">{a.area}{a.landmark ? `, near ${a.landmark}` : ''}</p>}
                  <p className="text-xs text-slate-500">{[a.city, a.state, a.pincode].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm('Delete this address?')) {
                    await deleteAddress(a._id);
                    toast.success('Address deleted');
                  }
                }}
                className="btn-danger btn-sm shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
