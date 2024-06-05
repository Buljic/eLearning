import React, { useState } from "react";
import config from '../config.js';
const AssignmentSubmitModal = ({ show, handleClose, assignment }) => {
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!assignment) {
            alert("No assignment selected");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:8080/api/assignments/${assignment.id}/submit`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to submit assignment");
            }
            alert("Assignment submitted successfully!");
            handleClose();
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("Failed to submit assignment");
        }
    };

    return (
        show && (
            <div className="modal">
                <form onSubmit={handleSubmit}>
                    <h2>Submit Assignment: {assignment?.name}</h2>
                    <div>
                        <label>File:</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>
                    <button type="submit">Submit</button>
                    <button type="button" onClick={handleClose}>Close</button>
                </form>
            </div>
        )
    );
};

export default AssignmentSubmitModal;
