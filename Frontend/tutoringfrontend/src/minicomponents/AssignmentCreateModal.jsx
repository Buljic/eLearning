import React, { useState } from 'react';
import axios from 'axios';

const AssignmentCreateModal = ({ show, handleClose, groupId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState(0);
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('assignment', JSON.stringify({
            name,
            description,
            dueDate,
            points: parseInt(points), // Ensure points is sent as an integer
            group: { id: groupId } // Ensure groupId is included in the assignment
        }));
        if (file) {
            formData.append('file', file);
        }
        try {
            await axios.post(`http://localhost:8080/api/assignments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            handleClose();
        } catch (error) {
            console.error('Failed to create assignment', error);
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={handleClose}>&times;</span>
                <h2>Create Assignment</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <label>
                        Description:
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </label>
                    <label>
                        Due Date:
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                    </label>
                    <label>
                        Points:
                        <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} required />
                    </label>
                    <label>
                        Image:
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    <button type="submit">Create</button>
                </form>
            </div>
        </div>
    );
};

export default AssignmentCreateModal;
