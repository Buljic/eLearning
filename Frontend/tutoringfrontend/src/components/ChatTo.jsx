import React, {useEffect} from "react";
import {useParams} from "react-router-dom";
import useFetchUser from "../customHooks/useFetchUser.js";

const ChatTo=()=>{
    const {objectUser}=useParams();
    const [ourUser,error,loading]=useFetchUser();
    //TODO razmisliti da li staviti id u endpoint ili username

    console.log("korisnik je"+ objectUser);

    useEffect(()=>{
        // const websocket=new WebSocket('ws://localhost:8080/chat');
        const socket=new SockJS('ws://localhost:8080/chat');//navodno znati ce se da je ovdje veza ta
        const stompClient=Stomp.over(socket);//koristimo socket iznad kao argument za ovaj stompClient

        stompClient.connect({},function(frame){
            console.log('Povezano:'+frame);

            if(ourUser.id<parseInt(objectUser))
            stompClient.subscribe('/queue/'+ourUser.id.toString()+'/'+objectUser.toString());//todo finish
        })

    },[]);


    return (
        <div>
            

        </div>
    );
}
export default ChatTo;











