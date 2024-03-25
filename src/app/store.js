// Store for this Redux Application
import { configureStore } from '@reduxjs/toolkit'

// connect API to the store
import { cryptoApi } from '../services/cryptoAPI'
import { cryptoNewsApi } from '../services/cryptoNewsAPI'

import pairReducer from '../components/newChartTry/stateManagement/features/pairSlice'
import backtestReducer from '../components/newChartTry/stateManagement/features/backtestSlice'
import datasetReducer from '../components/newChartTry/stateManagement/features/datasetSlice'

export default configureStore({
    reducer: {
        [cryptoApi.reducerPath] : cryptoApi.reducer,
        [cryptoNewsApi.reducerPath]: cryptoNewsApi.reducer,
        pair: pairReducer,
        backtest: backtestReducer,
        dataset: datasetReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware()
            .concat(cryptoApi.middleware)
            .concat(cryptoNewsApi.middleware)
    }
})