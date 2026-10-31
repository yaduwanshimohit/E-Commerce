import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

const defaultBanners = [
  {
    title: 'The Great Indian Tech Sale',
    subtitle: 'Get up to 40% OFF on Flagship 5G Mobiles, Laptops & Smart TVs',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600',
    linkUrl: '/products?category=Mobiles',
    buttonText: 'Shop Electronics',
    badgeText: 'FESTIVE OFFER',
  },
  {
    title: 'Style Festival 2026',
    subtitle: 'Upgrade your wardrobe with top international footwear & clothing brands',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
    linkUrl: '/products?category=Fashion',
    buttonText: 'Explore Fashion',
    badgeText: 'NEW ARRIVALS',
  },
  {
    title: 'Smart Home & Kitchen Appliances',
    subtitle: 'Air fryers, Smart TVs and home essentials starting at just ₹1,999',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600',
    linkUrl: '/products?category=Home%20%26%20Kitchen',
    buttonText: 'Shop Appliances',
    badgeText: 'BESTSELLERS',
  },
];

const BannerSlider = ({ banners = [] }) => {
  const activeBanners = banners.length > 0 ? banners : defaultBanners;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 group">
      <div className="relative h-[280px] sm:h-[360px] md:h-[440px] w-full">
        {activeBanners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark Gradient Overlay */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center">
              <div className="max-w-2xl px-6 sm:px-12 md:px-16 text-white">
                {banner.badgeText && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 text-blue-100 text-xs font-bold tracking-wider uppercase mb-3 backdrop-blur-md">
                    <Sparkles size={12} /> {banner.badgeText}
                  </span>
                )}
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-3">
                  {banner.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-200 line-clamp-2 mb-6 max-w-lg">
                  {banner.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={banner.linkUrl || '/products'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 group/btn"
                  >
                    {banner.buttonText || 'Shop Now'}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/products"
                    className="px-6 py-3 bg-white/15 backdrop-blur-md text-white border border-white/20 font-semibold text-sm rounded-xl hover:bg-white/25 transition-all"
                  >
                    Explore Catalog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/40 text-white hover:bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/40 text-white hover:bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {activeBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-blue-500' : 'w-2.5 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
