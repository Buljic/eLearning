// components/LoginForm.jsx
import React, {useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/general.css"
import MyUserContext from "../minicomponents/Context/MyUserContext.js";
import useFetchUser from "../customHooks/useFetchUser.js";
function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const {myUser,setMyUser}=useContext(MyUserContext);

console.log("SAMO JEDNOM MOLIM TE");
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
                // const {fetchedUser,error,loading}=useFetchUser();
                // //dodavanje u context
                // setMyUser(fetchedUser);
                //navigate('/welcome'); // Preusmjeravanje na WelcomePage


                const userResponse = await fetch('http://localhost:8080/api/welcomePage', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (userResponse.ok) {
                    const fetchedUser = await userResponse.json();
                  //  setMyUser(fetchedUser); // ovo azurira kontekst koji smo kreirali

                    sessionStorage.setItem('myUser',JSON.stringify(fetchedUser));//jer kao argument prima samo stringove
                    navigate('/welcome'); // Preusmeravanje na WelcomePage
                } else {
                    // Obrada grešaka
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
