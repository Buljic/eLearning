import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
            setSubmissions([]);
        }
    };

    const handleGradeSubmit = async (submissionId, grade, feedback) => {
        const response = await fetch(`http://localhost:8080/api/assignments/${assignmentId}/submissions/${submissionId}/feedback`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grade, feedback }),
        });
        if (response.ok) {
            alert("Feedback submitted successfully");
            fetchSubmissions();
        } else {
            console.error("Failed to submit feedback");
        }
    };

    return (
        <div>
            <h1>Submissions</h1>
            <ul>
                {submissions.map((submission) => (
                    <li key={submission.id}>
                        <p>Submitted by: {submission.student.username}</p>
                        <a href={`http://localhost:8080${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission</a>
                        <div>
                            <label>Grade:</label>
                            <input type="number" min="0" max="100" defaultValue={submission.grade} onBlur={(e) => handleGradeSubmit(submission.id, e.target.value, submission.feedback)} />
                        </div>
                        <div>
                            <label>Feedback:</label>
                            <textarea defaultValue={submission.feedback} onBlur={(e) => handleGradeSubmit(submission.id, submission.grade, e.target.value)}></textarea>
                        </div>
                        <p>Status: {submission.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentSubmissions;
