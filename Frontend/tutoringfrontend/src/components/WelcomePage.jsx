// components/WelcomePage.jsx
import React, {useEffect, useState} from 'react';

const WelcomePage = () => {
    // Preuzmite JWT iz localStorage ili slično
   // const token = localStorage.getItem('token'); ne koristimo vise localstorage nego cookies
const [username,setUsername]=useState('');

    // useEffect(() => {
    //     const getUsername = async () => {
    //         try {
    //             const response = await fetch('http://localhost:8080/api/welcomePage', {
    //                 method: 'GET',
    //                 credentials: 'include', // Šalje cookie-e uz zahtjev
    //             });
    //
    //             // Logovanje Set-Cookie headera iz odgovora, ako je dostupan
    //             console.log('Set-Cookie header:', response.headers.get('Set-Cookie'));
    //
    //             if (!response.ok) {
    //                 console.log("NIJE OK");
    //                 throw new Error(`Problem with fetch: ${response.statusText}`);
    //             }
    //
    //             const data = await response.text(); // Pretpostavimo da server vraća JSON
    //             console.log("OVO SE POSTAVLJA", data);
    //             setUsername(data.username); // Pretpostavimo da je 'username' ključ u JSON odgovoru
    //         } catch (error) {
    //             console.error("Error sa fetchom", error);
    //         }
    //     };
    //
    //     getUsername();
    // }, []);

    useEffect(() => {
        const getUsername = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/welcomePage', {
                    method: 'GET',
                    credentials: 'include', // Šalje cookie-e uz zahtjev
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    console.log("NIJE OK");
                    throw new Error('Problem with fetch');
                } else {
                    const username = await response.text(); // Pretpostavimo da backend vraća samo tekst
                    console.log("OVO SE POSTAVLJA");
                    setUsername(username); // Postavljanje korisničkog imena u state
                }
            } catch (error) {
                console.log("Error sa fetchom");
            }
        };
        getUsername();
    }, []); // Efekat se izvršava samo jednom nakon montiranja komponente
    return (
        <div>
            <h1>Dobrodošli</h1>
            <p>Kornisnicko ime je {username}</p>
            {/*<p>Vaš JWT: {token}</p>*/}
        </div>
    );
};

export default WelcomePage;
