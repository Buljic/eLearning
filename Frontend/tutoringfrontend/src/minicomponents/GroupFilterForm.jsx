import { useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import useFetchSubjects from '../customHooks/useFetchSubjects.js';

const GroupFilterForm = ({ filters, onFilterChange, onSubmit }) => {
    const [subjects, setSubjects] = useState(['']);
    const { subjects: allSubjects, loading: subjectsLoading } = useFetchSubjects();

    useEffect(() => {
        onFilterChange({
            ...filters,
            subjects: subjects.length === 1 && subjects[0] === '' ? [] : subjects,
        });
    }, [subjects]);

    const handleAddSubject = () => {
        if (subjects.length < 5) {
            setSubjects((prev) => [...prev, '']);
        }
    };

    const handleRemoveSubject = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects.length ? newSubjects : ['']);
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const handleChange = (event) => {
        onFilterChange({ ...filters, [event.target.name]: event.target.value });
    };

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', maxHeight: 'calc(100vh - 20px)', overflow: 'auto' }}>
            <TextField label="Naziv Grupe" name="group_name" value={filters.group_name} onChange={handleChange} placeholder="Pretrazi po nazivu grupe" fullWidth />
            <TextField label="Topic" name="topic" value={filters.topic} onChange={handleChange} placeholder="Pretrazi po topicu" fullWidth />

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Datum Pocetka (Od)" type="date" name="start_date_from" value={filters.start_date_from} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label="Datum Pocetka (Do)" type="date" name="start_date_to" value={filters.start_date_to} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Datum Zavrsetka (Od)" type="date" name="end_date_from" value={filters.end_date_from} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label="Datum Zavrsetka (Do)" type="date" name="end_date_to" value={filters.end_date_to} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Sati po Sedmici (Od)" type="number" name="hours_per_week_from" value={filters.hours_per_week_from} onChange={handleChange} fullWidth />
                <TextField label="Sati po Sedmici (Do)" type="number" name="hours_per_week_to" value={filters.hours_per_week_to} onChange={handleChange} fullWidth />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Cijena (Od)" type="number" name="price_from" value={filters.price_from} onChange={handleChange} fullWidth />
                <TextField label="Cijena (Do)" type="number" name="price_to" value={filters.price_to} onChange={handleChange} fullWidth />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Maksimalan broj studenata (Od)" type="number" name="max_students_from" value={filters.max_students_from} onChange={handleChange} fullWidth />
                <TextField label="Maksimalan broj studenata (Do)" type="number" name="max_students_to" value={filters.max_students_to} onChange={handleChange} fullWidth />
            </Box>

            <Typography variant="h6">Predmeti</Typography>
            {subjects.map((subject, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl sx={{ flexGrow: 1 }}>
                        <InputLabel>Predmet</InputLabel>
                        <Select value={subject} onChange={(event) => handleSubjectChange(index, event.target.value)}>
                            <MenuItem value="">Izaberi predmet</MenuItem>
                            {allSubjects.map((item) => (
                                <MenuItem key={item} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {subjects.length > 1 && (
                        <Button type="button" onClick={() => handleRemoveSubject(index)}>
                            Ukloni
                        </Button>
                    )}
                </Box>
            ))}

            {subjects.length < 5 && (
                <Button type="button" onClick={handleAddSubject}>
                    Dodaj predmet
                </Button>
            )}
            <Button type="submit" variant="contained" color="primary" disabled={subjectsLoading}>
                Pretrazi
            </Button>
        </Box>
    );
};

export default GroupFilterForm;
