import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetMyOrdersQuery } from '../../services/orderApi';
import { useGetNotificationsQuery } from '../../services/notificationApi';
import { useGetMyJarsQuery } from '../../services/jarApi';
import { useGetMyBillsQuery } from '../../services/billingApi';
import { useGetPublicSettingsQuery } from '../../services/settingsApi';

const SC = {
  placed: 'badge-blue',
  payment_pending: 'badge-yellow',
  confirmed: 'badge-cyan',
  preparing: 'badge-yellow',
  out_for_delivery: 'badge-orange',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

const statusIcon = {
  placed: '📋',
  payment_pending: '⏳',
  confirmed: '✅',
  preparing: '🔧',
  out_for_delivery: '🚚',
  delivered: '📦',
  cancelled: '❌',
};

export default function CustomerDashboard() {
  const user = useSelector(selectCurrentUser);
  const { data: ordersData } = useGetMyOrdersQuery({ limit: 5 });
  const { data: notifData } = useGetNotificationsQuery();
  const { data: jarsData } = useGetMyJarsQuery();
  const { data: billsData } = useGetMyBillsQuery();
  const { data: settings } = useGetPublicSettingsQuery();

  const jarBalance = jarsData?.summary?.balance || 0;
  const depositPerJar = Number(settings?.jarDepositAmount || 150);
  const depositHeld = jarsData?.summary?.depositHeld ?? (jarBalance * depositPerJar);
  const pendingBills = (billsData?.bills || []).filter((b) => b.status !== 'paid');
  const pendingBillTotal = pendingBills.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);

  const stats = [
    { l: 'Total Orders', v: ordersData?.total || 0, i: '📦', to: '/orders', c: '#1D4ED8', bg: 'rgba(29,78,216,0.1)', border: 'rgba(29,78,216,0.15)' },
    { l: 'Notifications', v: notifData?.unread || 0, i: '🔔', to: '/notifications', c: '#D97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.15)' },
    { l: 'Jar Deposit Held', v: `₹${depositHeld}`, i: '🫙', to: '/jars', c: '#EA580C', bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.15)' },
    { l: 'Pending Bills', v: pendingBillTotal > 0 ? `₹${pendingBillTotal}` : pendingBills.length, i: '🧾', to: '/bills', c: '#DC2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.15)' },
  ];

  const quickLinks = [
    { to: '/products', i: '🛍️', l: 'Order Water', d: 'Browse & order', color: '#2563EB' },
    { to: '/payments/submit', i: '💳', l: 'Submit Payment', d: 'Upload proof', color: '#059669' },
    { to: '/jars', i: '🫙', l: 'Jar Status', d: 'Track deposits', color: '#EA580C' },
    { to: '/subscriptions', i: '🔄', l: 'Subscriptions', d: 'Recurring orders', color: '#7C3AED' },
    { to: '/events', i: '🎉', l: 'Events', d: 'Quotes & bookings', color: '#E11D48' },
    { to: '/bills', i: '🧾', l: 'Bills', d: 'View invoices', color: '#D97706' },
    { to: '/addresses', i: '📍', l: 'Addresses', d: 'Saved locations', color: '#0F766E' },
    { to: '/messages', i: '💬', l: 'Messages', d: 'Contact support', color: '#4338CA' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Welcome Hero Banner ── */}
      <div
        className="relative rounded-2xl overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg,#071B34 0%,#0F2747 55%,#1e3a5f 100%)', boxShadow: '0 8px 32px rgba(7,27,52,0.3)' }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(37,99,235,0.3)' }} />
        <div className="absolute -bottom-12 left-1/3 h-32 w-32 rounded-full blur-2xl" style={{ background: 'rgba(6,182,212,0.2)' }} />

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                Welcome back
              </p>
              <h1 className="font-black text-2xl text-white">{user?.name || 'Customer'}</h1>
              <p className="text-blue-300/70 text-sm mt-0.5">{user?.email}</p>
            </div>

            <div className="shrink-0 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', minWidth: '140px' }}>
              <p className="text-blue-300/70 text-xs font-medium mb-1">Wallet Balance</p>
              <p className="font-black text-3xl text-white">₹{user?.walletBalance || 0}</p>
              {user?.outstandingDues > 0 && (
                <p className="text-red-400 text-xs mt-1.5 font-semibold">Due: ₹{user.outstandingDues}</p>
              )}
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2 mt-5">
            {[
              ['/products', '🛍️ Shop'],
              ['/cart', '🛒 Cart'],
              ['/service-area', '📍 Area'],
              ['/event-booking', '🎉 Events'],
            ].map(([to, l]) => (
              <Link
                key={to}
                to={to}
                className="text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alert Banners ── */}
      {user?.outstandingDues > 0 && (
        <Link to="/bills" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 hover:bg-red-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-red-800 text-sm">Outstanding Dues: ₹{user.outstandingDues}</p>
            <p className="text-xs text-red-600">Please clear your dues to continue ordering smoothly.</p>
          </div>
          <span className="ml-auto text-red-500 text-sm font-black">Pay →</span>
        </Link>
      )}

      {jarBalance > 0 && (
        <Link to="/jars" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 hover:bg-amber-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-2xl">🫙</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">{jarBalance} jar{jarBalance > 1 ? 's' : ''} pending return</p>
            <p className="text-xs text-amber-600">Return to get ₹{jarBalance * depositPerJar} back to your wallet.</p>
          </div>
          <span className="ml-auto text-amber-600 text-sm font-black">Return →</span>
        </Link>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.l}
            to={s.to}
            className="rounded-2xl bg-white p-4 border transition-all duration-300 hover:-translate-y-1 group"
            style={{ borderColor: s.border, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
            onMouseOver={e => e.currentTarget.style.boxShadow = `0 8px 24px ${s.bg}`}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-xl mb-3 transition-transform group-hover:scale-110" style={{ background: s.bg }}>
              {s.i}
            </div>
            <p className="font-black text-xl" style={{ color: s.c }}>{s.v}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.l}</p>
          </Link>
        ))}
      </div>

      {/* ── Recent Orders ── */}
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-black text-slate-800 text-base">Recent Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your latest water delivery orders</p>
          </div>
          <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
            View all <span>→</span>
          </Link>
        </div>

        {!ordersData?.orders?.length ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💧</div>
            <p className="font-bold text-slate-800 text-base mb-1">No orders yet</p>
            <p className="text-slate-500 text-sm mb-5">Order fresh RO water delivered to your door.</p>
            <Link to="/products" className="btn-primary btn-sm inline-flex">Order Water Now →</Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {ordersData.orders.map((o) => (
              <Link
                to={`/orders/${o._id}`}
                key={o._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  {statusIcon[o.orderStatus] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">#{o.orderNumber}</p>
                  <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="font-black text-slate-800 text-sm shrink-0">₹{o.total}</span>
                <span className={`${SC[o.orderStatus] || 'badge-gray'} badge shrink-0`}>{o.orderStatus?.replace(/_/g, ' ')}</span>
                <svg className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {ordersData?.orders?.length > 0 && (
          <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
            <Link to="/products" className="btn-primary btn-sm flex-1 justify-center">Order Again →</Link>
            <Link to="/orders" className="btn-secondary btn-sm flex-1 justify-center">All Orders</Link>
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-black text-slate-800 text-base">Quick Links</h2>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group rounded-2xl bg-white border border-slate-200 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl mb-3 transition-transform group-hover:scale-110"
                style={{ background: `${q.color}14` }}
              >
                {q.i}
              </div>
              <p className="font-bold text-slate-800 text-sm">{q.l}</p>
              <p className="text-xs text-slate-400 mt-0.5">{q.d}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
