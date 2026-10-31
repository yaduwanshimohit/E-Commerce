import { createSlice } from '@reduxjs/toolkit';

const initialItems = localStorage.getItem('recentlyViewed')
  ? JSON.parse(localStorage.getItem('recentlyViewed'))
  : [];

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: {
    items: initialItems,
  },
  reducers: {
    addRecentlyViewed: (state, action) => {
      const product = action.payload;
      if (!product || !product._id) return;

      // Filter out existing item if present
      const filtered = state.items.filter((item) => item._id !== product._id);

      // Unshift product to front of array, cap at 10 items
      state.items = [product, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(state.items));
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
      localStorage.removeItem('recentlyViewed');
    },
  },
});

export const { addRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
