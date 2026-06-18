// Categories.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../services/api';

export default function AdminCategories() {
  const { data: cats, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [form, setForm] = useState({ name: '', isActive: true });
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await updateCategory({ id: editId, ...form }).unwrap(); toast.success('Updated'); }
      else { await createCategory(form).unwrap(); toast.success('Created'); }
      setForm({ name: '', isActive: true }); setEditId(null);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-page max-w-xl">
      <div className="page-heading">
        <div>
          <h1>Categories</h1>
          <p>Organise products into categories for better browsing.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="card flex gap-3 items-end">
        <div className="flex-1"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
        <label className="flex items-center gap-1 text-sm mb-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Active</label>
        <button className="btn-primary btn-sm mb-2">{editId ? 'Update' : 'Add'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', isActive: true }); }} className="btn-secondary btn-sm mb-2">Cancel</button>}
      </form>
      {isLoading ? <p>Loading...</p> : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead><tr><th>Name</th><th>Slug</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {cats?.map(c => (
                <tr key={c._id}>
                  <td className="font-medium text-sm">{c.name}</td>
                  <td className="text-sm text-slate-500">{c.slug}</td>
                  <td><span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="flex gap-1">
                    <button onClick={() => { setForm({ name: c.name, isActive: c.isActive }); setEditId(c._id); }} className="btn-secondary btn-sm">Edit</button>
                    <button onClick={async () => { if(confirm('Delete?')) { await deleteCategory(c._id); toast.success('Deleted'); } }} className="btn-danger btn-sm">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
