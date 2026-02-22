import { useState, useEffect } from 'react';
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

const GroupFilterForm = ({ filters, onFilterChange, onSubmit }) => {
    const [subjects, setSubjects] = useState(['']);
    const { subjects: allSubjects } = useFetchSubjects();

    useEffect(() => {
        if (subjects.length === 1 && subjects[0] === '') {
            onFilterChange({ ...filters, subjects: [] });
        } else {
            onFilterChange({ ...filters, subjects });
        }
    }, [subjects]);

    const handleAddSubject = () => {
        if (subjects.length < 5) {
            setSubjects([...subjects, '']);
        }
    };

    const handleRemoveSubject = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const handleChange = (e) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', maxHeight: 'calc(100vh - 20px)', overflow: 'auto' }}>
            <TextField
                label="Naziv Grupe"
                name="group_name"
                value={filters.group_name}
                onChange={handleChange}
                placeholder="Pretraži po nazivu grupe"
                fullWidth
            />
            <TextField
                label="Topic"
                name="topic"
                value={filters.topic}
                onChange={handleChange}
                placeholder="Pretraži po topicu"
                fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Datum Početka (Od)"
                    type="date"
                    name="start_date_from"
                    value={filters.start_date_from}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="Datum Početka (Do)"
                    type="date"
                    name="start_date_to"
                    value={filters.start_date_to}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Datum Završetka (Od)"
                    type="date"
                    name="end_date_from"
                    value={filters.end_date_from}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="Datum Završetka (Do)"
                    type="date"
                    name="end_date_to"
                    value={filters.end_date_to}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Sati po Sedmici (Od)"
                    type="number"
                    name="hours_per_week_from"
                    value={filters.hours_per_week_from}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="Sati po Sedmici (Do)"
                    type="number"
                    name="hours_per_week_to"
                    value={filters.hours_per_week_to}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Cijena (Od)"
                    type="number"
                    name="price_from"
                    value={filters.price_from}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="Cijena (Do)"
                    type="number"
                    name="price_to"
                    value={filters.price_to}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Maksimalan broj studenata (Od)"
                    type="number"
                    name="max_students_from"
                    value={filters.max_students_from}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="Maksimalan broj studenata (Do)"
                    type="number"
                    name="max_students_to"
                    value={filters.max_students_to}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>
            <Typography variant="h6">Predmeti:</Typography>
            {subjects.map((subject, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl sx={{ flexGrow: 1 }}>
                        <InputLabel>Predmet</InputLabel>
                        <Select
                            value={subject}
                            onChange={(e) => handleSubjectChange(index, e.target.value)}
                        >
                            <MenuItem value="">Izaberi predmet</MenuItem>
                            {allSubjects.map((sub) => (
                                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {subjects.length > 1 && (
                        <Button type="button" onClick={() => handleRemoveSubject(index)}>Ukloni</Button>
                    )}
                </Box>
            ))}
            {subjects.length < 5 && (
                <Button type="button" onClick={handleAddSubject}>Dodaj Predmet</Button>
            )}
            <Button type="submit" variant="contained" color="primary">Pretraži</Button>
        </Box>
    );
};

export default GroupFilterForm;
