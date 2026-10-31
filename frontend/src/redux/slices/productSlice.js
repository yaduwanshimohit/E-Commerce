import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  products: [],
  page: 1,
  pages: 1,
  totalProducts: 0,
  availableBrands: [],
  productDetails: null,
  flashSaleProducts: [],
  featuredProducts: [],
  recommendedProducts: [],
  searchSuggestions: { products: [], categories: [] },
  loading: false,
  detailsLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(queryParams).toString();
      const { data } = await api.get(`/products?${params}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (idOrSlug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${idOrSlug}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

export const fetchFlashSaleProducts = createAsyncThunk(
  'products/fetchFlashSaleProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products/flash-sale');
      return data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products/featured');
      return data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchRecommendedProducts = createAsyncThunk(
  'products/fetchRecommendedProducts',
  async (category = '', { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/recommended?category=${encodeURIComponent(category)}`);
      return data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  'products/fetchSearchSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
      return data.suggestions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    clearSuggestions: (state) => {
      state.searchSuggestions = { products: [], categories: [] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.totalProducts = action.payload.totalProducts;
        state.availableBrands = action.payload.availableBrands || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFlashSaleProducts.fulfilled, (state, action) => {
        state.flashSaleProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      .addCase(fetchRecommendedProducts.fulfilled, (state, action) => {
        state.recommendedProducts = action.payload;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.searchSuggestions = action.payload;
      });
  },
});

export const { clearProductDetails, clearSuggestions } = productSlice.actions;
export default productSlice.reducer;
