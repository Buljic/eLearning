import { useEffect, useState } from 'react';
import config from '../config.js';

const useFetchUser = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/welcomePage`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 401) {
                    const refreshed = await fetch(`${config.BASE_URL}/api/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!refreshed.ok) {
                        throw new Error('Unauthorized');
                    }

                    const retryResponse = await fetch(`${config.BASE_URL}/api/welcomePage`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!retryResponse.ok) {
                        throw new Error('Problem with fetch');
                    }

                    const retryData = await retryResponse.json();
                    setUser(retryData);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Problem with fetch');
                }

                const data = await response.json();
                setUser(data);
            } catch (fetchError) {
                setError(fetchError);
                console.error('Error while fetching user', fetchError);
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, []);

    return { user, error, loading };
};

export default useFetchUser;
