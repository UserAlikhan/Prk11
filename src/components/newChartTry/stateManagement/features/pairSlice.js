import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
    pair: []
}

export const pairSlice = createSlice({
    name: 'pair',
    initialState,
    reducers: {
        addPair: (state, action) => {
            // const pair = {
            //     id: nanoid(),
            //     text: action.payload,
            // }

            // state.pair.push(pair)
            state.pair = action.payload
        },
        // removePair: (state, action) => {
        //     state.pair = state.pair.filter((p) => p.id !== action.payload)
        // },
        // updatePair: (state, action) => {
        //     const { id, newText } = action.payload
        //     const pairToUpdate = state.pair.find((p) => p.id === id)
        //     if (pairToUpdate) {
        //         pairToUpdate.text = newText
        //     }
        // }
    }
})

export const { addPair } = pairSlice.actions

export default pairSlice.reducer