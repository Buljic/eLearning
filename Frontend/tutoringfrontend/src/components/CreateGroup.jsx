import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, Container, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import useFetchSubjects from '../customHooks/useFetchSubjects.js';
import config from '../config.js';
import { notify } from '../utils/notifications.js';
import { getSessionUser } from '../utils/sessionUser.js';
import { canActAsProfessor } from '../utils/userRoles.js';

const CreateGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [topic, setTopic] = useState('');
    const [chosenSubjects, setChosenSubjects] = useState(['']);
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hoursPerWeek, setHoursPerWeek] = useState(0);
    const [price, setPrice] = useState(0);
    const [maxStudents, setMaxStudents] = useState(0);
    const [formError, setFormError] = useState('');
    const { subjects } = useFetchSubjects();

    const myUser = useMemo(() => getSessionUser(), []);
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
    if (!canActAsProfessor(myUser)) {
        return <Navigate to="/welcome" replace />;
    }

    const handleAddSubject = () => {
        if (chosenSubjects.length < 5) {
            setChosenSubjects((prev) => [...prev, '']);
        }
    };

    const handleRemoveSubject = (index) => {
        const next = chosenSubjects.filter((_, i) => i !== index);
        setChosenSubjects(next.length ? next : ['']);
    };

    const handleSubjectChange = (index, value) => {
        const next = [...chosenSubjects];
        if (next.includes(value)) {
            notify('Ne mozete dodati isti predmet vise puta.', 'warning');
            return;
        }
        next[index] = value;
        setChosenSubjects(next);
    };

    const isFormValid = () => {
        if (groupName.length < 3) return setValidation('Naziv grupe mora imati najmanje 3 slova.');
        if (topic.length < 4) return setValidation('Topic mora imati najmanje 4 slova.');
        if (chosenSubjects.some((subject) => subject === '')) return setValidation('Sva polja za predmete moraju biti popunjena.');
        if (!description.length) return setValidation('Opis mora biti popunjen.');
        if (!startDate) return setValidation('Datum pocetka mora biti izabran.');
        if (!endDate) return setValidation('Datum zavrsetka mora biti izabran.');
        if (new Date(endDate) < new Date(startDate)) return setValidation('Datum zavrsetka mora biti nakon datuma pocetka.');
        if (new Date(endDate) < new Date(startDate).setDate(new Date(startDate).getDate() + 7)) {
            return setValidation('Datum zavrsetka mora biti najmanje 7 dana nakon datuma pocetka.');
        }
        if (hoursPerWeek <= 0) return setValidation('Sati po sedmici moraju biti veci od 0.');
        if (price <= 0) return setValidation('Cijena mora biti veca od 0.');
        if (maxStudents <= 0) return setValidation('Maksimalan broj studenata mora biti veci od 0.');

        setFormError('');
        return true;
    };

    const setValidation = (message) => {
        setFormError(message);
        return false;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
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
            maxStudents,
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
            notify('Grupa uspjesno kreirana!', 'success');
        } catch (error) {
            console.error('Greska pri kreiranju grupe', error);
            notify('Doslo je do greske prilikom kreiranja grupe.', 'error');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Naziv Grupe"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    maxLength="31"
                    required
                    error={groupName.length < 3}
                    helperText={groupName.length < 3 ? 'Naziv grupe mora imati najmanje 3 slova.' : ''}
                />
                <TextField
                    label="Topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
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
                            <Select value={subject} onChange={(event) => handleSubjectChange(index, event.target.value)} required>
                                <MenuItem value="">Izaberi predmet</MenuItem>
                                {subjects.map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {chosenSubjects.length > 1 && (
                            <Button type="button" onClick={() => handleRemoveSubject(index)}>
                                Ukloni
                            </Button>
                        )}
                    </Box>
                ))}
                {chosenSubjects.length < 5 && (
                    <Button type="button" onClick={handleAddSubject}>
                        Dodaj Predmet
                    </Button>
                )}

                <TextField
                    label="Opis"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    multiline
                    rows={4}
                    maxLength="255"
                    required
                    error={description.length === 0}
                    helperText={description.length === 0 ? 'Opis mora biti popunjen.' : ''}
                />
                <TextField label="Datum Pocetka" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} InputLabelProps={{ shrink: true }} required />
                <TextField label="Datum Zavrsetka" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} InputLabelProps={{ shrink: true }} required />
                <TextField
                    label="Maksimalan broj studenata"
                    type="number"
                    value={maxStudents}
                    onChange={(event) => setMaxStudents(Math.max(0, Number(event.target.value)))}
                    required
                    error={maxStudents <= 0}
                    helperText={maxStudents <= 0 ? 'Maksimalan broj studenata mora biti veci od 0.' : ''}
                />
                <TextField
                    label="Cijena (BAM)"
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(Math.max(0, Number(event.target.value)))}
                    required
                    error={price <= 0}
                    helperText={price <= 0 ? 'Cijena mora biti veca od 0.' : ''}
                />
                <TextField
                    label="Sati po Sedmici"
                    type="number"
                    value={hoursPerWeek}
                    onChange={(event) => setHoursPerWeek(Math.max(0, Number(event.target.value)))}
                    required
                    error={hoursPerWeek <= 0}
                    helperText={hoursPerWeek <= 0 ? 'Sati po sedmici moraju biti veci od 0.' : ''}
                />
                {formError && <Alert severity="error">{formError}</Alert>}
                <Button type="submit" variant="contained" color="primary">
                    Kreiraj Grupu
                </Button>
            </Box>
        </Container>
    );
};

export default CreateGroup;
