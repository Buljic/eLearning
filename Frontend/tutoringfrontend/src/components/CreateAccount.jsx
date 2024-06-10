import React, { useState } from "react";
import config from '../config.js';
import { useNavigate } from "react-router-dom";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Container, Box } from '@mui/material';

function CreateAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('');

    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleCreateAccount = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${config.BASE_URL}/api/createAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, name, surname, phoneNumber, email, password, accountType }),
            });
            if (response.ok) {
                navigate('/login');
            } else {
                setMessage('Greska prilikom stvaranja racuna');
            }
        } catch (error) {
            setMessage('Doslo je do greske... pokusajte ponovo');
        }
    };

    const isFormValid = username.length >= 4 &&
        password.length >= 4 &&
        name.length >= 4 &&
        surname.length >= 4 &&
        email.length >= 4 &&
        accountType !== '';

    return (
        <Container maxWidth="sm">
            <Box component="form" onSubmit={handleCreateAccount} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Korisnicki username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    label="Korisnicko ime"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <TextField
                    label="Korisnicko prezime"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                />
                <TextField
                    label="Broj telefona"
                    value={phoneNumber}
                    onChange={(e) => {
                        const re = /^[0-9]*$/;
                        if (re.test(e.target.value) || e.target.value === '') {
                            setPhoneNumber(e.target.value);
                        }
                    }}
                    required
                />
                <TextField
                    label="Korisnicki email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="Lozinka"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <FormControl>
                    <InputLabel>Odaberi tip account-a</InputLabel>
                    <Select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        required
                    >
                        <MenuItem value=""><em>Odaberi tip account-a</em></MenuItem>
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="PROFESOR">Profesor</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" disabled={!isFormValid}>
                    Kreiraj racun
                </Button>
                {message && <Typography color="error">{message}</Typography>}
            </Box>
        </Container>
    );
}

export default CreateAccount;
