import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Package } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Modal from '../../components/common/Modal';
import axiosInstance from '../../api/axiosInstance';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = { name, description, image };

    try {
      if (isEditing) {
        await axiosInstance.put(`/categories/${editingId}`, payload);
      } else {
        await axiosInstance.post('/categories', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete category "${title}"?`)) {
      try {
        await axiosInstance.delete(`/categories/${id}`);
        setCategories(categories.filter((c) => c._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Product Categories
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize multi-vendor store departments and catalogs
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No categories found. Click "Add Category" to create your first one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Assigned Products</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <span className="font-bold text-slate-900 text-xs">
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-6 text-slate-500 font-mono text-[11px]">
                        {cat.slug}
                      </td>

                      <td className="py-3 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {cat.productCount || 0} Products
                        </span>
                      </td>

                      <td className="py-3 px-6 text-slate-500 line-clamp-1 max-w-xs">
                        {cat.description || 'No description'}
                      </td>

                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Create New Category'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Footwear & Sneakers"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of products under this category..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
