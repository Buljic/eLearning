import { useEffect, useState } from 'react';
import config from '../config.js';

const useFetchUser = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);  // Dodajemo loading stanje

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/welcomePage`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Problem with fetch');
                } else {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                setError(error);
                console.log("Error sa fetchom");
            } finally {
                setLoading(false);  // Postavite loading na false kada se završi dohvat podataka
            }
        };
        getUser();
    }, []);

    return { user, error, loading };  // Vraćamo loading zajedno sa user i error
};

export default useFetchUser;
