import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import '../css/subject.css';
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
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Tutori za predmet: {subject}
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {!error && tutors.length === 0 && <Alert severity="info">Nema dostupnih tutora za ovaj predmet.</Alert>}
            {!error && tutors.length > 0 && (
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {tutors.map((tutor) => (
                        <Box
                            component="li"
                            key={tutor.username}
                            id="tutorInfo"
                            sx={{ border: '1px solid #d7e0ea', borderRadius: 2, p: 1.5, mb: 1.5 }}
                        >
                            <Link to={`/userInfoFor/${tutor.username}`}>
                                Tutor: {tutor.name} | Ocjena: {tutor.teaching_grade} | Username: {tutor.username}
                            </Link>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default TutorsForSubject;
