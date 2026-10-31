import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialState = {
  dashboardStats: null,
  monthlySales: [],
  lowStockProducts: [],
  recentOrders: [],
  adminOrders: [],
  adminUsers: [],
  adminCoupons: [],
  adminBanners: [],
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/dashboard-stats');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/orders');
      return data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateOrderStatusAdminThunk = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, orderStatus, paymentStatus }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${orderId}/status`, { orderStatus, paymentStatus });
      toast.success(`Order status updated to ${orderStatus}`);
      return data.order;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update order status';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users');
      return data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const toggleBlockUserThunk = createAsyncThunk(
  'admin/toggleBlockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/block`);
      toast.success(data.message);
      return data.user;
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const fetchAdminCoupons = createAsyncThunk(
  'admin/fetchAdminCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/coupons');
      return data.coupons;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createCouponAdminThunk = createAsyncThunk(
  'admin/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/coupons', couponData);
      toast.success('Coupon created successfully!');
      return data.coupon;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create coupon';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteCouponAdminThunk = createAsyncThunk(
  'admin/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete coupon';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const fetchAdminBanners = createAsyncThunk(
  'admin/fetchAdminBanners',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/banners');
      return data.banners;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.stats;
        state.monthlySales = action.payload.monthlySales;
        state.lowStockProducts = action.payload.lowStockProducts;
        state.recentOrders = action.payload.recentOrders;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })
      .addCase(updateOrderStatusAdminThunk.fulfilled, (state, action) => {
        state.adminOrders = state.adminOrders.map((o) => (o._id === action.payload._id ? action.payload : o));
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.adminUsers = action.payload;
      })
      .addCase(toggleBlockUserThunk.fulfilled, (state, action) => {
        state.adminUsers = state.adminUsers.map((u) => (u._id === action.payload._id ? { ...u, isBlocked: action.payload.isBlocked } : u));
      })
      .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
        state.adminCoupons = action.payload;
      })
      .addCase(createCouponAdminThunk.fulfilled, (state, action) => {
        state.adminCoupons.unshift(action.payload);
      })
      .addCase(deleteCouponAdminThunk.fulfilled, (state, action) => {
        state.adminCoupons = state.adminCoupons.filter((c) => c._id !== action.payload);
      })
      .addCase(fetchAdminBanners.fulfilled, (state, action) => {
        state.adminBanners = action.payload;
      });
  },
});

export default adminSlice.reducer;
