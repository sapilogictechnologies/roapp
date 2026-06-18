import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../../services/api';

const SC = {
  placed: 'badge-blue',
  payment_pending: 'badge-yellow',
  confirmed: 'badge-cyan',
  preparing: 'badge-yellow',
  out_for_delivery: 'badge-orange',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

const statuses = ['placed', 'payment_pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function MyOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useGetMyOrdersQuery({ page, limit: 10, status: status || undefined });

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>My Orders</h1>
          <p>Review delivery status, totals, and payment state for every order.</p>
        </div>
        <Link to="/products" className="btn-primary btn-sm">Order Again →</Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select className="input w-44" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Orders</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <p className="py-2 text-sm text-slate-500 self-center">{data?.total ? `${data.total} orders` : ''}</p>
      </div>

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading orders...</div>
      ) : !data?.orders?.length ? (
        <div className="empty-state">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium text-slate-600">No orders found</p>
          <p className="text-xs mt-1 mb-4">{status ? 'Try clearing the filter' : 'Place your first order to get started'}</p>
          {!status && <Link to="/products" className="btn-primary btn-sm">Shop Now →</Link>}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.orders.map(o => (
              <Link
                to={`/orders/${o._id}`}
                key={o._id}
                className="card flex items-center gap-3 sm:gap-4 p-4 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-sm">#{o.orderNumber}</p>
                    <span className={`badge ${SC[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus?.replace(/_/g, ' ')}</span>
                    <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentStatus}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">₹{o.total}</p>
                  <p className="text-xs text-blue-500 group-hover:text-blue-700 mt-0.5">View →</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex gap-2 justify-end text-sm text-slate-600">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">Prev</button>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium">Page {page} of {data?.pages || 1}</span>
            <button disabled={page >= (data?.pages || 1)} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
