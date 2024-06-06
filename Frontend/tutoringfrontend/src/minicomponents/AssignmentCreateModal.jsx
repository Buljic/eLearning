import React, { useState } from "react";
import config from '../config.js';
const AssignmentCreateModal = ({ show, handleClose, groupId }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDateTime, setDueDateTime] = useState("");
    const [points, setPoints] = useState(0);
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const assignmentData = {
            name,
            description,
            dueDateTime,
            points,
            group_id: groupId,
        };

        const formData = new FormData();
        formData.append("assignment", JSON.stringify(assignmentData));
        formData.append("file", file);

        try {
            const response = await fetch(`${config.BASE_URL}/api/assignments`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to create assignment");
            }
            alert("Assignment created successfully!");
            handleClose();
        } catch (error) {
            console.error("Error creating assignment:", error);
            alert("Failed to create assignment");
        }
    };

    return (
        show && (
            <div className="modal">
                <form onSubmit={handleSubmit}>
                    <h2>Create Assignment</h2>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Due Date and Time:</label>
                        <input
                            type="datetime-local"
                            value={dueDateTime}
                            onChange={(e) => setDueDateTime(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Points:</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div>
                        <label>File:</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>
                    <button type="submit">Create Assignment</button>
                    <button type="button" onClick={handleClose}>Close</button>
                </form>
            </div>
        )
    );
};

export default AssignmentCreateModal;
