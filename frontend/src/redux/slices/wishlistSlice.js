import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const wishlistFromStorage = localStorage.getItem('wishlistItems')
  ? JSON.parse(localStorage.getItem('wishlistItems'))
  : [];

const initialState = {
  wishlistItems: wishlistFromStorage,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload; // product object
      const exists = state.wishlistItems.find((x) => x._id === product._id);

      if (exists) {
        state.wishlistItems = state.wishlistItems.filter((x) => x._id !== product._id);
        toast.success(`Removed from Wishlist`);
      } else {
        state.wishlistItems.push(product);
        toast.success(`Added to Wishlist ❤️`);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.wishlistItems = state.wishlistItems.filter((x) => x._id !== productId);
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
      toast.success('Removed from Wishlist');
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.removeItem('wishlistItems');
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
