import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetOrderQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation } from '../../services/api';

const statuses = ['placed', 'payment_pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const payStatuses = ['pending', 'paid', 'partial', 'refunded'];
const jarOptionLabel = {
  returning: 'Returning empty jar now',
  no_jar: 'Need new jar',
  return_later: 'Return later',
  own_container: 'Own container',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrderQuery(id);
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [updatePayStatus] = useUpdatePaymentStatusMutation();
  const [adminNotes, setAdminNotes] = useState('');
  const [noteText, setNoteText] = useState('');

  if (isLoading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  const handleStatus = async (orderStatus) => {
    try {
      await updateStatus({ id, orderStatus, adminNotes, note: noteText }).unwrap();
      toast.success('Updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const handlePayStatus = async (paymentStatus) => {
    try {
      await updatePayStatus({ id, paymentStatus, note: noteText }).unwrap();
      toast.success('Payment status updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  return (
    <div className="app-page max-w-3xl">
      <div className="page-heading">
        <div>
          <h1>Order #{order.orderNumber}</h1>
          <p>Order details, status management, and payment tracking.</p>
        </div>
        <Link to="/admin/orders" className="btn-secondary btn-sm">← Back to orders</Link>
      </div>

      {order.orderStatus === 'payment_pending' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          This UPI order is awaiting manual payment verification. Review proof in <Link to="/admin/payments" className="font-medium underline">Payments</Link> before confirming.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2 text-sm">
          <h2 className="font-semibold">Customer</h2>
          <div>{order.user?.name || order.guestName || 'Guest'}</div>
          <div className="text-slate-500">{order.user?.email}</div>
          <div className="text-slate-500">{order.user?.mobile || order.guestPhone}</div>
        </div>
        <div className="card space-y-2 text-sm">
          <h2 className="font-semibold">Delivery</h2>
          <div>{order.address}</div>
          {order.area && <div className="text-slate-500">{order.area}</div>}
          {order.pincode && <div className="text-slate-500">Pincode: {order.pincode} {order.city}</div>}
          {order.distanceKm > 0 && <div>Distance: {order.distanceKm} km | ETA: {order.etaMinutes} min</div>}
          <div>Location: {order.locationSource}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Items & Jar Options</h2>
        {order.items?.map((item, index) => (
          <div key={`${item.product || item.name}-${index}`} className="flex justify-between gap-3 border-b py-2 text-sm last:border-0">
            <div>
              <p>{item.name} x {item.quantity}</p>
              {item.isJarProduct && (
                <p className="mt-1 text-xs text-slate-500">
                  Jar option: <span className="font-medium text-slate-700">{jarOptionLabel[item.jarOption] || item.jarOption || '-'}</span>
                  {item.depositAmount > 0 && <span className="text-amber-600"> | Deposit Rs. {item.depositAmount}</span>}
                </p>
              )}
            </div>
            <span className="font-medium">Rs. {item.price * item.quantity}</span>
          </div>
        ))}
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {order.subtotal}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>Rs. {order.deliveryFee}</span></div>
          {order.depositFee > 0 && <div className="flex justify-between text-amber-600"><span>Jar Deposit</span><span>Rs. {order.depositFee}</span></div>}
          {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs. {order.discountAmount}</span></div>}
          <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>Rs. {order.total}</span></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span>Payment: <strong>{order.paymentMethod}</strong></span>
          <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
          <span>Jar status: <strong>{order.jarStatus}</strong></span>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Update Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button key={status} onClick={() => handleStatus(status)} className={`btn-sm ${order.orderStatus === status ? 'btn-primary' : 'btn-secondary'}`}>
              {status}
            </button>
          ))}
        </div>
        <div>
          <label className="label">Update Payment Status</label>
          <div className="flex flex-wrap gap-2">
            {payStatuses.map((status) => (
              <button key={status} onClick={() => handlePayStatus(status)} className={`btn-sm ${order.paymentStatus === status ? 'btn-primary' : 'btn-secondary'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div><label className="label">Status Note</label><input className="input" value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Note for status change" /></div>
          <div><label className="label">Admin Notes</label><input className="input" value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder={order.adminNotes || 'Admin notes'} /></div>
        </div>
      </div>

      {order.statusHistory?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-2">Status History</h2>
          <div className="space-y-1">
            {order.statusHistory.map((history, index) => (
              <div key={index} className="flex flex-wrap gap-3 text-sm">
                <span className="text-xs text-slate-400">{new Date(history.changedAt).toLocaleString()}</span>
                <span className="badge badge-blue">{history.status}</span>
                {history.note && <span className="text-slate-600">{history.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.paymentStatusHistory?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-2">Payment Status History</h2>
          <div className="space-y-1">
            {order.paymentStatusHistory.map((history, index) => (
              <div key={index} className="flex flex-wrap gap-3 text-sm">
                <span className="text-xs text-slate-400">{new Date(history.changedAt).toLocaleString()}</span>
                <span className="badge badge-green">{history.status}</span>
                {history.note && <span className="text-slate-600">{history.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
