import React, {useState} from "react";

import {useNavigate} from "react-router-dom";
import error from "eslint-plugin-react/lib/util/error.js";
function CreateAccount(){
//arrow functions... const imeFunkcije=(parametri)=>{tijelo Fx};
    //async znaci da moze koristiti await unutar sebe
    //dekonstrukcija nizova tj bukv uzimanje vrijednosti iz nekog niza nakon '='
    const [username,setUsername]=useState('');
    const[password,setPassword]=useState('');
    const [email,setEmail]=useState('');

    const navigate=useNavigate();
    const [message,setMessage]=useState('');

    const handleCreateAccount=async(event) =>{
        event.preventDefault();
        /*U slučaju forme, defaultno ponašanje je slanje forme (što obično učitava novu stranicu ili šalje podatke na server).
Kada pozoveš event.preventDefault(), kažeš browseru: "Ne radi ono standardno slanje forme, ja ću sam obraditi šta treba da se desi."*/

        try
        {
            const responce = await fetch('http://localhost:8080/createAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, email, password}),
            });
            if (responce.ok)
            {
                //ako je ok kreirano
                navigate('/login');//useNavigate se koristi ciji je argument neki endpoint
            }
            else
            {
                setMessage('Greska prilikom stvaranja racuna', error); //TODO iskoristi ovaj error
            }
        }
            catch(error){
                console.error('greska prilikom stvaranja racuna',error);
                setMessage('Doslo je do greske... pokusajte ponovo');
            }
        }
        //TODO implementovati funkcionalnost slanja confirmationa na mail preko backenda
    };


    return (
        <div>
            <form>
                <input type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="Korisnicko ime"/>
            {/*    fazon ovo onchange proslijedjuje 'e' kao event zapravo kada se desi i mi moramo znati unaprijed
            koji ce se desiti event jer ono nezz program pa na osnovu toga koristiti tu funkciju koja je u ovom slucaju
            set username s pristupanjem eventu 'e' za to! a target je ono sto se mijenja u eventu a value vrijednost*/}
                <input type="text"
                value={email}
                {/*       mozes bez '{}' ovo arrow functions jer je samo inline funkcija ovo*/}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Korisnicki email"/>

                <input type="password"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                placeholder="Lozinka"/>

                <button type="submit">Kreiraj racun</button>
            </form>
            {/*prvi gleda jel ima nesto u njemu i ako ima onda je true i prikaze se ovo drugo*/}
            {/*U JSX-u, koristiš {} da ubaciš JavaScript izraz unutar JSX-a. Ovo ti omogućava da dinamički manipulišeš sadržajem.
Gdje se može koristiti? Možeš koristiti {} bilo gdje unutar JSX-a da ubaciš JavaScript izraze, varijable, uslove, funkcije itd.*/}
            {message && <p>{message}</p>}
        </div>

    );

export default CreateAccount;