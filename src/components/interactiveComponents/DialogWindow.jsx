import React, { useState } from 'react'
import {
    Modal,
    Button,
    FormGroup,
    FormLabel,
    FormControl
} from 'react-bootstrap'

import PropTypes from 'prop-types'

const DialogWindow = ({ showModal, onClose, text, onSave, chartId }) => {
    const [localText, setLocalText] = useState(text)

    // useEffect(() => {
    //     setLocalText(text)
    // }, [text])

    const handleChange = (e) => {
        setLocalText(e.target.value)
    }

    const handleSave = () => {
        onSave(localText, chartId)
    }

    return (
        <Modal show={showModal} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Text</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <FormGroup controlId='text'>
                        <FormLabel>Text</FormLabel>
                        <FormControl
                            type='text'
                            value={localText}
                            onChange={handleChange}
                        />
                    </FormGroup>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle='primary' onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

DialogWindow.propTypes = {
    showModal: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    chartId: PropTypes.number.isRequired,
}

export default DialogWindow