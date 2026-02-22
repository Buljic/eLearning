import { useState } from 'react';
import useFetchUser from "../customHooks/useFetchUser.js";
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, List, ListItem } from '@mui/material';
import config from '../config.js';

const RequestSubjectAsTutor = () => {
    const { error, loading } = useFetchUser();
    const [inputSubject, setInputSubject] = useState('');
    const [comment, setComment] = useState('');
    const [writtenQualifications, setWrittenQualifications] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const { subjects, error2, loading2 } = useFetchSubjects();

    if (loading || loading2) {
        return <CircularProgress />;
    }

    if (error || error2) {
        return <Alert severity="error">Došlo je do greške: {error?.message || error2?.message}</Alert>;
    }

    const handleFormInput = async (event) => {
        event.preventDefault();

        try {
            console.log({ inputSubject, writtenQualifications, comment });
            const requestBody = JSON.stringify({ inputSubject, writtenQualifications, comment });
            console.log(requestBody);
            const response = await fetch(`${config.BASE_URL}/api/registerForSubjectAsTutor`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });
            if (!response.ok) {
                console.log("Neka greška u slanju ZAHTJEVA ZA SUBJECTOM");
                throw new Error("REGISTER FOR SUBJECT ERROR");
            } else {
                alert("Uspješno postavljeno");
            }
        } catch (error) {
            console.log("Greška sa" + error);
        }
    };

    const filteredSubjects = inputSubject && typeof inputSubject === 'string'
        ? subjects.filter(tempSubject => tempSubject.toLowerCase().includes(inputSubject.toLowerCase()))
        : [];

    const handleSuggestionClick = (clickedSubject) => {
        console.log("Pritisnuo si" + clickedSubject);
        setInputSubject(clickedSubject);
        setIsSearching(false);
    }

    const handleSearchChange = (event) => {
        setInputSubject(event.target.value || '');
        setIsSearching(true);
    }

    return (
        <Container>
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h4" gutterBottom>
                    REGISTRACIJA ZA PREDMETE
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Zatraži predmete za kvalifikaciju
                </Typography>
                <Box component="form" onSubmit={handleFormInput} sx={{ mt: 3 }}>
                    <TextField
                        id="subjectInputField"
                        label="Subject"
                        fullWidth
                        value={inputSubject}
                        onChange={handleSearchChange}
                        onFocus={() => inputSubject && setIsSearching(true)}
                        margin="normal"
                    />
                    {isSearching && inputSubject && (
                        <List id="suggestion">
                            {filteredSubjects.map((tSubject, index) => (
                                <ListItem key={index}>
                                    <Button onClick={() => handleSuggestionClick(tSubject)}>
                                        {tSubject}
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                    <TextField
                        id="textQualificationField"
                        label="Unesi svoje kvalifikacije"
                        fullWidth
                        value={writtenQualifications}
                        onChange={(e) => setWrittenQualifications(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        id="extraInformationField"
                        label="Unesi dodatne informacije"
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        margin="normal"
                    />
                    <Button id="subjectRequestSubmit" type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default RequestSubjectAsTutor;
