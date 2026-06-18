import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAllCustomersQuery,
  useGetAllMessagesQuery,
  useMarkAllMessagesReadMutation,
  useMarkMessageReadMutation,
  useSendAdminMessageMutation,
} from '../../services/api';

const dateTime = (value) => (value ? new Date(value).toLocaleString('en-IN') : '-');

export default function AdminMessages() {
  const [customerId, setCustomerId] = useState('');
  const [form, setForm] = useState({ customerId: '', subject: '', body: '' });
  const { data: customersData } = useGetAllCustomersQuery({ limit: 100 });
  const { data, isLoading } = useGetAllMessagesQuery(
    { limit: 100, customerId: customerId || undefined },
    { pollingInterval: 10000, refetchOnMountOrArgChange: true }
  );
  const [sendMessage, { isLoading: sending }] = useSendAdminMessageMutation();
  const [markRead] = useMarkMessageReadMutation();
  const [markAllRead] = useMarkAllMessagesReadMutation();

  const customers = customersData?.customers || [];
  const messages = data?.messages || [];
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer._id === (form.customerId || customerId)),
    [customers, form.customerId, customerId]
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!form.customerId) return toast.error('Choose a customer');
    if (!form.body.trim()) return toast.error('Write a message');
    try {
      await sendMessage({ ...form, body: form.body.trim() }).unwrap();
      toast.success('Message sent');
      setCustomerId(form.customerId);
      setForm((prev) => ({ ...prev, subject: '', body: '' }));
    } catch (error) {
      toast.error(error?.data?.message || 'Could not send message');
    }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Messages</h1>
          <p className="text-sm text-slate-500">Reply to customer questions and order/payment follow-ups.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select className="input sm:w-64" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.mobile || customer.email}
              </option>
            ))}
          </select>
          <button onClick={() => markAllRead()} className="btn-secondary btn-sm">Mark all read</button>
        </div>
      </div>

      <form onSubmit={submit} className="card grid gap-3 lg:grid-cols-[260px_220px_1fr_auto] lg:items-end">
        <div>
          <label className="label">Customer</label>
          <select
            className="input"
            value={form.customerId}
            onChange={(e) => setForm((prev) => ({ ...prev, customerId: e.target.value }))}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.mobile || customer.email}
              </option>
            ))}
          </select>
        </div>
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
            placeholder={selectedCustomer ? `Message ${selectedCustomer.name}` : 'Write a customer message'}
          />
        </div>
        <button className="btn-primary" disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
      </form>

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading messages...</div>
        ) : messages.length ? (
          <div className="divide-y divide-slate-100">
            {messages.map((message) => {
              const inbound = message.audience === 'admin';
              return (
                <button
                  key={message._id}
                  onClick={() => inbound && !message.readByAdmin && markRead(message._id)}
                  className={`block w-full p-4 text-left transition hover:bg-slate-50 ${inbound && !message.readByAdmin ? 'bg-cyan-50/70' : 'bg-white'}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{message.subject || 'Message'}</p>
                        <span className={`badge ${inbound ? 'badge-cyan' : 'badge-blue'}`}>
                          {inbound ? 'customer' : 'admin'}
                        </span>
                        {inbound && !message.readByAdmin && <span className="badge badge-yellow">unread</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{message.body}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {message.customer?.name || 'Customer'} | from {message.sender?.name || '-'}
                      </p>
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
            <p className="mt-1 text-sm text-slate-500">Customer messages and admin replies will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
