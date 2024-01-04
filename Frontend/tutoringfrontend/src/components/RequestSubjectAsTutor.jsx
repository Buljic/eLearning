import React from "react";
import {useState,useEffect} from "react";
import useFetchUser from "../customHooks/useFetchUser.js";
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
const RequestSubjectAsTutor=()=>{
    const {user,error,loading}=useFetchUser();
    const [subject,setSubject]=useState('');
    const [comment,setComment]=useState('');
    const [isSearching,setIsSearching]=useState(false);

    const {subjects,error2,loading2}=useFetchSubjects();

    const handleFormInput=async(event)=>{
        event.preventDefault();

        try
        {
            const response = await fetch('http://localhost:8080/api/registerForSubjectAsTutor', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
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

    const filteredSubjects=subject && typeof subject ==='string'
    ?
        subjects.filter(tempSubject=>tempSubject.toLowerCase().include(subject.toLowerCase()))
        :
        [];

    return (
        <div>
            <h1>REGISTRACIJA ZA PREDMETE</h1>
            <p>KORISNIK JE {user.name}</p>


            <form onSubmit={handleFormInput}>

                <div id="subjectSearch">
            <input
                type="text"
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
                placeholder="Subject"
                onFocus={()=>subject && setIsSearching(true)} />
                    {isSearching && subject && (
                        <ul id="suggestion">
                            {filteredSubjects.map((tSubject,index)=>(
                                <li key={index}>tSubject</li>
                            //     TODO Kreiraj button i handle click funkcionalnost
                            ))}

                        </ul>
                    )}
                </div>

                <button type="submit"></button>
            </form>
        </div>
    );



}
export default RequestSubjectAsTutor;