import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AssignmentCreateModal from "./AssignmentCreateModal";
import AssignmentSubmitModal from "./AssignmentSubmitModal";

const AssignmentList = ({ isProfessor }) => {
    const { groupId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

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

    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        fetchAssignments(); // Refresh the list after creating a new assignment
    };

    const handleOpenSubmitModal = (assignment) => {
        setSelectedAssignment(assignment);
        setShowSubmitModal(true);
    };

    const handleCloseSubmitModal = () => {
        setShowSubmitModal(false);
        setSelectedAssignment(null);
        fetchAssignments(); // Refresh the list after submitting
    };

    return (
        <div>
            <h1>Assignments</h1>
            {isProfessor && (
                <button onClick={handleOpenCreateModal}>Create New Assignment</button>
            )}
            <AssignmentCreateModal show={showCreateModal} handleClose={handleCloseCreateModal} groupId={groupId} />
            <AssignmentSubmitModal show={showSubmitModal} handleClose={handleCloseSubmitModal} assignment={selectedAssignment} />
            <ul>
                {assignments.map((assignment) => (
                    <li key={assignment.id}>
                        <h2>{assignment.name}</h2>
                        <p>{assignment.description}</p>
                        <p>Due: {new Date(assignment.dueDateTime).toLocaleString()}</p>
                        {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                        {isProfessor ? (
                            <Link to={`/assignments/${assignment.id}/submissions`}>
                                <button>View Submissions</button>
                            </Link>
                        ) : (
                            <button onClick={() => handleOpenSubmitModal(assignment)}>Submit Assignment</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentList;
