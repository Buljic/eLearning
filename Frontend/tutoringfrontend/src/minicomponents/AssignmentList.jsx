import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AssignmentCreateModal from "./AssignmentCreateModal";
import config from '../config.js';
import { Container, Box, Typography, Button, List, ListItem, CircularProgress, Card, CardContent } from '@mui/material';

const AssignmentList = ({ isProfessor }) => {
    const { groupId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false); // Definisanje state-a za modal
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        const response = await fetch(`${config.BASE_URL}/api/${groupId}/assignments`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setAssignments(data || []);
            console.log("Fetched assignments:", data);
        } else {
            console.error("Failed to fetch assignments");
            setAssignments([]);
        }
    };

    const getStatus = (assignment) => {
        if (!assignment.submissions) return "Missing";
        const submission = assignment.submissions.find(sub => sub.student.id === myUser.id);
        if (!submission) return "Missing";
        if (new Date(submission.submissionTime) > new Date(assignment.dueDateTime)) return "Late";
        return "Submitted";
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">Assignments</Typography>
                {isProfessor && (
                    <Button variant="contained" color="primary" onClick={() => setShowCreateModal(true)}>Create New Assignment</Button>
                )}
                <AssignmentCreateModal show={showCreateModal} handleClose={() => setShowCreateModal(false)} groupId={groupId} />
                {assignments.length === 0 ? (
                    <CircularProgress />
                ) : (
                    <List>
                        {assignments.map((assignment) => (
                            <ListItem key={assignment.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5">{assignment.name}</Typography>
                                        <Typography variant="body1">{assignment.description}</Typography>
                                        <Typography variant="body1">Due: {new Date(assignment.dueDateTime).toLocaleString()}</Typography>
                                        {assignment.imageUrl && <img src={`${config.BASE_URL}${assignment.imageUrl}`} alt={assignment.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                                        {!isProfessor && (
                                            <Typography variant="body1">Status: <span style={{ color: getStatusColor(getStatus(assignment)) }}>{getStatus(assignment)}</span></Typography>
                                        )}
                                        {isProfessor ? (
                                            <Link to={`/assignments/${assignment.id}/submissions`}>
                                                <Button variant="contained" color="primary">View Submissions</Button>
                                            </Link>
                                        ) : (
                                            <Link to={`/assignments/${assignment.id}`}>
                                                <Button variant="contained" color="primary">View Assignment</Button>
                                            </Link>
                                        )}
                                    </CardContent>
                                </Card>
                            </ListItem>
                        ))}
                    </List>
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

export default AssignmentList;