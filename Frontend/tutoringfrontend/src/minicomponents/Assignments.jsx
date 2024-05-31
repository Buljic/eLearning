import React, { useState, useEffect } from "react";
import AssignmentCreateModal from "./AssignmentCreateModal.jsx";


const Assignments = ({ groupId }) => {
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const fetchAssignments = async () => {
        const response = await fetch(`http://localhost:8080/api/${groupId}/assignments`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setAssignments(data || []);
        } else {
            console.error("Failed to fetch assignments");
        }
    };

    const handleCreateAssignment = () => {
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        fetchAssignments(); // Refresh assignments after creating a new one
    };

    return (
        <div>
            <h2>Zadaci</h2>
            <button onClick={handleCreateAssignment}>Novi zadatak</button>
            <AssignmentCreateModal show={showCreateModal} handleClose={handleCloseCreateModal} groupId={groupId} />
            <ul>
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <li key={assignment.id}>
                            <h3>{assignment.name}</h3>
                            <p>{assignment.description}</p>
                            <p>Due Date: {assignment.dueDate}</p>
                            <p>Points: {assignment.points}</p>
                            {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                        </li>
                    ))
                ) : (
                    <p>No assignments available.</p>
                )}
            </ul>
        </div>
    );
};

export default Assignments;

