import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetDashboardQuery } from '../../services/reportApi';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, refetch } = useGetDashboardQuery(undefined, { pollingInterval: 30000 });

  const stats = [
    { l: 'Pending Payments', v: data?.pendingPayments, i: '⏳', c: '#D97706', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', to: '/admin/payments' },
    { l: 'Active Orders', v: data?.pendingOrders, i: '🚚', c: '#0284C7', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)', to: '/admin/orders' },
    { l: 'Active Subscriptions', v: data?.activeSubscriptions, i: '🔄', c: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)', to: '/admin/subscriptions' },
    { l: 'Event Enquiries', v: data?.pendingEventInquiries, i: '🎉', c: '#E11D48', bg: 'rgba(225,29,72,0.1)', border: 'rgba(225,29,72,0.2)', to: '/admin/events' },
    { l: 'Pending Jar Returns', v: data?.pendingJars, i: '🫙', c: '#EA580C', bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.2)', to: '/admin/jars' },
    { l: 'Due Customers', v: data?.dueCustomers, i: '🧾', c: '#DC2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)', to: '/admin/customers' },
    { l: 'Total Customers', v: data?.totalCustomers, i: '👥', c: '#0F766E', bg: 'rgba(15,118,110,0.1)', border: 'rgba(15,118,110,0.2)', to: '/admin/customers' },
    { l: 'Total Orders', v: data?.totalOrders, i: '📊', c: '#4338CA', bg: 'rgba(67,56,202,0.1)', border: 'rgba(67,56,202,0.2)', to: '/admin/reports' },
    { l: "Today's Orders", v: data?.todayOrders, i: '📦', c: '#1D4ED8', bg: 'rgba(29,78,216,0.1)', border: 'rgba(29,78,216,0.2)', to: '/admin/orders' },
  ];

  const quickActions = [
    { to: '/admin/orders', i: '📦', l: 'Manage Orders', d: 'View and update order statuses', color: '#2563EB' },
    { to: '/admin/payments', i: '💳', l: 'Verify Payments', d: 'Approve or reject payment proofs', color: '#0284C7' },
    { to: '/admin/jars', i: '🫙', l: 'Jar Ledger', d: 'Track deposits and returns', color: '#EA580C' },
    { to: '/admin/events', i: '🎉', l: 'Event Bookings', d: 'Send quotes and confirm events', color: '#7C3AED' },
    { to: '/admin/subscriptions', i: '🔄', l: 'Subscriptions', d: 'Process due subscription orders', color: '#0F766E' },
    { to: '/admin/bills', i: '🧾', l: 'Bills', d: 'Generate and manage invoices', color: '#D97706' },
    { to: '/admin/reports', i: '📈', l: 'Reports', d: 'Sales, products, customers', color: '#4338CA' },
    { to: '/admin/settings', i: '⚙️', l: 'Settings', d: 'Business info, UPI, pricing', color: '#475569' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-black text-slate-800">Operations Dashboard</h1>
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <span className="live-dot" style={{ width: '6px', height: '6px' }} />
              Live
            </span>
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            Business overview
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-blue-500 font-mono font-semibold"><LiveClock /></span>
          </p>
        </div>
        <button
          onClick={refetch}
          className="btn-secondary btn-sm flex items-center gap-2 self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Revenue Cards — dark navy gradient ── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : data && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Today's Revenue", value: money(data.todayRevenue), sub: `${data.todayOrders || 0} orders today`, gradient: 'linear-gradient(135deg,#2563EB,#0EA5E9)', glow: 'rgba(37,99,235,0.3)' },
            { label: 'Month Revenue', value: money(data.monthRevenue), sub: 'Current month paid orders', gradient: 'linear-gradient(135deg,#059669,#10B981)', glow: 'rgba(16,185,129,0.3)' },
            { label: 'Total Revenue', value: money(data.totalRevenue), sub: 'All-time paid orders', gradient: 'linear-gradient(135deg,#071B34,#0F2747)', glow: 'rgba(7,27,52,0.4)' },
          ].map((item) => (
            <div
              key={item.label}
              className="relative rounded-2xl p-6 text-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: item.gradient, boxShadow: `0 8px 32px ${item.glow}` }}
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="relative">
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.label}</p>
                <p className="text-3xl font-black mt-2 tracking-tight">{item.value}</p>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Stat Cards grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link
              key={s.l}
              to={s.to}
              className="rounded-2xl p-5 bg-white border transition-all duration-300 hover:-translate-y-1 group"
              style={{ borderColor: s.border, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${s.bg}`; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: s.bg }}>
                  {s.i}
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="font-black text-2xl" style={{ color: s.c }}>{s.v ?? '–'}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.l}</p>
            </Link>
          ))}
        </div>
      )}

      {/* ── Alert Banners ── */}
      {!isLoading && data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.pendingPayments > 0 && (
            <Link to="/admin/payments" className="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 hover:bg-amber-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-2xl group-hover:scale-110 transition-transform">⏳</span>
              <div>
                <p className="font-bold text-amber-800 text-sm">{data.pendingPayments} Pending Payments</p>
                <p className="text-xs text-amber-600">Require manual verification</p>
              </div>
              <span className="ml-auto text-amber-400 text-xs font-bold">→</span>
            </Link>
          )}
          {data.pendingEventInquiries > 0 && (
            <Link to="/admin/events" className="group flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 hover:bg-rose-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎉</span>
              <div>
                <p className="font-bold text-rose-800 text-sm">{data.pendingEventInquiries} Event Enquiries</p>
                <p className="text-xs text-rose-600">Awaiting quote from admin</p>
              </div>
              <span className="ml-auto text-rose-400 text-xs font-bold">→</span>
            </Link>
          )}
          {data.pendingJars > 0 && (
            <Link to="/admin/jars" className="group flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 hover:bg-orange-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-2xl group-hover:scale-110 transition-transform">🫙</span>
              <div>
                <p className="font-bold text-orange-800 text-sm">{data.pendingJars} Jars Pending</p>
                <p className="text-xs text-orange-600">Customer jar returns outstanding</p>
              </div>
              <span className="ml-auto text-orange-400 text-xs font-bold">→</span>
            </Link>
          )}
          {data.dueCustomers > 0 && (
            <Link to="/admin/customers" className="group flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 hover:bg-red-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-2xl group-hover:scale-110 transition-transform">🧾</span>
              <div>
                <p className="font-bold text-red-800 text-sm">{data.dueCustomers} Customers with Dues</p>
                <p className="text-xs text-red-600">Outstanding balances to collect</p>
              </div>
              <span className="ml-auto text-red-400 text-xs font-bold">→</span>
            </Link>
          )}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-black text-slate-800 text-base">Quick Actions</h2>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group card-hover flex items-center gap-4 p-4"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${q.color}18` }}
              >
                {q.i}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{q.l}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{q.d}</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
