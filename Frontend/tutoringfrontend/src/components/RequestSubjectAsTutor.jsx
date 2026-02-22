import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, List, ListItem, TextField, Typography } from '@mui/material';
import useFetchSubjects from '../customHooks/useFetchSubjects.js';
import useFetchUser from '../customHooks/useFetchUser.js';
import config from '../config.js';
import { notify } from '../utils/notifications.js';

const RequestSubjectAsTutor = () => {
    const { error, loading } = useFetchUser();
    const { subjects, error: subjectsError, loading: subjectsLoading } = useFetchSubjects();

    const [inputSubject, setInputSubject] = useState('');
    const [comment, setComment] = useState('');
    const [writtenQualifications, setWrittenQualifications] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    if (loading || subjectsLoading) {
        return <CircularProgress />;
    }

    if (error || subjectsError) {
        return <Alert severity="error">Doslo je do greske: {error?.message || subjectsError?.message}</Alert>;
    }

    const handleFormInput = async (event) => {
        event.preventDefault();
        try {
            const requestBody = JSON.stringify({ inputSubject, writtenQualifications, comment });
            const response = await fetch(`${config.BASE_URL}/api/registerForSubjectAsTutor`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                throw new Error('Greska pri slanju zahtjeva.');
            }
            notify('Uspjesno postavljen zahtjev.', 'success');
            setComment('');
            setWrittenQualifications('');
        } catch (requestError) {
            console.error('Request subject as tutor failed:', requestError);
            notify('Doslo je do greske prilikom slanja zahtjeva.', 'error');
        }
    };

    const filteredSubjects =
        inputSubject && typeof inputSubject === 'string'
            ? subjects.filter((subject) => subject.toLowerCase().includes(inputSubject.toLowerCase()))
            : [];

    const handleSuggestionClick = (clickedSubject) => {
        setInputSubject(clickedSubject);
        setIsSearching(false);
    };

    const handleSearchChange = (event) => {
        setInputSubject(event.target.value || '');
        setIsSearching(true);
    };

    return (
        <Container>
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Registracija za predmete
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Zatrazite predmete za kvalifikaciju
                </Typography>
                <Box component="form" onSubmit={handleFormInput} sx={{ mt: 3 }}>
                    <TextField
                        id="subjectInputField"
                        label="Predmet"
                        fullWidth
                        value={inputSubject}
                        onChange={handleSearchChange}
                        onFocus={() => inputSubject && setIsSearching(true)}
                        margin="normal"
                    />
                    {isSearching && inputSubject && (
                        <List id="suggestion">
                            {filteredSubjects.map((subject, index) => (
                                <ListItem key={`${subject}-${index}`}>
                                    <Button onClick={() => handleSuggestionClick(subject)}>{subject}</Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                    <TextField
                        id="textQualificationField"
                        label="Unesite svoje kvalifikacije"
                        fullWidth
                        value={writtenQualifications}
                        onChange={(event) => setWrittenQualifications(event.target.value)}
                        margin="normal"
                    />
                    <TextField
                        id="extraInformationField"
                        label="Unesite dodatne informacije"
                        fullWidth
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        margin="normal"
                    />
                    <Button id="subjectRequestSubmit" type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default RequestSubjectAsTutor;
