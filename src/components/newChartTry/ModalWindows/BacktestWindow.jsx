import React, { useState } from "react";
import '../cssFiles/BacktestWindow.css'
import { useSelector } from "react-redux";

const BacktestWindow = ({ enabled, onSave, onClose }) => {
    const [newSessionInfo, setNewSessionInfo] = useState({
        balance: "",
        pair: useSelector(state => state.pair.pair),
        start_date: "",
        end_date: "",
        session_status: "started",
        win_rate: "",
        lose_rate: "",
        user_id: [1],
    })

    const handleChange = (event) => {
        const { name, value } = event.target
        setNewSessionInfo(prevState => ({
            ...prevState,
            [name]: name === 'balance' ? Number(value) : value
        }))

        console.log('setNewSessionInfo ', newSessionInfo)
    }

    const handleSave = async () => {
        try {
            await onSave(newSessionInfo)
        } catch(error) {
            console.error('Error saving session data ', error)
        }
    }

    return (
        <>
            {enabled && (
                <div id="backtestModal" className="backtest_modal" style={{ display: 'block' }}>
                    <div className="modal-content">
                        <h2>Backtest Configuration</h2>
                        <div className="input-group">
                            <label htmlFor="balance">Balance:</label>
                            <input
                                type="number"
                                id="balance"
                                name="balance"
                                value={newSessionInfo.balance}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="pair">Pair:</label>
                            <h3>{newSessionInfo.pair}</h3>
                            {/* <select
                                id="pair"
                                name="pair"
                                value={newSessionInfo.pair}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Pair</option>
                                <option value="BTCUSD">BTCUSD</option>
                                <option value="ETHUSD">ETHUSD</option>
                                <option value="SOLUSDT">SOLUSDT</option>
                            </select> */}
                        </div>
                        <div className="input-group">
                            <label htmlFor="start-date">Start Date:</label>
                            <input
                                type="date"
                                id="start-date"
                                name="start_date"
                                value={newSessionInfo.start_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="end-date">End Date:</label>
                            <input
                                type="date"
                                id="end-date"
                                name="end_date"
                                value={newSessionInfo.end_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="button-group">
                            <button id="start-btn" onClick={handleSave}>Start</button>
                            <button id="cancel-btn" onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default BacktestWindow;
