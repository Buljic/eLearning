import { useEffect, useState } from 'react';
import config from '../config.js';

const useFetchCertainUser = (username) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getCertainUser = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/getUser/${username}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Problem s fetchanjem korisnika.');
                }
                const data = await response.json();
                setUserInfo(data);
            } catch (fetchError) {
                setError(fetchError);
                console.error('Problem CERTAIN USER', fetchError);
            } finally {
                setLoading(false);
            }
        };

        getCertainUser();
    }, [username]);

    return { userInfo, error, loading };
};

export default useFetchCertainUser;
