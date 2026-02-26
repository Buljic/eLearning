import { useState } from 'react';
import config from '../config.js';
import { notify } from '../utils/notifications.js';

const AssignmentCreateModal = ({ show, handleClose, groupId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDateTime, setDueDateTime] = useState('');
    const [points, setPoints] = useState(0);
    const [file, setFile] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const assignmentData = {
            name,
            description,
            dueDateTime,
            points,
            group_id: groupId,
        };

        const formData = new FormData();
        formData.append('assignment', JSON.stringify(assignmentData));
        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await fetch(`${config.BASE_URL}/api/assignments`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to create assignment');
            }
            notify('Assignment created successfully!', 'success');
            handleClose();
        } catch (error) {
            console.error('Error creating assignment:', error);
            notify('Failed to create assignment.', 'error');
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal">
            <form onSubmit={handleSubmit}>
                <h2>Create Assignment</h2>
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
                </div>
                <div>
                    <label>Due Date and Time:</label>
                    <input type="datetime-local" value={dueDateTime} onChange={(event) => setDueDateTime(event.target.value)} required />
                </div>
                <div>
                    <label>Points:</label>
                    <input type="number" value={points} onChange={(event) => setPoints(Number(event.target.value))} required />
                </div>
                <div>
                    <label>File:</label>
                    <input type="file" onChange={(event) => setFile(event.target.files[0])} />
                </div>
                <button type="submit">Create Assignment</button>
                <button type="button" onClick={handleClose}>
                    Close
                </button>
            </form>
        </div>
    );
};

export default AssignmentCreateModal;
