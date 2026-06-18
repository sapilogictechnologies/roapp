import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetOrderQuery, useReorderMutation } from '../../services/api';

const statusColor = {
  placed: 'blue',
  payment_pending: 'yellow',
  confirmed: 'blue',
  preparing: 'yellow',
  out_for_delivery: 'yellow',
  delivered: 'green',
  cancelled: 'red',
};
const jarOptionLabel = {
  returning: 'Returning empty jar now',
  no_jar: 'Need new jar',
  return_later: 'Return later',
  own_container: 'Own container',
};
const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrderQuery(id);
  const [reorder, { isLoading: reordering }] = useReorderMutation();

  const handleReorder = async () => {
    try {
      const nextOrder = await reorder(id).unwrap();
      toast.success(`Reorder placed: #${nextOrder.orderNumber}`);
      navigate('/orders');
    } catch (err) {
      toast.error(err?.data?.message || 'Reorder failed');
    }
  };

  if (isLoading) return <div className="app-page"><div className="card text-sm text-slate-500">Loading order...</div></div>;
  if (!order) return <div className="app-page"><div className="card text-sm text-slate-500">Order not found.</div></div>;

  return (
    <div className="app-page max-w-2xl">
      <div className="page-heading">
        <div>
          <h1>Order #{order.orderNumber}</h1>
          <p>View order details, items, and payment status.</p>
        </div>
        <span className={`badge badge-${statusColor[order.orderStatus] || 'gray'}`}>{order.orderStatus?.replace(/_/g, ' ')}</span>
      </div>
      <div className="card space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-500">Date</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}>{order.paymentStatus}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Method</span><span>{order.paymentMethod}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-500">Address</span><span className="max-w-xs text-right">{order.address}</span></div>
        {order.etaMinutes && <div className="flex justify-between"><span className="text-slate-500">ETA</span><span>~{order.etaMinutes} min</span></div>}
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Items</h2>
        {order.items?.map((item, index) => (
          <div key={`${item.product || item.name}-${index}`} className="flex justify-between gap-3 border-b py-2 text-sm last:border-0">
            <div>
              <p>{item.name} x {item.quantity}</p>
              {item.isJarProduct && (
                <p className="mt-1 text-xs text-slate-500">
                  Jar option: {jarOptionLabel[item.jarOption] || item.jarOption || '-'}
                  {item.depositAmount > 0 && <span className="text-amber-600"> | Deposit {money(item.depositAmount)}</span>}
                </p>
              )}
            </div>
            <span>{money(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{money(order.deliveryFee)}</span></div>
          {order.depositFee > 0 && <div className="flex justify-between text-amber-600"><span>Jar Deposit</span><span>{money(order.depositFee)}</span></div>}
          {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{money(order.discountAmount)}</span></div>}
          <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>{money(order.total)}</span></div>
        </div>
      </div>
      {order.orderNotes && <div className="card text-sm"><span className="font-medium">Notes: </span>{order.orderNotes}</div>}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleReorder} disabled={reordering} className="btn-secondary btn-sm">{reordering ? 'Reordering...' : 'Reorder'}</button>
        {order.paymentStatus !== 'paid' && <Link to="/payments/submit" className="btn-primary btn-sm">Submit Payment</Link>}
        <Link to="/products" className="btn-secondary btn-sm">Back to shop</Link>
      </div>
    </div>
  );
}
