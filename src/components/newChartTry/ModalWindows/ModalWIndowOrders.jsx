import React from 'react';
import '../cssFiles/ModalWindowOrders.css'

class ModalWindowOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alert: props.alert,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleOpenClick = this.handleOpenClick.bind(this);
        this.handleSave = this.handleSave.bind(this);

        console.log('Props Modal', this.props)
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            alert: nextProps.alert
        })
    }
    handleOpenClick() {
        // Open the modal logic
        this.props.onOpen();
    }

    handleChange(e) {
        const { alert } = this.state
        const updatedAlert = { ...alert, yValue: Number(e.target.value) }
        console.log('handleChange Modal ', updatedAlert)

        this.setState({
            alert: updatedAlert
        });
    }

    handleSave() {
        this.props.onSave(this.state.alert, this.props.chartId);
        console.log('handleSave Modal ', this.props, this.state)
    }

    render() {
        const { showModal, onClose, onDeleteAlert } = this.props;
        const { alert } = this.state

        if (!showModal) return null
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
                                value={alert.yValue}
                            />
                            <div className="buttons-class">
                                <button id="delete" style={{backgroundColor: 'red', marginLeft: '35px'}} onClick={onDeleteAlert}>
                                    Delete Alert
                                </button>
                                <button id="save" style={{marginRight: '35px'}} onClick={this.handleSave}>
                                    Save Alert
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default ModalWindowOrders