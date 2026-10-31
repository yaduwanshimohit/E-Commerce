import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader/Loader';
import Modal from '../components/Modal/Modal';
import { fetchAdminBanners } from '../redux/slices/adminSlice';
import api from '../services/api';

const AdminBanners = () => {
  const dispatch = useDispatch();
  const { adminBanners: banners, loading } = useSelector((state) => state.admin);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    try {
      await api.post('/admin/banners', { title, subtitle, image: imageUrl });
      toast.success('Banner created!');
      setModalOpen(false);
      setTitle('');
      setImageUrl('');
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.error('Failed to create banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete banner?')) {
      try {
        await api.delete(`/admin/banners/${id}`);
        toast.success('Banner deleted');
        dispatch(fetchAdminBanners());
      } catch (err) {
        toast.error('Deletion failed');
      }
    }
  };

  if (loading) return <Loader message="Loading banners..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Image className="text-purple-400" /> Banner & Hero Promotional Management
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b._id} className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 group">
            <img src={b.image} alt={b.title} className="w-full h-48 object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-lg font-black text-white">{b.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-1">{b.subtitle}</p>
            </div>
            <button
              onClick={() => handleDelete(b._id)}
              className="absolute top-3 right-3 p-2 bg-rose-600/80 text-white rounded-full hover:bg-rose-600 transition-colors shadow"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Hero Banner">
        <form onSubmit={handleCreate} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold mb-1">Banner Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Banner Image URL *</label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow">
              Publish Banner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBanners;
