import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Paper, Snackbar, Stack, Typography } from '@mui/material';
import config from '../config.js';
import { canActAsStudent } from '../utils/userRoles.js';
import { getSessionUser } from '../utils/sessionUser.js';

const GroupDetails = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState('');
    const [requestStatus, setRequestStatus] = useState({ open: false, message: '', severity: 'success' });
    const myUser = getSessionUser();

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/groups/${groupId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Neuspjesno ucitavanje detalja grupe.');
                }
                const data = await response.json();
                setGroup(data);
            } catch (fetchError) {
                console.error('Error fetching group details:', fetchError);
                setError(fetchError.message || 'Neuspjesno ucitavanje detalja grupe.');
            }
        };
        fetchGroupDetails();
    }, [groupId]);

    const handleRequestAccess = async () => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/groups/${groupId}/request-access`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Neuspjesno slanje zahtjeva.');
            }
            setRequestStatus({ open: true, message: 'Zahtjev za pristup je uspjesno poslan.', severity: 'success' });
        } catch (requestError) {
            console.error('Error requesting access:', requestError);
            setRequestStatus({
                open: true,
                message: requestError.message || 'Neuspjesno slanje zahtjeva za pristup.',
                severity: 'error',
            });
        }
    };

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!group) {
        return <CircularProgress />;
    }

    const canRequestAccess = canActAsStudent(myUser) && new Date(group.startDate) > new Date();

    return (
        <Container>
            <Paper sx={{ my: 4, p: 3, borderRadius: 3 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    {group.group_name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {group.description || 'Bez opisa.'}
                </Typography>
                <Stack spacing={0.75}>
                    <Typography variant="body2">Start Date: {group.startDate}</Typography>
                    <Typography variant="body2">End Date: {group.endDate}</Typography>
                    <Typography variant="body2">Hours per Week: {group.hoursPerWeek}</Typography>
                    <Typography variant="body2">Price: {group.price} BAM</Typography>
                    <Typography variant="body2">Max Students: {group.maxStudents}</Typography>
                    <Typography variant="body2">Topic: {group.topic}</Typography>
                </Stack>

                {canRequestAccess && (
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleRequestAccess}>
                            Request Access
                        </Button>
                    </Box>
                )}

                {!myUser && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Prijavite se kako biste mogli slati zahtjev za pristup grupi.
                    </Alert>
                )}
            </Paper>

            <Snackbar
                open={requestStatus.open}
                autoHideDuration={4000}
                onClose={() => setRequestStatus((prev) => ({ ...prev, open: false }))}
            >
                <Alert severity={requestStatus.severity} onClose={() => setRequestStatus((prev) => ({ ...prev, open: false }))}>
                    {requestStatus.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default GroupDetails;
