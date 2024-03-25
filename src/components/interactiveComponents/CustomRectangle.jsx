import React, { useState } from 'react';
import { Brush } from 'react-stockcharts/lib/interactive';
import { getMouseCanvas, hexToRGBA } from 'react-stockcharts/lib/utils';

const CustomRectangle = ({ enabled, onStart, onComplete, fill, opacity, triangleColor  }) => {
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);

    const handleStart = (coords) => {
        if (!enabled) return
        setStart(coords)

        if (onStart) onStart(coords)
    }

    const handleEnd = (coords) => {
        if (!enabled) return
        setEnd(coords)

        if (onComplete) onComplete({ start, end, coords })
    }

    const drawOnCanvas = (ctx, moreProps) => {
        const rect = {
            x: start[0],
            y: Math.min(start[1], end[1]),
            height: Math.abs(end[1] - start[1]),
            width: Math.abs(end[0] - start[0]),
        };
    
        if (rect.width > 0 && rect.height > 0) {
            const { fill, opacity } = brushStyle;
            const dashArray = [];
    
            ctx.fillStyle = hexToRGBA(fill, opacity);
            ctx.setLineDash(dashArray);
            ctx.beginPath();
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height); // используйте ctx.fillRect
        }
    
        // Рисуем треугольник
        if (end) {
            const triangle = {
                x1: start[0],
                y1: end[1],
                x2: end[0],
                y2: end[1],
                x3: (start[0] + end[0]) / 2,
                y3: start[1],
            };
    
            ctx.fillStyle = triangleColor || 'green';
            ctx.beginPath();
            ctx.moveTo(triangle.x1, triangle.y1);
            ctx.lineTo(triangle.x2, triangle.y2);
            ctx.lineTo(triangle.x3, triangle.y3);
            ctx.closePath();
            ctx.fill();
        }
    };    

    const brushStyle = {
        fill: fill || '#FF0000',
        fillOpacity: opacity || 0.5,
    };

    return (
        <Brush
            type="1D"
            enabled={enabled}
            onStart={handleStart}
            onBrush={handleEnd}
            onSelect={handleEnd}
            stroke="#FF0000"
            fill="#FF0000"
            drawOn={["mousemove", "pan", "drag"]} // Добавьте эту строку, чтобы вызвать drawOnCanvas при движении мыши, pan или drag
            canvasToDraw={getMouseCanvas}
            canvasDraw={drawOnCanvas}
            selectedBoxStyle={{
                fill: 'rgba(255, 0, 0, 0.3)',
            }}
        />
    );
};

export default CustomRectangle;
