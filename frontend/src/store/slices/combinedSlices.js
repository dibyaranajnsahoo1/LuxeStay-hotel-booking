import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// ==================== HOTEL SLICE ====================
export const fetchHotels = createAsyncThunk('hotels/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await api.get(`/hotels?${query}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchHotel = createAsyncThunk('hotels/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/hotels/${id}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchFeaturedHotels = createAsyncThunk('hotels/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/hotels/featured')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchRoom = createAsyncThunk('hotels/fetchRoom', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/rooms/${id}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    hotels: [],
    featuredHotels: [],
    selectedHotel: null,
    selectedRoom: null,
    total: 0,
    pages: 1,
    loading: false,
    error: null,
    searchParams: {},
  },
  reducers: {
    setSearchParams: (state, action) => { state.searchParams = { ...state.searchParams, ...action.payload } },
    clearSelectedHotel: (state) => { state.selectedHotel = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false
        state.hotels = action.payload.hotels
        state.total = action.payload.total
        state.pages = action.payload.pages
      })
      .addCase(fetchHotels.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchFeaturedHotels.fulfilled, (state, action) => { state.featuredHotels = action.payload.hotels })

      .addCase(fetchHotel.pending, (state) => { state.loading = true })
      .addCase(fetchHotel.fulfilled, (state, action) => {
        state.loading = false
        state.selectedHotel = action.payload.hotel
        if (action.payload.rooms) state.selectedHotel.rooms = action.payload.rooms
      })
      .addCase(fetchHotel.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchRoom.pending, (state) => { state.loading = true })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.loading = false
        state.selectedRoom = action.payload.room
      })
      .addCase(fetchRoom.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export const { setSearchParams, clearSelectedHotel } = hotelSlice.actions
export const hotelReducer = hotelSlice.reducer

// ==================== BOOKING SLICE ====================
const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    currentStep: 1,
    searchData: { location: '', checkIn: null, checkOut: null, adults: 2, children: 0, rooms: 1 },
    selectedRoom: null,
    guestDetails: {},
    addOns: [],
    pricing: null,
    coupon: null,
    currentBooking: null,
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStep: (state, action) => { state.currentStep = action.payload },
    nextStep: (state) => { state.currentStep = Math.min(state.currentStep + 1, 6) },
    prevStep: (state) => { state.currentStep = Math.max(state.currentStep - 1, 1) },
    setSearchData: (state, action) => { state.searchData = { ...state.searchData, ...action.payload } },
    setSelectedRoom: (state, action) => { state.selectedRoom = action.payload },
    setGuestDetails: (state, action) => { state.guestDetails = action.payload },
    setAddOns: (state, action) => { state.addOns = action.payload },
    setPricing: (state, action) => { state.pricing = action.payload },
    setCoupon: (state, action) => { state.coupon = action.payload },
    setCurrentBooking: (state, action) => { state.currentBooking = action.payload },
    setBookings: (state, action) => { state.bookings = action.payload },
    resetBooking: (state) => {
      state.currentStep = 1
      state.selectedRoom = null
      state.guestDetails = {}
      state.addOns = []
      state.pricing = null
      state.coupon = null
      state.currentBooking = null
    },
  }
})

export const { setStep, nextStep, prevStep, setSearchData, setSelectedRoom, setGuestDetails, setAddOns, setPricing, setCoupon, setCurrentBooking, setBookings, resetBooking } = bookingSlice.actions
export const bookingReducer = bookingSlice.reducer

// ==================== UI SLICE ====================
const savedTheme = localStorage.getItem('luxestay_theme')
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark !== false

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isDarkMode: initialDark,
    isMobileMenuOpen: false,
    isSearchOpen: false
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
      localStorage.setItem('luxestay_theme', state.isDarkMode ? 'dark' : 'light')
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload
      localStorage.setItem('luxestay_theme', action.payload ? 'dark' : 'light')
    },
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen },
    closeMobileMenu: (state) => { state.isMobileMenuOpen = false },
    toggleSearch: (state) => { state.isSearchOpen = !state.isSearchOpen },
  }
})

export const { toggleDarkMode, setDarkMode, toggleMobileMenu, closeMobileMenu, toggleSearch } = uiSlice.actions
export const uiReducer = uiSlice.reducer
