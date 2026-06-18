import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAddJarEntryMutation, useGetAllCustomersQuery, useGetAllJarsQuery } from '../../services/api';

const init = { user: '', type: 'returned', quantity: 1, depositAmount: 0, notes: '' };

const typeClass = {
  delivered: 'badge-blue',
  returned: 'badge-green',
  deposit: 'badge-cyan',
  lost: 'badge-red',
  damaged: 'badge-red',
};

export default function AdminJars() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const { data, isLoading, refetch } = useGetAllJarsQuery({ page, limit: 20, type: typeFilter || undefined });
  const { data: customersData } = useGetAllCustomersQuery({ limit: 100, search: customerSearch || undefined });
  const [addEntry, { isLoading: adding }] = useAddJarEntryMutation();
  const [form, setForm] = useState(init);
  const [showForm, setShowForm] = useState(false);

  const customers = customersData?.customers || [];
  const summary = data?.summary || {};
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer._id === form.user),
    [customers, form.user]
  );

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!form.user) return toast.error('Choose a customer');
    if (Number(form.quantity) <= 0) return toast.error('Quantity must be greater than zero');
    try {
      await addEntry({
        ...form,
        quantity: Number(form.quantity),
        depositAmount: Number(form.depositAmount || 0),
      }).unwrap();
      toast.success('Jar ledger entry added');
      setForm(init);
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add jar entry');
    }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Jar Ledger</h1>
          <p>Track customer jar deliveries, returns, deposit held, refunds, and manual adjustments.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-36" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="lost">Lost</option>
            <option value="damaged">Damaged</option>
            <option value="deposit">Deposit</option>
          </select>
          <button onClick={refetch} className="btn-secondary btn-sm">Refresh</button>
          <button onClick={() => setShowForm((value) => !value)} className="btn-primary btn-sm">Add Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Delivered', summary.delivered || 0, 'badge-blue'],
          ['Returned', summary.returned || 0, 'badge-green'],
          ['Pending Jars', summary.balance || 0, 'badge-yellow'],
          ['Deposit Held', `Rs. ${summary.depositHeld || 0}`, 'badge-cyan'],
          ['Refunded', `Rs. ${summary.depositRefunded || 0}`, 'badge-green'],
        ].map(([label, value, klass]) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            <span className={`badge ${klass} mt-3`}>ledger</span>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Add Jar Entry</h2>
              <p className="text-sm text-slate-500">Returns, lost, and damaged entries cannot exceed pending jars.</p>
            </div>
            {selectedCustomer && <span className="badge badge-blue">{selectedCustomer.name}</span>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label">Find Customer</label>
              <input
                className="input"
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Search name, email, mobile"
              />
            </div>
            <div>
              <label className="label">Customer</label>
              <select className="input" value={form.user} onChange={(event) => setForm({ ...form, user: event.target.value })} required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.mobile || customer.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {['delivered', 'returned', 'lost', 'damaged', 'deposit'].map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input className="input" type="number" min="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
            </div>
            <div>
              <label className="label">Deposit Amount</label>
              <input className="input" type="number" min="0" value={form.depositAmount} onChange={(event) => setForm({ ...form, depositAmount: event.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Order, collection, refund, or adjustment note" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" disabled={adding}>{adding ? 'Adding...' : 'Add Entry'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="card text-sm text-slate-500">Loading jar ledger...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Order</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Deposit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data?.ledger?.map((entry) => (
                <tr key={entry._id}>
                  <td className="text-xs">{new Date(entry.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="text-sm">
                    {entry.user?.name || entry.user?.email || '-'}
                    <br />
                    <span className="text-xs text-slate-400">{entry.user?.email}</span>
                  </td>
                  <td className="text-xs">{entry.order?.orderNumber || '-'}</td>
                  <td><span className={`badge ${typeClass[entry.type] || 'badge-gray'}`}>{entry.type}</span></td>
                  <td>{entry.quantity}</td>
                  <td>{entry.depositAmount > 0 ? `Rs. ${entry.depositAmount}` : '-'}</td>
                  <td className="text-xs">{entry.notes || '-'}</td>
                </tr>
              ))}
              {!data?.ledger?.length && (
                <tr><td colSpan={7} className="text-center py-6 text-slate-500">No jar ledger entries</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 justify-end text-sm">
        <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="btn-secondary btn-sm">Prev</button>
        <span className="py-1 px-2">Page {page} of {data?.pages || 1}</span>
        <button disabled={page >= (data?.pages || 1)} onClick={() => setPage((value) => value + 1)} className="btn-secondary btn-sm">Next</button>
      </div>
    </div>
  );
}
