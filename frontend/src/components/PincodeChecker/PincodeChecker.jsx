import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      toast.error('Please enter a valid 6-digit Indian Pincode');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.get(`/pincode/check/${cleanPincode}`);
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check pincode serviceability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin size={16} className="text-blue-600" /> Check Delivery & Pincode Serviceability
        </label>
        <span className="text-[10px] font-semibold text-slate-400">All-India Delivery</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit Pincode (e.g., 110001)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600 font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow active:scale-95"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>Delivery Available to {pincode} ({result.city})</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700 font-semibold border-t border-emerald-100">
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-blue-600" />
              <span>Est. Delivery: <strong className="text-slate-900">{result.estimatedDeliveryDate}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Truck size={13} className="text-purple-600" />
              <span>Courier: <strong className="text-slate-900">{result.courierPartner}</strong></span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Cash on Delivery: <strong className="text-emerald-700">{result.codAvailable ? 'Available' : 'Prepaid Only'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5 font-medium">
          <XCircle size={15} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
