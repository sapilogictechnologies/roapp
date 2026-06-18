import React, { useState } from 'react';
import { useGetDashboardQuery, useGetSalesReportQuery, useGetProductsReportQuery, useGetPaymentsReportQuery, useGetJarsReportQuery, useGetCustomersReportQuery } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const getToken = () => localStorage.getItem('ro_token') || '';

export default function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const { data: dash } = useGetDashboardQuery();
  const { data: sales } = useGetSalesReportQuery({ from, to });
  const { data: products } = useGetProductsReportQuery();
  const { data: payments } = useGetPaymentsReportQuery();
  const { data: jars } = useGetJarsReportQuery();
  const { data: customers } = useGetCustomersReportQuery();

  const totalSalesRevenue = sales?.reduce((s, d) => s + (d.revenue || 0), 0) || 0;
  const totalSalesOrders = sales?.reduce((s, d) => s + (d.orders || 0), 0) || 0;

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Revenue, sales, products, payments, and jar movement summaries.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href={`${API_BASE}/export/orders?token=${getToken()}`} className="btn-secondary btn-sm">📥 Orders CSV</a>
          <a href={`${API_BASE}/export/customers?token=${getToken()}`} className="btn-secondary btn-sm">📥 Customers CSV</a>
          <a href={`${API_BASE}/export/payments?token=${getToken()}`} className="btn-secondary btn-sm">📥 Payments CSV</a>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: dash ? `₹${Number(dash.totalRevenue || 0).toLocaleString('en-IN')}` : '–', color: 'text-emerald-600' },
          { label: 'Month Revenue', value: dash ? `₹${Number(dash.monthRevenue || 0).toLocaleString('en-IN')}` : '–', color: 'text-blue-700' },
          { label: "Today's Revenue", value: dash ? `₹${Number(dash.todayRevenue || 0).toLocaleString('en-IN')}` : '–', color: 'text-cyan-600' },
          { label: 'Total Orders', value: dash?.totalOrders ?? '–', color: 'text-indigo-600' },
          { label: 'Total Customers', value: dash?.totalCustomers ?? '–', color: 'text-purple-600' },
          { label: 'Pending Payments', value: dash?.pendingPayments ?? '–', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card text-center p-5">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sales by day with date filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Sales by Day</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalSalesOrders} orders · ₹{totalSalesRevenue.toLocaleString('en-IN')} revenue in period
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div>
              <label className="text-xs text-slate-500 block mb-1">From</label>
              <input type="date" className="input text-sm" value={from} max={to} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">To</label>
              <input type="date" className="input text-sm" value={to} min={from} max={today} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="table-auto w-full text-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {sales?.map(s => (
                <tr key={s._id}>
                  <td className="font-mono text-xs">{s._id}</td>
                  <td>{s.orders}</td>
                  <td className="font-medium">₹{Number(s.revenue || 0).toLocaleString('en-IN')}</td>
                  <td className="text-slate-500">₹{s.orders ? Math.round(s.revenue / s.orders).toLocaleString('en-IN') : 0}</td>
                </tr>
              ))}
              {!sales?.length && <tr><td colSpan={4} className="text-center py-4 text-slate-500">No sales in this period</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3">Top Products</h2>
          <div className="overflow-y-auto max-h-64 space-y-2">
            {products?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                <span className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.totalQty} units sold</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">₹{Number(p.totalRevenue || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {!products?.length && <p className="text-center py-4 text-slate-500 text-sm">No product data</p>}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3">Payment Summary</h2>
          <div className="space-y-2">
            {payments?.map(p => (
              <div key={p._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50">
                <span className={`badge ${p._id === 'approved' ? 'badge-green' : p._id === 'pending' || p._id === 'pending_verification' ? 'badge-yellow' : p._id === 'partial' ? 'badge-blue' : 'badge-red'}`}>{p._id}</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">₹{Number(p.total || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500">{p.count} payments</p>
                </div>
              </div>
            ))}
            {!payments?.length && <p className="text-center py-4 text-slate-500 text-sm">No payment data</p>}
          </div>
        </div>

        {/* Jar Summary */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3">Jar Movement</h2>
          <div className="space-y-2">
            {jars?.map(j => (
              <div key={j._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50">
                <span className={`badge ${j._id === 'delivered' ? 'badge-blue' : j._id === 'returned' ? 'badge-green' : j._id === 'lost' || j._id === 'damaged' ? 'badge-red' : 'badge-yellow'}`}>{j._id}</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{j.totalQty} jars</p>
                  <p className="text-xs text-slate-500">{j.count} entries</p>
                </div>
              </div>
            ))}
            {!jars?.length && <p className="text-center py-4 text-slate-500 text-sm">No jar data</p>}
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3">Top Customers</h2>
          <div className="overflow-y-auto max-h-64 space-y-2">
            {customers?.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                <span className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-xs font-bold text-purple-700 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.user?.name || c.user?.email || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{c.totalOrders} orders</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {!customers?.length && <p className="text-center py-4 text-slate-500 text-sm">No customer data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
