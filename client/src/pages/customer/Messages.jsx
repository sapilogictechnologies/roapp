import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetMyMessagesQuery,
  useMarkAllMessagesReadMutation,
  useMarkMessageReadMutation,
  useSendCustomerMessageMutation,
} from '../../services/api';

const dateTime = (value) => (value ? new Date(value).toLocaleString('en-IN') : '-');

export default function CustomerMessages() {
  const [form, setForm] = useState({ subject: '', body: '' });
  const { data, isLoading } = useGetMyMessagesQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });
  const [sendMessage, { isLoading: sending }] = useSendCustomerMessageMutation();
  const [markRead] = useMarkMessageReadMutation();
  const [markAllRead] = useMarkAllMessagesReadMutation();
  const messages = data?.messages || [];

  const submit = async (event) => {
    event.preventDefault();
    if (!form.body.trim()) return toast.error('Write a message');
    try {
      await sendMessage({ ...form, body: form.body.trim() }).unwrap();
      toast.success('Message sent');
      setForm({ subject: '', body: '' });
    } catch (error) {
      toast.error(error?.data?.message || 'Could not send message');
    }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Messages</h1>
          <p className="text-sm text-slate-500">Ask about orders, payments, events, or jar returns.</p>
        </div>
        <button onClick={() => markAllRead()} className="btn-secondary btn-sm">Mark all read</button>
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <div>
            <label className="label">Subject</label>
            <input
              className="input"
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="label">Message</label>
            <input
              className="input"
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="Write your message"
            />
          </div>
        </div>
        <button className="btn-primary" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
      </form>

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading messages...</div>
        ) : messages.length ? (
          <div className="divide-y divide-slate-100">
            {messages.map((message) => {
              const fromAdmin = message.audience === 'customer';
              return (
                <button
                  key={message._id}
                  onClick={() => fromAdmin && !message.readByCustomer && markRead(message._id)}
                  className={`block w-full p-4 text-left transition hover:bg-slate-50 ${fromAdmin && !message.readByCustomer ? 'bg-cyan-50/70' : 'bg-white'}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{message.subject || 'Message'}</p>
                        <span className={`badge ${fromAdmin ? 'badge-blue' : 'badge-cyan'}`}>
                          {fromAdmin ? 'support' : 'you'}
                        </span>
                        {fromAdmin && !message.readByCustomer && <span className="badge badge-yellow">unread</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{message.body}</p>
                      <p className="mt-2 text-xs text-slate-500">From {message.sender?.name || 'Support'}</p>
                    </div>
                    <span className="text-xs text-slate-400">{dateTime(message.createdAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <h2 className="font-semibold text-slate-800">No messages yet</h2>
            <p className="mt-1 text-sm text-slate-500">Send a message and the support team can reply here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
