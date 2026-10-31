import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialItems = localStorage.getItem('compareItems')
  ? JSON.parse(localStorage.getItem('compareItems'))
  : [];

const compareSlice = createSlice({
  name: 'compare',
  initialState: {
    compareItems: initialItems,
  },
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;
      if (!product || !product._id) return;

      const exists = state.compareItems.some((item) => item._id === product._id);
      if (exists) {
        toast.error(`${product.name} is already in compare list!`);
        return;
      }

      if (state.compareItems.length >= 4) {
        toast.error('You can compare a maximum of 4 products at a time!');
        return;
      }

      state.compareItems.push(product);
      localStorage.setItem('compareItems', JSON.stringify(state.compareItems));
      toast.success(`Added ${product.name} to compare list!`);
    },
    removeFromCompare: (state, action) => {
      const productId = action.payload;
      state.compareItems = state.compareItems.filter((item) => item._id !== productId);
      localStorage.setItem('compareItems', JSON.stringify(state.compareItems));
      toast.success('Removed product from comparison');
    },
    clearCompare: (state) => {
      state.compareItems = [];
      localStorage.removeItem('compareItems');
      toast.success('Compare list cleared');
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
