import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader/Loader';
import Modal from '../components/Modal/Modal';
import { fetchCategories } from '../redux/slices/categorySlice';
import api from '../services/api';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500' });
      toast.success('Category created!');
      setModalOpen(false);
      setName('');
      setImage('');
      dispatch(fetchCategories());
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        dispatch(fetchCategories());
      } catch (err) {
        toast.error('Deletion failed');
      }
    }
  };

  if (loading) return <Loader message="Loading categories..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Grid className="text-purple-400" /> Category Management
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-xl object-cover bg-slate-900" />
              <div>
                <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                <p className="text-[11px] text-slate-500">/{cat.slug}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(cat._id)} className="p-2 text-rose-400 hover:bg-slate-900 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Category">
        <form onSubmit={handleAdd} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow">
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
