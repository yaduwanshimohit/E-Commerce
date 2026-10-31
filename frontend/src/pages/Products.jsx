import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Grid,
  List,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductSkeleton from '../components/Skeleton/ProductSkeleton';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, page, pages, totalProducts, availableBrands, loading } = useSelector(
    (state) => state.products
  );
  const { categories } = useSelector((state) => state.categories);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL Params
  const selectedCategory = searchParams.get('category') || '';
  const selectedKeyword = searchParams.get('keyword') || '';
  const selectedSortBy = searchParams.get('sortBy') || 'popularity';
  const selectedMinPrice = searchParams.get('minPrice') || '0';
  const selectedMaxPrice = searchParams.get('maxPrice') || '350000';
  const selectedRating = searchParams.get('rating') || '';
  const selectedMinDiscount = searchParams.get('minDiscount') || '';
  const selectedInStock = searchParams.get('inStock') === 'true';
  const currentPage = Number(searchParams.get('pageNumber')) || 1;

  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get('brand') ? searchParams.get('brand').split(',') : []
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedKeyword) params.keyword = selectedKeyword;
    if (selectedSortBy) params.sortBy = selectedSortBy;
    if (selectedMinPrice) params.minPrice = selectedMinPrice;
    if (selectedMaxPrice) params.maxPrice = selectedMaxPrice;
    if (selectedRating) params.rating = selectedRating;
    if (selectedMinDiscount) params.minDiscount = selectedMinDiscount;
    if (selectedInStock) params.inStock = 'true';
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
    if (currentPage) params.pageNumber = currentPage;

    dispatch(fetchProducts(params));
  }, [
    dispatch,
    selectedCategory,
    selectedKeyword,
    selectedSortBy,
    selectedMinPrice,
    selectedMaxPrice,
    selectedRating,
    selectedMinDiscount,
    selectedInStock,
    selectedBrands,
    currentPage,
  ]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('pageNumber', '1');
    setSearchParams(newParams);
  };

  const handleBrandChange = (brandName) => {
    let updated;
    if (selectedBrands.includes(brandName)) {
      updated = selectedBrands.filter((b) => b !== brandName);
    } else {
      updated = [...selectedBrands, brandName];
    }
    setSelectedBrands(updated);
    updateParam('brand', updated.join(','));
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('pageNumber', newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Products', link: '/products' },
          ...(selectedCategory ? [{ label: selectedCategory }] : []),
        ]}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 my-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {selectedCategory ? `${selectedCategory} Products` : selectedKeyword ? `Search Results for "${selectedKeyword}"` : 'All Products Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{totalProducts}</strong> products found
          </p>
        </div>

        {/* Top Actions: Mobile filter button, Sorting, View mode */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className="flex items-center gap-3">
            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600 hidden sm:inline">Sort By:</span>
              <select
                value={selectedSortBy}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                className="bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:border-blue-600"
              >
                <option value="popularity">Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Customer Rating</option>
                <option value="discount">Discount %</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center bg-slate-200/80 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Filter size={16} className="text-blue-600" /> Filter Products
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">Category</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Categories
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            {availableBrands?.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">Brand</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-blue-600">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">Max Price (₹)</h4>
              <input
                type="range"
                min="500"
                max="350000"
                step="5000"
                value={selectedMaxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-600 font-bold mt-1">
                <span>₹0</span>
                <span>₹{Number(selectedMaxPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">Customer Rating</h4>
              <div className="space-y-1.5">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => updateParam('rating', selectedRating === stars.toString() ? '' : stars.toString())}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${selectedRating === stars.toString() ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={14} className="fill-amber-400" /> {stars}★ & Above
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
              <input
                type="checkbox"
                checked={selectedInStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

          </div>
        </aside>

        {/* Mobile Sidebar Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
            <div className="w-4/5 max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-800">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile filter choices */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Category</h4>
                <div className="space-y-1">
                  <button onClick={() => { updateParam('category', ''); setMobileFilterOpen(false); }} className="block text-xs py-1">All Categories</button>
                  {categories?.map((cat) => (
                    <button key={cat._id} onClick={() => { updateParam('category', cat.name); setMobileFilterOpen(false); }} className="block text-xs py-1 text-slate-700">{cat.name}</button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { handleClearFilters(); setMobileFilterOpen(false); }}
                className="w-full py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Display Grid Area */}
        <main className="flex-1">
          {loading ? (
            <ProductSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Filter size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                We couldn't find any products matching your active filter criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-200">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(pages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>
      </div>

    </div>
  );
};

export default Products;
