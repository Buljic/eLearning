import React, { useState, useEffect } from 'react';
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import config from '../config.js';
const CreateGroup = () => {
    const [groupName, setGroupName] = useState(''); // max 31 chars
    const [topic, setTopic] = useState(''); // max 31 chars
    const [chosenSubjects, setChosenSubjects] = useState(['']); // as a list, one subject is required initially
    const [description, setDescription] = useState(''); // max 255 letters
    const [startDate, setStartDate] = useState(''); // must be at least 7 days AFTER today's date
    const [endDate, setEndDate] = useState(''); // these are dates
    const [hoursPerWeek, setHoursPerWeek] = useState(0);
    const [price, setPrice] = useState(0);
    const { subjects, loading, error } = useFetchSubjects();
    const [maxStudents, setMaxStudents] = useState(0);
    const storedUser = sessionStorage.getItem('myUser');
    const myUser = JSON.parse(storedUser);
    const tutorId = myUser.id;

    useEffect(() => {
        const today = new Date();
        const minStartDate = new Date();
        minStartDate.setDate(today.getDate() + 7);

        const minEndDate = new Date(minStartDate);
        minEndDate.setDate(minStartDate.getDate() + 7); // kurs mora trajati najmanje jednu sedmicu

        setStartDate(minStartDate.toISOString().split('T')[0]);
        setEndDate(minEndDate.toISOString().split('T')[0]);
    }, []);

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
        return (
            groupName.length >= 3 &&
            topic.length >= 4 &&
            chosenSubjects.every(subject => subject !== '') &&
            description.length > 0 &&
            startDate &&
            endDate &&
            new Date(endDate) >= new Date(startDate) &&
            new Date(endDate) >= new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 7)) &&
            hoursPerWeek > 0 &&
            price > 0 &&
            maxStudents > 0
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            alert('Sva polja moraju biti popunjena prema pravilima.');
            return;
        }

        console.log('Chosen Subjects: ', chosenSubjects);

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

        console.log('Group Data: ', groupData);

        try {
            const response = await fetch('http://localhost:8080/api/createGroup', {
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
            console.log("Greška pri kreiranju grupe", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Naziv Grupe:</label>
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength="31"
                    required
                />
                {groupName.length < 3 && <p style={{color: 'red'}}>Naziv grupe mora imati najmanje 3 slova.</p>}
            </div>
            <div>
                <label>Topic:</label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    maxLength="31"
                    required
                />
                {topic.length < 4 && <p style={{color: 'red'}}>Topic mora imati najmanje 4 slova.</p>}
            </div>
            <div>
                <label>Predmeti:</label>
                {chosenSubjects.map((subject, index) => (
                    <div key={index}>
                        <select
                            value={subject}
                            onChange={(e) => handleSubjectChange(index, e.target.value)}
                            required
                        >
                            <option value="">Izaberi predmet</option>
                            {subjects.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                        {chosenSubjects.length > 1 && (
                            <button type="button" onClick={() => handleRemoveSubject(index)}>Ukloni</button>
                        )}
                    </div>
                ))}
                {chosenSubjects.length < 5 && (
                    <button type="button" onClick={handleAddSubject}>Dodaj Predmet</button>
                )}
            </div>
            <div>
                <label>Opis:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength="255"
                    required
                />
            </div>
            <div>
                <label>Datum Početka:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                />
            </div>
            <div>
                <label>Datum Završetka:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={new Date(
                        startDate ? new Date(startDate).setDate(new Date(startDate).getDate() + 7) : new Date().setDate(
                            new Date().getDate() + 14)).toISOString().split('T')[0]}
                    required
                />
                {new Date(endDate) <= new Date(startDate) && (
                    <p style={{color: 'red'}}>Datum završetka mora biti najmanje 7 dana nakon datuma početka.</p>
                )}
            </div>
            <div>
                <label>Maksimalan broj studenata:</label>
                <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Math.max(0, e.target.value))}
                    min="1"
                    required
                />
            </div>
            <div>
                <label>Cijena (BAM):</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, e.target.value))}
                    min="0"
                    required
                />
            </div>
            <div>
                <label>Sati po Sedmici:</label>
                <input
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Math.max(0, e.target.value))}
                    min="2"
                    required
                />
            </div>
            <button type="submit" disabled={!isFormValid()}>Kreiraj Grupu</button>
        </form>
    );
};

export default CreateGroup;