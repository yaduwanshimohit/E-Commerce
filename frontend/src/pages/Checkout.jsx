import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  MapPin,
  Plus,
  Check,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Modal from '../components/Modal/Modal';
import { fetchAddresses, addAddressThunk, selectAddress } from '../redux/slices/addressSlice';
import { createOrderThunk } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { createPaymentOrderThunk, verifyPaymentThunk } from '../redux/slices/paymentSlice';
import { loadRazorpayScript } from '../utils/loadRazorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { appliedCoupon } = useSelector((state) => state.coupon);
  const { addresses, selectedAddress, loading: addrLoading } = useSelector((state) => state.address);
  const { userInfo } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' | 'COD'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // New Address Form State
  const [newAddr, setNewAddr] = useState({
    fullName: userInfo?.name || '',
    mobileNumber: userInfo?.mobile || '',
    houseFlat: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
    isDefault: true,
  });

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    dispatch(fetchAddresses());
  }, [dispatch, userInfo, cartItems.length, navigate]);

  // Subtotal & Prices
  const subtotal = cartItems.reduce((acc, item) => acc + item.discountPrice * item.quantity, 0);
  const shippingFee = subtotal > 499 ? 0 : 50;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.mobileNumber || !newAddr.pincode || !newAddr.houseFlat) {
      toast.error('Please fill all required address fields');
      return;
    }
    const result = await dispatch(addAddressThunk(newAddr));
    if (addAddressThunk.fulfilled.match(result)) {
      setShowAddressModal(false);
    }
  };

  // Launch Razorpay Payment Modal
  const handleRazorpayPayment = async (order) => {
    try {
      const paymentOrderRes = await dispatch(
        createPaymentOrderThunk({ amount: order.totalAmount, orderId: order._id })
      );

      if (!createPaymentOrderThunk.fulfilled.match(paymentOrderRes)) {
        toast.error('Failed to create Razorpay payment order');
        setPlacingOrder(false);
        return;
      }

      const pData = paymentOrderRes.payload;

      // Ensure Razorpay SDK script is loaded
      const isScriptLoaded = await loadRazorpayScript();

      // Dev mock order fallback (if Razorpay keys are not live or using dev mock)
      if (pData.isMock || !isScriptLoaded || !window.Razorpay) {
        toast.success('Simulated Razorpay Payment (Test / Dev Mode)...');
        const verifyRes = await dispatch(
          verifyPaymentThunk({
            razorpay_order_id: pData.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_signature',
            orderId: order._id,
          })
        );
        if (verifyPaymentThunk.fulfilled.match(verifyRes)) {
          dispatch(clearCart());
          navigate(`/order-success/${order._id}`);
        } else {
          navigate(`/order-failed/${order._id}`);
        }
        return;
      }

      const options = {
        key: pData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
        amount: pData.amount,
        currency: pData.currency || 'INR',
        name: 'NexCart India',
        description: `Order Payment #${order._id.slice(-6)}`,
        order_id: pData.orderId,
        prefill: {
          name: selectedAddress?.fullName || userInfo?.name || '',
          email: userInfo?.email || '',
          contact: selectedAddress?.mobileNumber || userInfo?.mobile || '',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response) {
          // Verify signature on backend securely!
          const verifyRes = await dispatch(
            verifyPaymentThunk({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            })
          );

          if (verifyPaymentThunk.fulfilled.match(verifyRes)) {
            dispatch(clearCart());
            navigate(`/order-success/${order._id}`);
          } else {
            navigate(`/order-failed/${order._id}`);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled by user');
            setPlacingOrder(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error?.description || 'Payment failed');
        setPlacingOrder(false);
        navigate(`/order-failed/${order._id}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Razorpay payment initialization error');
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    setPlacingOrder(true);
    const orderData = {
      orderItems: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.discountPrice,
        variantId: item.variantId,
        variantInfo: item.variantInfo,
        sku: item.sku,
      })),
      shippingAddress: selectedAddress,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : '',
    };

    const orderRes = await dispatch(createOrderThunk(orderData));

    if (createOrderThunk.fulfilled.match(orderRes)) {
      const createdOrder = orderRes.payload;

      if (paymentMethod === 'Razorpay') {
        await handleRazorpayPayment(createdOrder);
      } else {
        // Cash on Delivery
        dispatch(clearCart());
        toast.success('Order placed successfully via Cash on Delivery!');
        navigate(`/order-success/${createdOrder._id}`);
      }
    } else {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <Breadcrumb items={[{ label: 'Cart', link: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl font-extrabold text-slate-900">Multi-Step Secure Checkout</h1>

      {/* Steps Indicator Bar */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveStep(1)}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeStep === 1 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
          1. Delivery Address
        </button>

        <button
          onClick={() => selectedAddress && setActiveStep(2)}
          disabled={!selectedAddress}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeStep === 2 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 disabled:opacity-40'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
          2. Order Review
        </button>

        <button
          onClick={() => selectedAddress && setActiveStep(3)}
          disabled={!selectedAddress}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeStep === 3 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 disabled:opacity-40'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
          3. Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Main Form Container */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Delivery Address Selection */}
          {activeStep === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="text-blue-600" /> Select Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-4">No addresses saved yet. Add your delivery address to proceed.</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
                  >
                    + Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?._id === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => dispatch(selectAddress(addr))}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {addr.addressType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Mobile: {addr.mobileNumber}</p>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600">
                            <Check size={14} /> Deliver to this address
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveStep(2)}
                  disabled={!selectedAddress}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
                >
                  Continue to Order Review <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Review Order Products */}
          {activeStep === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Package className="text-blue-600" /> Review Items in Order ({cartItems.length})
                </h3>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId || item.product} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-xl bg-white p-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.variantInfo && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded mt-0.5">
                          {item.variantInfo}
                        </span>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: <strong>{item.quantity}</strong> x ₹{item.discountPrice?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-slate-900">
                      ₹{(item.discountPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Back to Address
                </button>

                <button
                  onClick={() => setActiveStep(3)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
                >
                  Proceed to Payment <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Payment Method */}
          {activeStep === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <CreditCard className="text-blue-600" /> Select Payment Method
                </h3>
                <p className="text-xs text-slate-500 mt-1">Choose your preferred online or offline payment method</p>
              </div>

              <div className="space-y-4">
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'Razorpay' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
                      RZP
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        Razorpay Secure Online Payment
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">RECOMMENDED</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Pay via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Razorpay' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                    {paymentMethod === 'Razorpay' && <Check size={14} />}
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow">
                      <Banknote size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Pay in cash when your order is delivered to your doorstep</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                    {paymentMethod === 'COD' && <Check size={14} />}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Back to Review
                </button>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {placingOrder ? 'Processing...' : paymentMethod === 'Razorpay' ? `Pay ₹${grandTotal.toLocaleString('en-IN')} via Razorpay` : 'Place Order (COD)'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Order Pricing Summary Box */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingFee}</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-blue-600">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {selectedAddress && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Deliver To:</span>
                <p className="text-slate-600 truncate">{selectedAddress.fullName} - {selectedAddress.city}, {selectedAddress.pincode}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Address Modal Dialog */}
      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add New Delivery Address">
        <form onSubmit={handleAddAddressSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={newAddr.mobileNumber}
                onChange={(e) => setNewAddr({ ...newAddr, mobileNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat / Building *</label>
              <input
                type="text"
                required
                value={newAddr.houseFlat}
                onChange={(e) => setNewAddr({ ...newAddr, houseFlat: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street / Colony *</label>
              <input
                type="text"
                required
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Checkout;
