import { configureStore } from '@reduxjs/toolkit'
import pairReducer from './features/pairSlice'

export const store = configureStore({
    reducer: pairReducer
})