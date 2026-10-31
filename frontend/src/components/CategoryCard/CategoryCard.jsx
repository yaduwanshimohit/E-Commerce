import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Tv,
  Shirt,
  Home,
  Sparkles,
  ShoppingBag,
  Dumbbell,
  BookOpen,
  Watch,
} from 'lucide-react';

const iconMap = {
  Smartphone,
  Tv,
  Shirt,
  Home,
  Sparkles,
  ShoppingBag,
  Dumbbell,
  BookOpen,
  Watch,
};

const CategoryCard = ({ category }) => {
  if (!category) return null;
  const IconComponent = iconMap[category.icon] || ShoppingBag;

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group relative flex flex-col items-center bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
        <IconComponent size={32} />
      </div>
      <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors text-center">
        {category.name}
      </h3>
      <p className="text-[11px] text-slate-400 text-center line-clamp-1 mt-0.5">
        {category.description || 'Explore Products'}
      </p>
    </Link>
  );
};

export default CategoryCard;
