import { useEffect, useState } from 'react';
import config from '../config.js';

const useFetchSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSubjects = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/allSubjects`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Problem with fetch');
                }
                const data = await response.json();
                setSubjects(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                setError(fetchError);
                console.error('Error with subjects fetch', fetchError);
            } finally {
                setLoading(false);
            }
        };
        getSubjects();
    }, []);

    return { subjects, error, loading };
};

export default useFetchSubjects;
