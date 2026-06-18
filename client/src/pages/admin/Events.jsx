import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAllEventsQuery,
  useUpdateEventQuoteMutation,
  useUpdateEventStatusMutation,
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

export default function AdminEvents() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [quoteForm, setQuoteForm] = useState({ id: '', quoteAmount: '', quoteNotes: '' });
  const [showQuoteFor, setShowQuoteFor] = useState(null);
  const { data, isLoading } = useGetAllEventsQuery({ page, limit: 20, status });
  const [updateQuote, { isLoading: sendingQuote }] = useUpdateEventQuoteMutation();
  const [updateStatus] = useUpdateEventStatusMutation();

  const openQuoteForm = (event) => {
    setShowQuoteFor(event._id);
    setQuoteForm({
      id: event._id,
      quoteAmount: event.quoteAmount || event.estimatedTotal || '',
      quoteNotes: event.quoteNotes || '',
    });
  };

  const handleQuote = async (event) => {
    event.preventDefault();
    try {
      await updateQuote({
        id: quoteForm.id,
        quoteAmount: Number(quoteForm.quoteAmount),
        quoteNotes: quoteForm.quoteNotes,
      }).unwrap();
      toast.success('Quote sent');
      setShowQuoteFor(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send quote');
    }
  };

  const handleStatus = async (id, nextStatus, note = '', extra = {}) => {
    try {
      await updateStatus({ id, status: nextStatus, note, ...extra }).unwrap();
      toast.success('Event updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Event Bookings</h1>
          <p className="text-sm text-slate-500">Quote customer event enquiries and manage confirmed bookings.</p>
        </div>
        <select
          className="input w-44"
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {isLoading ? <div className="card text-sm text-slate-500">Loading event bookings...</div> : (
        <>
          <div className="space-y-3">
            {data?.events?.map((event) => (
              <div key={event._id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{event.name} - {event.eventType}</h2>
                      <span className={`badge ${statusClass[event.status] || 'badge-gray'}`}>{event.status}</span>
                      {event.quoteResponse === 'accepted' && <span className="badge badge-green">quote accepted</span>}
                      {event.quoteResponse === 'rejected' && <span className="badge badge-red">quote rejected</span>}
                    </div>
                    <p className="text-sm text-slate-600">
                      {event.phone} | {date(event.eventDate)} | {event.venue}
                    </p>
                    <p className="text-sm text-slate-600">
                      Guests: {event.guestCount || '-'} | Water: {event.waterQuantity || event.waterType || '-'}
                    </p>
                    {event.createdBy && (
                      <p className="text-xs text-slate-500">
                        Customer: {event.createdBy.name || '-'} ({event.createdBy.email || event.createdBy.mobile || '-'})
                      </p>
                    )}
                    {event.notes && <p className="text-xs text-slate-500">Notes: {event.notes}</p>}
                    {event.cancellationReason && <p className="text-xs text-red-600">Cancel reason: {event.cancellationReason}</p>}
                  </div>

                  <div className="lg:text-right space-y-2 shrink-0">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                        {event.quoteAmount > 0 ? 'Quote' : 'Estimate'}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {money(event.quoteAmount > 0 ? event.quoteAmount : event.estimatedTotal)}
                      </p>
                    </div>
                    {event.quoteNotes && <p className="text-xs text-slate-500 max-w-xs lg:ml-auto">{event.quoteNotes}</p>}
                    <div className="flex flex-wrap lg:justify-end gap-2">
                      {['pending', 'quoted'].includes(event.status) && (
                        <button onClick={() => openQuoteForm(event)} className="btn-primary btn-sm">
                          {event.status === 'quoted' ? 'Update Quote' : 'Send Quote'}
                        </button>
                      )}
                      {event.status === 'quoted' && event.quoteResponse === 'accepted' && (
                        <button
                          onClick={() => handleStatus(event._id, 'confirmed', 'Confirmed after customer quote acceptance')}
                          className="btn-success btn-sm"
                        >
                          Confirm
                        </button>
                      )}
                      {event.status === 'quoted' && event.quoteResponse !== 'accepted' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Confirm this event before the customer accepts the quote?')) {
                              handleStatus(event._id, 'confirmed', 'Confirmed manually by admin', { adminOverride: true });
                            }
                          }}
                          className="btn-secondary btn-sm"
                        >
                          Override Confirm
                        </button>
                      )}
                      {event.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatus(event._id, 'completed', 'Event completed')}
                          className="btn-success btn-sm"
                        >
                          Complete
                        </button>
                      )}
                      {!['completed', 'cancelled'].includes(event.status) && (
                        <button
                          onClick={() => handleStatus(event._id, 'cancelled', 'Cancelled by admin')}
                          className="btn-danger btn-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {showQuoteFor === event._id && (
                  <form onSubmit={handleQuote} className="mt-4 grid sm:grid-cols-[160px_1fr_auto_auto] gap-3 items-end border-t border-slate-100 pt-4">
                    <div>
                      <label className="label">Quote Amount</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        value={quoteForm.quoteAmount}
                        onChange={(e) => setQuoteForm({ ...quoteForm, quoteAmount: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Quote Notes</label>
                      <input
                        className="input"
                        value={quoteForm.quoteNotes}
                        onChange={(e) => setQuoteForm({ ...quoteForm, quoteNotes: e.target.value })}
                        placeholder="Delivery terms, advance amount, setup notes"
                      />
                    </div>
                    <button className="btn-primary btn-sm" disabled={sendingQuote}>Send</button>
                    <button type="button" onClick={() => setShowQuoteFor(null)} className="btn-secondary btn-sm">Cancel</button>
                  </form>
                )}
              </div>
            ))}
            {!data?.events?.length && <div className="empty-state">No event bookings found.</div>}
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
