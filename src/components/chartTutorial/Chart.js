import React from "react";
import PropTypes from 'prop-types';
import { scaleTime } from "d3-scale";
import MadeData from './Data'
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { utcDay } from 'd3-time';
import { fitWidth } from "react-stockcharts/lib/helper";
import { timeIntervalBarWidth } from "react-stockcharts/lib/utils/barWidth";

let ChartJS = ({ type, width, ratio, data }) => {

    console.log('DSF', data)
    const xAccessor = (d) => {
        if (!d || d.date === undefined) {
            console.log('Invalid data point:', d);
            return null;
        }
        return new Date(d.date)
    }

    const minDate = new Date(Math.min(...data.map(d => new Date(d.date))))
    const maxDate = new Date(Math.max(...data.map(d => new Date(d.date))))
    console.log(minDate)
    console.log(maxDate)
    // crate chart canvas
    return (
        <div className="ChartJS">
            <ChartCanvas
                height={400}
                ratio={ratio}
                width={width}
                margin={{left: 50, right: 50, top: 10, bottom: 30}}
                type={type}
                data={data}
                seriesName="MSFT"
                xAccessor={xAccessor}
                xScale={scaleTime()}
                xExtents={[minDate, maxDate]}
            >
                <Chart
                    id={1}
                    yExtents={(d) => [d.high, d.low]}
                >
                    <XAxis axisAt='bottom' orient='bottom' ticks={6}/>
                    <YAxis axisAt='left' orient='left' ticks={5}/>
                    <CandlestickSeries width={timeIntervalBarWidth(utcDay)}/>
                </Chart>
            </ChartCanvas>
        </div>
    )
}

ChartJS.prototype = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    ratio: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['svg', 'hybrib']).isRequired,
}

ChartJS.defaultProps = {
    type: 'svg'
}

ChartJS = fitWidth(ChartJS)

export default ChartJS