import React, {useState} from "react";
import '../cssFiles/SessionExistsWindow.css'
import { useSelector } from "react-redux";

const SessionExistsWindow = ({enabled, onClose, onStartNewSession, onContinueSession}) => {
    const backtestState = useSelector(state => state.backtest)
    console.log('SessionExistsWindow ', backtestState)
    return (
        <>
            {enabled && (
                <>
                    <button id="backtestBtn">Open Backtest Window</button>
                    <button id="sessionBtn">Open Session Window</button>
                
                    <div id="backtestModal" className="session_modal">
                        <div className="modal-content-session">
                            <h2>Backtest Configuration</h2>
                        </div>
                    </div>
                
                    <div id="sessionModal" className="session_modal" style={{display: "block"}}>
                        <div className="modal-content-session session">
                            <h2>Session Information</h2>
                            <p>Session with the specified pair already exists:</p>
                            <ul className="info">
                                <li><strong>Balance:</strong>{backtestState.newSessionInfo.balance}</li>
                                <li><strong>Pair:</strong>{backtestState.newSessionInfo.pair}</li>
                                <li><strong>Start Date:</strong>{backtestState.newSessionInfo.start_date}</li>
                                <li><strong>End Date:</strong>{backtestState.newSessionInfo.end_date}</li>
                            </ul>
                            <div className="button-group">
                                <button id="continue-btn" onClick={onContinueSession}>Continue Session</button>
                                <button id="new-btn" onClick={onStartNewSession}>Start New Session</button>
                                <button id="cancel-session-btn" onClick={onClose}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default SessionExistsWindow