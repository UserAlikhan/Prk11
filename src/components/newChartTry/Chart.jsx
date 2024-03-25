import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import {
	Modal,
	Button,
	FormGroup,
	FormControl,
  FormLabel,
} from "react-bootstrap";

import shortid from 'shortid';

import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, BarSeries, MACDSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	MouseCoordinateY,
	MouseCoordinateX
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip, MACDTooltip } from "react-stockcharts/lib/tooltip";
import { macd } from "react-stockcharts/lib/indicator";

import { fitWidth } from "react-stockcharts/lib/helper";
import { InteractiveText, DrawingObjectSelector, TrendLine, FibonacciRetracement, EquidistantChannel, InteractiveYCoordinate } from "react-stockcharts/lib/interactive";
import { getMorePropsForChart } from "react-stockcharts/lib/interactive/utils";
import { head, last, toObject } from "react-stockcharts/lib/utils";
import {
	saveInteractiveNodes,
	getInteractiveNodes,
} from "./interactiveutils";
import axios from "axios";
import ModalWindow from './ModalWindows/ModalWindow'
import ModalWindowOrders from "./ModalWindows/ModalWIndowOrders";
import BacktestWindow from "./ModalWindows/BacktestWindow";
import SessionExistsWindow from "./ModalWindows/SessionExistsWindow";
import ChartController from "./ModalWindows/ChartController";
import './cssFiles/graphWindow.css'

import { connect } from "react-redux";
import { addBacktestMode } from "./stateManagement/features/backtestSlice";
import { addMacd } from "./stateManagement/features/datasetSlice";

function round(number, precision=0) {
	const d = Math.pow(10, precision)
	return Math.round(number * d) / d
}
const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

