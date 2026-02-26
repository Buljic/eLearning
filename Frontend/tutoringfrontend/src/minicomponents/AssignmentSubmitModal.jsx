import { useState } from 'react';
import config from '../config.js';
import { notify } from '../utils/notifications.js';

const AssignmentSubmitModal = ({ show, handleClose, assignment }) => {
    const [file, setFile] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!assignment) {
            notify('No assignment selected.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${config.BASE_URL}/api/assignments/${assignment.id}/submit`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to submit assignment');
            }
            notify('Assignment submitted successfully!', 'success');
            handleClose();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            notify('Failed to submit assignment.', 'error');
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal">
            <form onSubmit={handleSubmit}>
                <h2>Submit Assignment: {assignment?.name}</h2>
                <div>
                    <label>File:</label>
                    <input type="file" onChange={(event) => setFile(event.target.files[0])} required />
                </div>
                <button type="submit">Submit</button>
                <button type="button" onClick={handleClose}>
                    Close
                </button>
            </form>
        </div>
    );
};

export default AssignmentSubmitModal;
