import React from "react";
import {useState,useEffect} from "react";
import useFetchUser from "../customHooks/useFetchUser.js";
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import config from '../config.js';
//TODO kasnije postavi admin-only stranicu za obradu ovih requestova i dodaj image based obradjivanje
const RequestSubjectAsTutor=()=>{
    const {user,error,loading}=useFetchUser();
    const [inputSubject,setInputSubject]=useState('');
    const [comment,setComment]=useState('');
    const[writtenQualifications,setWrittenQualifications]=useState('');
    const [isSearching,setIsSearching]=useState(false);

    const {subjects,error2,loading2}=useFetchSubjects();

    if(!user)
    {
        return <h1>loading</h1>
    }
    const handleFormInput=async(event)=>{
        event.preventDefault();

        try
        {
            console.log({inputSubject,writtenQualifications,comment});
            const requestBody = JSON.stringify({inputSubject, writtenQualifications, comment});
            console.log(requestBody);
            const response = await fetch('http://localhost:8080/api/registerForSubjectAsTutor', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({inputSubject,writtenQualifications,comment}),
            });
            if (!response.ok)
            {
                console.log("Neka greska u slanju ZAHTJEVA ZA SUBJECTOM");
                throw new Error("REGISTER FOR SUBJECT ERROR");
            }
            else
            {

            }
        }
            catch(error)
            {
                console.log("greska sa"+ error);
            }

    };

    const filteredSubjects=inputSubject && typeof inputSubject ==='string'
    ?
        subjects.filter(tempSubject=>tempSubject.toLowerCase().includes(inputSubject.toLowerCase()))
        :
        [];

    const handleSuggestionClick=(clickedSubject)=>{
        console.log("Pritisnuo si" + clickedSubject);
        setInputSubject(clickedSubject);
        setIsSearching(false);
    }
    const handleSearchChange=(event)=>{
        setInputSubject(event.target.value || '');
        setIsSearching(true);
    }

    return (
        <div>
            <h1>REGISTRACIJA ZA PREDMETE</h1>
            <p>KORISNIK JE {user.name}</p>

            <div id="subjectRegistrationForm">
            <form onSubmit={handleFormInput}>

                <div id="subjectSearch">
            <input
                id="subjectInputField"
                type="text"
                value={inputSubject}
                onChange={handleSearchChange}
                placeholder="Subject"
                onFocus={()=>inputSubject && setIsSearching(true)} />
                    {isSearching && inputSubject && (
                        <ul id="suggestion">
                            {filteredSubjects.map((tSubject,index)=>(
                                <li key={index} id={tSubject}>
                                    <button onClick={()=>handleSuggestionClick(tSubject)}>{tSubject}</button>
                                </li>
                            //     TODO Kreiraj button i handle click funkcionalnost
                            ))}

                        </ul>
                    )}
                </div>
                <input id="textQualificationField"
                    type="text"
                       value={writtenQualifications}
                       onChange={(e)=>setWrittenQualifications(e.target.value)}
                       placeholder="Unesi svoje kvalifikacije"/><br/>
                <input id="extraInformationField"
                    type="text"
                       value={comment}
                       onChange={(e)=>setComment(e.target.value)}
                       placeholder="Unesi dodatne informacije"/>


                <br/>
                <button id="subjectRequestSubmit" type="submit">Submit</button>
            </form>
            </div>
        </div>
    );



}
export default RequestSubjectAsTutor;