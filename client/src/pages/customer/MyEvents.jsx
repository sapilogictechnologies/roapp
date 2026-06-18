import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useAcceptEventQuoteMutation,
  useGetMyEventsQuery,
  useRejectEventQuoteMutation,
} from '../../services/api';

const statuses = ['pending', 'quoted', 'confirmed', 'completed', 'cancelled'];
const statusClass = {
  pending: 'badge-yellow',
  quoted: 'badge-blue',
  confirmed: 'badge-cyan',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '-';

export default function MyEvents() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [rejecting, setRejecting] = useState('');
  const [reason, setReason] = useState('');
  const { data, isLoading } = useGetMyEventsQuery({ page, limit: 10, status });
  const [acceptQuote, { isLoading: accepting }] = useAcceptEventQuoteMutation();
  const [rejectQuote, { isLoading: rejectingQuote }] = useRejectEventQuoteMutation();

  const handleAccept = async (id) => {
    try {
      await acceptQuote(id).unwrap();
      toast.success('Quote accepted. Your event is confirmed.');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not accept quote');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectQuote({ id, reason }).unwrap();
      toast.success('Quote rejected.');
      setRejecting('');
      setReason('');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not reject quote');
    }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>My Events</h1>
          <p className="text-sm text-slate-500">Review quotes and track your event water bookings.</p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-40"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Link to="/event-booking" className="btn-primary btn-sm">New Event</Link>
        </div>
      </div>

      {isLoading ? <div className="card text-sm text-slate-500">Loading event bookings...</div> : (
        <>
          <div className="space-y-3">
            {data?.events?.map((event) => (
              <div key={event._id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{event.eventType}</h2>
                      <span className={`badge ${statusClass[event.status] || 'badge-gray'}`}>{event.status}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {date(event.eventDate)} | {event.venue}
                    </p>
                    <p className="text-sm text-slate-600">
                      Guests: {event.guestCount || '-'} | Water: {event.waterQuantity || event.waterType || '-'}
                    </p>
                    {event.notes && <p className="text-xs text-slate-500">Notes: {event.notes}</p>}
                    {event.quoteNotes && (
                      <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                        {event.quoteNotes}
                      </p>
                    )}
                  </div>

                  <div className="lg:text-right space-y-2 shrink-0">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                        {event.quoteAmount > 0 ? 'Final Quote' : 'Estimated Total'}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {money(event.quoteAmount > 0 ? event.quoteAmount : event.estimatedTotal)}
                      </p>
                    </div>
                    {event.status === 'quoted' && (
                      <div className="flex flex-wrap lg:justify-end gap-2">
                        <button
                          onClick={() => handleAccept(event._id)}
                          disabled={accepting}
                          className="btn-success btn-sm"
                        >
                          Accept Quote
                        </button>
                        <button
                          onClick={() => { setRejecting(event._id); setReason(''); }}
                          className="btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {event.status === 'pending' && (
                      <p className="text-xs text-slate-500">Quote pending from admin.</p>
                    )}
                    {event.quoteResponse === 'accepted' && (
                      <p className="text-xs text-emerald-600 font-medium">Accepted on {date(event.quoteRespondedAt)}</p>
                    )}
                    {event.quoteResponse === 'rejected' && (
                      <p className="text-xs text-red-600 font-medium">Rejected on {date(event.quoteRespondedAt)}</p>
                    )}
                  </div>
                </div>

                {rejecting === event._id && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 border-t border-slate-100 pt-4">
                    <input
                      className="input flex-1"
                      placeholder="Reason for rejection (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <button
                      onClick={() => handleReject(event._id)}
                      disabled={rejectingQuote}
                      className="btn-danger btn-sm"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setRejecting(''); setReason(''); }}
                      className="btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!data?.events?.length && (
              <div className="empty-state">
                <h2 className="empty-state-title mb-2">No event bookings yet</h2>
                <Link to="/event-booking" className="btn-primary btn-sm">Book an Event</Link>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end text-sm">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary btn-sm">Prev</button>
            <span className="py-1 px-2">Page {page} of {data?.pages || 1}</span>
            <button disabled={page >= (data?.pages || 1)} onClick={() => setPage((p) => p + 1)} className="btn-secondary btn-sm">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
