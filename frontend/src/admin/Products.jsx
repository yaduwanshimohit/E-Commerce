import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Plus, Trash2, Edit, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader/Loader';
import Modal from '../components/Modal/Modal';
import { fetchProducts } from '../redux/slices/productSlice';
import api from '../services/api';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    sku: '',
    barcode: '',
    hsnCode: '8517',
    categoryName: 'Fashion',
    description: '',
    price: 1999,
    discountPrice: 1499,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'],
    specifications: [
      { key: 'Material', value: '100% Combed Cotton' },
      { key: 'Fit Type', value: 'Regular Fit' },
    ],
    isFlashSale: false,
    isFeatured: false,
    hasVariants: false,
    attributes: [
      { name: 'Color', options: 'Black, White, Blue' },
      { name: 'Size', options: 'S, M, L, XL' },
    ],
    variants: [],
  });

  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 50 }));
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      brand: '',
      sku: '',
      barcode: '',
      hsnCode: '8517',
      categoryName: 'Fashion',
      description: '',
      price: 1999,
      discountPrice: 1499,
      stock: 50,
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'],
      specifications: [
        { key: 'Material', value: '100% Combed Cotton' },
        { key: 'Fit Type', value: 'Regular Fit' },
      ],
      isFlashSale: false,
      isFeatured: false,
      hasVariants: false,
      attributes: [
        { name: 'Color', options: 'Black, White, Blue' },
        { name: 'Size', options: 'S, M, L, XL' },
      ],
      variants: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    
    const mappedAttrs = p.attributes && p.attributes.length > 0
      ? p.attributes.map((a) => ({ name: a.name, options: Array.isArray(a.options) ? a.options.join(', ') : a.options }))
      : [
          { name: 'Color', options: 'Black, White, Blue' },
          { name: 'Size', options: 'S, M, L, XL' },
        ];

    setForm({
      name: p.name,
      brand: p.brand,
      sku: p.sku || '',
      barcode: p.barcode || '',
      hsnCode: p.hsnCode || '8517',
      categoryName: p.categoryName,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      images: p.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
      specifications: p.specifications && p.specifications.length > 0 ? p.specifications : [{ key: 'Material', value: 'Standard' }],
      isFlashSale: p.isFlashSale,
      isFeatured: p.isFeatured,
      hasVariants: Boolean(p.hasVariants),
      attributes: mappedAttrs,
      variants: p.variants || [],
    });
    setModalOpen(true);
  };

  // Helper to generate combination variants
  const handleGenerateVariants = () => {
    const validAttrs = form.attributes
      .filter((a) => a.name.trim() && a.options.trim())
      .map((a) => ({
        name: a.name.trim(),
        options: a.options.split(',').map((o) => o.trim()).filter(Boolean),
      }));

    if (validAttrs.length === 0) {
      toast.error('Please enter at least one attribute with options');
      return;
    }

    // Cartesian product of options
    const cartesian = (args) => {
      const r = [];
      const max = args.length - 1;
      function helper(arr, i) {
        for (let j = 0, l = args[i].options.length; j < l; j++) {
          const a = [...arr, { name: args[i].name, value: args[i].options[j] }];
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const combinations = cartesian(validAttrs);
    const prefix = (form.name || 'PRD').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');

    const generated = combinations.map((combo, idx) => {
      const skuSuffix = combo.map((c) => c.value.substring(0, 3).toUpperCase()).join('-');
      return {
        sku: `${prefix}-${skuSuffix}-${idx + 1}`,
        attributes: combo,
        price: form.price || 1000,
        discountPrice: form.discountPrice || form.price || 800,
        stock: 15,
        images: form.images || [],
        isDefault: idx === 0,
      };
    });

    setForm((prev) => ({ ...prev, variants: generated }));
    toast.success(`Generated ${generated.length} variants!`);
  };

  // Category specification templates preset helper
  const handleApplyCategoryTemplate = (templateName) => {
    let specs = [];
    if (templateName === 'Mobile') {
      specs = [
        { key: 'RAM', value: '8GB' },
        { key: 'Storage', value: '128GB' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'Battery', value: '5000 mAh' },
        { key: 'Display', value: '6.7" AMOLED 120Hz' },
        { key: 'Camera', value: '50MP OIS Triple Camera' },
      ];
    } else if (templateName === 'Laptop') {
      specs = [
        { key: 'RAM', value: '16GB DDR5' },
        { key: 'SSD', value: '512GB NVMe SSD' },
        { key: 'Processor', value: 'Intel Core i7 14th Gen' },
        { key: 'Screen Size', value: '15.6" FHD IPS 144Hz' },
        { key: 'GPU', value: 'NVIDIA RTX 4060 8GB' },
      ];
    } else if (templateName === 'Apparel') {
      specs = [
        { key: 'Material', value: '100% Combed Bio-Wash Cotton' },
        { key: 'Fit Type', value: 'Regular Fit' },
        { key: 'Sleeve Length', value: 'Short Sleeve' },
        { key: 'Care Instructions', value: 'Machine Wash Cold' },
      ];
    }
    setForm((prev) => ({ ...prev, specifications: specs }));
    toast.success(`Applied ${templateName} specification template!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedAttributes = form.hasVariants
        ? form.attributes
            .filter((a) => a.name.trim() && a.options)
            .map((a) => ({
              name: a.name.trim(),
              options: typeof a.options === 'string'
                ? a.options.split(',').map((o) => o.trim()).filter(Boolean)
                : a.options,
            }))
        : [];

      const payload = {
        ...form,
        attributes: formattedAttributes,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('New product created!');
      }
      setModalOpen(false);
      dispatch(fetchProducts({ pageSize: 50 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product removed');
        dispatch(fetchProducts({ pageSize: 50 }));
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="text-purple-400" /> Product Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage catalog, pricing, inventory stock & deals</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter products by name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <Loader message="Loading products table..." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Price / Discount</th>
                  <th className="p-4">Total Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
                      <span className="font-bold text-white max-w-xs truncate">{p.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">{p.categoryName}</td>
                    <td className="p-4 font-semibold text-purple-400">{p.brand}</td>
                    <td className="p-4 font-bold text-slate-300">
                      {p.hasVariants ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800">
                          {p.variants?.length || 0} Variants
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">
                      ₹{p.discountPrice?.toLocaleString('en-IN')}{' '}
                      <span className="text-slate-500 text-[10px] line-through">₹{p.price?.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${p.stock > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-purple-400 hover:bg-slate-900 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-rose-400 hover:bg-slate-900 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-bold mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Brand *</label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Category *</label>
              <input
                type="text"
                required
                value={form.categoryName}
                onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Base Price (₹)</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Discount Price (₹)</label>
              <input
                type="number"
                required
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Default Stock</label>
              <input
                type="number"
                required
                disabled={form.hasVariants}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border rounded-xl disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Product SKU</label>
              <input
                type="text"
                placeholder="e.g., IPHONE17-BLK-256"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Barcode (EAN/UPC)</label>
              <input
                type="text"
                placeholder="e.g., 8901234567890"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">HSN/SAC Code (GST)</label>
              <input
                type="text"
                placeholder="e.g., 8517 / 6109"
                value={form.hsnCode}
                onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Image URL</label>
            <input
              type="text"
              value={form.images[0] || ''}
              onChange={(e) => setForm({ ...form, images: [e.target.value] })}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            ></textarea>
          </div>

          {/* Dynamic Category Specifications / Attributes Structure */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800">Category Specifications & Technical Attributes</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyCategoryTemplate('Mobile')}
                  className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  + Mobile Template
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCategoryTemplate('Laptop')}
                  className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                >
                  + Laptop Template
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCategoryTemplate('Apparel')}
                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200"
                >
                  + Apparel Template
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {form.specifications?.map((spec, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key (e.g. RAM / Processor)"
                    value={spec.key}
                    onChange={(e) => {
                      const updated = [...form.specifications];
                      updated[idx].key = e.target.value;
                      setForm({ ...form, specifications: updated });
                    }}
                    className="w-1/3 px-3 py-1.5 text-xs border rounded-xl bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 16GB DDR5)"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...form.specifications];
                      updated[idx].value = e.target.value;
                      setForm({ ...form, specifications: updated });
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border rounded-xl bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.specifications.filter((_, i) => i !== idx);
                      setForm({ ...form, specifications: updated });
                    }}
                    className="text-rose-500 font-bold text-xs px-2"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    specifications: [...(form.specifications || []), { key: '', value: '' }],
                  })
                }
                className="text-[11px] font-bold text-blue-600 hover:underline pt-1 block"
              >
                + Add Custom Specification Row
              </button>
            </div>
          </div>

          {/* Product Variant Configuration Block */}
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <input
                type="checkbox"
                checked={form.hasVariants}
                onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              Enable Product Variants (Color, Size, Storage, etc.)
            </label>

            {form.hasVariants && (
              <div className="space-y-4 pt-2 border-t border-purple-200">
                <h4 className="text-xs font-extrabold text-purple-900">Step 1: Define Attributes & Options</h4>
                {form.attributes.map((attr, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Attribute Name (e.g. Color)"
                      value={attr.name}
                      onChange={(e) => {
                        const updated = [...form.attributes];
                        updated[idx].name = e.target.value;
                        setForm({ ...form, attributes: updated });
                      }}
                      className="col-span-4 px-3 py-1.5 text-xs border rounded-xl bg-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Options comma-separated (e.g. Black, White, Blue)"
                      value={attr.options}
                      onChange={(e) => {
                        const updated = [...form.attributes];
                        updated[idx].options = e.target.value;
                        setForm({ ...form, attributes: updated });
                      }}
                      className="col-span-7 px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.attributes.filter((_, i) => i !== idx);
                        setForm({ ...form, attributes: updated });
                      }}
                      className="col-span-1 text-rose-500 font-bold text-xs"
                    >
                      X
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        attributes: [...form.attributes, { name: '', options: '' }],
                      })
                    }
                    className="px-3 py-1.5 bg-white text-purple-700 font-bold text-xs rounded-xl border border-purple-300"
                  >
                    + Add Attribute
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateVariants}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    ⚡ Generate Combinations ({form.variants.length} active)
                  </button>
                </div>

                {/* Generated Variant Table */}
                {form.variants.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-extrabold text-purple-900">Step 2: Custom Variant SKUs, Prices & Stock</h4>
                    <div className="max-h-60 overflow-y-auto border border-purple-200 rounded-xl bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-purple-100 text-purple-900 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">Variant</th>
                            <th className="p-2">SKU</th>
                            <th className="p-2">Price (₹)</th>
                            <th className="p-2">Disc. Price (₹)</th>
                            <th className="p-2">Stock</th>
                            <th className="p-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                          {form.variants.map((v, vIdx) => (
                            <tr key={vIdx}>
                              <td className="p-2 font-bold text-slate-800">
                                {v.attributes?.map((a) => a.value).join(' / ')}
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) => {
                                    const updated = [...form.variants];
                                    updated[vIdx].sku = e.target.value;
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="w-24 px-1.5 py-1 text-[11px] border rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => {
                                    const updated = [...form.variants];
                                    updated[vIdx].price = Number(e.target.value);
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="w-16 px-1.5 py-1 text-[11px] border rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={v.discountPrice}
                                  onChange={(e) => {
                                    const updated = [...form.variants];
                                    updated[vIdx].discountPrice = Number(e.target.value);
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="w-16 px-1.5 py-1 text-[11px] border rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => {
                                    const updated = [...form.variants];
                                    updated[vIdx].stock = Number(e.target.value);
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="w-16 px-1.5 py-1 text-[11px] border rounded"
                                />
                              </td>
                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = form.variants.filter((_, i) => i !== vIdx);
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="text-rose-600 font-bold"
                                >
                                  Del
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={form.isFlashSale}
                onChange={(e) => setForm({ ...form, isFlashSale: e.target.checked })}
              />
              Flash Sale Item
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Featured Item
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow">
              Save Product
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminProducts;
