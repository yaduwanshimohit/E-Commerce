import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import CategoryCard from '../components/CategoryCard/CategoryCard';
import Loader from '../components/Loader/Loader';
import { fetchCategories } from '../redux/slices/categorySlice';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <Loader message="Loading categories..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'Categories' }]} />

      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">All Product Categories</h1>
        <p className="text-xs text-slate-500 mt-1">Explore products across top shopping departments</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Categories;
