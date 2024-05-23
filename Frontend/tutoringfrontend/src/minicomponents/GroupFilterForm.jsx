import React, { useState } from 'react';

const GroupFilterForm = ({ filters, onFilterChange, onSubmit }) => {
    const [subjects, setSubjects] = useState(['']);

    const handleAddSubject = () => {
        if (subjects.length < 5) {
            setSubjects([...subjects, '']);
        }
    };

    const handleRemoveSubject = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
        onFilterChange({ ...filters, subjects: newSubjects });
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
        onFilterChange({ ...filters, subjects: newSubjects });
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
                <label>Datum Početka:</label>
                <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Datum Završetka:</label>
                <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Sati po Sedmici:</label>
                <input
                    type="number"
                    name="hours_per_week"
                    value={filters.hours_per_week}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Cijena (BAM):</label>
                <input
                    type="number"
                    name="price"
                    value={filters.price}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Maksimalan broj studenata:</label>
                <input
                    type="number"
                    name="max_students"
                    value={filters.max_students}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Predmeti:</label>
                {subjects.map((subject, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => handleSubjectChange(index, e.target.value)}
                            placeholder="Predmet"
                        />
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