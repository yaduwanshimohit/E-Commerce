import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  Award,
  CreditCard,
  Gift,
  Percent,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import BannerSlider from '../components/BannerSlider/BannerSlider';
import CategoryCard from '../components/CategoryCard/CategoryCard';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductSkeleton from '../components/Skeleton/ProductSkeleton';
import RecentlyViewed from '../components/RecentlyViewed/RecentlyViewed';
import {
  fetchFlashSaleProducts,
  fetchFeaturedProducts,
  fetchRecommendedProducts,
} from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const Home = () => {
  const dispatch = useDispatch();

  const { categories, loading: catLoading } = useSelector((state) => state.categories);
  const {
    flashSaleProducts,
    featuredProducts,
    recommendedProducts,
    loading: prodLoading,
  } = useSelector((state) => state.products);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFlashSaleProducts());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchRecommendedProducts());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BannerSlider />
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-blue-600" /> Explore Top Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">Browse our wide selection of premium curated departments</p>
          </div>
          <Link to="/categories" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Flash Sale Banner & Timer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Zap size={32} className="text-amber-200 fill-amber-200 animate-pulse" />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-1">
                LIMITED TIME DEAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">Today's Lightning Flash Sale</h2>
              <p className="text-amber-100 text-sm mt-0.5">Grab unbelievable discounts on top electronics & gadgets</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-slate-950/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
            <Clock size={20} className="text-amber-300" />
            <div className="flex items-center gap-2 text-center">
              <div>
                <span className="block text-xl font-extrabold font-mono bg-white/20 px-2.5 py-1 rounded-lg">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-amber-200 font-semibold uppercase">Hours</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div>
                <span className="block text-xl font-extrabold font-mono bg-white/20 px-2.5 py-1 rounded-lg">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-amber-200 font-semibold uppercase">Mins</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div>
                <span className="block text-xl font-extrabold font-mono bg-white/20 px-2.5 py-1 rounded-lg">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-amber-200 font-semibold uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {prodLoading ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flashSaleProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Offers & Bank Cashback Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-3xl border border-blue-500/30 shadow-lg relative overflow-hidden group">
            <CreditCard size={100} className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform" />
            <span className="inline-block px-3 py-1 bg-blue-600 text-xs font-bold rounded-full mb-3">BANK OFFER</span>
            <h3 className="text-xl font-bold mb-1">Instant 10% Cashback</h3>
            <p className="text-xs text-slate-300 mb-4">On HDFC & ICICI Bank Credit Cards on orders above ₹4,999</p>
            <Link to="/products" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Shop Eligible Products →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white p-6 rounded-3xl border border-purple-500/30 shadow-lg relative overflow-hidden group">
            <Gift size={100} className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform" />
            <span className="inline-block px-3 py-1 bg-purple-600 text-xs font-bold rounded-full mb-3">NEW USER SPECIAL</span>
            <h3 className="text-xl font-bold mb-1">Flat ₹100 Discount</h3>
            <p className="text-xs text-slate-300 mb-4">Apply code <strong className="text-amber-300">WELCOME100</strong> at checkout</p>
            <Link to="/products" className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1">
              Claim Offer Now →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-lg relative overflow-hidden group">
            <Percent size={100} className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform" />
            <span className="inline-block px-3 py-1 bg-emerald-600 text-xs font-bold rounded-full mb-3">FESTIVE COUPON</span>
            <h3 className="text-xl font-bold mb-1">Up to 20% Extra OFF</h3>
            <p className="text-xs text-slate-300 mb-4">Use coupon <strong className="text-amber-300">FESTIVE20</strong> on orders over ₹1,999</p>
            <Link to="/products" className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1">
              Explore Festival Deals →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-blue-600" /> Featured Bestsellers
            </h2>
            <p className="text-sm text-slate-500 mt-1">Handpicked top-rated products loved by thousands of shoppers</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            See All Products <ArrowRight size={16} />
          </Link>
        </div>

        {prodLoading ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="text-indigo-600" /> Recommended For You
            </h2>
            <p className="text-sm text-slate-500 mt-1">Products tailored based on popularity and customer ratings</p>
          </div>
        </div>

        {prodLoading ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed Browsing History */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecentlyViewed />
      </section>

    </div>
  );
};

export default Home;
