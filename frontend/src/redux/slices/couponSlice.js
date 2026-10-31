import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialState = {
  appliedCoupon: null,
  loading: false,
  error: null,
};

export const applyCouponThunk = createAsyncThunk(
  'coupon/applyCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/coupons/validate', { code, cartTotal });
      toast.success(data.message || 'Coupon applied!');
      return data.coupon;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid coupon code';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      toast.success('Coupon removed');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCouponThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCouponThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload;
      })
      .addCase(applyCouponThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeCoupon } = couponSlice.actions;
export default couponSlice.reducer;
