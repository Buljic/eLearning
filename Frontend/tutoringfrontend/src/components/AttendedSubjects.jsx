import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
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
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #d8e3ef', textAlign: 'center', mb: 3 }}>
                <MenuBookIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>Vasi kursevi</Typography>
                <Typography color="text.secondary">
                    Pregledajte grupe kojima prisustvujete
                </Typography>
            </Paper>

            {attendedGroups.length === 0 && (
                <Alert severity="info">
                    Trenutno nemate aktivnih kurseva.
                </Alert>
            )}

            <Grid container spacing={2}>
                {attendedGroups.map((group, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': { boxShadow: '0 6px 24px rgba(13,91,203,0.14)', borderColor: 'primary.main' },
                            }}
                        >
                            <CardActionArea component={Link} to={`/group/${group.group_id}`}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            <GroupsIcon />
                                        </Avatar>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            {group.group_name}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default AttendedSubjects;
