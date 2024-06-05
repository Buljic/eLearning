import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from '../config.js';
const SubmissionDetail = () => {
    const { submissionId } = useParams();
    const [submission, setSubmission] = useState(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        fetchSubmission();
    }, []);

    const fetchSubmission = async () => {
        const response = await fetch(`http://localhost:8080/api/submissions/${submissionId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setSubmission(data);
            setGrade(data.grade);
            setFeedback(data.feedback);
        } else {
            console.error("Failed to fetch submission");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionData = {
            grade,
            feedback,
        };

        try {
            const response = await fetch(`http://localhost:8080/api/submissions/${submissionId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to update submission");
            }
            alert("Submission updated successfully!");
            fetchSubmission(); // Refresh the submission details
        } catch (error) {
            console.error("Error updating submission:", error);
            alert("Failed to update submission");
        }
    };

    if (!submission) return <div>Loading...</div>;

    return (
        <div>
            <h2>Submission by: {submission.user.username}</h2>
            <p>Submission Time: {new Date(submission.submissionTime).toLocaleString()}</p>
            <p>Status: <span style={{ color: getStatusColor(submission.status) }}>{submission.status}</span></p>
            <div>
                <a href={`http://localhost:8080${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission File</a>
            </div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Grade:</label>
                    <input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Feedback:</label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Update Submission</button>
            </form>
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

export default SubmissionDetail;
