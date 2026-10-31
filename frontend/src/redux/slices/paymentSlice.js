import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialState = {
  razorpayOrder: null,
  paymentVerified: false,
  loading: false,
  error: null,
};

export const createPaymentOrderThunk = createAsyncThunk(
  'payment/createPaymentOrder',
  async ({ amount, orderId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payment/create-order', { amount, orderId });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create payment order';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const verifyPaymentThunk = createAsyncThunk(
  'payment/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payment/verify', paymentData);
      toast.success('Payment verified & order placed!');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Payment signature verification failed';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.razorpayOrder = null;
      state.paymentVerified = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrderThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPaymentOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload;
      })
      .addCase(createPaymentOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPaymentThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyPaymentThunk.fulfilled, (state) => {
        state.loading = false;
        state.paymentVerified = true;
      })
      .addCase(verifyPaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
