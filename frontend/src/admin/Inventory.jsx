import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader/Loader';
import { fetchProducts } from '../redux/slices/productSlice';
import api from '../services/api';

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [stockUpdates, setStockUpdates] = useState({});

  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 50 }));
  }, [dispatch]);

  const handleStockChange = (productId, val) => {
    setStockUpdates({ ...stockUpdates, [productId]: Number(val) });
  };

  const handleSaveStock = async (productId) => {
    const newStock = stockUpdates[productId];
    if (newStock === undefined) return;
    try {
      await api.put(`/products/${productId}`, { stock: newStock });
      toast.success('Stock inventory updated!');
      dispatch(fetchProducts({ pageSize: 50 }));
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  if (loading) return <Loader message="Loading stock inventory..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-400" /> Inventory Management & Stock Alerts
        </h1>
        <p className="text-xs text-slate-400 mt-1">Quick stock level monitoring and bulk inventory updating</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Update Quantity</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {products.map((p) => {
                const isLow = p.stock <= 5;
                const currentVal = stockUpdates[p._id] !== undefined ? stockUpdates[p._id] : p.stock;
                return (
                  <tr key={p._id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-white max-w-sm truncate">{p.name}</td>
                    <td className="p-4 text-slate-300">{p.brand}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${isLow ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-emerald-400'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={currentVal}
                        onChange={(e) => handleStockChange(p._id, e.target.value)}
                        className="w-24 px-3 py-1.5 bg-slate-900 text-white rounded-xl border border-slate-800 font-bold focus:outline-none focus:border-purple-500"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSaveStock(p._id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 ml-auto"
                      >
                        <Save size={14} /> Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
