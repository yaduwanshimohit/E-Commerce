import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Zap,
  Star,
  MessageSquare,
  FileText,
  HelpCircle,
  Share2,
  Scale,
  Bell,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import RatingStars from '../components/Rating/RatingStars';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Loader from '../components/Loader/Loader';
import ProductCard from '../components/ProductCard/ProductCard';
import PincodeChecker from '../components/PincodeChecker/PincodeChecker';
import RecentlyViewed from '../components/RecentlyViewed/RecentlyViewed';
import {
  fetchProductDetails,
  fetchRecommendedProducts,
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { addRecentlyViewed } from '../redux/slices/recentlyViewedSlice';
import { addToCompare, removeFromCompare } from '../redux/slices/compareSlice';
import api from '../services/api';

const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { productDetails: product, detailsLoading: loading, recommendedProducts } = useSelector(
    (state) => state.products
  );
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);
  const { compareItems } = useSelector((state) => state.compare);
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Product Variant Selection State
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Product Q&A State
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Back in stock alert state
  const [stockAlertEmail, setStockAlertEmail] = useState('');
  const [submittingStockAlert, setSubmittingStockAlert] = useState(false);
  const [stockAlertSubscribed, setStockAlertSubscribed] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(idOrSlug));
  }, [dispatch, idOrSlug]);

  useEffect(() => {
    if (product) {
      // Store in Recently Viewed history
      dispatch(addRecentlyViewed(product));

      dispatch(fetchRecommendedProducts(product.categoryName));
      fetchReviews(product._id);
      fetchQuestions(product._id);

      // Initialize variant attributes
      if (product.hasVariants && product.attributes?.length > 0) {
        const defaultVar = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
        const initialAttrs = {};
        if (defaultVar && defaultVar.attributes) {
          defaultVar.attributes.forEach((a) => {
            initialAttrs[a.name] = a.value;
          });
        } else {
          product.attributes.forEach((attr) => {
            if (attr.options?.length > 0) {
              initialAttrs[attr.name] = attr.options[0];
            }
          });
        }
        setSelectedAttributes(initialAttrs);
      }
    }
  }, [dispatch, product]);

  // Update selectedVariant whenever selectedAttributes change
  useEffect(() => {
    if (product && product.hasVariants && product.variants?.length > 0) {
      const match = product.variants.find((v) => {
        return v.attributes.every((attr) => selectedAttributes[attr.name] === attr.value);
      });
      setSelectedVariant(match || null);
      setSelectedImage(0); // Reset gallery index on variant switch
    } else {
      setSelectedVariant(null);
    }
  }, [selectedAttributes, product]);

  const fetchReviews = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/${productId}`);
      if (data.success) {
        setReviews(data.reviews);
        setTotalReviews(data.totalReviews);
        setDistribution(data.distribution);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async (productId) => {
    try {
      const { data } = await api.get(`/qa/product/${productId}`);
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error('Please login to ask a question');
      navigate('/login');
      return;
    }

    if (!newQuestionText.trim()) {
      toast.error('Please type your question');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const { data } = await api.post(`/qa/product/${product._id}`, {
        question: newQuestionText.trim(),
      });
      if (data.success) {
        toast.success('Question posted! Seller will answer soon.');
        setNewQuestionText('');
        fetchQuestions(product._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleStockAlertSubscribe = async (e) => {
    e.preventDefault();
    const emailToUse = userInfo ? userInfo.email : stockAlertEmail.trim();

    if (!emailToUse) {
      toast.error('Please enter your email address to get notified');
      return;
    }

    setSubmittingStockAlert(true);
    try {
      const { data } = await api.post('/stock-alert/subscribe', {
        productId: product._id,
        email: emailToUse,
      });
      if (data.success) {
        toast.success(data.message || 'Subscribed! We will notify you when back in stock.');
        setStockAlertSubscribed(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe for stock alert');
    } finally {
      setSubmittingStockAlert(false);
    }
  };

  // Dynamic values based on variant selection
  const currentImages = (selectedVariant && selectedVariant.images?.length > 0)
    ? selectedVariant.images
    : (product?.images || []);

  const currentPrice = selectedVariant ? selectedVariant.price : (product?.price || 0);
  const currentDiscountPrice = selectedVariant ? selectedVariant.discountPrice : (product?.discountPrice || 0);
  const currentStock = selectedVariant ? selectedVariant.stock : (product?.stock || 0);
  const currentDiscountPercent = currentPrice > 0 ? Math.round(((currentPrice - currentDiscountPrice) / currentPrice) * 100) : 0;
  const currentSku = selectedVariant?.sku || '';

  const variantInfoString = selectedVariant && selectedVariant.attributes
    ? selectedVariant.attributes.map((a) => `${a.name}: ${a.value}`).join(', ')
    : '';

  const cartItemId = selectedVariant
    ? `${product?._id}-${selectedVariant._id}`
    : product?._id;

  const isWishlisted = product && wishlistItems.some((item) => item._id === product._id);
  const isInCart = product && cartItems.some((item) => (item.cartItemId || item.product) === cartItemId || item.product === product._id);
  const isCompared = product && compareItems.some((item) => item._id === product._id);

  const handleToggleCompare = () => {
    if (!product) return;
    if (isCompared) {
      dispatch(removeFromCompare(product._id));
    } else {
      dispatch(addToCompare(product));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.hasVariants && !selectedVariant) {
      toast.error('Please select all variant options');
      return;
    }
    if (currentStock <= 0) {
      toast.error('Selected variant is out of stock!');
      return;
    }
    dispatch(
      addToCart({
        cartItemId,
        product: product._id,
        name: product.name,
        image: currentImages[0] || product.images[0],
        price: currentPrice,
        discountPrice: currentDiscountPrice,
        stock: currentStock,
        quantity,
        variantId: selectedVariant ? selectedVariant._id : undefined,
        variantInfo: variantInfoString,
        sku: currentSku,
      })
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (product) dispatch(toggleWishlist(product));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error('Please login to leave a review');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/reviews/${product._id}`, {
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });

      if (data.success) {
        toast.success('Review submitted successfully!');
        setNewTitle('');
        setNewComment('');
        fetchReviews(product._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader message="Loading product details..." />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Products', link: '/products' },
          { label: product.categoryName, link: `/products?category=${encodeURIComponent(product.categoryName)}` },
          { label: product.name },
        ]}
      />

      {/* Main Product Display Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery with Zoom Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative h-[360px] sm:h-[450px] w-full rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center overflow-hidden group">
            <img
              src={currentImages?.[selectedImage] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
            {currentDiscountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {currentDiscountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail List */}
          {currentImages?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl bg-slate-50 border-2 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all ${
                    selectedImage === idx ? 'border-blue-600 shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & Buy CTA */}
        <div className="lg:col-span-6 flex flex-col">
          
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              {product.brand}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleCompare}
                className={`p-2 rounded-full border transition-all flex items-center gap-1.5 px-3 text-xs font-bold ${
                  isCompared
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title={isCompared ? 'Remove from Compare' : 'Compare Product'}
              >
                <Scale size={16} />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full border transition-all ${
                  isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                }`}
                title="Add to Wishlist"
              >
                <Heart size={20} className={isWishlisted ? 'fill-rose-600' : ''} />
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <RatingStars rating={product.rating} numReviews={product.numReviews} size={18} />
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <Check size={12} /> Verified Product
            </span>
          </div>

          {/* Price Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{currentDiscountPrice?.toLocaleString('en-IN')}
            </span>
            {currentPrice > currentDiscountPrice && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ₹{currentPrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                  Save ₹{(currentPrice - currentDiscountPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          {/* Interactive Variant Options Picker */}
          {product.hasVariants && product.attributes?.length > 0 && (
            <div className="space-y-4 mb-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Options
              </h4>
              {product.attributes.map((attr) => (
                <div key={attr.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{attr.name}:</span>
                    <span className="font-bold text-blue-600">{selectedAttributes[attr.name] || 'Select'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.options?.map((opt) => {
                      const isSelected = selectedAttributes[attr.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attr.name]: opt }))}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {currentSku && (
                <div className="text-[11px] text-slate-400 pt-1">
                  SKU: <span className="font-mono text-slate-600 font-bold">{currentSku}</span>
                </div>
              )}
            </div>
          )}

          {/* Stock Indicator */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-600 mr-2">Stock Availability:</span>
            {currentStock > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Check size={14} /> In Stock ({currentStock} units available)
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Back in Stock Notification Box (If Stock = 0) */}
          {currentStock <= 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Bell size={16} className="text-amber-600 animate-bounce" />
                <span>Currently Out of Stock? Get Notified!</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Enter your email address to receive an instant notification as soon as inventory is updated.
              </p>
              {stockAlertSubscribed ? (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Check size={16} /> Alert saved! We'll notify you when available.
                </div>
              ) : (
                <form onSubmit={handleStockAlertSubscribe} className="flex gap-2">
                  {!userInfo && (
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={stockAlertEmail}
                      onChange={(e) => setStockAlertEmail(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  )}
                  <button
                    type="submit"
                    disabled={submittingStockAlert}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <Bell size={14} /> {submittingStockAlert ? 'Submitting...' : 'Notify Me When Available'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          {currentStock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-extrabold text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
                </div>
            </div>
          )}

          {/* Add to Cart & Buy Now Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                currentStock <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isInCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
              }`}
            >
              <ShoppingBag size={18} />
              {isInCart ? 'Added to Cart' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md flex items-center justify-center gap-2 active:scale-98"
            >
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {/* Pincode Serviceability Check Widget */}
          <div className="mb-6">
            <PincodeChecker />
          </div>

          {/* Delivery & Warranty Information */}
          <div className="mt-auto grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
              <Truck size={20} className="text-blue-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Free Express Delivery</span>
              <span className="text-[10px] text-slate-400">Within 2-4 Days</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
              <RotateCcw size={20} className="text-purple-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">{product.returnPolicy}</span>
              <span className="text-[10px] text-slate-400">Hassle free</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
              <ShieldCheck size={20} className="text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">{product.warranty}</span>
              <span className="text-[10px] text-slate-400">Brand Covered</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabbed Section: Description / Specifications / Reviews / Questions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'description' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={16} /> Description
          </button>

          <button
            onClick={() => setActiveTab('specifications')}
            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'specifications' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={16} /> Specifications
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reviews' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={16} /> Customer Reviews ({totalReviews})
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'questions' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle size={16} /> FAQs & Questions
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: Description */}
          {activeTab === 'description' && (
            <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
              <p>{product.description}</p>
              {product.features?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3 text-base">Key Highlights & Features</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <Check size={16} className="text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="max-w-3xl">
              <h4 className="font-bold text-slate-900 mb-4 text-base">Technical Specifications</h4>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {product.specifications?.map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="py-3 px-4 font-semibold text-slate-600 w-1/3 border border-slate-200">{spec.key}</td>
                      <td className="py-3 px-4 text-slate-900 border border-slate-200">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              
              {/* Ratings Overview & Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0">
                  <span className="text-5xl font-black text-slate-900">{product.rating.toFixed(1)}</span>
                  <div className="my-2">
                    <RatingStars rating={product.rating} showNumber={false} size={20} />
                  </div>
                  <span className="text-xs text-slate-500">Based on {totalReviews} reviews</span>
                </div>

                {/* Rating Distribution Bar */}
                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = distribution[starNum] || 0;
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={starNum} className="flex items-center gap-3 text-xs">
                        <span className="w-8 font-semibold text-slate-600 flex items-center gap-0.5">
                          {starNum} <Star size={12} className="fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-10 text-right text-slate-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Review Form */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Write a Customer Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={20}
                            className={star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Review Title (e.g. Great quality and fast shipping!)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl text-sm border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <textarea
                      rows="3"
                      placeholder="Share your experience with this product..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl text-sm border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No customer reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {rev.userName?.[0] || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900">{rev.userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <RatingStars rating={rev.rating} showNumber={false} size={14} />

                      {rev.title && <h5 className="font-bold text-sm text-slate-800">{rev.title}</h5>}
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 4: Product Q&A */}
          {activeTab === 'questions' && (
            <div className="space-y-8 max-w-3xl">
              
              {/* Ask Question Form */}
              <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle size={18} className="text-purple-600" /> Have a question about this product?
                </h4>
                <p className="text-xs text-slate-500">
                  Ask our seller/support team directly. We will answer as soon as possible!
                </p>

                <form onSubmit={handleQuestionSubmit} className="space-y-3">
                  <textarea
                    rows="3"
                    placeholder="e.g. Does this phone support 5G carrier aggregation in India?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingQuestion}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <Send size={14} /> {submittingQuestion ? 'Posting...' : 'Ask Question'}
                  </button>
                </form>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">Customer Questions ({questions.length})</h4>
                
                {questions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No questions asked yet. Be the first to ask!</p>
                ) : (
                  questions.map((q) => (
                    <div key={q._id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex items-start gap-2 text-sm font-semibold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">
                          Q
                        </span>
                        <div className="flex-1">
                          <p>{q.question}</p>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Asked by {q.userName} on {new Date(q.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {q.answer ? (
                        <div className="ml-6 p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                            <Check size={14} className="text-emerald-600" /> Seller / Admin Answer:
                          </div>
                          <p className="text-slate-700 pl-5">{q.answer}</p>
                        </div>
                      ) : (
                        <div className="ml-6 text-[11px] text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                          Pending answer from seller...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Default FAQs */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">General FAQs</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-sm text-slate-900">Q: Does this come with brand warranty in India?</h5>
                  <p className="text-xs text-slate-600">A: Yes, all products on NexCart come with 100% genuine manufacturer brand warranty valid across India.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-sm text-slate-900">Q: What payment options are accepted?</h5>
                  <p className="text-xs text-slate-600">A: We accept Razorpay online payments (UPI, Credit/Debit cards, Net Banking) as well as Cash on Delivery.</p>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Recommended Products Slider */}
      {recommendedProducts?.length > 0 && (
        <section className="pt-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">Similar Recommended Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Browsing History */}
      <RecentlyViewed currentProductId={product._id} />

    </div>
  );
};

export default ProductDetails;
