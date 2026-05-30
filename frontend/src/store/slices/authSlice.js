import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

const user = JSON.parse(localStorage.getItem('luxestay_user') || 'null')
const token = localStorage.getItem('luxestay_token')

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get profile')
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/update-profile', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed')
  }
})

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (hotelId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/auth/wishlist/${hotelId}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    token: token || null,
    isAuthenticated: !!token && !!user,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('luxestay_user')
      localStorage.removeItem('luxestay_token')
      toast.success('Logged out successfully')
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null }
    const setError = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(register.pending, setLoading)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('luxestay_user', JSON.stringify(action.payload.user))
        localStorage.setItem('luxestay_token', action.payload.token)
        toast.success(`Welcome to LuxeStay, ${action.payload.user.name}!`)
      })
      .addCase(register.rejected, setError)

      .addCase(login.pending, setLoading)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('luxestay_user', JSON.stringify(action.payload.user))
        localStorage.setItem('luxestay_token', action.payload.token)
        toast.success(`Welcome back, ${action.payload.user.name}!`)
      })
      .addCase(login.rejected, setError)

      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user
        localStorage.setItem('luxestay_user', JSON.stringify(action.payload.user))
      })

      .addCase(updateProfile.pending, setLoading)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        localStorage.setItem('luxestay_user', JSON.stringify(action.payload.user))
        toast.success('Profile updated successfully')
      })
      .addCase(updateProfile.rejected, setError)

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user) state.user.wishlist = action.payload.wishlist
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
