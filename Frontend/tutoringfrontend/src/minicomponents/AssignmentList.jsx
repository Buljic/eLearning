import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AssignmentCreateModal from "./AssignmentCreateModal";

const AssignmentList = ({ isProfessor }) => {
    const { groupId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [showModal, setShowModal] = useState(false);

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
            setAssignments([]);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchAssignments(); // Refresh the list after creating a new assignment
    };

    return (
        <div>
            <h1>Assignments</h1>
            {isProfessor && (
                <button onClick={handleOpenModal}>Create New Assignment</button>
            )}
            <AssignmentCreateModal show={showModal} handleClose={handleCloseModal} groupId={groupId} />
            <ul>
                {assignments.map((assignment) => (
                    <li key={assignment.id}>
                        <h2>{assignment.name}</h2>
                        <p>{assignment.description}</p>
                        <p>Due: {new Date(assignment.dueDateTime).toLocaleString()}</p>
                        {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                        {isProfessor && (
                            <Link to={`/assignments/${assignment.id}/submissions`}>
                                <button>View Submissions</button>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentList;
