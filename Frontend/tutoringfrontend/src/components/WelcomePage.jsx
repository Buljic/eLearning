// components/WelcomePage.jsx
import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";

const WelcomePage = () => {
    // Preuzmi JWT iz localStorage ili slično
   // const token = localStorage.getItem('token'); ne koristimo vise localstorage nego cookies


    const [user,setUser]=useState('');



    useEffect(() => {
        const getUser = async () => {
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
                    const data = await response.json();//await response.text(); // Pretpostavimo da backend vraća samo tekst
                    console.log("OVO SE POSTAVLJA");
                    setUser(data); // Postavljanje korisničkog imena u state
                    console.log(data);
                }
            } catch (error) {
                console.log("Error sa fetchom");
            }
        };
        getUser();
    }, []); // Efekat se izvršava samo jednom nakon montiranja komponente
    return (
        // nav je za navigacijski i govori browseru da nisu samo kao obicni linkovi nego za navigaciju
        <div>
            <h1>Dobrodošli</h1>
            <p>Kornisnicko ime je {user.name}</p>

            <nav>
                <ul>
                    {/*nemoj dva puta resolvati objekat neki*/}
                    { ((user.accountType==='STUDENT') || (user.accountType==='OBOJE')  ) && <li><Link to="/searchSubjects">Trazi predmete</Link></li> }
                    { (user.accountType==='OBOJE') && <li>Radi</li>}
                    {(user.accountType==='STUDENT') && <li>STUDENT</li>}
                </ul>
            </nav>
            {/*<p>Vas JWT: {token}</p>*/}
        </div>
    );
};

export default WelcomePage;
