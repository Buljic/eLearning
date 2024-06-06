import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from '../config.js';
const AssignmentDetail = () => {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [status, setStatus] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    useEffect(() => {
        fetchAssignment();
    }, []);

    const fetchAssignment = async () => {
        const response = await fetch(`${config.BASE_URL}/api/assignments/${assignmentId}/withSubmissions`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setAssignment(data);
            setStatus(getStatus(data));
            console.log("Fetched assignment:", data);
        } else {
            console.error("Failed to fetch assignment");
        }
    };

    const getStatus = (assignment) => {
        if (!assignment.submissions || assignment.submissions.length === 0) return "Missing";
        const submission = assignment.submissions.find(sub => sub.student.id === myUser.id);
        if (!submission) return "Missing";
        if (new Date(submission.submissionTime) > new Date(assignment.dueDateTime)) return "Late";
        return "Submitted";
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert("Please select a file to submit.");
            return;
        }

        if (status === "Submitted" || status === "Late") {
            alert("Assignment has already been submitted or is late.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch(`${config.BASE_URL}/api/assignments/${assignmentId}/submit`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (response.ok) {
                alert("Assignment submitted successfully.");
                fetchAssignment(); // Refresh assignment details
            } else {
                alert("Failed to submit assignment.");
            }
        } catch (error) {
            console.error("Failed to submit assignment", error);
            alert("An error occurred while submitting the assignment.");
        }
    };

    if (!assignment) return <div>Loading...</div>;

    const submission = assignment.submissions ? assignment.submissions.find(sub => sub.student.id === myUser.id) : null;
    const feedback = submission ? submission.feedback : "No feedback yet.";
    const grade = submission ? submission.grade : "No grade yet.";

    return (
        <div>
            <h1>{assignment.name}</h1>
            <p>{assignment.description}</p>
            <p>Due: {new Date(assignment.dueDateTime).toLocaleString()}</p>
            {assignment.imageUrl && <img src={`${config.BASE_URL}${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
            <p>Status: <span style={{ color: getStatusColor(status) }}>{status}</span></p>
            {status === "Missing" && (
                <div>
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleSubmit}>Submit Assignment</button>
                </div>
            )}
            {status !== "Missing" && (
                <div>
                    <h2>Feedback</h2>
                    <p>{feedback}</p>
                    <p>Grade: {grade}</p>
                </div>
            )}
            {myUser.accountType !== "STUDENT" && assignment.submissions && assignment.submissions.length > 0 && (
                <div>
                    <h2>Submissions</h2>
                    <ul>
                        {assignment.submissions.map((submission) => (
                            <li key={submission.id}>
                                <p>{submission.student.username}</p>
                                <p>{new Date(submission.submissionTime).toLocaleString()}</p>
                                <p>Status: {submission.status}</p>
                                {submission.fileUrl && <a href={`${config.BASE_URL}${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission</a>}
                                {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                                {submission.grade && <p>Grade: {submission.grade}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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

export default AssignmentDetail;
