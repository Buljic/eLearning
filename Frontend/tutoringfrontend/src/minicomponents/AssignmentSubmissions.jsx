import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const AssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        const response = await fetch(`http://localhost:8080/api/assignments/${assignmentId}/submissions`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setSubmissions(data || []);
        } else {
            console.error("Failed to fetch submissions");
        }
    };

    return (
        <div>
            <h1>Submissions for Assignment {assignmentId}</h1>
            <ul>
                {submissions.map((submission) => (
                    <li key={submission.id}>
                        <p>Submitted by: {submission.user.username}</p>
                        <p>Submission Time: {new Date(submission.submissionTime).toLocaleString()}</p>
                        <p>Status: <span style={{ color: getStatusColor(submission.status) }}>{submission.status}</span></p>
                        <Link to={`/assignments/${assignmentId}/submissions/${submission.id}`}>
                            <button>View Submission</button>
                        </Link>
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

export default AssignmentSubmissions;
