import React from 'react';
import { Link } from 'react-router-dom';
import { useGetMyPaymentsQuery } from '../../services/api';

const statusClass = {
  approved: 'badge-green',
  rejected: 'badge-red',
  partial: 'badge-blue',
  pending: 'badge-yellow',
  pending_verification: 'badge-yellow',
};

const methodIcon = { upi: '📱', cash: '💵', bank: '🏦', credit: '💳' };

export default function MyPayments() {
  const { data: payments, isLoading } = useGetMyPaymentsQuery();

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>My Payments</h1>
          <p>Uploaded payment proofs and admin verification status.</p>
        </div>
        <Link to="/payments/submit" className="btn-primary btn-sm">Submit Proof →</Link>
      </div>

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading payments...</div>
      ) : !payments?.length ? (
        <div className="empty-state">
          <div className="text-4xl mb-2">💳</div>
          <p className="font-medium text-slate-600">No payments submitted yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Submit a payment screenshot to update your order status.</p>
          <Link to="/payments/submit" className="btn-primary btn-sm">Submit Payment</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
                    {methodIcon[payment.method] || '💳'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">
                        {payment.order?.orderNumber ? `#${payment.order.orderNumber}` : 'General payment'}
                      </p>
                      <span className={`badge ${statusClass[payment.status] || 'badge-gray'}`}>
                        {payment.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{payment.method?.toUpperCase()}
                      {payment.utrNumber && ` · UTR: ${payment.utrNumber}`}
                    </p>
                    {(payment.adminNotes || payment.rejectionReason) && (
                      <p className="text-xs mt-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600">
                        Admin: {payment.adminNotes || payment.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">₹{payment.amount}</p>
                  {payment.expectedAmount && payment.expectedAmount !== payment.amount && (
                    <p className="text-xs text-slate-400">Expected ₹{payment.expectedAmount}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
