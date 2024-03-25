import React, {useState, useEffect} from "react"
import Papa from 'papaparse'
import CandleStickChart from '../newChartTry/Chart'

import { useDispatch, useSelector } from "react-redux"
import { addMacd, changeDataset } from "../newChartTry/stateManagement/features/datasetSlice"

import { macd } from "react-stockcharts/lib/indicator";

import CandleStickChartWithMACDIndicator from "../newChartTry/CandleStickChartWithMACDIndicator"


const LoadData = () => {

    const dispatch = useDispatch()
    const [data, setData] = useState([])
    const bk = useSelector(state => state.backtest)
    
    function parseTsvFile(file, onDataParsed) {
        Papa.parse(file, {
            complete: (result) => {
                onDataParsed(result.data)
            },
            header: true,
            delimiter: '\t'
        })
    }

    async function loadRemoteFile() {
        try {
            const response = await fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
            const tsvText = await response.text()
            // convert tsv file to Blob
            const tsvBlob = new Blob([tsvText], {type: 'text/tsv'})
            const tsvFile = new File([tsvBlob], 'MSFT.tsv')

            const macdCalculator = macd()
                .options({
                    fast: 12,
                    slow: 26,
                    signal: 9,
                })
                .merge((d, c) => {d.macd = c;})

            parseTsvFile(tsvFile, (parsedData) => {
                // filter out undefined values from parsedData
                let filteredData = parsedData.filter((item) => item !== undefined)

                filteredData = filteredData.map(d => ({
                    ...d,
                    close: +d.close,
                    high: +d.high,
                    low: +d.low,
                    open: +d.open,
                    volume: +d.volume,
                }))

                const start_date = bk.newSessionInfo.start_date
                const end_date = bk.newSessionInfo.end_date

                console.log('State backtest', start_date, end_date)
                const dataWithCalculatedMACD = macdCalculator(filteredData)
                console.log('dataWithCalculatedMACD ', dataWithCalculatedMACD)

                dispatch(changeDataset({ data: dataWithCalculatedMACD, start_date, end_date }))
                setData(filteredData)
            });
        } catch (error) {
            console.error("Error fetching or parsing the remote TSV file:", error)
        }
    }

    useEffect(() => {
        loadRemoteFile()
    }, [bk])

    return (
        <>
            {data.length > 0 ? <CandleStickChart data={data} width={1300} ratio={1} type="hybrid"/> : null}
        </>
    )
}

export default LoadData