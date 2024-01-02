import React from "react";
import {useState,useEffect} from "react";
import useFetchUser from "../customHooks/useFetchUser.js";
const RequestSubjectAsTutor=()=>{
    const {user,error}=useFetchUser();



    return (
        <div>
            <p>KORISNIK JE {user.name}</p>
        </div>
    );



}
export default RequestSubjectAsTutor;