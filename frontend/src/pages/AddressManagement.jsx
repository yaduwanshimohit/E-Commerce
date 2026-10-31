import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Plus, Trash2, Edit, Check, Star } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Modal from '../components/Modal/Modal';
import Loader from '../components/Loader/Loader';
import {
  fetchAddresses,
  addAddressThunk,
  updateAddressThunk,
  deleteAddressThunk,
  setDefaultAddressThunk,
} from '../redux/slices/addressSlice';

const AddressManagement = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.address);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    houseFlat: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
    isDefault: false,
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      fullName: '',
      mobileNumber: '',
      houseFlat: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      addressType: 'Home',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr._id);
    setForm({ ...addr });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await dispatch(updateAddressThunk({ id: editingId, addressData: form }));
    } else {
      await dispatch(addAddressThunk(form));
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    dispatch(deleteAddressThunk(id));
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddressThunk(id));
  };

  if (loading) return <Loader message="Loading addresses..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <Breadcrumb items={[{ label: 'Address Management' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Saved Delivery Addresses
        </h1>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`p-6 rounded-3xl border-2 bg-white shadow-sm flex flex-col justify-between ${
              addr.isDefault ? 'border-blue-600' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-sm text-slate-900">{addr.fullName}</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {addr.addressType}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
              </p>
              <p className="text-xs text-slate-500 font-medium">Phone: {addr.mobileNumber}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              {addr.isDefault ? (
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Star size={14} className="fill-blue-600 text-blue-600" /> Default Address
                </span>
              ) : (
                <button
                  onClick={() => handleSetDefault(addr._id)}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600"
                >
                  Set as Default
                </button>
              )}

              <div className="flex items-center gap-3">
                <button onClick={() => handleOpenEdit(addr)} className="text-xs font-semibold text-slate-600 hover:text-blue-600">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(addr._id)} className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Address */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Address' : 'Add New Address'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat *</label>
              <input
                type="text"
                required
                value={form.houseFlat}
                onChange={(e) => setForm({ ...form, houseFlat: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street *</label>
              <input
                type="text"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AddressManagement;
