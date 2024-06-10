import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import config from '../config.js';
import { Container, Box, Typography, Button, CircularProgress, Alert } from '@mui/material';

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
        return <Alert severity="error">{error}</Alert>;
    }

    if (!group) {
        return <CircularProgress />;
    }

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">{group.group_name}</Typography>
                <Typography variant="body1">{group.description}</Typography>
                <Typography variant="body1">Start Date: {group.startDate}</Typography>
                <Typography variant="body1">End Date: {group.endDate}</Typography>
                <Typography variant="body1">Hours per Week: {group.hoursPerWeek}</Typography>
                <Typography variant="body1">Price: {group.price} BAM</Typography>
                <Typography variant="body1">Max Students: {group.maxStudents}</Typography>
                <Typography variant="body1">Topic: {group.topic}</Typography>
                {myUser.accountType === 'STUDENT' && new Date(group.startDate) > new Date() && (
                    <Button variant="contained" color="primary" onClick={handleRequestAccess}>
                        Request Access
                    </Button>
                )}
                {message && <Typography color="error">{message}</Typography>}
            </Box>
        </Container>
    );
};

export default GroupDetails;
