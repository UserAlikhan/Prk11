import React, { useState, useRef } from "react";
import PropTypes from 'prop-types'

import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'

import { Chart, ChartCanvas, ZoomButtons } from "react-stockcharts";
import {
    BarSeries,
    AreaSeries,
    CandlestickSeries,
    LineSeries,
    MACDSeries
} from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
    CrossHairCursor,
    EdgeIndicator,
    CurrentCoordinate,
    MouseCoordinateX,
    MouseCoordinateY
} from 'react-stockcharts/lib/coordinates'

import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import {
    OHLCTooltip,
    MovingAverageTooltip,
    MACDTooltip
} from 'react-stockcharts/lib/tooltip'
import { ema, macd, sma } from 'react-stockcharts/lib/indicator'
import { fitWidth } from "react-stockcharts/lib/helper"; 
import {
    head,
    last,
    toObject
} from 'react-stockcharts/lib/utils'
import {
	getMorePropsForChart
} from 'react-stockcharts/lib/interactive/utils'

// liblaries for making interactive tools
import { TrendLine, 
	FibonacciRetracement, 
	InteractiveText, 
	Brush, 
	DrawingObjectSelector,
	InteractiveYCoordinate
} from 'react-stockcharts/lib/interactive'
import Rectangle from "../interactiveComponents/Rectangle";

import { saveInteractiveNodes, saveInteractiveNode, getInteractiveNodes } from "./interactiveutils";
import DialogWindow from "../interactiveComponents/DialogWindow";
import {
    Modal,
    Button,
    FormGroup,
    FormLabel,
    FormControl
} from 'react-bootstrap'

const macdAppearance = {
    stroke: {
        macd: '#FF0000',
        signal: '#00F300',
    },
    fill: {
        divergence: '#4682B4',
    },
}

const mouseEdgeAppearance = {
    textFill: '#542605',
    stroke: '#05233B',
    strokeOpacity: 1,
    stokeWidth: 3,
    arrowWidth: 5,
    fill: '#BCDEFA',
}

// InteractiveYCoordinate
const alert = InteractiveYCoordinate.defaultProps.defaultPriceCoordinate
const sell = {
	...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
	stroke: '#E3342F',
	textFill: "#E3342F",
	text: "Sell 320",
	edge: {
		...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
		stroke: "#E3342F"
	}
}
const buy = {
	...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
	stroke: "#1F9D55",
	textFill: "#1F9D55",
	text: "Buy 120",
	edge: {
		...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
		stroke: "#1F9D55"
	}
};

