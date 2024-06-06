import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import config from '../config.js';
const GroupDetails = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const storedUser = sessionStorage.getItem('myUser');
    const myUser = JSON.parse(storedUser);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/groups/${groupId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch group details');
                }
                const data = await response.json();
                setGroup(data);
                console.log("Group data fetched: ", data);
            } catch (err) {
                console.error("Error fetching group details: ", err);
                setError(err.message);
            }
        };
        fetchGroupDetails();
    }, [groupId]);

    const handleRequestAccess = async () => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/groups/${groupId}/request-access`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }
            alert('Zahtjev za pristup je uspješno poslan.');
        } catch (error) {
            console.error('Error requesting access:', error);
            alert(`Error requesting access: ${error.message}`);
        }
    };

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!group) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>{group.group_name}</h1>
            <p>{group.description}</p>
            <p>Start Date: {group.startDate}</p>
            <p>End Date: {group.endDate}</p>
            <p>Hours per Week: {group.hoursPerWeek}</p>
            <p>Price: {group.price} BAM</p>
            <p>Max Students: {group.maxStudents}</p>
            <p>Topic: {group.topic}</p>
            {myUser.accountType === 'STUDENT' && new Date(group.startDate) > new Date() && (
                <button onClick={handleRequestAccess}>Request Access</button>
            )}
            {message && <p>{message}</p>}
        </div>
    );
};

export default GroupDetails;
