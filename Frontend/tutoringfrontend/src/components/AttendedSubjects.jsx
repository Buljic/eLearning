import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Alert, Container, Box, Typography, CircularProgress, List, ListItem, Button } from '@mui/material';
import config from '../config.js';
import { getSessionUser } from '../utils/sessionUser.js';

const AttendedSubjects = () => {
    const myUser = getSessionUser();
    const [attendedGroups, setAttendedGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!myUser?.id) {
            setLoading(false);
            setError('Morate biti prijavljeni.');
            return;
        }

        const getAttendedSubjects = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${config.BASE_URL}/api/getAttendedGroups?userId=${myUser.id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Problem s fetchanjem attended groups');
                }

                const data = await response.json();
                setAttendedGroups(data || []);
            } catch {
                setAttendedGroups([]);
                setError('Neuspjesno ucitavanje kurseva.');
            } finally {
                setLoading(false);
            }
        };

        getAttendedSubjects();
    }, [myUser?.id]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Container>
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Vasi kursevi</Typography>
                {attendedGroups.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Trenutno nemate aktivnih kurseva.
                    </Alert>
                )}
                <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {attendedGroups.map((group, index) => (
                        <ListItem key={index} sx={{ width: '100%', maxWidth: 600 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to={`/group/${group.group_id}`}
                                fullWidth
                                sx={{ mb: 2, textTransform: 'none' }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    {group.group_name}
                                </Typography>
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Container>
    );
};

export default AttendedSubjects;
