import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AssignmentDetail = () => {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchAssignment();
    }, []);

    const fetchAssignment = async () => {
        const response = await fetch(`http://localhost:8080/api/assignments/${assignmentId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setAssignment(data);
            const userSubmission = data.submissions.find(sub => sub.user.id === myUser.id);
            setSubmission(userSubmission);
        } else {
            console.error("Failed to fetch assignment");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:8080/api/assignments/${assignmentId}/submit`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to submit assignment");
            }
            alert("Assignment submitted successfully!");
            fetchAssignment(); // Refresh the assignment details
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("Failed to submit assignment");
        }
    };

    if (!assignment) return <div>Loading...</div>;

    return (
        <div>
            <h2>{assignment.name}</h2>
            <p>{assignment.description}</p>
            <p>Due: {new Date(assignment.dueDateTime).toLocaleString()}</p>
            {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
            <p>Status: <span style={{ color: getStatusColor(getStatus(assignment)) }}>{getStatus(assignment)}</span></p>
            {submission && (
                <div>
                    <p>Submission Time: {new Date(submission.submissionTime).toLocaleString()}</p>
                    <p>Grade: {submission.grade}</p>
                    <p>Feedback: {submission.feedback}</p>
                </div>
            )}
            {getStatus(assignment) === "Missing" && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>File:</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
};

const getStatus = (assignment) => {
    const submission = assignment.submissions.find(sub => sub.user.id === myUser.id);
    if (!submission) return "Missing";
    if (new Date(submission.submissionTime) > new Date(assignment.dueDateTime)) return "Late";
    return "Submitted";
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

export default AssignmentDetail;
