import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../services/api';
import toast from 'react-hot-toast';

const statuses = ['placed','payment_pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
const statusColor = { placed:'blue', payment_pending:'yellow', confirmed:'blue', preparing:'yellow', out_for_delivery:'yellow', delivered:'green', cancelled:'red' };

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const { data, isLoading, refetch } = useGetAllOrdersQuery({ page, limit: 20, status, search, paymentMethod });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatus = async (id, orderStatus) => {
    try { await updateStatus({ id, orderStatus }).unwrap(); toast.success('Status updated'); }
    catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Orders</h1>
          <p>Manage deliveries, update statuses, and track payments for all orders.</p>
        </div>
        <button onClick={refetch} className="btn-secondary btn-sm">🔄 Refresh</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="input w-48" placeholder="Search order#/phone/pincode" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input w-44" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="input w-36" value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setPage(1); }}>
          <option value="">All Payment</option>
          <option value="cod">COD</option>
          <option value="upi">UPI</option>
          <option value="credit">Pay Later</option>
        </select>
      </div>
      {isLoading ? <div className="card text-sm text-slate-500">Loading orders...</div> : (
        <>
          <div className="card overflow-x-auto">
            <table className="table-auto w-full">
              <thead><tr><th>Order #</th><th>Customer</th><th>Location</th><th>Total</th><th>Status</th><th>Payment</th><th>Method</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {data?.orders?.map(o => (
                  <tr key={o._id}>
                    <td><Link to={`/admin/orders/${o._id}`} className="text-blue-600 font-medium">{o.orderNumber}</Link></td>
                    <td className="text-sm">{o.user?.name || o.guestName || 'Guest'}<br/><span className="text-xs text-gray-400">{o.user?.mobile || o.guestPhone}</span></td>
                    <td className="text-xs">{o.pincode ? `📍${o.pincode}` : ''} {o.city}</td>
                    <td>₹{o.total}</td>
                    <td>
                      <select className="text-xs border rounded px-1 py-0.5" value={o.orderStatus} onChange={e => handleStatus(o._id, e.target.value)}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><span className={`badge ${o.paymentStatus==='paid'?'badge-green':o.paymentStatus==='partial'?'badge-blue':'badge-yellow'}`}>{o.paymentStatus}</span></td>
                    <td className="text-xs">{o.paymentMethod}</td>
                    <td className="text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><Link to={`/admin/orders/${o._id}`} className="text-blue-600 text-xs">Detail</Link></td>
                  </tr>
                ))}
                {!data?.orders?.length && <tr><td colSpan={9} className="text-center text-gray-500 py-4">No orders</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 justify-end text-sm">
            <button disabled={page===1} onClick={() => setPage(p => p-1)} className="btn-secondary btn-sm">Prev</button>
            <span className="py-1 px-2">Page {page} of {data?.pages||1} ({data?.total||0} total)</span>
            <button disabled={page>=data?.pages} onClick={() => setPage(p => p+1)} className="btn-secondary btn-sm">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