const CandleStickChartWithMACDIndicator = ({ type, width, ratio, data: initialData }) => {

    // console.log('Data ', type, width, ratio)

    // convert components of data to number
    // in order to calculate macd in the future
    initialData = initialData.map(d => ({
        ...d,
        close: +d.close,
        high: +d.high,
        low: +d.low,
        open: +d.open,
        volume: +d.volume,
    }))

    // console.log('Initial ', initialData)
    
	const ema26 = ema()
		.id(0)
		.options({ windowSize: 26 })
		.merge((d, c) => { d.ema26 = c; })
		.accessor(d => d.ema26);

	const ema12 = ema()
		.id(1)
		.options({ windowSize: 12 })
		.merge((d, c) => {d.ema12 = c;})
		.accessor(d => d.ema12);

	const macdCalculator = macd()
        // setting default parameters of macd
		.options({
			fast: 12,
			slow: 26,
			signal: 9,
		})
        // data conversion at each step
        // of the indicator calculation
		.merge((d, c) => {
            d.macd = c
        })
        // this method is uses to determine which indicator
        // value should be used from the data object when 
        // plotting
		.accessor(d => {
            return d.macd
        });

	const smaVolume50 = sma()
		.id(3)
		.options({
			windowSize: 50,
			sourcePath: "volume",
		})
		.merge((d, c) => {d.smaVolume50 = c;})
		.accessor(d => d.smaVolume50);

	const calculatedData = smaVolume50(macdCalculator(ema12(ema26(initialData))));
    // console.log('calculatedData ', calculatedData)

	const xScaleProvider = discontinuousTimeScaleProvider
		.inputDateAccessor(d => {
            if (!d || d.date === undefined){
                return null
            } else {
                return new Date(d.date)
            }
        });

	const {
		data,
		xScale,
		xAccessor,
		displayXAccessor,
	} = xScaleProvider(calculatedData);
	console.log('xScale', displayXAccessor)

    const [interactiveMode, setInteractiveMode] = useState('draw');
    const [interactiveRectangeMode, setInteractiveRectangleMode] = useState(false)

	// Fibbanaci Code ##############################################################
    const [enableFib, setEnableFib] = useState(false)
	const [retracements1, setRetracements1] = useState([]);
  	const [retracements3, setRetracements3] = useState([]);

	const saveInteractiveNodesHandler = saveInteractiveNodes.bind({})
	const saveInteractiveNodeHandler = saveInteractiveNode.bind({})
	const getInteractiveNodesHandler = getInteractiveNodes.bind({});
  
	const onFibComplete1 = (retracements) => {
	  setRetracements1(retracements);
	  setEnableFib(false);
	};
  
	const onFibComplete3 = (retracements) => {
	  setRetracements3(retracements);
	  setEnableFib(false);
	};
	// Fibbanaci Code ##############################################################

	// TrendLines Code ##############################################################
    // const [trendLines, setTrendLines] = useState([])

	const [trendLines1, setTrendLines1] = useState([])
	const [trendLines3, setTrendLines3] = useState([])

	const [enableTrendLines, setEnableTrendLines] = useState(false)

	const onTrendLineComplete1  = (trendLines) => {
		setTrendLines1(trendLines)
		setEnableTrendLines(false)
	}

	const onTrendLineComplete3  = (trendLines) => {
		setTrendLines3(trendLines)
		setEnableTrendLines(false)
	}
	// TrendLines Code ####################s##########################################

	// Rectangle Code ####################s##########################################

    const [drawingRectangle, setDrawingRectangle] = useState([])

	const BRUSH_TYPE = '2D'
	const [xExtents, setXExtents] = useState([])
	const [yExtents1, setYExtents1] = useState([])
	const [yExtents3, setYExtents3] = useState([])

	const [brush1, setBrush1] = useState([])
	const [brush3, setBrush3] = useState([])

	const [enabledBrush, setEnableBrush] = useState(false)

	const handleBrush1 = (brushCoords, moreProps) => {

		console.log('Brush 1 Node:', saveInteractiveNodesHandler("Brush", 1));

		const {start, end} = brushCoords
		const left = Math.min(start.xValue, end.xValue)
		const right = Math.max(start.xValue, end.xValue)
		console.log('RIGHT AND LEFT ', right, left)
		const low = Math.min(start.yValue, end.yValue)
		const high = Math.max(start.yValue, end.yValue)

		setXExtents([left, right])
		setYExtents1(BRUSH_TYPE === '2D' ? [low, high]: yExtents1)
		setEnableBrush(false)

		onBrushComplete1({ start, end })
	}

	const handleBrush3 = (brushCoords, moreProps) => {
		const {start, end} = brushCoords
		const left = Math.min(start.xValue, end.xValue)
		const right = Math.max(start.xValue, end.xValue)

		const low = Math.min(start.yValue, end.yValue)
		const high = Math.max(start.yValue, end.yValue)

		setXExtents([left, right])
		setYExtents3(BRUSH_TYPE === '2D' ? [low, high]: yExtents3)
		setEnableBrush(false)

		onBrushComplete3({ start, end })
	}

	const onBrushComplete1 = (brushData) => {
		console.log('Brush 1 Complete:', brushData);
		
		const { start, end } = brushData;
   		setBrush1({ start, end });
		setEnableBrush(false)
	}

	const onBrushComplete3 = (brushData) => {
		setBrush3(brushData)
		setEnableBrush(false)
	}

	// Rectangle Code ####################s##########################################

	// InteractiveText Code ####################s####################################

	const [state, setState] = useState({
		enableInteractiveObject: true,
		textList1: [],
		textList3: [],
		showModal: false,
	})

	const { showModal, textList1 } = state
	console.log('showModal ', showModal, textList1)

	const handleSelection = (interactives, moreProps, e) => {

		if (state.enableInteractiveObject) {
			const independentCharts = moreProps.currentCharts.filter((d) => d !== 2);

			if (independentCharts.length > 0) {
				const first = head(independentCharts);
	
				const morePropsForChart = getMorePropsForChart(moreProps, first);
				const {
					mouseXY: [, mouseY],
					chartConfig: { yScale },
					xAccessor,
					currentItem,
				} = morePropsForChart;
	
				const position = [xAccessor(currentItem), yScale.invert(mouseY)];
				const newText = {
					...InteractiveText.defaultProps.defaultText,
					position,
				};
				handleChoosePosition(newText, morePropsForChart, e);
			}
		} else {
			const state = toObject(interactives, (each) => {
				return [`textList_${each.chartId}`, each.objects];
			});
	
			// Use the correct chart ID for state update
			setState(state);
		}
	}

	const handleChoosePosition = (text, moreProps) => {

		const { id: chartId } = moreProps.chartConfig.id;
		
		setState((prevState) => {
			const newTextList = prevState[`textList_${chartId}`] || []
			console.log('newTextList ', newTextList)
			return {
				...prevState,
				[`textList_${chartId}`]: [...newTextList, text],
				showModal: true,
				text: text.text,
				chartId,
			};
		});
	}

	const handleTextChange = (text, chartId) => {
		setState(prevState => {
			const textList = prevState[`textList_${chartId}`] || [];
			const allButLast = textList.slice(0, textList.length - 1);
			console.log('handleTextChange ', textList, allButLast)
			const lastText = {
				...last(textList),
				text
			};
	
			return {
				...prevState,
				[`textList_${chartId}`]: [...allButLast, lastText],
				showModal: false,
				enableInteractiveObject: false,
			};
		});
	}
	

	const handleDialogClose = () => {
		setState({showModal: false})
	}

	const onDrawComplete = (textList, moreProps) => {

		const { id: chartId } = moreProps.chartConfig;

		setState((prevState) => {
			const key = `textList_${chartId}`;
			return {
				...prevState,
				[key]: textList,
				enableInteractiveObject: false,
			};
		});
	}

	// InteractiveText Code #########################################################

	// Zoom and Pna Code ###########################################################

	const [suffix, setSuffix] = useState(1)
	
	const handleReset = () => {
		setSuffix((prevSuffix) => prevSuffix + 1)
	}

	const chartRef = useRef(null)

	// InteractiveYCooridnate ###########################################################

	// const [yCoordinateList_1, setYCoordinateList_1] = useState([
	// 	{
	// 	  ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
	// 	  yValue: 55.90,
	// 	  id: shortid.generate(),
	// 	  draggable: true,
	// 	},
	// 	{
	// 	  // ...buy,
	// 	  yValue: 50.90,
	// 	  id: shortid.generate(),
	// 	  draggable: false,
	// 	},
	// 	{
	// 	  // ...sell,
	// 	  yValue: 58.90,
	// 	  id: shortid.generate(),
	// 	  draggable: false,
	// 	},
	// ])

	// const [showModal, setShowModal] = useState(false)
	// const [alertToEdit, setAlertToEdit] = useState({})

	// const handleDoubleClickAlert = (item) => {
	// 	 setShowModal(true);
	// 	setAlertToEdit({
	// 		alert: item.object,
	// 		chartId: item.chartId,
	// 	});
	// }

	// const handleChoosePosition = (alert, moreProps) => {
	// 	const { id: chartId } = moreProps.chartConfig;
	// 	setYCoordinateList_1((prevList) => [
	// 	  ...prevList,
	// 	  alert,
	// 	]);
	// 	setEnableInteractiveObject(false);
	// };
	

	// const handleSelection = (interactives, moreProps, e) => {
	// 	if (enableInteractiveObject) {
	// 	  const independentCharts = moreProps.currentCharts.filter(d => d !== 2);
	// 	  if (independentCharts.length > 0) {
	// 		const first = head(independentCharts);
	// 		const morePropsForChart = getMorePropsForChart(moreProps, first);
	// 		const {
	// 		  mouseXY: [, mouseY],
	// 		  chartConfig: { yScale },
	// 		} = morePropsForChart;
	
	// 		const yValue = round(yScale.invert(mouseY), 2);
	// 		const newAlert = {
	// 		  ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
	// 		  yValue,
	// 		  id: shortid.generate(),
	// 		};
	// 		handleChoosePosition(newAlert, morePropsForChart, e);
	// 	  }
	// 	} else {
	// 	  const state = toObject(interactives, each => {
	// 		return [`yCoordinateList_${each.chartId}`, each.objects];
	// 	  });
	// 	  setYCoordinateList_1(state);
	// 	}
	// }

	// const handleChangeAlert = (alert, chartId) => {
	// 	const yCoordinateList = yCoordinateList_1.map(d => {
	// 		return d.id === alert.id ? alert : d
	// 	})
	// 	setYCoordinateList_1(yCoordinateList)
	// 	setShowModal(false)
	// 	setEnableInteractiveObject(false)
	// }

	// const handleDeleteAlert = () => {
	// 	const { alertToEdit } = alertToEdit
	// 	const key = `yCoordinateList_${alertToEdit.chartId}`
	// 	const yCoordinateList = yCoordinateList_1.filter(d => {
	// 		return d.id !== alertToEdit.alert.id;
	// 	});
	// 	setAlertToEdit({});
	// 	setYCoordinateList_1(yCoordinateList);
	// 	setShowModal(false);
	// }

	// const handleDialogClose = () => {
	// 	setAlertToEdit({});
	// 	setShowModal(false);
	//   };

	// InteractiveYCooridnate ###########################################################

	const [rectangles, setRectangles] = useState([])

	const addRectangle = (rectangle) => {
		setRectangles([...rectangles, rectangle]);
	};

    return (
        <>
            <ChartCanvas 
				ref={chartRef}
				height={600}
				width={width}
				ratio={ratio}
				margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
				type={type}
				seriesName={`MSFT_${suffix}`}
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
			>

				<Chart id={1} height={400}
					yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>

					<TrendLine
						ref={saveInteractiveNodesHandler("Trendline", 1)}
						enabled={enableTrendLines}
						type="LINE"
						snap={false}
						snapTo={d => [d.high, d.low]}
						trends={trendLines1}
						onStart={() => console.log("START")}
						onComplete={onTrendLineComplete1}
					/>

					<FibonacciRetracement
						ref={saveInteractiveNodesHandler("FibonacciRetracement", 1)}
						enabled={enableFib}
						type="BOUND"
						retracements={retracements1}
						onComplete={onFibComplete1}
					/>

					<Brush 
						ref={saveInteractiveNodesHandler("Brush", 1)}
						enabled={enabledBrush}
						brushData={brush1}
						type={BRUSH_TYPE}
						onBrush={handleBrush1}
					/>

					<InteractiveText
						ref={saveInteractiveNodesHandler("InteractiveText", 1)}
						enabled={state.enableInteractiveObject}
						text="Lorem ipsum..."
						onDragComplete={onDrawComplete}
						textList={state.textList1}
					/>


					{/* <InteractiveYCoordinate 
						ref={saveInteractiveNodes('InteractiveYCoordinate', 1)}
						enabled={enableInteractiveObject}
						onDragComplete={onDragComplete}
						onDelete={onDelete}
						yCoordinateList={yCoordinateList_1}
					/> */}

					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")}
						{...mouseEdgeAppearance}
					/>

					<CandlestickSeries />
					<LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()}/>
					<LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()}/>

					<CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
					<CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12.stroke()} />

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close}
						fill={d => d.close > d.open ? "#A2F5BF" : "#F9ACAA"}
						stroke={d => d.close > d.open ? "#0B4228" : "#6A1B19"}
						textFill={d => d.close > d.open ? "#0B4228" : "#420806"}
						strokeOpacity={1}
						strokeWidth={3}
						arrowWidth={2}
					/>

					<OHLCTooltip origin={[-40, 0]}/>
					<MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema26.accessor(),
								type: "EMA",
								stroke: ema26.stroke(),
								windowSize: ema26.options().windowSize,
							},
							{
								yAccessor: ema12.accessor(),
								type: "EMA",
								stroke: ema12.stroke(),
								windowSize: ema12.options().windowSize,
							},
						]}
					/>

					<ZoomButtons
						onReset={handleReset}
					/>
				</Chart>
				<Chart id={2} height={150}
					yExtents={[d => d.volume, smaVolume50.accessor()]}
					origin={(w, h) => [0, h - 300]}
				>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")}
						{...mouseEdgeAppearance}
					/>

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
					<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
				</Chart>
				<Chart id={3} height={150}
					yExtents={macdCalculator.accessor()}
					origin={(w, h) => [0, h - 150]} padding={{ top: 10, bottom: 10 }}
				>
					<XAxis axisAt="bottom" orient="bottom"/>
					<YAxis axisAt="right" orient="right" ticks={2} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")}
						rectRadius={5}
						{...mouseEdgeAppearance}
					/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")}
						{...mouseEdgeAppearance}
					/>

					<FibonacciRetracement
						ref={saveInteractiveNodesHandler("FibonacciRetracement", 3)}
						enabled={enableFib}
						type="BOUND"
						retracements={retracements3}
						onComplete={onFibComplete3}
					/>

					<TrendLine
						ref={saveInteractiveNodesHandler("Trendline", 3)}
						enabled={enableTrendLines}
						type="LINE"
						snap={false}
						snapTo={d => [d.high, d.low]}
						trends={trendLines3}
						onStart={() => console.log("START")}
						onComplete={onTrendLineComplete3}
					/>

					<Brush 
						ref={saveInteractiveNodesHandler("Brush", 3)}
						enabled={enabledBrush}
						type={BRUSH_TYPE}
						onBrush={handleBrush3}
					/>
					
					<InteractiveText 
						ref={saveInteractiveNodesHandler('InteractiveText', 3)}
						enabled={state.enableInteractiveObject}
						text='Text Object...'
						onDrawComplete={(textList, moreProps) => onDrawComplete(textList, moreProps, 3)}
						textList={state.textList3}
					/>

					<MACDSeries yAccessor={d => d.macd}
						{...macdAppearance} />
					<MACDTooltip
						origin={[-38, 15]}
						yAccessor={d => d.macd}
						options={macdCalculator.options()}
						appearance={macdAppearance}
					/>
				</Chart>
				<CrossHairCursor />
				{/* <DrawingObjectSelector
					enabled
					getInteractiveNodes={() => getInteractiveNodes('InteractiveText', 1)}
					drawingObjectMap={{
						InteractiveText: "textList",
					}}
					onSelect={(interactives, moreProps, e) => handleSelection(interactives, moreProps, e)}
				/> */}
			</ChartCanvas>
			<DialogWindow 
				showModal={showModal}
				chartId={state.chartId}
				onClose={handleDialogClose}
				onSave={handleTextChange}
			/>

            <button onClick={() => setEnableTrendLines(enableTrendLines === false ? true : false)}>
                {enableTrendLines === true ? 'Start Drawing' : 'Move'}
            </button>

            <button onClick={() => setEnableBrush(enabledBrush === false ? true : false)}>
                {enabledBrush === true ? 'Рисуем' : 'Не'}
            </button>

            <button onClick={() => setEnableFib(enableFib === false ? true : false)}>
                {enableFib === true ? 'ФИБА ДА' : 'ФИБА НЕТ'}
            </button>

			<button onClick={() => setState((prevState) => ({ enableInteractiveObject: !prevState.enableInteractiveObject }))}>
				{state.enableInteractiveObject === true ? 'ТЕКСТ ДА' : 'ТЕКСТ НЕТ'}
			</button>
        </>
		);
}

CandleStickChartWithMACDIndicator.propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.array.isRequired,
    ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
}

CandleStickChartWithMACDIndicator.defaultProps = {
    type: 'hybrid'
}

export default fitWidth(CandleStickChartWithMACDIndicator)