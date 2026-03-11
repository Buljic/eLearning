import { useState } from 'react';
import config from '../config.js';
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
                const responseMessage = await response.text();
                setMessage(responseMessage || 'Greska prilikom stvaranja racuna');
            }
        } catch (error) {
            setMessage('Doslo je do greske... pokusajte ponovo');
        }
    };

    const isFormValid = username.length >= 4 &&
        password.length >= 8 &&
        name.length >= 4 &&
        surname.length >= 4 &&
        email.length >= 4 &&
        accountType !== '';

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #d8e3ef' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" gutterBottom>
                        Registracija
                    </Typography>
                    <Typography color="text.secondary">
                        Kreirajte novi korisnicki racun
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleCreateAccount} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Korisnicki username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Ime"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Prezime"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            required
                            fullWidth
                        />
                    </Box>
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
                        label="Email"
                        type="email"
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
                        <InputLabel>Tip korisnickog racuna</InputLabel>
                        <Select
                            value={accountType}
                            label="Tip korisnickog racuna"
                            onChange={(e) => setAccountType(e.target.value)}
                            required
                        >
                            <MenuItem value=""><em>Odaberi</em></MenuItem>
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="PROFESOR">Profesor</MenuItem>
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" size="large" disabled={!isFormValid}>
                        Kreiraj racun
                    </Button>
                    {message && <Alert severity="error">{message}</Alert>}
                </Box>
            </Paper>
        </Container>
    );
}

export default CreateAccount;
