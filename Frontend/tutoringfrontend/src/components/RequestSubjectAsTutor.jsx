import React from "react";
import {useState,useEffect} from "react";
import useFetchUser from "../customHooks/useFetchUser.js";
const RequestSubjectAsTutor=()=>{
    const {user,error,loading}=useFetchUser();


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

    return (
        <div>
            <h1>REGISTRACIJA ZA PREDMETE</h1>
            <p>KORISNIK JE {user.name}</p>

            <form onSubmit={handleFormInput}>

                <button type="submit"></button>
            </form>
        </div>
    );



}
export default RequestSubjectAsTutor;