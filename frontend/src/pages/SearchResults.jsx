import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductSkeleton from '../components/Skeleton/ProductSkeleton';
import { fetchProducts } from '../redux/slices/productSlice';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const dispatch = useDispatch();

  const { products, totalProducts, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (query) {
      dispatch(fetchProducts({ keyword: query }));
    }
  }, [dispatch, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb items={[{ label: `Search Results for "${query}"` }]} />

      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Search Results</h1>
        <p className="text-xs text-slate-500 mt-1">
          Found <strong className="text-slate-900">{totalProducts}</strong> products matching "{query}"
        </p>
      </div>

      {loading ? (
        <ProductSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try checking your spelling or searching for another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
