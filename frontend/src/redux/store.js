import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import addressReducer from './slices/addressSlice';
import couponReducer from './slices/couponSlice';
import adminReducer from './slices/adminSlice';
import recentlyViewedReducer from './slices/recentlyViewedSlice';
import compareReducer from './slices/compareSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
    orders: orderReducer,
    payment: paymentReducer,
    address: addressReducer,
    coupon: couponReducer,
    admin: adminReducer,
    recentlyViewed: recentlyViewedReducer,
    compare: compareReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
