import React from 'react';
import { Link } from 'react-router-dom';
export default function OrderCard({ order }) {
  return (
    <Link to={`/orders/${order._id}`} className="flex justify-between items-center py-2 border-b last:border-0 hover:bg-gray-50 px-2 rounded text-sm">
      <span className="font-medium">#{order.orderNumber}</span>
      <span>₹{order.total}</span>
      <span className={`badge badge-${order.orderStatus === 'delivered' ? 'green' : order.orderStatus === 'cancelled' ? 'red' : 'blue'}`}>{order.orderStatus}</span>
    </Link>
  );
}
