import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Plus, Trash2 } from 'lucide-react';
import Loader from '../components/Loader/Loader';
import Modal from '../components/Modal/Modal';
import {
  fetchAdminCoupons,
  createCouponAdminThunk,
  deleteCouponAdminThunk,
} from '../redux/slices/adminSlice';

const AdminCoupons = () => {
  const dispatch = useDispatch();
  const { adminCoupons: coupons, loading } = useSelector((state) => state.admin);

  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(499);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(500);

  useEffect(() => {
    dispatch(fetchAdminCoupons());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code) return;
    await dispatch(
      createCouponAdminThunk({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
      })
    );
    setModalOpen(false);
    setCode('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete coupon?')) {
      dispatch(deleteCouponAdminThunk(id));
    }
  };

  if (loading) return <Loader message="Loading store coupons..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Tag className="text-purple-400" /> Coupon Management
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c._id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-mono font-black text-base text-amber-300 block">{c.code}</span>
              <p className="text-xs text-slate-300 mt-1">
                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`}
              </p>
              <p className="text-[11px] text-slate-500">Min Order: ₹{c.minOrderAmount}</p>
            </div>
            <button onClick={() => handleDelete(c._id)} className="p-2 text-rose-400 hover:bg-slate-900 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Coupon Code">
        <form onSubmit={handleCreate} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold mb-1">Coupon Code (e.g. SUMMER50) *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full uppercase px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow">
              Create Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
