import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import hotelReducer from './slices/hotelSlice'
import bookingReducer from './slices/bookingSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotels: hotelReducer,
    booking: bookingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export default store
