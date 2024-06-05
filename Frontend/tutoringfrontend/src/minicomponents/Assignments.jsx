import React, { useState, useEffect } from "react";
import AssignmentCreateModal from "./AssignmentCreateModal";
import config from '../config.js';
const Assignments = ({ groupId, onSelectAssignment }) => {
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    useEffect(() => {
        fetchAssignments();
    }, []);

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

    const getStatusStyle = (status) => {
        switch (status) {
            case "MISSING":
                return { color: "red" };
            case "SUBMITTED":
                return { color: "green" };
            case "LATE":
                return { color: "yellow" };
            default:
                return {};
        }
    };

    return (
        <div>
            <h2>Zadaci</h2>
            {myUser.accountType === 'PROFESOR' && (
                <button onClick={handleCreateAssignment}>Novi zadatak</button>
            )}
            <AssignmentCreateModal show={showCreateModal} handleClose={handleCloseCreateModal} groupId={groupId} />
            <ul>
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <li key={assignment.id} onClick={() => onSelectAssignment(assignment)}>
                            <h3>{assignment.name}</h3>
                            <p>{assignment.description}</p>
                            <p>Due Date: {assignment.dueDateTime}</p>
                            <p>Points: {assignment.points}</p>
                            {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                            {assignment.submissions && assignment.submissions.length > 0 && assignment.submissions.map((submission) => (
                                <div key={submission.id} style={getStatusStyle(submission.status)}>
                                    <p>Status: {submission.status}</p>
                                </div>
                            ))}
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
