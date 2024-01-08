// components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/general.css"
function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
               // const data = await response.json();
                //localStorage.setItem('token', data.token); // Spremanje JWT tokena u localStorage
                navigate('/welcome'); // Preusmjeravanje na WelcomePage
            } else {
                setMessage('Neuspješna prijava. Molimo pokušajte ponovo.');
            }
        } catch (error) {
            console.error('Greška prilikom login-a', error);
            setMessage('Došlo je do greške. Molimo pokušajte ponovo.');
        }
    };

    return (
        <div>

            <div id="loginDiv">
                <h2>Ukucajte svoje kredencijale</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Korisničko ime"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Lozinka"
                />
                <br/>
                <button type="submit" id="loginSubmit">Login</button>
            </form>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}

export default LoginForm;
