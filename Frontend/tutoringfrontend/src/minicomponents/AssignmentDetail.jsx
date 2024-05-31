import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentDetail = ({ assignment }) => {
    const [file, setFile] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        const response = await fetch(`http://localhost:8080/api/assignments/${assignment.id}/submissions`, {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        try {
            await axios.post(`http://localhost:8080/api/assignments/${assignment.id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            fetchSubmissions();
        } catch (error) {
            console.error('Failed to submit assignment', error);
        }
    };

    return (
        <div>
            <h3>{assignment.name}</h3>
            <p>{assignment.description}</p>
            <p>Due Date: {assignment.dueDate}</p>
            <p>Points: {assignment.points}</p>
            {assignment.imageUrl && <img src={`http://localhost:8080${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
            <form onSubmit={handleSubmit}>
                <label>
                    Submit your work:
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                </label>
                <button type="submit">Submit</button>
            </form>
            <h4>Submissions:</h4>
            <ul>
                {submissions.length > 0 ? (
                    submissions.map((submission) => (
                        <li key={submission.id}>
                            <a href={`http://localhost:8080${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission</a>
                            <p>Feedback: {submission.feedback}</p>
                            <p>Grade: {submission.grade}</p>
                        </li>
                    ))
                ) : (
                    <p>No submissions yet.</p>
                )}
            </ul>
        </div>
    );
};

export default AssignmentDetail;
