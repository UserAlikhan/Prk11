import { createSlice } from '@reduxjs/toolkit'

const initialState = []
export const datasetSlice = createSlice({
    name: 'dataset',
    initialState,
    reducers: {
        changeDataset: (state, action) => {
            const { data, start_date, end_date } = action.payload
            console.log('changeDataset ', start_date, end_date)
            if (start_date) {
                console.log('changeDataset if')
                const filteredData = data.filter((item) => {
                    const date = new Date(item.date)
                    if (date >= new Date(start_date)) {
                        console.log('changeDataset if DADA')
                    }
                    
                    return date >= new Date(start_date) && date <= new Date(end_date)
                })
                return [filteredData]
            } else {
                console.log('changeDataset else')
                return [data]
            }
            
        },
        addMacd: (state, action) => {
            // state.forEach((item) => {
            //     const macdResult = macdCalculator(item)
            //     console.log('macdResult ', macdResult)
            //     item.macd = macdResult
            // })
        }
    }
})

export const { changeDataset, addMacd } = datasetSlice.actions

export default datasetSlice.reducer