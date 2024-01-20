import React, {useEffect, useRef, useState} from "react";

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Chat=({chatId,isGroupChat})=>{//ako je group chat onda proslijedujemo groupchatid a inace samo id te osobe

    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);

    const stompClient=useRef(null);
    const[ourEndpoint,setOurEndpoint]=useState('');

    // if(!isGroupChat) //TODO Postavi i za groupChat

    useEffect(() => {
        // const websocket=new WebSocket('ws://localhost:8080/chat');
        const socket = new SockJS('http://localhost:8080/api/chatTo');//navodno znati ce se da je ovdje veza ta
        //const stompClient = Stomp.over(socket);//koristimo socket iznad kao argument za ovaj stompClient
        stompClient.current=Stomp.over(socket);

        stompClient.current.connect({}, function (frame) {
            console.log('Povezano:' + frame);

            if (myUser.id < chatId)
            {
                setOurEndpoint(  /*'/queue/'*/ + myUser.id.toString() + '/' +/*objectUser.*/chatId.toString());
            }//TODO popravi endpointe tj njihvo mapiranje
            else
            {
                setOurEndpoint(/*'/queue/' +*/ chatId.toString() + '/' + myUser.id.toString());
            }

            stompClient.current.subscribe(ourEndpoint, (messageOutput) => {
                appendMessage(messageOutput.body);
            });
        });

        // const sendMessage=()=>

        function appendMessage(messageBody)
        {
            let chatBox = document.getElementById('chatBox');
            let messageElement = document.createElement('div');//da fazon kreira div za jednu neku poruku

            messageElement.innerText = messageBody.message;//u taj novi nas div stavlja poruku tu koju joj proslijedimo

            if (messageBody.receiver === chatId)//ako mi saljemo poruku nekome
            {
                messageElement.className = 'sent-message';
            }
            else
            {
                messageElement.className = 'received-message';
            }
            chatBox.appendChild(messageElement);//da u onaj nas chatBox element appenda jos jedan element
        }

        //TODO dodaj cleanup funkciju
    }, [ourEndpoint]);
    function sendMessage()
    {
        let messageElement = document.getElementById('messageInput');
        let messageText = messageElement.value; //value se koristi za input field a ne innerText(on za <p> i sl)
        if (messageText.trim() !== '')//da nije prazno
        {
            console.log(messageText+"OVO JE PORUKA");
            stompClient.current.send(ourEndpoint, {}, JSON.stringify(messageText));
            messageElement.value = '';
        }
    }


    return (
        <div>
            <h1>Dopisivanje {myUser.id} sa {chatId}</h1>

            <div id="chatBox">
            </div>
            {/*TODO POSTAVI KONFIGURACIJU POSTO RADIMO S VITEOM*/}
            <input type="text" id="messageInput"></input>
            <button type="submit" onClick={()=>sendMessage()}>Slanje</button>

        </div>
    );
}

export default Chat;