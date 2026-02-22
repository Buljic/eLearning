import { useState, useEffect, useMemo } from 'react';
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import config from '../config.js';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Container, Box, Alert } from '@mui/material';
import { Navigate } from "react-router-dom";

const CreateGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [topic, setTopic] = useState('');
    const [chosenSubjects, setChosenSubjects] = useState(['']);
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hoursPerWeek, setHoursPerWeek] = useState(0);
    const [price, setPrice] = useState(0);
    const { subjects } = useFetchSubjects();
    const [maxStudents, setMaxStudents] = useState(0);
    const [formError, setFormError] = useState('');
    const myUser = useMemo(() => JSON.parse(sessionStorage.getItem('myUser')), []);
    const tutorId = myUser?.id;

    useEffect(() => {
        const today = new Date();
        const minStartDate = new Date();
        minStartDate.setDate(today.getDate() + 7);

        const minEndDate = new Date(minStartDate);
        minEndDate.setDate(minStartDate.getDate() + 7);

        setStartDate(minStartDate.toISOString().split('T')[0]);
        setEndDate(minEndDate.toISOString().split('T')[0]);
    }, []);

    if (!tutorId) {
        return <Navigate to="/login" replace />;
    }

    const handleAddSubject = () => {
        if (chosenSubjects.length < 5) {
            setChosenSubjects([...chosenSubjects, '']);
        }
    };

    const handleRemoveSubject = (index) => {
        const newChosenSubjects = chosenSubjects.filter((_, i) => i !== index);
        setChosenSubjects(newChosenSubjects);
    };

    const handleSubjectChange = (index, value) => {
        const newChosenSubjects = [...chosenSubjects];
        if (newChosenSubjects.includes(value)) {
            alert('Ne možete dodati isti predmet više puta.');
            return;
        }
        newChosenSubjects[index] = value;
        setChosenSubjects(newChosenSubjects);
    };

    const isFormValid = () => {
        if (groupName.length < 3) {
            setFormError('Naziv grupe mora imati najmanje 3 slova.');
            return false;
        }
        if (topic.length < 4) {
            setFormError('Topic mora imati najmanje 4 slova.');
            return false;
        }
        if (chosenSubjects.some(subject => subject === '')) {
            setFormError('Sva polja za predmete moraju biti popunjena.');
            return false;
        }
        if (description.length === 0) {
            setFormError('Opis mora biti popunjen.');
            return false;
        }
        if (!startDate) {
            setFormError('Datum početka mora biti izabran.');
            return false;
        }
        if (!endDate) {
            setFormError('Datum završetka mora biti izabran.');
            return false;
        }
        if (new Date(endDate) < new Date(startDate)) {
            setFormError('Datum završetka mora biti nakon datuma početka.');
            return false;
        }
        if (new Date(endDate) < new Date(startDate).setDate(new Date(startDate).getDate() + 7)) {
            setFormError('Datum završetka mora biti najmanje 7 dana nakon datuma početka.');
            return false;
        }
        if (hoursPerWeek <= 0) {
            setFormError('Sati po sedmici moraju biti veći od 0.');
            return false;
        }
        if (price <= 0) {
            setFormError('Cijena mora biti veća od 0.');
            return false;
        }
        if (maxStudents <= 0) {
            setFormError('Maksimalan broj studenata mora biti veći od 0.');
            return false;
        }
        setFormError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            return;
        }

        const groupData = {
            groupName,
            topic,
            chosenSubjects,
            description,
            startDate,
            endDate,
            hoursPerWeek,
            price,
            tutorId,
            maxStudents
        };

        try {
            const response = await fetch(`${config.BASE_URL}/api/createGroup`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groupData),
            });
            if (!response.ok) {
                throw new Error('Problem s fetchom');
            }
            alert('Grupa uspješno kreirana!');
        } catch (error) {
            console.error("Greška pri kreiranju grupe", error);
            alert('Došlo je do greške prilikom kreiranja grupe.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Naziv Grupe"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength="31"
                    required
                    error={groupName.length < 3}
                    helperText={groupName.length < 3 ? 'Naziv grupe mora imati najmanje 3 slova.' : ''}
                />
                <TextField
                    label="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    maxLength="31"
                    required
                    error={topic.length < 4}
                    helperText={topic.length < 4 ? 'Topic mora imati najmanje 4 slova.' : ''}
                />
                <Typography variant="h6">Predmeti:</Typography>
                {chosenSubjects.map((subject, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl sx={{ flexGrow: 1 }}>
                            <InputLabel>Predmet</InputLabel>
                            <Select
                                value={subject}
                                onChange={(e) => handleSubjectChange(index, e.target.value)}
                                required
                            >
                                <MenuItem value="">Izaberi predmet</MenuItem>
                                {subjects.map((sub) => (
                                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {chosenSubjects.length > 1 && (
                            <Button type="button" onClick={() => handleRemoveSubject(index)}>Ukloni</Button>
                        )}
                    </Box>
                ))}
                {chosenSubjects.length < 5 && (
                    <Button type="button" onClick={handleAddSubject}>Dodaj Predmet</Button>
                )}
                <TextField
                    label="Opis"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={4}
                    maxLength="255"
                    required
                    error={description.length === 0}
                    helperText={description.length === 0 ? 'Opis mora biti popunjen.' : ''}
                />
                <TextField
                    label="Datum Početka"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <TextField
                    label="Datum Završetka"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <TextField
                    label="Maksimalan broj studenata"
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Math.max(0, e.target.value))}
                    required
                    error={maxStudents <= 0}
                    helperText={maxStudents <= 0 ? 'Maksimalan broj studenata mora biti veći od 0.' : ''}
                />
                <TextField
                    label="Cijena (BAM)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, e.target.value))}
                    required
                    error={price <= 0}
                    helperText={price <= 0 ? 'Cijena mora biti veća od 0.' : ''}
                />
                <TextField
                    label="Sati po Sedmici"
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Math.max(0, e.target.value))}
                    required
                    error={hoursPerWeek <= 0}
                    helperText={hoursPerWeek <= 0 ? 'Sati po sedmici moraju biti veći od 0.' : ''}
                />
                {formError && <Alert severity="error">{formError}</Alert>}
                <Button type="submit" variant="contained" color="primary">Kreiraj Grupu</Button>
            </Box>
        </Container>
    );
};

export default CreateGroup;
