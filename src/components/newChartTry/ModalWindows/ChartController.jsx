import React, { useState, useEffect } from "react";
import '../cssFiles/ChartController.css'
import prevImg from './images/prevBtn.png'
import pauseImg from './images/pauseBtn.png'
import nextImg from './images/nextBtn.png'

const ChartController = ({ enabled, onNextClick, onPreviousClick }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseDown = (e) => {
        setIsDragging(true)
        setStartX(e.clientX - position.x)
        setStartY(e.clientY - position.y)
    }

    const handleMouseMove = (e) => {
        if (isDragging) {
            const newX = e.clientX - startX
            const newY = e.clientY - startY
            setPosition({ x: newX, y: newY })
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        } else {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging, position])

    return (
        <>
            {enabled && (
                <div id="chartControls" style={{ left: `${position.x}px`, top: `${position.y}px` }} onMouseDown={handleMouseDown}>
                    <button id="prevBtn"><img src={prevImg} onClick={onPreviousClick} alt="Previous" /></button>
                    <button id="playPauseBtn"><img src={pauseImg} alt="Play" /></button>
                    <button id="nextBtn"><img src={nextImg} onClick={onNextClick} alt="Next" /></button>
                </div>
            )}
        </>
    )
}

export default ChartController;