const alert = InteractiveYCoordinate.defaultProps.defaultPriceCoordinate
const sell = {
	...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
	stroke: "#E3342F",
	textFill: "#E3342F",
	text: "Sell 120",
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

class CandleStickChartWithText extends React.Component {
	constructor(props) {
		super(props);

		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawComplete = this.onDrawComplete.bind(this);
		this.handleChoosePosition = this.handleChoosePosition.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.handleSelection = this.handleSelection.bind(this);

		this.saveCanvasNode = this.saveCanvasNode.bind(this);

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleTextChange = this.handleTextChange.bind(this);

		this.onClickTrendLine = this.onClickTrendLine.bind(this)
		this.onClickInteractiveText = this.onClickInteractiveText.bind(this)
		this.onClickFibonacci = this.onClickFibonacci.bind(this)
		this.onClickEquidistantChannel = this.onClickEquidistantChannel.bind(this)
		this.onColorClick = this.onColorClick.bind(this)
		this.deselectAll = this.deselectAll.bind(this)
		this.checkForDuplicateObject = this.checkForDuplicateObject.bind(this)
		this.fetchAllComponent = this.fetchAllComponent.bind(this)
		this.sendDataToDatabase = this.sendDataToDatabase.bind(this)
		this.checkForUpdate = this.checkForUpdate.bind(this)

		this.handleSelectionInteractiveYCoordinate = this.handleSelectionInteractiveYCoordinate.bind(this)
		this.handleChoosePositionInteractiveYCoordinate = this.handleChoosePositionInteractiveYCoordinate.bind(this)
		this.handleDoubleClickAlert = this.handleDoubleClickAlert.bind(this)
		this.handleChangeAlert = this.handleChangeAlert.bind(this)
		this.handleDeleteAlert = this.handleDeleteAlert.bind(this)
		this.handleDialogCloseInteractiveYCoordinate = this.handleDialogCloseInteractiveYCoordinate.bind(this)
		this.onDelete = this.onDelete.bind(this)
		this.onDragCompleteInteractiveYCoordinate = this.onDragCompleteInteractiveYCoordinate.bind(this)
		this.checkForSession = this.checkForSession.bind(this)
		this.handleCloseBacktestWindow = this.handleCloseBacktestWindow.bind(this)
		this.handleSaveSessionInfo = this.handleSaveSessionInfo.bind(this)
		this.fastForward = this.fastForward.bind(this)
		this.rewind = this.rewind.bind(this)
		this.pause = this.pause.bind(this)
		this.handleCloseSessionExistsWindow = this.handleCloseSessionExistsWindow.bind(this)
		this.handleStartNewSession = this.handleStartNewSession.bind(this)
		this.handleContinueSession = this.handleContinueSession.bind(this)
		this.calculateStopLoss = this.calculateStopLoss.bind(this)
		this.calculateTakeProfit = this.calculateTakeProfit.bind(this)
		this.updateOrdersIdx = this.updateOrdersIdx.bind(this)

		this.saveNode = this.saveNode.bind(this)

		this.state = {
			stateInteractiveText: {
				enableInteractiveObject: false,
				textList_1: [],
				textList_3: [],
				showModal: false,
				id_for_textList_1: [],
				id_for_textList_3: [],
			},
			stateTrendLine: {
				enableTrendLine: false,
				trends_1: [],
				trends_3: [],
				id_for_trends_1: [],
				id_for_trends_3: [],
			},
			stateFibonacci: {
				enableFibonacci: false,
				fibonacci_1: [],
				fibonacci_3: [],
				id_for_fibonacci_1: [],
				id_for_fibonacci_3: [],
			},
			stateEquidistantChannel: {
				enableEquidistantChannel: false,
				equidistantChannel_1: [],
				id_forEquidistantChannel1: [],
			},
			stateInteractiveYCoordinate: {
				enableInteractiveYCoordinate: false,
				interactiveYCoordinate_1: [
					// {
					// 	...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
					// 	yValue: 55.90,
					// 	id: shortid.generate(),
					// 	draggable: true,
					// },
					// {
					// 	...buy,
					// 	yValue: 50.90,
					// 	id: shortid.generate(),
					// 	draggable: true,
					// },
					// {
					// 	...sell,
					// 	yValue: 58.90,
					// 	id: shortid.generate(),
					// 	draggable: true,
					// },
				],
				showModalInteractiveYCoordinate: false,
				alertToEdit: {},
				id_for_interactiveYCoordinate_1: [],
			},
			selectedColor: {
				color: "#00ff00"
			},
			lastPrice: [this.props.data[this.props.data.length - 1].close],
			pair: [this.props.pair.pair],
			takeProfit: {
				price: 0,
				rr: ''
			},
			stopLoss: {
				price: 0,
				rr: ''
			},
			backtestWindow: this.props.backtest,
				
				// enableBacktestWindow: false,
				// enableSessionExistWindow: false,
				// newSessionInfo: {
				// 	balance: "",
				// 	pair: "",
				// 	start_date: "",
				// 	end_date: "",
				// 	session_status: "",
				// 	win_rate: "",
				// 	lose_rate: "",
				// 	user_id: [1],
				// },
				// backtestMode: false,
			
			userId: [1]
		}

		this.onDrawCompleteChart1 = this.onDrawCompleteChart1.bind(this)
		this.onDrawCompleteChart3 = this.onDrawCompleteChart3.bind(this)
		this.onFibComplete1 = this.onFibComplete1.bind(this)
		this.onFibComplete3 = this.onFibComplete3.bind(this)
		this.onDrawCompleteEquidistantChannel = this.onDrawCompleteEquidistantChannel.bind(this)
		this.handleFibClick = this.handleFibClick.bind(this)
		this.handleClickBuy = this.handleClickBuy.bind(this)
		this.handleClickSell = this.handleClickSell.bind(this)
		// console.log('props ', this.props.data[this.props.data.length - 1].close)
	}
  
	saveCanvasNode(node) {
		this.canvasNode = node;
		console.log('saveCanvasNode ', node)
	}
	handleSelection(interactives, moreProps, e) {

		if (this.state.stateInteractiveText.enableInteractiveObject) {
			const independentCharts = moreProps.currentCharts.filter(d => d !== 2)
			if (independentCharts.length > 0) {
				const first = head(independentCharts)

				const morePropsForChart = getMorePropsForChart(moreProps, first)
				console.log('morePropsForChart ', morePropsForChart.chartConfig)
				const {
					mouseXY: [, mouseY],
					chartConfig: { yScale },
					xAccessor,
					currentItem,
				} = morePropsForChart

				const position = [xAccessor(currentItem), yScale.invert(mouseY)]
				const newText = {
					...InteractiveText.defaultProps.defaultText,
					position,
				};
				this.handleChoosePosition(newText, morePropsForChart, e)
			}
		} else {
			const state = toObject(interactives, each => {
				return [
					`textList_${each.chartId}`,
					each.objects,
				];
			});
			this.setState(
				prevState => ({
					stateInteractiveText: {
						...prevState.stateInteractiveText,
						state
					}
				})
      		)
		}
	}
	// handleSelection(interactives, moreProps, e) {

    // 	console.log('handleSelection has been toggled ')

	// 	if (this.state.stateInteractiveText.enableInteractiveObject) {
	// 		const independentCharts = moreProps.currentCharts.filter(d => d !== 2)
	// 		if (independentCharts.length > 0) {
	// 			const first = head(independentCharts)

	// 			const morePropsForChart = getMorePropsForChart(moreProps, first)
	// 			const {
	// 				mouseXY: [, mouseY],
	// 				chartConfig: { yScale },
	// 				xAccessor,
	// 				currentItem,
	// 			} = morePropsForChart

	// 			const position = [xAccessor(currentItem), yScale.invert(mouseY)]

	// 			let newObject
	// 			let objectType

	// 			if (this.state.stateInteractiveText.enableInteractiveObject) {
	// 				newObject = {
	// 					...InteractiveText.defaultProps.defaultText,
	// 					position,
	// 				}
	// 				objectType = 'textList'
	// 			} else if (this.state.stateTrendLine.enableTrendLine) {
	// 				this.handleTrendlineSelection(interactives)
	// 				return
	// 			}
	// 			this.handleChoosePosition(newObject, morePropsForChart, e, objectType)
	// 		}
	// 	} else {
	// 		const state = toObject(interactives, each => {
	// 			let objectType
	// 			if (this.state.stateInteractiveText.enableInteractiveObject) {
	// 				objectType = 'textLst'
	// 			} else if (this.state.enableTrends) {
	// 				objectType = 'trends'
	// 			}
				
	// 			return [
	// 				`${objectType}_${each.chartId}`,
	// 				each.objects
	// 			]
	// 		})

	// 		this.setState(
	// 			prevState => ({
	// 			stateTrendLine: {
	// 				...prevState.stateTrendLine,
	// 				state
	// 			}
	// 			})
    //   		)
	// 	}
	// }
	handleChoosePosition(text, moreProps) {
		this.componentWillUnmount();
		const { id: chartId } = moreProps.chartConfig;
	
		this.setState(prevState => {
			const existingTextList = prevState.stateInteractiveText[`textList_${chartId}`] || [];
			return {
				stateInteractiveText: {
					...prevState.stateInteractiveText,
					[`textList_${chartId}`]: [...existingTextList, text],
					showModal: true,
					text: text.text,
					chartId
				}
			}
		})
	}
	
	async handleTextChange(text, chartId) {
		const textList = this.state.stateInteractiveText[`textList_${chartId}`];
		const allButLast = textList
			.slice(0, textList.length - 1);

		const lastText = {
			...last(textList),
			text,
		}

		const idLastObject = (await axios.get('http://localhost:3000/drawn-objects/largest_id')).data

		this.setState(
			prevState => ({
				stateInteractiveText: {
					...prevState.stateInteractiveText,
					[`textList_${chartId}`]: [
						...allButLast,
						lastText
					],
					showModal: false,
				enableInteractiveObject: false,
				}
			})
		)
		try{
			const response = await axios.put(`http://localhost:3000/drawn-objects/${idLastObject}`, {
				name: `textList_${chartId}`,
				object: JSON.stringify(lastText),
				user: this.state.userId[0]	
			})
		} catch(error) {
			console.error('Error updating object ', error)
		}
		// this.componentDidMount();
	}
	handleDialogClose() {
		this.setState(prevState => ({
			stateInteractiveText: {
				...prevState.stateInteractiveText,
				showModal: false,
			}
		}))
		// this.componentDidMount();
	}

	handleOpenModal() {
		this.setState(prevState => ({
			stateInteractiveText: {
				...prevState.stateInteractiveText,
				showModal: true,
			}
		}))
		// this.componentDidMount()
	}

	componentDidMount() {
		document.addEventListener("keyup", this.onKeyPress);
		this.fetchAllComponent()
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.onKeyPress);
	}
	async componentDidUpdate(prevProps, prevState) {
		const { textList_1, textList_3 } = this.state.stateInteractiveText
		// const { trends_1, trends_3 } = this.state.stateTrendLine

		// const response = await this.checkForUpdate(
		// 	prevState,
		// 	this.state,
		// )
		// if (response[0] != undefined){
		// 	const {category, key, isUpdatedObj, isUpdatedIdx} = response[0]

		// 	if (isUpdatedIdx != undefined){
		// 		await axios.put(`http://localhost:3000/drawn-objects/${isUpdatedIdx}`, {
		// 			name: key,
		// 			object: JSON.stringify(isUpdatedObj),
		// 			user: this.state.userId[0]
		// 		})
		// 	}
		// }
		// if (response[0] != undefined){
		// 	const {category, key, isUpdatedObj, isUpdatedIdx} = response[0]

		// 	if (isUpdatedIdx != undefined){
				// await axios.put(`http://localhost:3000/drawn-objects/${isUpdatedIdx}`, {
				// 	name: key,
				// 	object: JSON.stringify(isUpdatedObj),
				// 	user: this.state.userId[0]
				// })
		// 	}
		// }
		const responses = await this.checkForUpdate(
			prevState.stateInteractiveText,
			this.state.stateInteractiveText,
			['textList_1', 'textList_3']
		)
		responses.map(async (response) => {
			const { name, isUpdatedObj, isUpdatedIdx } = response
			console.log('componentDidUpdate ', name, isUpdatedObj, isUpdatedIdx)
			if (isUpdatedIdx != undefined){
				await axios.put(`http://localhost:3000/drawn-objects/${isUpdatedIdx}`, {
						name: name,
						object: JSON.stringify(isUpdatedObj),
						user: this.state.userId[0]
				})
			}
		})


		if (textList_1.length > prevState.stateInteractiveText.textList_1.length) {
			const lastObject = textList_1[textList_1.length - 1]
			const isDuplicate = await this.checkForDuplicateObject(lastObject, 'textList_1')

			if (isDuplicate === false) {
				this.sendDataToDatabase(lastObject, 'textList_1')
			}
		}

		if (textList_3.length > prevState.stateInteractiveText.textList_3.length) {
			const lastObject = textList_3[textList_3.length - 1]
			const isDuplicate = await this.checkForDuplicateObject(lastObject, 'textList_3')

			if (isDuplicate === false) {
				this.sendDataToDatabase(lastObject, 'textList_3')
			}
		}
		// console.log('componentDidUpdate ', trends_1.length, prevState.stateTrendLine.trends_1.length)
		// if (trends_1.length > prevState.stateTrendLine.trends_1.length) {
		// 	const lastObject = trends_1[trends_1.length - 1]
		// 	const isDuplicate = await this.checkForDuplicateObject(lastObject, 'trends_1')

		// 	if (isDuplicate === false) {
		// 		this.sendDataToDatabase(lastObject, 'trends_1')
		// 	}
		// }
	}
	// async checkForUpdate(prevState, currentState) {
	// 	const categories = Object.keys(currentState)
	// 	for (const category of categories) {
	// 		const prevCategoryState = prevState[category]
	// 		const currentCategoryState = currentState[category]
	// 		//  пропускаем категории которые отсутствуют в одном из состояний
	// 		if (!prevCategoryState || !currentCategoryState) continue
	// 		// получаем все ключи объектов в категории
	// 		const objectKeys = Object.keys(currentCategoryState)

	// 		const result = objectKeys.map((key) => {
	// 			const prevObj = prevCategoryState[key]
    //         	const currentObj = currentCategoryState[key]
				
	// 			if (Array.isArray(prevObj) && prevObj.length > 1 && prevObj.length === currentObj.length) {
	// 				console.log('checkForUpdate ', prevObj.length, currentObj.length)
	// 				const isUpdated = currentObj.map((obj, idx) => {
	// 					return JSON.stringify(obj) === JSON.stringify(prevObj[idx])
	// 				})
					
	// 				const falseIndex = isUpdated.indexOf(false)
	// 				if (falseIndex != -1) {
	// 					const name = `id_for_${key}`

	// 					return { category: category, key: key, isUpdatedObj: currentObj[falseIndex], isUpdatedIdx: currentCategoryState[name][falseIndex] }
	// 				}					
	// 			}
	// 		})
			
	// 		return result.filter(res => res != undefined)
	// 	}
	// 	return null
	// }
	async checkForUpdate(prevState, currentState, names) {
		const updatedObject = names.map((name) => {
			const prevStateList = prevState[name]
			const currentStateList = currentState[name]
			const currentObjIdx = currentState[`id_for_${name}`]
			console.log('checkForUpdate ', prevStateList, currentStateList, currentObjIdx)

			const isUpdated = prevStateList.map((prevObj, idx) => {
				if (name.split('_')[0] === 'textList' && prevStateList.length === currentStateList.length) {
					console.log('checkForUpdate prevObj ', prevObj)
					return prevObj.position[0] === currentStateList[idx].position[0] && prevObj.position[1] === currentStateList[idx].position[1]
				} 
			})

			const falseIndex = isUpdated.indexOf(false)
			return { name: name, isUpdatedObj: currentStateList[falseIndex], isUpdatedIdx: currentObjIdx[falseIndex] }
		})
		return updatedObject
		// const isUpdated = prevState.map((prevObj, idx) => {
		// 	if (name.split('_')[0] === 'textList' && prevState.length === currentState.length) {
		// 		return prevObj.position[0] === currentState[idx].position[0] && prevObj.position[1] === currentState[idx].position[1]
		// 	} 
		// })
		// console.log('checkForUpdate ', isUpdated)
		// const falseIndex = isUpdated.indexOf(false)
		// console.log('checkForUpdate ',currentObjIdx[falseIndex])
		// return  {name: name, isUpdatedObj: currentState[falseIndex], isUpdatedIdx: currentObjIdx[falseIndex]}
	}

	async sendDataToDatabase(data, name) {
		try {
			const response = await axios.post('http://localhost:3000/drawn-objects', {
				name: name,
				object: JSON.stringify(data),
				user: this.state.userId[0]
			})
		} catch (error) {
			console.error('Error sending data to the database:', error);
		}
	}
	onDrawComplete(textList, moreProps) {
		// this gets called on
		// 1. draw complete of drawing object
		// 2. drag complete of drawing object
		const { id: chartId } = moreProps.chartConfig;

		this.setState(
			prevState => ({
				stateInteractiveText: {
				...prevState.stateInteractiveText,
				enableInteractiveObject: false,
						[`textList_${chartId}`]: textList,
				}
			})
    	)

		// const lastObject = this.state.stateInteractiveText[`textList_${chartId}`]
	}
	async onKeyPress(e) {
		const keyCode = e.which;

		async function removeSelected(objects, type, id_objects) {
			console.log('removeSelected ', id_objects)
			try{
				if (Array.isArray(objects)) {
					console.log('removeSelected ', objects)
					const deletedObjects =  objects.map((object, idx) => {
						if (object.selected) {
							// console.log('Object selected TYPE')
							if (id_objects[idx] !== undefined) {
								try {
									const response = axios.delete(`http://localhost:3000/drawn-objects/${id_objects[idx]}`)
									return null
								} catch (error) {
									console.error('Error deleting object ', error)
								}
							} else {
								return null
							}

						} else {
							return object
						}
					})
					console.log('deletedObjects ', deletedObjects)
					// return deletedObjects.filter(object => object !== null)
					return {
						objects: deletedObjects.filter(object => object !== null),
						ids: id_objects.filter((id, idx) => objects[idx] && objects[idx].selected !== true)
					}
				} else {
					console.error('Invalid input: not an array');
					return []
				}
			} catch(error){
				console.error('Error in removeSelected:', error);
				return []
			}
		}

		switch (keyCode) {
			case 46:
				case 8: {
					// DEL
					const updateState = async () => {
						const { objects: newFibonacci1, ids: newFibonacci1Ids } = await removeSelected(this.state.stateFibonacci.fibonacci_1, 'fibonacci_1', this.state.stateFibonacci.id_for_fibonacci_1);
						const { objects: newFibonacci3, ids: newFibonacci3Ids } = await removeSelected(this.state.stateFibonacci.fibonacci_3, 'fibonacci_3', this.state.stateFibonacci.id_for_fibonacci_3);
						const { objects: newTrends1, ids: newTrends1Ids } = await removeSelected(this.state.stateTrendLine.trends_1, 'trends_1', this.state.stateTrendLine.id_for_trends_1);
						const { objects: newTrends3, ids: newTrends3Ids } = await removeSelected(this.state.stateTrendLine.trends_3, 'trends_1', this.state.stateTrendLine.id_for_trends_3);
						const { objects: newInteractiveText1, ids: newInteractiveText1Ids } = await removeSelected(this.state.stateInteractiveText.textList_1, 'textList_1', this.state.stateInteractiveText.id_for_textList_1);
						const { objects: newInteractiveText3, ids: newInteractiveText3Ids } = await removeSelected(this.state.stateInteractiveText.textList_3, 'textList_3', this.state.stateInteractiveText.id_for_textList_3);
						console.log('STATE STATE ', this.state.stateInteractiveText.textList_1, this.state.stateInteractiveText.id_for_textList_1)
		
						this.setState(prevState => ({
							stateInteractiveText: {
								textList_1: newInteractiveText1,
								textList_3: newInteractiveText3,
								id_for_textList_1: newInteractiveText1Ids,
								id_for_textList_3: newInteractiveText3Ids,
							},
							stateTrendLine: {
								trends_1: newTrends1,
								trends_3: newTrends3,
								id_for_trends_1: newTrends1Ids,
								id_for_trends_3: newTrends3Ids,
							},
						}));
					};
					updateState();
					break;
				}
		}
	}

	async checkForDuplicateObject(newObject, objectType) {
		try{
			const response = await axios.get(`http://localhost:3000/drawn-objects/${this.state.userId[0]}`)
			const existingObjects = response.data
			console.log('existingObjects ', newObject.position)
			// Check for duplicate
			const isDuplicate = existingObjects.some(existingObject => {
				if (existingObject.name === 'fibonacci_1' && objectType === 'fibonacci_1') {
					return existingObject.x1 === newObject.x1 && existingObject.y1 === newObject.y1

				} else if (existingObject.name.split('_')[0] === 'trends' && objectType.split('_')[0] === 'trends') {
					return existingObject.start === newObject.start && existingObject.end === newObject.end

				} else if (existingObject.name.split('_')[0] === 'textList' && objectType.split('_')[0] === 'textList') {
					console.log('Text List CHECK')
					const parsedObject = JSON.parse(existingObject.object).position
					// console.log('existingObject.position ', JSON.parse(existingObject.object).position)
					return parsedObject[0] === newObject.position[0] && parsedObject[1] === newObject.position[1]
				}
			})

			console.log('existingObjects ', isDuplicate)
			return isDuplicate
			
		} catch (error) {
			console.error('Error fetching existing objects: ', error)
			return false
		}
	}

  async onDrawCompleteChart1(trends_1, prevState) {
    // this gets called on
    // 1. draw complete of trendline
    // 2. drag complete of trendline
	const isUpdated = true ? trends_1.length === prevState.trends_1.length : false
	if (isUpdated) {
		const selectedObjIdx = trends_1.findIndex(trend => trend.selected === true)
		const databaseIdx = prevState.id_for_trends_1 && prevState.id_for_trends_1[selectedObjIdx]

		if (databaseIdx != undefined) {
			await axios.put(`http://localhost:3000/drawn-objects/${databaseIdx}`, {
				name: 'trends_1',
				object: JSON.stringify(trends_1[selectedObjIdx]),
				user: this.state.userId[0]
			})

			this.setState(
				prevState => ({
					stateTrendLine: {
						enableTrendLine: false,
						trends_1: trends_1,
						id_for_trends_1: [...prevState.stateTrendLine.id_for_trends_1],
						trends_3: [...prevState.stateTrendLine.trends_3],
						id_for_trends_3: [...prevState.stateTrendLine.id_for_trends_3],
					}
				})
			)
		}
	} else {
		const largestId = await axios.get('http://localhost:3000/drawn-objects/largest_id')
		console.log('largestId ', largestId.data + 1)
		this.setState(
			prevState => ({
				stateTrendLine : {
					enableTrendLine: false,
					trends_1: trends_1,
					id_for_trends_1: [...prevState.stateTrendLine.id_for_trends_1, largestId.data + 1],
					trends_3: [...prevState.stateTrendLine.trends_3],
					id_for_trends_3: [...prevState.stateTrendLine.id_for_trends_3],
				}
			}),
			async () => {
				const lastObject = this.state.stateTrendLine.trends_1[this.state.stateTrendLine.trends_1.length - 1]
				const isDuplicate = await this.checkForDuplicateObject(lastObject, 'trends_1')
				console.log()
				if (isDuplicate === false) {
					try{
						const response = await axios.post('http://localhost:3000/drawn-objects', {
							name: 'trends_1', 
							object: JSON.stringify(lastObject), 
							user: this.state.userId[0]
						})
					} catch(error) {
						console.error('Error saving to database ', error)
					}
				} else {
					console.log('Duplicate object, not saving to the database.');
				}
			}
		)
		console.log('state trend ', this.state.stateTrendLine)
	}
  }
  async onDrawCompleteChart3(trends_3, prevState) {
    // this gets called on
    // 1. draw complete of trendline
    // 2. drag complete of trendline
	const isUpdated = true ? trends_3.length === prevState.trends_3.length : false
	if (isUpdated) {
		const selectedObjIdx = trends_3.findIndex(trend => trend.selected === true)
		const databaseIdx = prevState.id_for_trends_3 && prevState.id_for_trends_3[selectedObjIdx]
		if (databaseIdx != undefined) {
			await axios.put(`http://localhost:3000/drawn-objects/${databaseIdx}`, {
				name: 'trends_3',
				object: JSON.stringify(trends_3[selectedObjIdx]),
				user: this.state.userId[0]
			})

			this.setState(
				prevState => ({
					stateTrendLine: {
						enableTrendLine: false,
						trends_3: trends_3,
						id_for_trends_3: [...prevState.stateTrendLine.id_for_trends_3],
						trends_1: [...prevState.stateTrendLine.trends_1],
						id_for_trends_1: [...prevState.stateTrendLine.id_for_trends_1],
					}
				})
			)
		}
	} else {
		const largestId = await axios.get('http://localhost:3000/drawn-objects/largest_id')
		this.setState(
			prevState => ({
				stateTrendLine : {
					enableTrendLine: false,
					trends_3: trends_3,
					id_for_trends_3: [...prevState.stateTrendLine.id_for_trends_3, largestId.data + 1],
					trends_1: [...prevState.stateTrendLine.trends_1],
					id_for_trends_1: [...prevState.stateTrendLine.id_for_trends_1],
				}
			}),
			async () => {
				const lastObject = this.state.stateTrendLine.trends_3[this.state.stateTrendLine.trends_3.length - 1]
				const isDuplicate = await this.checkForDuplicateObject(lastObject, 'trends_3')
				console.log()
				if (isDuplicate === false) {
					try{
						const response = await axios.post('http://localhost:3000/drawn-objects', {
							name: 'trends_3', 
							object: JSON.stringify(lastObject), 
							user: this.state.userId[0]
						})
					} catch(error) {
						console.error('Error saving to database ', error)
					}
				} else {
					console.log('Duplicate object, not saving to the database.');
				}
			}
		)
		console.log('state trend ', this.state.stateTrendLine)
	}
  }

  onDrawCompleteEquidistantChannel(channels_1) {
	this.setState(
		prevState => ({
			stateEquidistantChannel: {
				...prevState.stateEquidistantChannel,
				enableEquidistantChannel: false,
				equidistantChannel_1: channels_1
			}
		})
	)
  }

  async fetchAllComponent() {
	const response = await axios.get(`http://localhost:3000/drawn-objects/${this.state.userId[0]}`)

	response.data.map((res) => {
		if (res.name === 'fibonacci_1') {
			this.setState(prevState => ({
				stateFibonacci: {
					...prevState.stateFibonacci,
					fibonacci_1: [...prevState.stateFibonacci.fibonacci_1, JSON.parse(res.object)],
					id_for_fibonacci_1:[...prevState.stateFibonacci.id_for_fibonacci_1, res.id]
				}
			}))
		} else if (res.name === 'fibonacci_3') {
			this.setState(prevState => ({
				stateFibonacci: {
					...prevState.stateFibonacci,
					fibonacci_3: [...prevState.stateFibonacci.fibonacci_3, JSON.parse(res.object)],
					id_for_fibonacci_3:[...prevState.stateFibonacci.id_for_fibonacci_3, res.id]
				}
			}))
		} else if (res.name === 'trends_1') {
			this.setState(prevState => ({
				stateTrendLine: {
					...prevState.stateTrendLine,
					trends_1: [...prevState.stateTrendLine.trends_1, JSON.parse(res.object)],
					id_for_trends_1:[...prevState.stateTrendLine.id_for_trends_1, res.id]
				}
			}))
		} else if (res.name === 'trends_3') {
			this.setState(prevState => ({
				stateTrendLine: {
					...prevState.stateTrendLine,
					trends_3: [...prevState.stateTrendLine.trends_3, JSON.parse(res.object)],
					id_for_trends_3:[...prevState.stateTrendLine.id_for_trends_3, res.id]
				}
			}))
		} else if (res.name === 'textList_1') {
			this.setState(prevState => ({
				stateInteractiveText: {
					...prevState.stateInteractiveText,
					textList_1: [...prevState.stateInteractiveText.textList_1, JSON.parse(res.object)],
					id_for_textList_1: [...prevState.stateInteractiveText.id_for_textList_1, res.id]
				}
			}))
		} else if (res.name === 'textList_3') {
			this.setState(prevState => ({
				stateInteractiveText: {
					...prevState.stateInteractiveText,
					textList_3: [...prevState.stateInteractiveText.textList_3, JSON.parse(res.object)],
					id_for_textList_3: [...prevState.stateInteractiveText.id_for_textList_3, res.id]
				}
			}))
		}
	})

	const orderObject = await axios.get(`http://localhost:3000/orders-buy/1/3/XRPUSD`)
	if (orderObject.data) {
		orderObject.data.map((buyOrder) => {
			const parsedObj = JSON.parse(buyOrder.order_object)
			console.log('buyOrder ', buyOrder.id)
			const updatedObj = {
				...buy,
				yValue: parsedObj.yValue,
				id: parsedObj.id,
				draggable: false,
				text: `BUY #${parsedObj.text}`
			}
			this.handleChoosePositionInteractiveYCoordinate(updatedObj, 1)

			const stopLossValue = this.calculateStopLoss(this.props.data[this.props.data.length - 1].close, 15)
			const stopLossObject = {
				...sell,
				yValue: stopLossValue,
				id: shortid.generate(),
				draggable: true,
				text: `STOP LOSS #${this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.length + 1} 3.5%`
			}

			const takeProfitValue = this.calculateTakeProfit(this.props.data[this.props.data.length - 1].close, 15)
			const takeProfitObject = {
				...sell,
				yValue: takeProfitValue,
				id: shortid.generate(),
				draggable: true,
				text: `TAKE PROFIT #${this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.length} 3.5%`
			}

			this.setState(prevState => ({
				stateInteractiveYCoordinate: {
					...prevState.stateInteractiveYCoordinate,
					interactiveYCoordinate_1: [...prevState.stateInteractiveYCoordinate.interactiveYCoordinate_1, stopLossObject, takeProfitObject],
					id_for_interactiveYCoordinate_1: [...prevState.stateInteractiveYCoordinate.id_for_interactiveYCoordinate_1, buyOrder.id]
				}
			}))
		})

		console.log('buyOrderResponse', this.state.stateInteractiveYCoordinate)
	}
  }

	async onFibComplete1(fibonacci_1, prevState) {
		const isUpdated = true ? fibonacci_1.length === prevState.fibonacci_1.length : false
		if (isUpdated) {
			const selectedObjIdx = fibonacci_1.findIndex(fib => fib.selected === true)
			const databaseIdx = prevState.id_for_fibonacci_1 && prevState.id_for_fibonacci_1[selectedObjIdx]

			if (databaseIdx != undefined) {
				await axios.put(`http://localhost:3000/drawn-objects/${databaseIdx}`, {
					name: 'fibonacci_1',
					object: JSON.stringify(fibonacci_1[selectedObjIdx]),
					user: this.state.userId[0]
				})

				this.setState(
					prevState => ({
						stateFibonacci: {
							enableFibonacci: false,
							fibonacci_1: fibonacci_1,
							id_for_fibonacci_1: [...prevState.stateFibonacci.id_for_fibonacci_1],
							fibonacci_3: [...prevState.stateFibonacci.fibonacci_3],
							id_for_fibonacci_3: [...prevState.stateFibonacci.id_for_fibonacci_3],
						}
					})
				)
			}
		} else {
			const largestId = await axios.get('http://localhost:3000/drawn-objects/largest_id')
			console.log('largestId ', largestId.data + 1)
			this.setState(
				prevState => ({
					stateFibonacci : {
						enableTrendLine: false,
						fibonacci_1: fibonacci_1,
						id_for_fibonacci_1: [...prevState.stateFibonacci.id_for_fibonacci_1, largestId.data + 1],
						fibonacci_3: [...prevState.stateFibonacci.fibonacci_3],
						id_for_fibonacci_3: [...prevState.stateFibonacci.id_for_fibonacci_3],
					}
				}),
				async () => {
					const lastObject = this.state.stateFibonacci.fibonacci_1[this.state.stateFibonacci.fibonacci_1.length - 1]
					const isDuplicate = await this.checkForDuplicateObject(lastObject, 'fibonacci_1')
					console.log()
					if (isDuplicate === false) {
						try{
							const response = await axios.post('http://localhost:3000/drawn-objects', {
								name: 'fibonacci_1', 
								object: JSON.stringify(lastObject), 
								user: this.state.userId[0]
							})
						} catch(error) {
							console.error('Error saving to database ', error)
						}
					} else {
						console.log('Duplicate object, not saving to the database.');
					}
				}
			)
		}
	}

	async onFibComplete3(fibonacci_3, prevState) {
		const isUpdated = true ? fibonacci_3.length === prevState.fibonacci_3.length : false
		if (isUpdated) {
			const selectedObjIdx = fibonacci_3.findIndex(fib => fib.selected === true)
			const databaseIdx = prevState.id_for_fibonacci_3 && prevState.id_for_fibonacci_3[selectedObjIdx]

			if (databaseIdx != undefined) {
				await axios.put(`http://localhost:3000/drawn-objects/${databaseIdx}`, {
					name: 'fibonacci_3',
					object: JSON.stringify(fibonacci_3[selectedObjIdx]),
					user: this.state.userId[0]
				})

				this.setState(
					prevState => ({
						stateFibonacci: {
							enableFibonacci: false,
							fibonacci_3: fibonacci_3,
							id_for_fibonacci_3: [...prevState.stateFibonacci.id_for_fibonacci_3],
							fibonacci_1: [...prevState.stateFibonacci.fibonacci_1],
							id_for_fibonacci_1: [...prevState.stateFibonacci.id_for_fibonacci_1],
						}
					})
				)
			}
		} else {
			const largestId = await axios.get('http://localhost:3000/drawn-objects/largest_id')
			console.log('largestId ', largestId.data + 1)
			this.setState(
				prevState => ({
					stateFibonacci : {
						enableTrendLine: false,
						fibonacci_3: fibonacci_3,
						id_for_fibonacci_3: [...prevState.stateFibonacci.id_for_fibonacci_3, largestId.data + 1],
						fibonacci_1: [...prevState.stateFibonacci.fibonacci_1],
						id_for_fibonacci_1: [...prevState.stateFibonacci.id_for_fibonacci_1],
					}
				}),
				async () => {
					const lastObject = this.state.stateFibonacci.fibonacci_3[this.state.stateFibonacci.fibonacci_3.length - 1]
					const isDuplicate = await this.checkForDuplicateObject(lastObject, 'fibonacci_3')
					console.log()
					if (isDuplicate === false) {
						try{
							const response = await axios.post('http://localhost:3000/drawn-objects', {
								name: 'fibonacci_3', 
								object: JSON.stringify(lastObject), 
								user: this.state.userId[0]
							})
						} catch(error) {
							console.error('Error saving to database ', error)
						}
					} else {
						console.log('Duplicate object, not saving to the database.');
					}
				}
			)
		}
	}
	// #################### InteractiveYCoordinate ###########################################
	handleSelectionInteractiveYCoordinate(interactives, moreProps, e) {
		if (this.state.stateInteractiveYCoordinate.enableInteractiveYCoordinate) {
			const independentCharts = moreProps.currentCharts.filter(d => d !== 2);
			if (independentCharts.length > 0) {
				const first = head(independentCharts);

				const morePropsForChart = getMorePropsForChart(moreProps, first);
				const {
					mouseXY: [, mouseY],
					chartConfig: { yScale },
				} = morePropsForChart;

				const yValue = round(yScale.invert(mouseY), 2);
				const newAlert = {
					...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
					yValue,
					id: shortid.generate()
				}
				this.handleChoosePositionInteractiveYCoordinate(newAlert, morePropsForChart, e)
			}
		} else {
			const state = toObject(interactives, each => {
				return [
					`interactiveYCoordinate_${each.chartId}`,
					each.objects,
				]
			})
			this.setState({
				stateInteractiveYCoordinate: state
			})
		}
	}

	handleChoosePositionInteractiveYCoordinate(alert, chartId) {
		// const {id: chartId} = moreProps.chartConfig
		this.setState(prevState => ({
			stateInteractiveYCoordinate: {
				...prevState.stateInteractiveYCoordinate,
				[`interactiveYCoordinate_${chartId}`] : [
					...this.state.stateInteractiveYCoordinate[`interactiveYCoordinate_${chartId}`],
					alert,
				],
				enableInteractiveYCoordinate: false
			},
		}))
	}

	handleDoubleClickAlert(item) {
		console.log('handleDoubleClickAlert ', item)
		this.setState(prevState => ({
			stateInteractiveYCoordinate: {
				...prevState.stateInteractiveYCoordinate,
				showModalInteractiveYCoordinate: true,
				alertToEdit: {
					alert: item.object,
					chartId: item.chartId,
				}
			}
		}))
	}

	handleChangeAlert(alert, chartId) {
		const yCoordinateList = this.state.stateInteractiveYCoordinate[`interactiveYCoordinate_${chartId}`]
		console.log('handleChangeAlert ', yCoordinateList, alert)
		const newAlertList = yCoordinateList.map((d) => {
			return d.id === alert.id ? alert : d
		})
		console.log('handleChangeAlert ', newAlertList)
		this.setState(prevState => ({
			stateInteractiveYCoordinate: {
				...prevState.stateInteractiveYCoordinate,
				[`interactiveYCoordinate_${chartId}`]: newAlertList,
				showModalInteractiveYCoordinate: false,
				enableInteractiveYCoordinate: false,
			}
		}))
	}

	handleDeleteAlert() {
		const { alertToEdit } = this.state.stateInteractiveYCoordinate
		const key = `interactiveYCoordinate_${alertToEdit.chartId}`
		const yCoordinateList = this.state.stateInteractiveYCoordinate[key].filter((d) => {
			return d.id !== alertToEdit.alert.id
		})

		this.setState(prevState => ({
			...prevState,
			stateInteractiveYCoordinate: {
				...prevState.stateInteractiveYCoordinate,
				showModalInteractiveYCoordinate: false,
				alertToEdit: {},
				[key]: yCoordinateList
			}
		}))
	}
	
	handleDialogCloseInteractiveYCoordinate() {
		this.setState((prevState) => {
			const { originalAlertList, alertToEdit } = prevState.stateInteractiveYCoordinate
			const key = `interactiveYCoordinate_${alertToEdit.chartId}`;
			const list = originalAlertList || prevState.stateInteractiveYCoordinate[key];
	  
			return {
				...prevState,
				stateInteractiveYCoordinate: {
					...prevState.stateInteractiveYCoordinate,
					showModal: false,
					[key]: list,
				}
			};
		})
	}

	onDelete(yCoordinate, moreProps) {
		const chartId = moreProps.chartConfig.id;
      	const key = `interactiveYCoordinate_${chartId}`
		console.log('onDelete ', key)
		this.setState(prevState => {
			const newState = { ...prevState }
			const list = newState.stateInteractiveYCoordinate[key]

			// Фильтруем список, оставляя только объекты, у которых id не равен id удаляемого объектаs
			newState.stateInteractiveYCoordinate[key] = list.filter(d => d.id !== yCoordinate.id)

			return newState
		})
	}

	onDragCompleteInteractiveYCoordinate(yCoordinateList, moreProps, draggedAlert) {
		const { id: chartId } = moreProps.chartConfig;
		const key = `interactiveYCoordinate_${chartId}`;
		console.log('onDragCompleteInteractiveYCoordinate ', draggedAlert)
		this.setState(prevState => {
			const newState = { ...prevState };
			
			newState.stateInteractiveYCoordinate.enableInteractiveYCoordinate = false;
			newState.stateInteractiveYCoordinate[key] = yCoordinateList;
			newState.stateInteractiveYCoordinate.showModalInteractiveYCoordinate = draggedAlert != null;
			newState.stateInteractiveYCoordinate.alertToEdit = {
				alert: draggedAlert,
				chartId,
			};
			newState.stateInteractiveYCoordinate.originalAlertList = prevState.stateInteractiveYCoordinate[key];
	
			return newState;
		});
	}

	async handleClickBuy() {
		console.log('handleClickBuy has been toggled', this.props)

		if (this.props.backtest.backtestMode === false) {
			const response = await this.checkForSession()
			console.log('handleClickBuy ', response.id)
			if (response === false) {
				this.setState(prevState => ({
					...prevState,
					backtestWindow: {
						enableBacktestWindow: true
					}
				}))
			} else {
				const { dispatch } = this.props

				const updatedBacktestWindow = {
					...this.props.backtest,
					enableSessionExistWindow: true,
					newSessionInfo: {
						balance: response.balance,
						pair: response.pair,
						start_date: response.start_date,
						end_date: response.end_date,
						session_status: response.session_status,
						win_rate: response.win_rate,
						lose_rate: response.lose_rate,
						user_id: response.user_id
					},
					session_id: response.id
				}

				dispatch(addBacktestMode(updatedBacktestWindow))

				this.setState(prevState => ({
					...prevState,
					backtestWindow: {
						enableSessionExistWindow: true
					}
				}))

				console.log('handleClickBuy ', this.state.backtestWindow)
			}
		} else {
			const buyObject = {
				...buy,
				yValue: this.props.data[this.props.data.length - 1].close,
				id: shortid.generate(),
				draggable: false,
				text: `BUY ORDER #${this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.length + 2}`
			}
			const biggestId = await axios.get(`http://localhost:3000/orders-buy/biggest_id`)
			console.log('biggestId ', biggestId.data)
			this.setState(prevState => ({
				...prevState,
				stateInteractiveYCoordinate: {
					...prevState.stateInteractiveYCoordinate,
					id_for_interactiveYCoordinate_1: [...this.state.stateInteractiveYCoordinate.id_for_interactiveYCoordinate_1, biggestId.data + 1]
				}
			}))

			const response = await axios.post('http://localhost:3000/orders-buy', {
					price: this.props.data[this.props.data.length - 1].close, 
					margin: 15, 
					order_amount: this.props.data[this.props.data.length - 1].close * 15, 
					order_status: "active", 
					order_object: buyObject, 
					user_id: this.props.backtest.newSessionInfo.user_id, 
					session_id: this.props.backtest.session_id
			})

			this.handleChoosePositionInteractiveYCoordinate(buyObject, 1)

			const stopLossValue = this.calculateStopLoss(this.props.data[this.props.data.length - 1].close, 15)
			const stopLossObject = {
				...sell,
				yValue: stopLossValue,
				id: shortid.generate(),
				draggable: true,
				text: `STOP LOSS #${this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.length + 1} 3.5%`
			}

			// const response1 = await axios.post('http://localhost:3000/orders-buy', {
			// 	price: stopLossValue, 
			// 	margin: 15, 
			// 	order_amount: stopLossValue * 15, 
			// 	order_status: "active", 
			// 	order_object: stopLossObject, 
			// 	user_id: this.props.backtest.newSessionInfo.user_id, 
			// 	session_id: this.props.backtest.session_id
			// })

			this.setState(prevState => ({
				...prevState,
				stopLoss: {
					price: stopLossValue,
					rr: '3.5'
				}
			}))

			this.handleChoosePositionInteractiveYCoordinate(stopLossObject, 1)

			const takeProfitValue = this.calculateTakeProfit(this.props.data[this.props.data.length - 1].close, 15)
			const takeProfitObject = {
				...sell,
				yValue: takeProfitValue,
				id: shortid.generate(),
				draggable: true,
				text: `TAKE PROFIT #${this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.length} 3.5%`
			}

			// const response2 = await axios.post('http://localhost:3000/orders-buy', {
			// 	price: takeProfitValue, 
			// 	margin: 15, 
			// 	order_amount: takeProfitValue * 15, 
			// 	order_status: "active", 
			// 	order_object: takeProfitObject, 
			// 	user_id: this.props.backtest.newSessionInfo.user_id, 
			// 	session_id: this.props.backtest.session_id
			// })

			this.setState(prevState => ({
				...prevState,
				takeProfit: {
					price: takeProfitValue,
					rr: '3.5'
				}
			}))

			this.handleChoosePositionInteractiveYCoordinate(takeProfitObject, 1)

		}
	}
	calculateStopLoss(buy_price, margin) {
		const real_amount = buy_price * margin
		return (real_amount * (1 - 0.2)) / margin
	}
	calculateTakeProfit(buy_price, margin) {
		const real_amount = buy_price * margin
		return (real_amount * (1 + 0.02)) / margin
	}

	handleClickSell() {
		if (this.state.backtestWindow.backtestMode === false){
			const sellObject = {
				...sell,
				yValue: this.props.data[this.props.data.length - 1].close,
				id: shortid.generate(),
				draggable: true,
			} 
			this.handleChoosePositionInteractiveYCoordinate(sellObject, 1)
		}
	}

	async checkForSession() {
		try {
			const response = await axios.get(`http://localhost:3000/sessions/${this.state.userId[0]}/${this.state.pair[0]}`)
			return response.data
		} catch(error) {
			console.error('Error fetching sessions ', error)
		}
	}

	handleCloseBacktestWindow() {
		this.setState(prevState => ({
			backtestWindow: {
				...prevState.backtestWindow,
				enableBacktestWindow: false,
			}
		}))
	}
	async handleSaveSessionInfo(sessionInfo) {
		
		this.setState(prevState => ({
			backtestWindow: {
				...prevState.backtestWindow,
				enableBacktestWindow: false,
				enableSessionExistWindow: false,
				newSessionInfo: sessionInfo,
				backtestMode: true
			}
		}), async () => {
			try {
				const response = await axios.post(`http://localhost:3000/sessions`, {
					balance: Number(this.state.backtestWindow.newSessionInfo.balance),
					user_id: this.state.userId[0],
					start_date: this.state.backtestWindow.newSessionInfo.start_date,
					end_date: this.state.backtestWindow.newSessionInfo.end_date,	
					session_status: this.state.backtestWindow.newSessionInfo.session_status,
					pair: this.state.backtestWindow.newSessionInfo.pair,
				})
				console.log('handleSaveSessionInfo ', response)

				const { dispatch } = this.props
				dispatch(addBacktestMode(this.state.backtestWindow))

			} catch (error) {
				console.error('Error post session ', error)
			}
		})
	}

	async updateOrdersIdx() {
		const orderObject = await axios.get(`http://localhost:3000/orders-buy/${this.state.userId[0]}/${this.props.backtest.session_id}/${this.props.pair.pair}`)

		if (orderObject.data) {
			const idx = orderObject.data.map((buyOrder) => buyOrder.id)
			console.log('idx ', idx)
			this.setState(prevState => ({
				stateInteractiveYCoordinate: {
					...prevState.stateInteractiveYCoordinate,
					id_for_interactiveYCoordinate_1: idx
				}
			}))
		}
	}

	fastForward() {
		// console.log('fastForward ', this.props.data[this.props.data.length - 1].high, this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1)
		this.updateOrdersIdx()
		const { dispatch, backtest } = this.props
		const { newSessionInfo } = backtest

		const nextCandleStick = new Date(newSessionInfo.end_date)
		nextCandleStick.setDate(nextCandleStick.getDate() + 1)
		const nextDate = nextCandleStick.toISOString().split('T')[0]

		const updatedBacktestWindow = {
			...backtest,
			newSessionInfo: {
				...newSessionInfo, 
				end_date: nextDate
			},
			backtestMode: true,
		}

		dispatch(addBacktestMode(updatedBacktestWindow))
		this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.map((obj) => {
			if (obj && this.props.data[this.props.data.length - 1].high >= obj.yValue){
				if(obj.text.split(' ')[0] === 'TAKE') {
					const takeElement = this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.find(element => element.text === obj.text)
					const takeElementIdx = this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.indexOf(takeElement)
					console.log('fastForward ', takeElementIdx, this.state.stateInteractiveYCoordinate.id_for_interactiveYCoordinate_1[takeElementIdx-2])
					const updatedTakeObject = {
						order_object: JSON.stringify(takeElement),
						order_status: 'take',
						sell_price: obj.yValue,
					}

					try {
						axios.put(`http://localhost:3000/orders-buy/${this.state.stateInteractiveYCoordinate.id_for_interactiveYCoordinate_1[takeElementIdx-2]}`, 
							updatedTakeObject
						)

						// Фильтруем список, оставляя только объекты, у которых text не равен text удаляемого объектаs
						const newState = this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1.filter(d => d.text.split(' ')[2] != obj.text.split(' ')[2])

						this.setState(prevState => ({
							stateInteractiveYCoordinate: {
								...prevState.stateInteractiveYCoordinate,
								interactiveYCoordinate_1: newState
							}
						}))
					} catch(error) {
						console.error('Error updating object ', error)
					}
				}
			}
		})
	}

	rewind() {
		const { dispatch, backtest } = this.props
		const { newSessionInfo } = backtest

		const prevCandleStick = new Date(newSessionInfo.end_date)
		prevCandleStick.setDate(prevCandleStick.getDate() - 1)
		const prevDate = prevCandleStick.toISOString().split('T')[0]

		const updatedBacktestWindow = {
			...backtest,
			newSessionInfo: {
				...newSessionInfo, 
				end_date: prevDate
			},
			backtestMode: true,
		}

		dispatch(addBacktestMode(updatedBacktestWindow))		
	}

	pause() {

	}

	handleCloseSessionExistsWindow() {
		this.setState(prevState => ({
			backtestWindow: {
				...prevState.backtestWindow,
				enableSessionExistWindow: false,
			}
		}), async () => {
			const response = await this.checkForSession()

			if (response != false) {
				const { dispatch } = this.props

				const updatedBacktestWindow = {
					...this.props.backtest,
					enableSessionExistWindow: false,
					newSessionInfo: {
						balance: response.balance,
						pair: response.pair,
						start_date: undefined,
						end_date: undefined,
						session_status: response.session_status,
						win_rate: response.win_rate,
						lose_rate: response.lose_rate,
						user_id: response.user_id
					}
				}

				dispatch(addBacktestMode(updatedBacktestWindow))
			}
		})
	}

	handleStartNewSession() {
		console.log('handleStartNewSession ', this.props.backtest.newSessionInfo.balance)
		this.setState(prevState => ({
			backtestWindow: {
				...prevState.backtestWindow,
				enableSessionExistWindow: false,
				enableBacktestWindow: true
			}
		}), async () => {
			await axios.put(`http://localhost:3000/sessions/${this.state.userId[0]}/${this.props.pair.pair}`, {
				balance: this.props.backtest.newSessionInfo.balance,
				user_id: this.state.userId[0],
				start_date: this.props.backtest.newSessionInfo.start_date,
				end_date: this.props.backtest.newSessionInfo.end_date,
				session_status: "canceled",
				pair: this.props.pair.pair
			})
		})
	}

	async handleContinueSession() {
		const response = await this.checkForSession()
		console.log('handleClickBuy ', response.balance)
		if (response != false) {
			const { dispatch } = this.props

			const updatedBacktestWindow = {
				...this.props.backtest,
				enableSessionExistWindow: false,
				newSessionInfo: {
					balance: response.balance,
					pair: response.pair,
					start_date: response.start_date,
					end_date: response.end_date,
					session_status: response.session_status,
					win_rate: response.win_rate,
					lose_rate: response.lose_rate,
					user_id: response.user_id
				},
				backtestMode: true,
			}

			dispatch(addBacktestMode(updatedBacktestWindow))

			this.setState(prevState => ({
				backtestWindow: {
					...prevState.backtestWindow,
					enableSessionExistWindow: false,
					backtestMode: true,
				}
			}))
		}
	}

	saveNode(node) {
		this.node = node;
	}
	// #################### InteractiveYCoordinate ###########################################

  handleFibClick(e, interactive, chartId) {
	console.log('handleFibClick ', interactive)
	const { fibonacci_1, fibonacci_3 } = this.state.stateFibonacci

	const updatedFibonnaci1 = fibonacci_1.map(fib => ({
		...fib,
		selected: fib === interactive ? !fib.selected : false
	}))

	const updatedFibonacci3 = fibonacci_3.map(fib => ({
		...fib,
		selected: false,
  	}))

	this.setState(prevState => ({
		stateFibonacci: {
		  ...prevState.stateFibonacci,
		  fibonacci_1: updatedFibonnaci1,
		  fibonacci_3: updatedFibonacci3,
		},
	}))
  }

  onClickTrendLine() {
	this.setState(prevState => ({
		stateTrendLine: {
			...prevState.stateTrendLine,
			enableTrendLine: !prevState.stateTrendLine.enableTrendLine,
		}
	}))
  }

  onClickFibonacci() {
	this.setState(prevState => ({
		stateFibonacci: {
			...prevState.stateFibonacci,
			enableFibonacci: !prevState.stateFibonacci.enableFibonacci,
		}
	}))
  }

  onClickInteractiveText() {
	this.setState(prevState => ({
		stateInteractiveText: {
			...prevState.stateInteractiveText,
			enableInteractiveObject: !prevState.stateInteractiveText.enableInteractiveObject,
		}
	}))
  }

  onClickEquidistantChannel() {
	this.setState(prevState => ({
		stateEquidistantChannel: {
			...prevState.stateEquidistantChannel,
			enableEquidistantChannel: !prevState.stateEquidistantChannel.enableEquidistantChannel
		}
	}))
  }

  	deselectAll() {
		const { stateInteractiveText, stateTrendLine, stateFibonacci, stateEquidistantChannel }  = this.state

		function deselectObjects(objects) {
			return objects.map(object => ({
				...object,
				selected: false
			}))
		}

		// const updatedInteractiveText = {
		// 	...stateInteractiveText,
		// 	textList_1: deselectObjects(stateInteractiveText.textList_1),
		// 	textList_3: deselectObjects(stateInteractiveText.textList_3),
		// }
	  
		const updatedTrendLine = {
			...stateTrendLine,
			trends_1: deselectObjects(stateTrendLine.trends_1),
			trends_3: deselectObjects(stateTrendLine.trends_3),
		}
	  
		const updatedFibonacci = {
			...stateFibonacci,
			fibonacci_1: deselectObjects(stateFibonacci.fibonacci_1),
			fibonacci_3: deselectObjects(stateFibonacci.fibonacci_3),
		}
	  
		const updatedEquidistantChannel = {
			...stateEquidistantChannel,
			equidistantChannel_1: deselectObjects(stateEquidistantChannel.equidistantChannel_1),
		}

		this.setState({
			// stateInteractiveText: updatedInteractiveText,
			stateTrendLine: updatedTrendLine,
			stateFibonacci: updatedFibonacci,
			stateEquidistantChannel: updatedEquidistantChannel,
		})
	}

  	onColorClick(color) {
		this.setState(prevState => ({
			selectedColor: {
				...prevState.selectedColor,
				color: color
			}
		}))
		console.log('COLOR ', this.state.selectedColor)
	}

	render() {
		const { dispatch } = this.props
		console.log('Pair ', this.props)
		console.log('chartConfig ', this.context.chartConfig)

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => {d.macd = c;})
			.accessor(d => d.macd);

		// console.log('macdCalculator accessor', macdCalculator.accessor())
		// console.log('macdCalculator options', macdCalculator.options())
			
		const { type, data: initialData, width, ratio } = this.props;

		// const calculatedData = macdCalculator(initialData);

		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => new Date(d.date))

		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(initialData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];

		return (
			<>
				<div className="graph">
					<div className="available-stocks">
						<div className="stock">
							<div className="favorite-star" id='BTC' >&#9733;</div>
							<div className="pair">BTC/USDT</div>
							<div className="info">Last Price: $45,000</div>
							<div className="info">
								24h Change: <span className="change-percantage positive">+5%</span>
							</div>
							<div className="info">Market Cap: $1.2T</div>
							<div>
								<button className="details-btn">Details</button>
								<button className="trade-btn">Trade</button>
							</div>
						</div>
						<div className="stock">
							<div className="favorite-star" id='SOL'>&#9733;</div>
							<div className="pair">SOL/USDT</div>
							<div className="info">Last Price: $45,000</div>
							<div className="info">
								24h Change: <span className="change-percantage negative">-15%</span>
							</div>
							<div className="info">Market Cap: $1.2T</div>
							<div>
								<button className="details-btn">Details</button>
								<button className="trade-btn">Trade</button>
							</div>
						</div>
						<div className="stock">
							<div className="favorite-star" id='EUR' >&#9733;</div>
							<div className="pair">EUR/USD</div>
							<div className="info">Last Price: $45,000</div>
							<div className="info">
								24h Change: <span className="change-percantage positive">+10%</span>
							</div>
							<div className="info">Market Cap: $1.2T</div>
							<div>
								<button className="details-btn">Details</button>
								<button className="trade-btn">Trade</button>
							</div>
						</div>
					</div>
				
					<div className="chart-with-tools">
						<div className="nav-bar-component">
							<div className="select-elements">
								<select id="currency-select" className="dropdown">
									<option value="EURUSD">EURUSD</option>
									<option value="GBPUSD">GBPUSD</option>
									<option value="EURCAD">EURCAD</option>
								</select>
						
								<select id="timeframe-select" className="dropdown">
									<option value="1hour">1 час</option>
									<option value="4hours">4 часа</option>
									<option value="1day">1 день</option>
								</select>
							</div>
					
							<div className="manageOrders-panel">
								<button style={{padding: '15px 15px'}} onClick={this.handleClickBuy}>Buy</button>
								<button style={{padding: '15px 15px'}} onClick={this.handleClickSell}>Sell</button>
								<button style={{padding: '15px 15px'}}>Cancel</button>
							</div>
						</div>
	
						<div className="tools">
							<button onClick={this.onClickTrendLine} style={{backgroundColor: this.state.stateTrendLine.enableTrendLine ? 'blue': null}}>Trend Line</button>
							<button onClick={this.onClickInteractiveText} 
								style={{backgroundColor: this.state.stateInteractiveText.enableInteractiveObject ? 'blue': null}}
							>
								Interactive Text
							</button>
							<button onClick={this.onClickFibonacci} style={{backgroundColor: this.state.stateFibonacci.enableFibonacci ? 'blue': null}}>Fibbanaci</button>
							<button>Rectangle</button>
							<button onClick={this.onClickEquidistantChannel} 
								style={{backgroundColor: this.state.stateEquidistantChannel.enableEquidistantChannel ? 'blue': null}}
							>
								Equidistant Channel
							</button>
						</div>
	
						<div className="colors">
							<div className="default-colors">
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#ff0000'}} onClick={() => this.onColorClick('#ff0000')}></button>
									<button className="color" style={{backgroundColor: '#00ff00'}} onClick={() => this.onColorClick('#00ff00')}></button>
									<button className="color" style={{backgroundColor: '#0000ff'}} onClick={() => this.onColorClick('#0000ff')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#e2f107'}} onClick={() => this.onColorClick('#e2f107')}></button>
									<button className="color" style={{backgroundColor: '#b96d09'}} onClick={() => this.onColorClick('#b96d09')}></button>
									<button className="color" style={{backgroundColor: '#4caf50'}} onClick={() => this.onColorClick('#4caf50')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#9c27b0'}} onClick={() => this.onColorClick('#9c27b0')}></button>
									<button className="color" style={{backgroundColor: '#ffc107'}} onClick={() => this.onColorClick('#ffc107')}></button>
									<button className="color" style={{backgroundColor: '#2196f3'}} onClick={() => this.onColorClick('#2196f3')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#ff0000'}} onClick={() => this.onColorClick('#ff0000')}></button>
									<button className="color" style={{backgroundColor: '#00ff00'}} onClick={() => this.onColorClick('#00ff00')}></button>
									<button className="color" style={{backgroundColor: '#0000ff'}} onClick={() => this.onColorClick('#0000ff')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#e2f107'}} onClick={() => this.onColorClick('#e2f107')}></button>
									<button className="color" style={{backgroundColor: '#b96d09'}} onClick={() => this.onColorClick('#b96d09')}></button>
									<button className="color" style={{backgroundColor: '#4caf50'}} onClick={() => this.onColorClick('#4caf50')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#9c27b0'}} onClick={() => this.onColorClick('#9c27b0')}></button>
									<button className="color" style={{backgroundColor: '#ffc107'}} onClick={() => this.onColorClick('#ffc107')}></button>
									<button className="color" style={{backgroundColor: '#2196f3'}} onClick={() => this.onColorClick('#2196f3')}></button>
								</div>
	
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#ff0000'}} onClick={() => this.onColorClick('#ff0000')}></button>
									<button className="color" style={{backgroundColor: '#00ff00'}} onClick={() => this.onColorClick('#00ff00')}></button>
									<button className="color" style={{backgroundColor: '#0000ff'}} onClick={() => this.onColorClick('#0000ff')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#e2f107'}} onClick={() => this.onColorClick('#e2f107')}></button>
									<button className="color" style={{backgroundColor: '#b96d09'}} onClick={() => this.onColorClick('#b96d09')}></button>
									<button className="color" style={{backgroundColor: '#4caf50'}} onClick={() => this.onColorClick('#4caf50')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#9c27b0'}} onClick={() => this.onColorClick('#9c27b0')}></button>
									<button className="color" style={{backgroundColor: '#ffc107'}} onClick={() => this.onColorClick('#ffc107')}></button>
									<button className="color" style={{backgroundColor: '#2196f3'}} onClick={() => this.onColorClick('#2196f3')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#ff0000'}} onClick={() => this.onColorClick('#ff0000')}></button>
									<button className="color" style={{backgroundColor: '#00ff00'}} onClick={() => this.onColorClick('#00ff00')}></button>
									<button className="color" style={{backgroundColor: '#0000ff'}} onClick={() => this.onColorClick('#0000ff')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#e2f107'}} onClick={() => this.onColorClick('#e2f107')}></button>
									<button className="color" style={{backgroundColor: '#b96d09'}} onClick={() => this.onColorClick('#b96d09')}></button>
									<button className="color" style={{backgroundColor: '#4caf50'}} onClick={() => this.onColorClick('#4caf50')}></button>
								</div>
								
								<div className="color-row">
									<button className="color" style={{backgroundColor: '#9c27b0'}} onClick={() => this.onColorClick('#9c27b0')}></button>
									<button className="color" style={{backgroundColor: '#ffc107'}} onClick={() => this.onColorClick('#ffc107')}></button>
									<button className="color" style={{backgroundColor: '#2196f3'}} onClick={() => this.onColorClick('#2196f3')}></button>
								</div>

								<div className="color-row">
									<button className="color" style={{backgroundColor: '#9c27b0'}} onClick={() => this.onColorClick('#9c27b0')}></button>
									<button className="color" style={{backgroundColor: '#ffc107'}} onClick={() => this.onColorClick('#ffc107')}></button>
									<button className="color" style={{backgroundColor: '#2196f3'}} onClick={() => this.onColorClick('#2196f3')}></button>
								</div>
							</div>
	
							<div className="palitra">
								<div id='color-indicator' className="color-indicator"></div>  
								<div id="color-picker"></div>
							</div>
						</div>
						{/* onClick={() => this.deselectAll()} */}
						<div className="chart" onClick={() => this.deselectAll()}>
							<ChartCanvas ref={this.saveCanvasNode}
								height={700}
								width={1400}
								ratio={ratio}
								margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
								type={type}
								seriesName="MSFT"
								data={data}
								xScale={xScale}
								xAccessor={xAccessor}
								displayXAccessor={displayXAccessor}
								xExtents={xExtents}
							>
								<Chart id={1} height={400}
									yExtents={[d => [d.high, d.low]]}
									padding={{ top: 10, bottom: 20 }}
								>
									<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
									<YAxis axisAt="right" orient="right" ticks={5} />
									<MouseCoordinateY
										at="right"
										orient="right"
										displayFormat={format(".2f")} />
	
									<CandlestickSeries />

									{/* <LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()} />
          							<LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()} /> */}
	
									<EdgeIndicator itemType="last" orient="right" edgeAt="right"
										yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>
	
									<OHLCTooltip origin={[-40, 0]}/>
	
									<InteractiveText
										ref={this.saveInteractiveNodes("InteractiveText", 1)}
										enabled={this.state.stateInteractiveText.enableInteractiveObject}
										text="Lorem ipsum..."
										onDragComplete={this.onDrawComplete}
										textList={this.state.stateInteractiveText.textList_1}
										onSelect={() => console.log('onclick interactivetext')}
										onChoosePosition={() => console.log('OnComplete Interactivetext')}
									/>
	
									<TrendLine 
										ref={this.saveInteractiveNodes("Trendline", 1)}
										enabled={this.state.stateTrendLine.enableTrendLine}
										type="LINE"
										snap={false}
										snapTo={d => [d.high, d.low]}
										onStart={() => console.log("START")}
										// onComplete={this.onDrawCompleteChart1}
										onComplete={(line) => this.onDrawCompleteChart1(line, this.state.stateTrendLine)}
										trends={this.state.stateTrendLine.trends_1}
										appearance={{stroke: this.state.selectedColor.color}}
									/>

									<FibonacciRetracement
										ref={this.saveInteractiveNodes("FibonacciRetracement", 1)}
										enabled={this.state.stateFibonacci.enableFibonacci}
										type="BOUND"
										retracements={this.state.stateFibonacci.fibonacci_1}
										onComplete={(fib) => this.onFibComplete1(fib, this.state.stateFibonacci)}
										// onSelect={(e, interactive) => this.handleFibClick(e, interactive, e)}
										// onSelect={(e, interactive) => console.log('onSelect ', e, interactive)}
									/>

									<EquidistantChannel
										ref={this.saveInteractiveNodes("EquidistantChannel", 1)}
										enabled={this.state.stateEquidistantChannel.enableEquidistantChannel}
										onStart={() => console.log("START")}
										onComplete={this.onDrawCompleteEquidistantChannel}
										channels={this.state.stateEquidistantChannel.equidistantChannel_1}
										appearance={{
											stroke: this.state.selectedColor.color,
											strokeOpacity: 1,
											strokeWidth: 1,
											fill: this.state.selectedColor.color,
											fillOpacity: 0.2,
											edgeStroke: "#000000",
											edgeFill: "#FFFFFF",
											edgeFill2: "#250B98",
											edgeStrokeWidth: 1,
											r: 5
										}}
									/>

									<InteractiveYCoordinate 
										ref={this.saveInteractiveNodes('InteractiveYCoordinate', 1)}
										enabled={this.state.stateInteractiveYCoordinate.enableInteractiveYCoordinate}
										onDragComplete={this.onDragCompleteInteractiveYCoordinate}
										onDelete={this.onDelete}
										yCoordinateList={this.state.stateInteractiveYCoordinate.interactiveYCoordinate_1}
									/>

								</Chart>
								<Chart id={2} height={150}
									yExtents={[d => d.volume]}
									origin={(w, h) => [0, h - 300]}
								>
									<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>
	
									<MouseCoordinateY
										at="left"
										orient="left"
										displayFormat={format(".4s")} />
	
									<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
								</Chart>
	
								<Chart id={3} height={150}
									yExtents={macdCalculator.accessor()}
									origin={(w, h) => [0, h - 150]}
									padding={{ top: 10, bottom: 10 }}
								>
									<XAxis axisAt="bottom" orient="bottom"/>
									<YAxis axisAt="right" orient="right" ticks={2}/>
	
									<MouseCoordinateX
										at="bottom"
										orient="bottom"
										displayFormat={timeFormat("%Y-%m-%d")}
									/>
	
									<MouseCoordinateY
										at="right"
										orient="right"
										displayFormat={format(".2f")}
									/>
	
									<MACDSeries yAccessor={d => d.macd}
										{...macdAppearance} />
	
									<MACDTooltip
										origin={[-38, 15]}
										yAccessor={d => d.macd}
										options={macdCalculator.options()}
										appearance={macdAppearance}
									/>
	
									<InteractiveText
										ref={this.saveInteractiveNodes("InteractiveText", 3)}
										enabled={this.state.stateInteractiveText.enableInteractiveObject}
										text="Text Object 3"
										onDragComplete={this.onDrawComplete}
										textList={this.state.stateInteractiveText.textList_3}
									/>
	
									<TrendLine 
										ref={this.saveInteractiveNodes("Trendline", 3)}
										enabled={this.state.stateTrendLine.enableTrendLine}
										type="LINE"
										snap={false}
										snapTo={d => [d.high, d.low]}
										onStart={() => console.log("START")}
										onComplete={(line) => this.onDrawCompleteChart3(line, this.state.stateTrendLine)}
										trends={this.state.stateTrendLine.trends_3}
										appearance={{stroke: this.state.selectedColor.color}}
									/>

									<FibonacciRetracement
										ref={this.saveInteractiveNodes("FibonacciRetracement", 3)}
										enabled={this.state.stateFibonacci.enableFibonacci}
										type="BOUND"
										retracements={this.state.stateFibonacci.fibonacci_3}
										onComplete={(fib) => this.onFibComplete3(fib, this.state.stateFibonacci)}
									/>
									
								</Chart>
								<CrossHairCursor />
								<DrawingObjectSelector
									enabled
									getInteractiveNodes={this.getInteractiveNodes}
									drawingObjectMap={{
										InteractiveText: "textList",
									}}
									onSelect={this.handleSelection}
								/>
								{/* <DrawingObjectSelector 
									enabled
									getInteractiveNodes={this.getInteractiveNodes}
									drawingObjectMap={{
										InteractiveYCoordinate: "interactiveYCoordinate"
									}}
									onSelect={this.handleSelectionInteractiveYCoordinate}
									onDoubleClick={this.handleDoubleClickAlert}
								/>	 */}
							</ChartCanvas>
							<ModalWindow
								showModal={this.state.stateInteractiveText.showModal}
								text={this.state.stateInteractiveText.textList_1}
								chartId={this.state.stateInteractiveText.chartId}
								onClose={this.handleDialogClose}
								onSave={this.handleTextChange}
							/>
							<ModalWindowOrders 
								showModal={this.state.stateInteractiveYCoordinate.showModalInteractiveYCoordinate}
								alert={this.state.stateInteractiveYCoordinate.alertToEdit.alert}
								chartId={this.state.stateInteractiveYCoordinate.alertToEdit.chartId}
								onClose={this.handleDialogCloseInteractiveYCoordinate}
								onSave={this.handleChangeAlert}
								onDeleteAlert={this.handleDeleteAlert}
							/>
							<BacktestWindow 
								enabled={this.state.backtestWindow.enableBacktestWindow}
								onClose={this.handleCloseBacktestWindow}
								onSave={this.handleSaveSessionInfo}
							/>
							<SessionExistsWindow
								enabled={this.state.backtestWindow.enableSessionExistWindow}
								onClose={this.handleCloseSessionExistsWindow}
								onStartNewSession={this.handleStartNewSession}
								onContinueSession={this.handleContinueSession}
							/>
							<ChartController
								enabled={this.state.backtestWindow.backtestMode}
								onNextClick={this.fastForward}
								onPreviousClick={this.rewind}
							/>
						</div>
					</div>
				</div>

				<div className="orders-container">
					<table id="order-table">
						<thead>
							<tr>
								<th>Валютные пары</th>
								<th>Время</th>
								<th>Объем заявки</th>
								<th>Кредитное плечо</th>
								<th>Маржа</th>
								<th>Общий торговый объем</th>
								<th>Комиссия</th>
								<th>Открытие дата</th>
								<th>Закрытие дата</th>
								<th>Номер заявки</th>
								<th>Details</th>
							</tr>
						</thead>
							<tbody>
								<tr>
								<td>EURUSD</td>
								<td>12:00 PM</td>
								<td>1.0</td>
								<td>1:100</td>
								<td>1000</td>
								<td>5000</td>
								<td>20</td>
								<td>2022-02-15</td>
								<td>2022-02-16</td>
								<td>123456</td>
								<td><button className="details-button">Details</button></td>
								</tr>
							</tbody>
					</table>
   				</div>
			</>
		);
	}
}

CandleStickChartWithText.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithText.defaultProps = {
	type: "svg"
};

const CandleStickChart = fitWidth(
	CandleStickChartWithText
);

const mapStateToProps = (state) => ({
	pair: state.pair,
	backtest: state.backtest,
	data: state.dataset[0]
})

export default connect(mapStateToProps)(CandleStickChart)