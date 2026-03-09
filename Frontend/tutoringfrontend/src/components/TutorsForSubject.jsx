import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import config from '../config.js';

const TutorsForSubject = () => {
    const { subject } = useParams();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getTutorsForSubject = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${config.BASE_URL}/api/getTutorsFor?subject=${encodeURIComponent(subject)}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    setTutors([]);
                    setError('Neuspjesno ucitavanje tutora za predmet.');
                    return;
                }

                const data = await response.json();
                setTutors(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                console.error('Failed to load tutors:', fetchError);
                setTutors([]);
                setError('Neuspjesno ucitavanje tutora za predmet.');
            } finally {
                setLoading(false);
            }
        };

        getTutorsForSubject();
    }, [subject]);

    if (loading) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #d8e3ef', textAlign: 'center', mb: 3 }}>
                <SchoolIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                    Tutori za predmet
                </Typography>
                <Chip label={subject} color="primary" sx={{ fontSize: '1rem', px: 1 }} />
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!error && tutors.length === 0 && <Alert severity="info">Nema dostupnih tutora za ovaj predmet.</Alert>}

            <Grid container spacing={2}>
                {tutors.map((tutor) => (
                    <Grid item xs={12} sm={6} key={tutor.username}>
                        <Card variant="outlined" sx={{ borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(13,91,203,0.12)' } }}>
                            <CardActionArea component={Link} to={`/userInfoFor/${tutor.username}`}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                                            {tutor.name?.charAt(0)?.toUpperCase() || <PersonIcon />}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {tutor.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                @{tutor.username}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={<StarIcon />}
                                            label={tutor.teaching_grade ?? '-'}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
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

export default TutorsForSubject;
