import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
                const response = await fetch(`http://localhost:8080/api/groups/${groupId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch group details');
                }
                const data = await response.json();
                setGroup(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchGroupDetails();
    }, [groupId]);

    const handleRequestAccess = async () => {
        if (myUser.role !== 'STUDENT') {
            setMessage('Only students can request access to groups');
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/request-access`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to request access');
            }
            setMessage('Access requested successfully');
        } catch (err) {
            setError(err.message);
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
            <p>Start Date: {group.start_date}</p>
            <p>End Date: {group.end_date}</p>
            <p>Hours per Week: {group.hours_per_week}</p>
            <p>Price: {group.price} BAM</p>
            <p>Max Students: {group.max_students}</p>
            <p>Topic: {group.topic}</p>
            {myUser.role === 'STUDENT' && group.start_date >= new Date().toISOString().split('T')[0] && (
                <button onClick={handleRequestAccess}>Request Access</button>
            )}
            {message && <p>{message}</p>}
        </div>
    );
};

export default GroupDetails;
