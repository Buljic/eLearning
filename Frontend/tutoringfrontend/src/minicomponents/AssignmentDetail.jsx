import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from '../config.js';
import { Container, Box, Typography, Button, CircularProgress, Alert, Card, CardContent, List, ListItem } from '@mui/material';

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

    if (!assignment) return <CircularProgress />;

    const submission = assignment.submissions ? assignment.submissions.find(sub => sub.student.id === myUser.id) : null;
    const feedback = submission ? submission.feedback : "No feedback yet.";
    const grade = submission ? submission.grade : "No grade yet.";

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">{assignment.name}</Typography>
                <Typography variant="body1">{assignment.description}</Typography>
                <Typography variant="body1">Due: {new Date(assignment.dueDateTime).toLocaleString()}</Typography>
                {assignment.imageUrl && <img src={`${config.BASE_URL}${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                <Typography variant="body1">Status: <span style={{ color: getStatusColor(status) }}>{status}</span></Typography>
                {status === "Missing" && (
                    <Box>
                        <input type="file" onChange={handleFileChange} />
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Submit Assignment</Button>
                    </Box>
                )}
                {status !== "Missing" && (
                    <Box>
                        <Typography variant="h6">Feedback</Typography>
                        <Typography variant="body1">{feedback}</Typography>
                        <Typography variant="body1">Grade: {grade}</Typography>
                    </Box>
                )}
                {myUser.accountType !== "STUDENT" && assignment.submissions && assignment.submissions.length > 0 && (
                    <Box>
                        <Typography variant="h6">Submissions</Typography>
                        <List>
                            {assignment.submissions.map((submission) => (
                                <ListItem key={submission.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="body2">{submission.student.username}</Typography>
                                            <Typography variant="body2">{new Date(submission.submissionTime).toLocaleString()}</Typography>
                                            <Typography variant="body2">Status: {submission.status}</Typography>
                                            {submission.fileUrl && <Button href={`${config.BASE_URL}${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission</Button>}
                                            {submission.feedback && <Typography variant="body2">Feedback: {submission.feedback}</Typography>}
                                            {submission.grade && <Typography variant="body2">Grade: {submission.grade}</Typography>}
                                        </CardContent>
                                    </Card>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </Container>
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