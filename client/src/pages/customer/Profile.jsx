import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../../features/auth/authSlice';
import { useUpdateProfileMutation } from '../../services/api';

export default function Profile() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) setForm({ name: user.name || '', mobile: user.mobile || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(form).unwrap();
      dispatch(setCredentials({ token: localStorage.getItem('ro_token') || localStorage.getItem('token'), user: updated }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'C';

  return (
    <div className="app-page max-w-xl">
      <div className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account details and wallet balance.</p>
        </div>
      </div>

      {/* Account overview card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
            {initial}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name || 'Customer'}</p>
            <p className="text-blue-100 text-sm">{user?.email}</p>
            {user?.mobile && <p className="text-blue-200 text-xs mt-0.5">{user.mobile}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/15 p-3 text-center">
            <p className="text-lg font-black">₹{user?.walletBalance || 0}</p>
            <p className="text-xs text-blue-100 mt-0.5">Wallet</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 text-center">
            <p className="text-lg font-black">{user?.loyaltyPoints || 0}</p>
            <p className="text-xs text-blue-100 mt-0.5">Points</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 text-center">
            <p className="text-lg font-black text-red-200">₹{user?.outstandingDues || 0}</p>
            <p className="text-xs text-blue-100 mt-0.5">Dues</p>
          </div>
        </div>
      </div>

      {user?.outstandingDues > 0 && (
        <Link to="/bills" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-red-800 text-sm">Outstanding dues: ₹{user.outstandingDues}</p>
            <p className="text-xs text-red-600">Clear dues to continue ordering smoothly.</p>
          </div>
          <span className="text-red-500 text-sm font-bold">Pay →</span>
        </Link>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold text-slate-800">Edit Profile</h2>
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" />
        </div>
        <div>
          <label className="label">Mobile Number</label>
          <input className="input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit mobile number" inputMode="numeric" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-slate-50 text-slate-500" value={user?.email || ''} disabled />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact support if needed.</p>
        </div>
        <button className="btn-primary btn-sm" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: '/orders', i: '📦', l: 'My Orders' },
          { to: '/jars', i: '🫙', l: 'Jar Status' },
          { to: '/bills', i: '🧾', l: 'My Bills' },
          { to: '/payments', i: '💳', l: 'Payments' },
          { to: '/addresses', i: '📍', l: 'Addresses' },
          { to: '/subscriptions', i: '🔄', l: 'Subscriptions' },
        ].map(q => (
          <Link key={q.to} to={q.to} className="card-hover p-4 text-center">
            <span className="text-2xl block mb-1">{q.i}</span>
            <p className="text-xs font-semibold text-slate-700">{q.l}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
