import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSubmitPaymentProofMutation, useGetPublicSettingsQuery } from '../../services/api';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const steps = [
  { n: '1', t: 'Open UPI app', d: 'Google Pay, PhonePe, or Paytm' },
  { n: '2', t: 'Pay to UPI ID', d: 'Copy the UPI ID shown below' },
  { n: '3', t: 'Screenshot proof', d: 'Capture payment success screen' },
  { n: '4', t: 'Submit here', d: 'Upload screenshot + enter UTR' },
];

export default function SubmitPayment() {
  const [form, setForm] = useState({ amount: '', method: 'upi', utrNumber: '', notes: '', orderId: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submit, { isLoading }] = useSubmitPaymentProofMutation();
  const { data: settings } = useGetPublicSettingsQuery();
  const [done, setDone] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return setFile(null);
    if (!IMAGE_TYPES.includes(selected.type)) return toast.error('Upload JPG, PNG, or WebP screenshot');
    if (selected.size > 5 * 1024 * 1024) return toast.error('Screenshot must be under 5MB');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.method === 'upi' && !file) return toast.error('Upload payment screenshot');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (form.amount) fd.append('expectedAmount', form.amount);
    if (file) fd.append('screenshot', file);
    try {
      await submit(fd).unwrap();
      toast.success('Payment proof submitted! Admin will verify shortly.');
      setDone(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Submission failed');
    }
  };

  if (done) return (
    <div className="app-page max-w-md mx-auto text-center">
      <div className="card p-8 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-4xl mx-auto">✅</div>
        <h2 className="text-xl font-bold text-slate-800">Payment Submitted!</h2>
        <p className="text-slate-500 text-sm">Admin will verify your payment and update your order status within a few hours.</p>
        <div className="flex flex-col gap-2">
          <Link to="/orders" className="btn-primary btn-sm justify-center">View My Orders</Link>
          <Link to="/payments" className="btn-secondary btn-sm justify-center">Payment History</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-page max-w-2xl">
      <div className="page-heading">
        <div>
          <h1>Submit Payment Proof</h1>
          <p>Upload UPI screenshot and UTR for manual verification by admin.</p>
        </div>
        <Link to="/payments" className="btn-secondary btn-sm">Payment History</Link>
      </div>

      {/* How to pay steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map(s => (
          <div key={s.n} className="card p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center text-sm font-black mx-auto mb-2">{s.n}</div>
            <p className="text-xs font-bold text-slate-800">{s.t}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.d}</p>
          </div>
        ))}
      </div>

      {/* UPI payment info */}
      <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Pay to UPI ID</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{settings?.upiId || 'your-upi@bank'}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(settings?.upiId || '');
                toast.success('UPI ID copied!');
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Copy UPI ID
            </button>
            {settings?.accountName && (
              <p className="text-sm text-slate-600 mt-2">Account: <span className="font-semibold">{settings.accountName}</span></p>
            )}
          </div>
          {settings?.qrImage && (
            <div className="shrink-0">
              <img src={settings.qrImage} alt="QR Code" className="h-28 w-28 rounded-2xl border border-blue-200 object-contain bg-white p-1" />
              <p className="text-[10px] text-center text-blue-600 mt-1 font-semibold">Scan to pay</p>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200 flex flex-wrap gap-3 text-xs text-slate-600">
          <span>⚠️ Double-check UPI ID before paying</span>
          <span>·</span>
          <span>Save your screenshot immediately after payment</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold text-slate-800">Payment Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Amount Paid (₹) *</label>
            <input className="input" type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="Enter exact amount" />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">UTR / Transaction ID {form.method === 'upi' ? '(optional)' : '(if available)'}</label>
          <input className="input font-mono" value={form.utrNumber} onChange={e => setForm({ ...form, utrNumber: e.target.value })} placeholder="12-digit UTR or transaction reference" />
          <p className="text-xs text-slate-500 mt-1">Found in UPI app → transaction details</p>
        </div>

        <div>
          <label className="label">Order ID (optional)</label>
          <input className="input" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="Link to a specific order (if known)" />
        </div>

        <div>
          <label className="label">Payment Screenshot {form.method === 'upi' ? '*' : ''}</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="input" />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="h-32 rounded-xl object-cover border border-slate-200" />
              <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="mt-1 text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1">JPG, PNG or WebP · Max 5MB</p>
        </div>

        <div>
          <label className="label">Notes (optional)</label>
          <input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any extra info for admin" />
        </div>

        <button className="btn-primary w-full h-12 text-base" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Payment Proof →'}
        </button>
        <p className="text-center text-xs text-slate-400">Admin will verify and approve within a few hours. Order status updates automatically.</p>
      </form>
    </div>
  );
}
