import { useEffect, useState } from 'react';

const useFetchUser = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/welcomePage', {
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
            }
        };
        getUser();
    }, []);
    console.log("KORISNIK JE")
    console.log(user);
    return { user, error };
};

export default useFetchUser;
