// import React, { Component } from "react";
// import PropTypes from "prop-types";

// import { isDefined, isNotDefined, noop, strokeDashTypes } from 'react-stockcharts/lib/utils'

// import {
// 	getValueFromOverride,
// 	terminate,
// 	saveNodeType,
// 	isHoverForInteractiveType,
// } from 'react-stockcharts/lib/utils/barWidth'

// import HoverTextNearMouse from 'react-stockcharts/lib/interactive/components/HoverTextNearMouse'

// class Rectangle extends Component {
// 	constructor(props) {
// 		super(props);

// 		this.handleStart = this.handleStart.bind(this);
// 		this.handleEnd = this.handleEnd.bind(this);
// 		this.handleDrawLine = this.handleDrawLine.bind(this);
// 		this.handleDragLine = this.handleDragLine.bind(this);
// 		this.handleDragLineComplete = this.handleDragLineComplete.bind(this);


// 		this.getSelectionState = isHoverForInteractiveType("trends")
// 			.bind(this);

// 		this.state = {
// 		};
// 		this.nodes = [];
// 	}
// 	handleDragLine(index, newXYValue) {
// 		this.setState({
// 			override: {
// 				index,
// 				...newXYValue
// 			}
// 		});
// 	}
// 	handleDragLineComplete(moreProps) {
// 		const { override } = this.state;
// 		if (isDefined(override)) {
// 			const { trends } = this.props;
// 			const newTrends = trends
// 				.map((each, idx) => idx === override.index
// 					? {
// 						...each,
// 						start: [override.x1Value, override.y1Value],
// 						end: [override.x2Value, override.y2Value],
// 						selected: true,
// 					}
// 					: {
// 						...each,
// 						selected: false,
// 					});

// 			this.setState({
// 				override: null,
// 			}, () => {
// 				this.props.onComplete(newTrends, moreProps);
// 			});
// 		}
// 	}
// 	handleDrawLine(xyValue) {
// 		const { current } = this.state;
// 		if (isDefined(current) && isDefined(current.start)) {
// 			this.mouseMoved = true;
// 			this.setState({
// 				current: {
// 					start: current.start,
// 					end: xyValue,
// 				}
// 			});
// 		}
// 	}
// 	handleStart(xyValue, moreProps, e) {
// 		const { current } = this.state;

// 		if (isNotDefined(current) || isNotDefined(current.start)) {
// 			this.mouseMoved = false;

// 			this.setState({
// 				current: {
// 					start: xyValue,
// 					end: null,
// 				},
// 			}, () => {
// 				this.props.onStart(moreProps, e);
// 			});
// 		}
// 	}
// 	handleEnd(xyValue, moreProps, e) {
// 		const { current } = this.state;
// 		const { trends, appearance, type } = this.props;

// 		if (this.mouseMoved
// 			&& isDefined(current)
// 			&& isDefined(current.start)
// 		) {
// 			const newTrends = [
// 				...trends.map(d => ({ ...d, selected: false })),
// 				{
// 					start: current.start,
// 					end: xyValue,
// 					selected: true,
// 					appearance,
// 					type,
// 				}
// 			];
// 			this.setState({
// 				current: null,
// 				trends: newTrends
// 			}, () => {
// 				this.props.onComplete(newTrends, moreProps, e);
// 			});
// 		}
// 	}
// 	render() {
// 		const { appearance } = this.props;
// 		const { enabled, snap, shouldDisableSnap, snapTo, type } = this.props;
// 		const { currentPositionRadius, currentPositionStroke } = this.props;
// 		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
// 		const { hoverText, trends } = this.props;
// 		const { current, override } = this.state;

// 		const tempLine = isDefined(current)
// 			? isDefined(current.end)
// 			: null;

// 		return 
// 			{trends.map((each, idx) => {
// 				const eachAppearance = isDefined(each.appearance)
// 					? { ...appearance, ...each.appearance }
// 					: appearance;

// 				const hoverTextWithDefault = {
// 					...Rectangle.defaultProps.hoverText,
// 					...hoverText
// 				};

// 				return ;
// 			})}			
// 		;
// 	}
// }


// Rectangle.propTypes = {
// 	snap: PropTypes.bool.isRequired,
// 	enabled: PropTypes.bool.isRequired,
// 	snapTo: PropTypes.func,
// 	shouldDisableSnap: PropTypes.func.isRequired,

// 	onStart: PropTypes.func.isRequired,
// 	onComplete: PropTypes.func.isRequired,
// 	onSelect: PropTypes.func,

// 	currentPositionStroke: PropTypes.string,
// 	currentPositionStrokeWidth: PropTypes.number,
// 	currentPositionstrokeOpacity: PropTypes.number,
// 	currentPositionRadius: PropTypes.number,
// 	type: PropTypes.oneOf(['RECTANGLE']),
// 	hoverText: PropTypes.object.isRequired,

// 	trends: PropTypes.array.isRequired,

// 	appearance: PropTypes.shape({
//         isFill: true,
// 		stroke: PropTypes.string.isRequired,
// 		strokeOpacity: PropTypes.number.isRequired,
// 		strokeWidth: PropTypes.number.isRequired,
// 		strokeDasharray: PropTypes.oneOf(strokeDashTypes),
// 		edgeStrokeWidth: PropTypes.number.isRequired,
// 		edgeFill: PropTypes.string.isRequired,
// 		edgeStroke: PropTypes.string.isRequired,
// 	}).isRequired
// };

// Rectangle.defaultProps = {
// 	type: "RECTANGLE",

// 	onStart: noop,
// 	onComplete: noop,
// 	onSelect: noop,

// 	currentPositionStroke: "#000000",
// 	currentPositionstrokeOpacity: 1,
// 	currentPositionStrokeWidth: 3,
// 	currentPositionRadius: 0,

// 	shouldDisableSnap: e => (e.button === 2 || e.shiftKey),
// 	hoverText: {
// 		...HoverTextNearMouse.defaultProps,
// 		enable: true,
// 		bgHeight: "auto",
// 		bgWidth: "auto",
// 		text: "Click to select object",
// 		selectedText: "",
// 	},
// 	trends: [],

// 	appearance: {
// 		stroke: "#000000",
// 		strokeOpacity: 1,
// 		strokeWidth: 1,
// 		strokeDasharray: "Solid",
// 		edgeStrokeWidth: 1,
// 		edgeFill: "#FFFFFF",
// 		edgeStroke: "#000000",
// 		r: 6,
//                 fill: '#8AAFE2',
//                 fillOpacity: 0.7,
//                 text: '',        
// 	}
// };

// export default Rectangle;