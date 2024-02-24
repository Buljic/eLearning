
import React, {useContext} from 'react';
import useFetchUser from "../customHooks/useFetchUser";
import {Link} from "react-router-dom";
import myUserContext from "../minicomponents/Context/MyUserContext.js";
import MyUserContext from "../minicomponents/Context/MyUserContext.js";

const WelcomePage = () => {
    const { user, error, loading } = useFetchUser(); // Koristimo naš custom hook

    console.log("SAMO JEDNOM");
    //const {myUser,setMyUser}=useContext(MyUserContext);//dodajemo usera u context
    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);//jer ono inace dobijamo string obicni
    if (loading) {
        return <div>Učitavanje...</div>; // Prikazujemo dok se podaci učitavaju
    }

    if (error) {
        return <div>Došlo je do greške: {error.message}</div>; // Prikazujemo ako postoji greška
    }

    // Kada nije ucitavanje i nema greske, prikazujemo podatke korisnika
    return (
        <div>
            <h1>NAS USER {myUser.username}</h1>
            <h1>Dobrodošli, {user?.name}</h1>
            <ul>
                {(user.accountType==='STUDENT')||(user.accountType==='OBOJE') && <li><Link to='/searchSubjects'>Trazi predmete</Link></li>}
                { (user.accountType==='OBOJE') && <li>Radi</li>}
                {(user.accountType==='STUDENT') && <li>STUDENT</li>}
                {(user.accountType==='TUTOR')||(user.accountType==='OBOJE') && <li><Link to="/requestSubjectsAsTutor">Registruj se za predmete</Link></li>}
                {(user.accountType==='STUDENT')||(user.accountType==='OBOJE') && <li><Link to="/attendedCourses">Kursevi koje pohadjas</Link></li>}
                <li><Link to="/userSearch">Pretraži usere</Link></li>
            </ul>
        </div>
    );
};

export default WelcomePage;