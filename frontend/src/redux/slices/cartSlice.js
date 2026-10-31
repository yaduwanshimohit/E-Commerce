import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const cartFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const initialState = {
  cartItems: cartFromStorage,
  shippingAddress: localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : null,
  paymentMethod: 'Razorpay',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // { product, name, image, price, discountPrice, stock, quantity, variantId, variantInfo, sku }
      const cartItemId = item.cartItemId || (item.variantId ? `${item.product}-${item.variantId}` : item.product);
      
      const existItem = state.cartItems.find(
        (x) => (x.cartItemId || (x.variantId ? `${x.product}-${x.variantId}` : x.product)) === cartItemId
      );

      const qty = item.quantity || 1;

      if (existItem) {
        const newQty = existItem.quantity + qty;
        if (newQty > item.stock) {
          toast.error(`Only ${item.stock} items available in stock!`);
          existItem.quantity = item.stock;
        } else {
          existItem.quantity = newQty;
          toast.success(`Updated quantity for ${item.name}`);
        }
      } else {
        if (qty > item.stock) {
          toast.error(`Only ${item.stock} items available in stock!`);
        } else {
          state.cartItems.push({ ...item, cartItemId, quantity: qty });
          toast.success(`${item.name}${item.variantInfo ? ` (${item.variantInfo})` : ''} added to cart!`);
        }
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartQuantity: (state, action) => {
      const { cartItemId, productId, quantity } = action.payload;
      const targetId = cartItemId || productId;

      const item = state.cartItems.find(
        (x) => (x.cartItemId || (x.variantId ? `${x.product}-${x.variantId}` : x.product)) === targetId
      );
      if (item) {
        if (quantity > item.stock) {
          toast.error(`Maximum stock reached (${item.stock})`);
          item.quantity = item.stock;
        } else if (quantity <= 0) {
          state.cartItems = state.cartItems.filter(
            (x) => (x.cartItemId || (x.variantId ? `${x.product}-${x.variantId}` : x.product)) !== targetId
          );
          toast.success(`${item.name} removed from cart`);
        } else {
          item.quantity = quantity;
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      }
    },
    removeFromCart: (state, action) => {
      const targetId = typeof action.payload === 'object' ? (action.payload.cartItemId || action.payload.productId) : action.payload;
      const item = state.cartItems.find(
        (x) => (x.cartItemId || (x.variantId ? `${x.product}-${x.variantId}` : x.product)) === targetId || x.product === targetId
      );
      if (item) {
        toast.success(`${item.name} removed from cart`);
      }
      state.cartItems = state.cartItems.filter(
        (x) => (x.cartItemId || (x.variantId ? `${x.product}-${x.variantId}` : x.product)) !== targetId && x.product !== targetId
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
