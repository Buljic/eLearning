import React, {useEffect} from "react";
import {useParams} from "react-router-dom";
import useFetchUser from "../customHooks/useFetchUser.js";

const ChatTo=()=>{
    const {objectUser}=useParams();
    const [ourUser,error,loading]=useFetchUser();
    //TODO razmisliti da li staviti id u endpoint ili username

    console.log("korisnik je"+ objectUser);




    return (
        <div>
            

        </div>
    );
}
export default ChatTo;











