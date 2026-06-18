import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useToggleProductMutation, useGetCategoriesQuery } from '../../services/api';

const init = { name:'', description:'', price:'', salePrice:'', unit:'piece', isAvailable:true, isVisible:true, isJarProduct:false, depositAmount:0, stock:0 };

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetProductsQuery({ page, limit: 20, search });
  const { data: cats } = useGetCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [toggleProduct] = useToggleProductMutation();
  const [form, setForm] = useState({ ...init, category: '' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editId) { await updateProduct({ id: editId, ...Object.fromEntries(fd) }).unwrap(); toast.success('Updated'); }
      else { await createProduct(fd).unwrap(); toast.success('Created'); }
      setForm({ ...init, category: '' }); setEditId(null); setShowForm(false); setImageFile(null);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description||'', price: p.price, salePrice: p.salePrice||'', unit: p.unit, category: p.category?._id||'', isAvailable: p.isAvailable, isVisible: p.isVisible, isJarProduct: p.isJarProduct, depositAmount: p.depositAmount||0, stock: p.stock||0 });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete product?')) return;
    try { await deleteProduct(id).unwrap(); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>Manage water products, stock, pricing, images, and jar deposit rules.</p>
        </div>
        <div className="flex gap-2">
          <input className="input w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...init, category: '' }); }} className="btn-primary btn-sm">Add Product</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h2 className="font-semibold">{editId ? 'Edit' : 'Add'} Product</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div><label className="label">Unit</label><input className="input" value={form.unit} onChange={e => set('unit', e.target.value)} /></div>
            <div><label className="label">Price (₹)</label><input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required /></div>
            <div><label className="label">Sale Price (₹)</label><input className="input" type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} /></div>
            <div><label className="label">Stock</label><input className="input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} /></div>
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">None</option>
                {cats?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} /> Available</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.isVisible} onChange={e => set('isVisible', e.target.checked)} /> Visible</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.isJarProduct} onChange={e => set('isJarProduct', e.target.checked)} /> Jar Product</label>
          </div>
          {form.isJarProduct && <div><label className="label">Deposit Amount (₹)</label><input className="input w-40" type="number" value={form.depositAmount} onChange={e => set('depositAmount', e.target.value)} /></div>}
          <div><label className="label">Product Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="input" /></div>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" disabled={creating}>{creating ? '...' : (editId ? 'Update' : 'Create')}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <div className="card text-sm text-slate-500">Loading products...</div> : (
        <div className="card overflow-x-auto">
          <table className="table-auto w-full">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.products?.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded" />}
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        {p.isJarProduct && <span className="text-xs text-orange-600">Jar product</span>}
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{p.category?.name || '-'}</td>
                  <td className="text-sm">₹{p.salePrice || p.price}{p.salePrice && <span className="line-through text-slate-400 ml-1 text-xs">₹{p.price}</span>}</td>
                  <td className="text-sm">{p.stock}</td>
                  <td>
                    <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-red'}`}>{p.isAvailable ? 'Active' : 'Off'}</span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(p)} className="btn-secondary btn-sm">Edit</button>
                      <button onClick={() => toggleProduct(p._id)} className="btn-secondary btn-sm">{p.isAvailable ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => handleDelete(p._id)} className="btn-danger btn-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.products?.length && <tr><td colSpan={6} className="text-center text-slate-500 py-4">No products</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2 justify-end text-sm">
        <button disabled={page===1} onClick={() => setPage(p => p-1)} className="btn-secondary btn-sm">Prev</button>
        <span className="py-1 px-2">Page {page} of {data?.pages||1}</span>
        <button disabled={page>=data?.pages} onClick={() => setPage(p => p+1)} className="btn-secondary btn-sm">Next</button>
      </div>
    </div>
  );
}
