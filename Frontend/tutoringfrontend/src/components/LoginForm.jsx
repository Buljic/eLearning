import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/general.css";
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import config from '../config.js';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${config.BASE_URL}/api/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const userResponse = await fetch(`${config.BASE_URL}/api/welcomePage`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (userResponse.ok) {
                    const fetchedUser = await userResponse.json();
                    sessionStorage.setItem('myUser', JSON.stringify(fetchedUser));
                    navigate('/welcome');
                } else {
                    setMessage('Neuspješno dohvatanje korisničkih podataka.');
                }
            } else {
                setMessage('Neuspješna prijava. Molimo pokušajte ponovo.');
            }
        } catch (error) {
            console.error('Greška prilikom login-a', error);
            setMessage('Došlo je do greške. Molimo pokušajte ponovo.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Ukucajte svoje kredencijale</Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Korisničko ime"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Lozinka"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary">Login</Button>
                </Box>
                {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}
            </Box>
        </Container>
    );
}

export default LoginForm;