import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllCustomersQuery, useToggleCustomerMutation, useTogglePayLaterMutation } from '../../services/api';

export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useGetAllCustomersQuery({ page, limit: 20, search });
  const [toggleCustomer] = useToggleCustomerMutation();
  const [togglePayLater] = useTogglePayLaterMutation();

  const handleTogglePayLater = async (id, current) => {
    try {
      await togglePayLater({ id, allowPayLater: !current }).unwrap();
      toast.success('Updated');
      refetch();
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Customers</h1>
          <p>Review balances, account status, and pay-later access.</p>
        </div>
        <div className="flex gap-2 items-center">
          <input className="input w-48" placeholder="Search name/email/phone" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <a href={`${import.meta.env.VITE_API_BASE_URL}/export/customers?token=${localStorage.getItem('ro_token') || ''}`} download className="btn-secondary btn-sm">Export CSV</a>
        </div>
      </div>
      {isLoading ? <div className="card text-sm text-slate-500">Loading customers...</div> : (
        <>
          <div className="card overflow-x-auto">
            <table className="table-auto w-full">
              <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Outstanding</th><th>Pay Later</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {data?.customers?.map(c => (
                  <tr key={c._id}>
                    <td className="font-medium text-sm">{c.name}</td>
                    <td className="text-sm">{c.email}</td>
                    <td className="text-sm">{c.mobile}</td>
                    <td className={`font-medium ${c.outstandingDues > 0 ? 'text-red-600' : 'text-slate-600'}`}>₹{c.outstandingDues || 0}</td>
                    <td>
                      <button onClick={() => handleTogglePayLater(c._id, c.allowPayLater)} className={`btn-sm ${c.allowPayLater ? 'btn-success' : 'btn-secondary'}`}>
                        {c.allowPayLater ? '✓ Enabled' : 'Enable'}
                      </button>
                    </td>
                    <td><span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>{c.isActive ? 'Active' : 'Blocked'}</span></td>
                    <td className="text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={async () => { await toggleCustomer(c._id); toast.success('Updated'); }} className={`btn-sm ${c.isActive ? 'btn-danger' : 'btn-success'}`}>{c.isActive ? 'Block' : 'Unblock'}</button>
                    </td>
                  </tr>
                ))}
                {!data?.customers?.length && <tr><td colSpan={8} className="text-center py-4 text-slate-500">No customers</td></tr>}
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
