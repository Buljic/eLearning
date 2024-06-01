import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AssignmentCreateModal from "./AssignmentCreateModal";

const AssignmentList = ({ isProfessor }) => {
    const { groupId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

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

    const getStatus = (assignment) => {
        if (!assignment.submissions) return "Missing";
        const submission = assignment.submissions.find(sub => sub.user.id === myUser.id);
        if (!submission) return "Missing";
        if (new Date(submission.submissionTime) > new Date(assignment.dueDateTime)) return "Late";
        return "Submitted";
    };

    return (
        <div>
            <h1>Assignments</h1>
            {isProfessor && (
                <button onClick={() => setShowCreateModal(true)}>Create New Assignment</button>
            )}
            <AssignmentCreateModal show={showCreateModal} handleClose={() => setShowCreateModal(false)} groupId={groupId} />
            <ul>
                {assignments.map((assignment) => (
                    <li key={assignment.id}>
                        <h2>{assignment.name}</h2>
                        <p>{assignment.description}</p>
                        <p>Due: {new Date(assignment.dueDateTime).toLocaleString()}</p>
                        {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                        {!isProfessor && (
                            <p>Status: <span style={{ color: getStatusColor(getStatus(assignment)) }}>{getStatus(assignment)}</span></p>
                        )}
                        {isProfessor ? (
                            <Link to={`/assignments/${assignment.id}/submissions`}>
                                <button>View Submissions</button>
                            </Link>
                        ) : (
                            <Link to={`/assignments/${assignment.id}`}>
                                <button>View Assignment</button>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case "Missing":
            return "red";
        case "Submitted":
            return "green";
        case "Late":
            return "orange";
        default:
            return "black";
    }
};

export default AssignmentList;
