import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AssignmentCreateModal from "./AssignmentCreateModal";
import config from '../config.js';
import { Container, Box, Typography, Button, List, ListItem, CircularProgress, Card, CardContent, Alert } from '@mui/material';
import { getSessionUser } from "../utils/sessionUser.js";

const AssignmentList = ({ isProfessor, groupId }) => {
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const myUser = useMemo(() => getSessionUser(), []);

    useEffect(() => {
        fetchAssignments();
    }, [groupId]);

    const fetchAssignments = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${config.BASE_URL}/api/${groupId}/assignments`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                setError("Neuspjesno ucitavanje zadataka.");
                setAssignments([]);
                return;
            }
            const data = await response.json();
            setAssignments(data || []);
        } catch (e) {
            setError("Greska prilikom ucitavanja zadataka.");
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (assignment) => {
        if (!myUser?.id || !assignment.submissions) return "Missing";
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
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : assignments.length === 0 ? (
                    <Alert severity="info">Trenutno nema zadataka za ovu grupu.</Alert>
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
