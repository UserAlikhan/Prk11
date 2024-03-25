import React from 'react';
import '../cssFiles/ModalWindow.css';

class ModalWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.text
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleOpenClick = this.handleOpenClick.bind(this);
        this.handleSave = this.handleSave.bind(this);

        console.log('Props Modal', this.props)
    }

    handleOpenClick() {
        // Open the modal logic
        this.props.onOpen();
    }

    handleChange(e) {
        this.setState({
            text: e.target.value
        });
        console.log('handleChange Modal ', this.state)
    }

    handleSave() {
        this.props.onSave(this.state.text, this.props.chartId);
        console.log('handleSave Modal ', this.props, this.state)
    }

    render() {
        const { showModal, onClose } = this.props;
        return (
            <>
                {showModal && (
                    <div className="modal-container show" id="modal-container">
                        <div className="modal">
                            <h1>Edit text object</h1>
                            <input
                                type="text"
                                placeholder="Type Some Text"
                                id="interactiveText-input"
                                onChange={this.handleChange}
                            />
                            <div className="buttons-class">
                                <button id="save" onClick={this.handleSave}>
                                    Save Button
                                </button>
                                <button id="close" onClick={onClose}>
                                    Close Button
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default ModalWindow;
