import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/addresses');
      return data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddressThunk = createAsyncThunk(
  'address/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/addresses', addressData);
      toast.success('Address added successfully!');
      return data.address;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add address';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateAddressThunk = createAsyncThunk(
  'address/updateAddress',
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/addresses/${id}`, addressData);
      toast.success('Address updated successfully!');
      return data.address;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update address';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteAddressThunk = createAsyncThunk(
  'address/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted');
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete address';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const setDefaultAddressThunk = createAsyncThunk(
  'address/setDefaultAddress',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/addresses/${id}/default`);
      toast.success('Default delivery address updated');
      return data.address;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        if (!state.selectedAddress && action.payload.length > 0) {
          state.selectedAddress = action.payload.find((a) => a.isDefault) || action.payload[0];
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAddressThunk.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
        if (action.payload.isDefault || state.addresses.length === 1) {
          state.selectedAddress = action.payload;
        }
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => (a._id === action.payload._id ? action.payload : a));
        if (state.selectedAddress?._id === action.payload._id) {
          state.selectedAddress = action.payload;
        }
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
        if (state.selectedAddress?._id === action.payload) {
          state.selectedAddress = state.addresses[0] || null;
        }
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a._id === action.payload._id,
        }));
        state.selectedAddress = action.payload;
      });
  },
});

export const { selectAddress } = addressSlice.actions;
export default addressSlice.reducer;
