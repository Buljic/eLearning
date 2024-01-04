
import React from 'react';
import useFetchUser from "../customHooks/useFetchUser";
import {Link} from "react-router-dom";

const WelcomePage = () => {
    const { user, error, loading } = useFetchUser(); // Koristimo naš custom hook

    if (loading) {
        return <div>Učitavanje...</div>; // Prikazujemo dok se podaci učitavaju
    }

    if (error) {
        return <div>Došlo je do greške: {error.message}</div>; // Prikazujemo ako postoji greška
    }

    // Kada nije ucitavanje i nema greske, prikazujemo podatke korisnika
    return (
        <div>
            <h1>Dobrodošli, {user?.name}</h1>
            <ul>
                {(user.accountType==='STUDENT')||(user.accountType==='OBOJE') && <li><Link to='/searchSubjects'>Trazi predmete</Link></li>}
                { (user.accountType==='OBOJE') && <li>Radi</li>}
                {(user.accountType==='STUDENT') && <li>STUDENT</li>}
                {(user.accountType==='TUTOR')||(user.accountType==='OBOJE') && <li><Link to="/requestSubjectsAsTutor">Registruj se za predmete</Link></li>}
            </ul>
        </div>
    );
};

export default WelcomePage;