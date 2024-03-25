import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    enableBacktestWindow: false,
	enableSessionExistWindow: false,
    newSessionInfo: {
		balance: 0,
		pair: "",
		start_date: "",
		end_date: "",
		session_status: "",
		win_rate: "",
		lose_rate: "",
		user_id: [1],
	},
	backtestMode: false,
    session_id: 0
}

export const backtestSlice = createSlice({
    name: 'backtest',
    initialState,
    reducers: {
        addBacktestMode: (state, action) => {
            state.enableBacktestWindow = action.payload.enableBacktestWindow;
            state.enableSessionExistWindow = action.payload.enableSessionExistWindow;
            state.newSessionInfo = action.payload.newSessionInfo;
            state.backtestMode = action.payload.backtestMode;
            state.session_id = action.payload.session_id;
        }
    }
})

export const { addBacktestMode } = backtestSlice.actions

export default backtestSlice.reducer