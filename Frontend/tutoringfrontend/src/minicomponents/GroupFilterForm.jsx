import React, { useState, useEffect } from 'react';
import useFetchSubjects from "../customHooks/useFetchSubjects.js";

const GroupFilterForm = ({ filters, onFilterChange, onSubmit }) => {
    const [subjects, setSubjects] = useState(['']);
    const { subjects: allSubjects, loading, error } = useFetchSubjects();

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
        <form onSubmit={onSubmit} style={{ flex: 1 }}>
            <div>
                <label>Naziv Grupe:</label>
                <input
                    type="text"
                    name="group_name"
                    value={filters.group_name}
                    onChange={handleChange}
                    placeholder="Pretraži po nazivu grupe"
                />
            </div>
            <div>
                <label>Topic:</label>
                <input
                    type="text"
                    name="topic"
                    value={filters.topic}
                    onChange={handleChange}
                    placeholder="Pretraži po topicu"
                />
            </div>
            <div>
                <label>Datum Početka (Od):</label>
                <input
                    type="date"
                    name="start_date_from"
                    value={filters.start_date_from}
                    onChange={handleChange}
                />
                <label>Datum Početka (Do):</label>
                <input
                    type="date"
                    name="start_date_to"
                    value={filters.start_date_to}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Datum Završetka (Od):</label>
                <input
                    type="date"
                    name="end_date_from"
                    value={filters.end_date_from}
                    onChange={handleChange}
                />
                <label>Datum Završetka (Do):</label>
                <input
                    type="date"
                    name="end_date_to"
                    value={filters.end_date_to}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Sati po Sedmici (Od):</label>
                <input
                    type="number"
                    name="hours_per_week_from"
                    value={filters.hours_per_week_from}
                    onChange={handleChange}
                />
                <label>Sati po Sedmici (Do):</label>
                <input
                    type="number"
                    name="hours_per_week_to"
                    value={filters.hours_per_week_to}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Cijena (Od):</label>
                <input
                    type="number"
                    name="price_from"
                    value={filters.price_from}
                    onChange={handleChange}
                />
                <label>Cijena (Do):</label>
                <input
                    type="number"
                    name="price_to"
                    value={filters.price_to}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Maksimalan broj studenata (Od):</label>
                <input
                    type="number"
                    name="max_students_from"
                    value={filters.max_students_from}
                    onChange={handleChange}
                />
                <label>Maksimalan broj studenata (Do):</label>
                <input
                    type="number"
                    name="max_students_to"
                    value={filters.max_students_to}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Predmeti:</label>
                {subjects.map((subject, index) => (
                    <div key={index}>
                        <select
                            value={subject}
                            onChange={(e) => handleSubjectChange(index, e.target.value)}
                            required={subjects.length > 1 || (subjects.length === 1 && subjects[0] !== '')}
                        >
                            <option value="">Izaberi predmet</option>
                            {allSubjects.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                        {subjects.length > 1 && (
                            <button type="button" onClick={() => handleRemoveSubject(index)}>Ukloni</button>
                        )}
                    </div>
                ))}
                {subjects.length < 5 && (
                    <button type="button" onClick={handleAddSubject}>Dodaj Predmet</button>
                )}
            </div>
            <button type="submit">Pretraži</button>
        </form>
    );
};

export default GroupFilterForm;
