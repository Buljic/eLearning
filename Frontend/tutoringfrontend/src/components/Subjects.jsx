import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetchSubjects from '../customHooks/useFetchSubjects.js';
import config from '../config.js';

const Subjects = () => {
    const { subjects } = useFetchSubjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [popularSubjects, setPopularSubjects] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const getPopularSubjects = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/mostTutorSubjects`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    setPopularSubjects([]);
                    return;
                }
                const data = await response.json();
                setPopularSubjects(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch popular subjects:', error);
                setPopularSubjects([]);
            }
        };
        getPopularSubjects();
    }, []);

    const filteredSubjects = useMemo(() => {
        if (!searchTerm) {
            return [];
        }
        return subjects.filter((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, subjects]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value || '');
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (subject) => {
        setSearchTerm(subject);
        setShowSuggestions(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!searchTerm.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${config.BASE_URL}/api/subjects/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                setSearchResults([]);
                return;
            }
            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to search subjects:', error);
            setSearchResults([]);
        }
    };

    const subjectsToRender = isSearching ? searchResults : popularSubjects;

    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Profesori s specijalizacijom za predmete</p>
            <form id="searchForm" onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
                <input
                    id="inputField"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm && setShowSuggestions(true)}
                    placeholder="Pretrazi predmete"
                    style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit" id="subjectsSearch" style={{ padding: '0.5rem 1rem', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Pretrazi</button>
            </form>

            {showSuggestions && searchTerm && (
                <ul id="suggestions" style={{ listStyleType: 'none', padding: 0 }}>
                    {filteredSubjects.map((subject) => (
                        <li key={subject} id={subject} style={{ marginBottom: '0.5rem' }}>
                            <button id={subject} type="button" onClick={() => handleSuggestionClick(subject)} style={{ padding: '0.3rem 0.5rem', borderRadius: '5px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
                                {subject}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {subjectsToRender.map((subject) => (
                    <li key={subject.name} id={isSearching ? 'searchSubjectsResult' : 'popularSubjectsResult'} style={{ marginBottom: '0.5rem' }}>
                        <Link to={`/tutorsFor/${subject.name}`} style={{ textDecoration: 'none', color: '#000' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f0f0f0', maxWidth: '300px', margin: 'auto' }}>
                                Ime je {subject.name}. Broj tutora: {subject.number}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Subjects;
