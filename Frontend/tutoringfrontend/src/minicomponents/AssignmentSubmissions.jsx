import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [grade, setGrade] = useState("");

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
            setSubmissions(data);
        } else {
            console.error("Failed to fetch submissions");
        }
    };

    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleGradeChange = (e) => {
        setGrade(e.target.value);
    };

    const handleProvideFeedback = async (submissionId) => {
        const feedbackData = {
            feedback,
            grade
        };

        try {
            const response = await fetch(`http://localhost:8080/api/assignments/${assignmentId}/submissions/${submissionId}/feedback`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });
            if (response.ok) {
                alert("Feedback provided successfully.");
                fetchSubmissions(); // Refresh submissions
            } else {
                alert("Failed to provide feedback.");
            }
        } catch (error) {
            console.error("Failed to provide feedback", error);
            alert("An error occurred while providing feedback.");
        }
    };

    if (submissions.length === 0) return <div>No submissions yet.</div>;

    return (
        <div>
            <h1>Submissions</h1>
            <ul>
                {submissions.map((submission) => (
                    <li key={submission.id}>
                        {submission.student && (
                            <>
                                <p>{submission.student.username}</p>
                                <p>{new Date(submission.submissionTime).toLocaleString()}</p>
                                <p>Status: {submission.status}</p>
                                {submission.fileUrl && <a href={`http://localhost:8080${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission</a>}
                                <textarea value={feedback} onChange={handleFeedbackChange} placeholder="Enter feedback" />
                                <input type="number" value={grade} onChange={handleGradeChange} placeholder="Enter grade" />
                                <button onClick={() => handleProvideFeedback(submission.id)}>Submit Feedback</button>
                                {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                                {submission.grade && <p>Grade: {submission.grade}</p>}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentSubmissions;
