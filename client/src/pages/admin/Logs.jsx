import React, { useState } from 'react';
import { useGetLogsQuery } from '../../services/api';

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetLogsQuery({ page, limit: 50 });

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Activity Logs</h1>
          <p>Audit trail of all admin actions — payments, orders, settings, and customers.</p>
        </div>
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <div className="card overflow-x-auto">
            <table className="table-auto w-full">
              <thead><tr><th>Date</th><th>User</th><th>Module</th><th>Action</th><th>Description</th></tr></thead>
              <tbody>
                {data?.logs?.map(l => (
                  <tr key={l._id}>
                    <td className="text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="text-sm">{l.user?.name || l.user?.email || 'System'}</td>
                    <td><span className="badge badge-blue">{l.module}</span></td>
                    <td className="text-sm font-medium">{l.action}</td>
                    <td className="text-xs text-slate-600">{l.description}</td>
                  </tr>
                ))}
                {!data?.logs?.length && <tr><td colSpan={5} className="text-center py-4 text-slate-500">No activity logs</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 justify-end text-sm">
            <button disabled={page===1} onClick={() => setPage(p => p-1)} className="btn-secondary btn-sm">Prev</button>
            <span className="py-1 px-2">Page {page} of {data?.pages||1}</span>
            <button disabled={page>=data?.pages} onClick={() => setPage(p => p+1)} className="btn-secondary btn-sm">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
