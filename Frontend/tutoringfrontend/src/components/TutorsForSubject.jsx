import React , {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {useParams} from "react-router-dom";

const tutorsForSubject = () =>{
    const { subject }=useParams();
    console.log({subject});
    return (
        <div>
        <p>TEST- {subject}</p>
            <p>NESTO</p>
        </div>
    );

};

export default tutorsForSubject;