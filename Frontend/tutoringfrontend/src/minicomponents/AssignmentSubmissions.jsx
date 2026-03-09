import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import config from '../config.js';
import { Container, Box, Typography, Button, TextField, List, ListItem, Card, CardContent } from '@mui/material';
import { notify } from '../utils/notifications.js';

const AssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [feedbackMap, setFeedbackMap] = useState({});
    const [gradeMap, setGradeMap] = useState({});

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/assignments/${assignmentId}/submissions`, {
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
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        }
    };

    const handleFeedbackChange = (submissionId, value) => {
        setFeedbackMap(prev => ({ ...prev, [submissionId]: value }));
    };

    const handleGradeChange = (submissionId, value) => {
        setGradeMap(prev => ({ ...prev, [submissionId]: value }));
    };

    const handleProvideFeedback = async (submissionId) => {
        const feedbackData = {
            feedback: feedbackMap[submissionId] || "",
            grade: gradeMap[submissionId] || ""
        };

        try {
            const response = await fetch(`${config.BASE_URL}/api/assignments/${assignmentId}/submissions/${submissionId}/feedback`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });
            if (response.ok) {
                notify('Feedback provided successfully.', 'success');
                setFeedbackMap(prev => ({ ...prev, [submissionId]: "" }));
                setGradeMap(prev => ({ ...prev, [submissionId]: "" }));
                fetchSubmissions();
            } else {
                notify('Failed to provide feedback.', 'error');
            }
        } catch (error) {
            console.error("Failed to provide feedback", error);
            notify('An error occurred while providing feedback.', 'error');
        }
    };

    if (submissions.length === 0) return <Typography variant="h6">No submissions yet.</Typography>;

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">Submissions</Typography>
                <List>
                    {submissions.map((submission) => (
                        <ListItem key={submission.id}>
                            <Card sx={{ width: '100%' }}>
                                <CardContent>
                                    {submission.student && (
                                        <>
                                            <Typography variant="h6">{submission.student.username}</Typography>
                                            <Typography variant="body2">{new Date(submission.submissionTime).toLocaleString()}</Typography>
                                            <Typography variant="body2">Status: {submission.status}</Typography>
                                            {submission.fileUrl && <Button href={`${config.BASE_URL}${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">View Submission</Button>}
                                            <TextField
                                                label="Feedback"
                                                multiline
                                                rows={4}
                                                value={feedbackMap[submission.id] || ""}
                                                onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                                                fullWidth
                                                sx={{ my: 2 }}
                                            />
                                            <TextField
                                                label="Grade"
                                                type="number"
                                                value={gradeMap[submission.id] || ""}
                                                onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                                                fullWidth
                                            />
                                            <Button variant="contained" color="primary" onClick={() => handleProvideFeedback(submission.id)} sx={{ mt: 2 }}>Submit Feedback</Button>
                                            {submission.feedback && <Typography variant="body2">Feedback: {submission.feedback}</Typography>}
                                            {submission.grade && <Typography variant="body2">Grade: {submission.grade}</Typography>}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Container>
    );
};

export default AssignmentSubmissions;
