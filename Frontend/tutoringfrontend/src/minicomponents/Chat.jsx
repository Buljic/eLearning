import React, {useEffect, useRef, useState} from "react";

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {act} from "react-dom/test-utils";

const Chat=({chatId,isGroupChat})=>{//ako je group chat onda proslijedujemo groupchatid a inace samo id te osobe

    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);

    const stompClient=useRef(null);
    const[ourEndpointToReceive,setOurEndpointToReceive]=useState('');
    const[ourEndpointToSend,setOurEndpointToSend]=useState('');
    const[baseEndpoint,setBaseEndpoint]=useState('');//TODO skrati s 3 varijable na jednu i koristi ovu

     if(!isGroupChat) //TODO Postavi i za groupChat
     {
    useEffect(() => {
        // const websocket=new WebSocket('ws://localhost:8080/chat');
        const socket = new SockJS('http://localhost:8080/api/chatTo');//navodno znati ce se da je ovdje veza ta
        //const stompClient = Stomp.over(socket);//koristimo socket iznad kao argument za ovaj stompClient
        stompClient.current=Stomp.over(socket);
        let subscription;
       let activeConnection;
        stompClient.current.connect({}, function (frame) {
            console.log('Povezano:' + frame);
activeConnection=true;
            if (myUser.id < chatId)
            {
                setOurEndpointToReceive(  '/queue/' + myUser.id.toString() + '/' +/*objectUser.*/chatId.toString());
                setOurEndpointToSend('/app/'+myUser.id.toString() + '/' +/*objectUser.*/chatId.toString());
                setBaseEndpoint(myUser.id.toString+'/'+chatId.toString());
            }
            else
            {
                setOurEndpointToReceive('/queue/' + chatId.toString() + '/' + myUser.id.toString());
                setOurEndpointToSend('/app/'+chatId.toString() + '/' + myUser.id.toString());
                setBaseEndpoint(chatId.toString()+'/'+myUser.id.toString());
            }

            subscription= stompClient.current.subscribe(ourEndpointToReceive, (messageOutput) => {
                appendMessage(messageOutput.body);
            });

        });

        // const sendMessage=()=>
        async function fetchPreviousMessages(){
            const response=await fetch( `http://localhost:8080/api/${myUser.id.toString()}/${chatId.toString()}/getOldDirectMessages`,{//'http://localhost:8080/api/'+baseEndpoint+'/getOldDirectMessages',{
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            const poruke=await response.json();
            poruke.reverse();//Koristi se jer inace se najmladja poruka prva appenda
            poruke.forEach(poruka=>{
                console.log("STARA PORUKA"+JSON.stringify(poruka));
            });
            poruke.forEach(poruka=>{
                appendMessage(JSON.stringify(poruka));
            });
        }

        function appendMessage(neformatiranaPoruka)
        {
            const messageBody=JSON.parse(neformatiranaPoruka);
            console.log("Ovo je poruka"+messageBody);
            let chatBox = document.getElementById('chatBox');
            let messageElement = document.createElement('div');//da fazon kreira div za jednu neku poruku

            messageElement.innerText = messageBody.message_text;//u taj novi nas div stavlja poruku tu koju joj proslijedimo

            if (messageBody.user2 === myUser.id)//ako mi primamo poruku od nekoga     //PROMJENJENO S receiver
            {
                console.log("OVO JE PRIMLJENA PORUKA");
                messageElement.className = 'received-message';
            }
            else
            {
                console.log("OVO JE POSLANA PORUKA");
                messageElement.className = 'sent-message';
            }
            chatBox.appendChild(messageElement);//da u onaj nas chatBox element appenda jos jedan element
        }

        if (baseEndpoint) {
            fetchPreviousMessages();
        }


        return () => {
            if (activeConnection && stompClient.current) {
                // Proverite da li je veza aktivna pre diskonektovanja
                stompClient.current.disconnect(() => {
                    console.log('Diskonektovan!');
                });
                activeConnection = false;
            }
        };

    }, [ourEndpointToReceive]);
     }

                //Ako jeste group chat
     else {

         useEffect(() => {

             const socket = new SockJS('http://localhost:8080/api/chatGroup');
             stompClient.current=Stomp.over(socket);
             let subscription;
             let activeConnection;
             stompClient.current.connect({}, function (frame) {
                 console.log('Povezano:' + frame);
                 activeConnection=true;
                 if (chatId)
                 {
                     setOurEndpointToReceive(  '/topic/' + chatId.toString());
                     setOurEndpointToSend('/app/'+chatId.toString());
                     setBaseEndpoint(chatId.toString());
                 }

                 subscription= stompClient.current.subscribe(ourEndpointToReceive, (messageOutput) => {
                     appendMessage(messageOutput.body);
                 });

             });

             // const sendMessage=()=>
             //TODO IMPLEMENT FETCH PREVIOUS MESSAGES FOR GROUP
             async function fetchPreviousMessages(){
                 const response=await fetch( `http://localhost:8080/api/${myUser.id.toString()}/${chatId.toString()}/getOldDirectMessages`,{//'http://localhost:8080/api/'+baseEndpoint+'/getOldDirectMessages',{
                     method:'GET',
                     credentials:'include',
                     headers:{
                         'Content-Type':'application/json',
                     }
                 });
                 const poruke=await response.json();
                 poruke.reverse();//Koristi se jer inace se najmladja poruka prva appenda
                 poruke.forEach(poruka=>{
                     console.log("STARA PORUKA"+JSON.stringify(poruka));
                 });
                 poruke.forEach(poruka=>{
                     appendMessage(JSON.stringify(poruka));
                 });
             }

             function appendMessage(neformatiranaPoruka)
             {
                 const messageBody=JSON.parse(neformatiranaPoruka);
                 console.log("Ovo je poruka"+messageBody);
                 let chatBox = document.getElementById('chatBox');
                 let messageElement = document.createElement('div');//da fazon kreira div za jednu neku poruku

                 messageElement.innerText = messageBody.message_text;//u taj novi nas div stavlja poruku tu koju joj proslijedimo

                 if (messageBody.sender !== myUser.id)//ako mi primamo poruku od nekoga     //PROMJENJENO S receiver
                 {
                     console.log("OVO JE PRIMLJENA PORUKA");
                     messageElement.className = 'received-message';
                 }
                 else
                 {
                     console.log("OVO JE POSLANA PORUKA");
                     messageElement.className = 'sent-message';
                 }
                 chatBox.appendChild(messageElement);//da u onaj nas chatBox element appenda jos jedan element
             }
             //TODO
             // if (baseEndpoint) {
             //     fetchPreviousMessages();
             // }


             return () => {
                 if (activeConnection && stompClient.current) {

                     stompClient.current.disconnect(() => {
                         console.log('Diskonektovan!');
                     });
                     activeConnection = false;
                 }
             };

         }, [ourEndpointToReceive]);

     }


    function sendMessage()
    {
        let messageElement = document.getElementById('messageInput');
        let messageText = messageElement.value; //value se koristi za input field a ne innerText(on za <p> i sl)
        if (messageText.trim() !== '')//da nije prazno
        {
            //TODO ADAPTIRAJ ZA GROUP
            console.log(messageText+"OVO JE PORUKA");
            const chatMessage={
                message_text:messageText,
                user2:chatId
            };
            stompClient.current.send(ourEndpointToSend, {}, JSON.stringify(chatMessage)/*JSON.stringify(messageText,chatId)*/);
            messageElement.value = '';
        }
    }





    return (
        <div>
            <h1>Dopisivanje {myUser.id} sa {chatId}</h1>

        {/*<div className="chat-container">*/}
            <div id="chatBox">
            </div>
            {/*TODO POSTAVI KONFIGURACIJU POSTO RADIMO S VITEOM*/}

                <div className="input-area">
                    <input type="text" id="messageInput" />
                    <button type="submit" onClick={sendMessage}>Slanje</button>
                </div>
        {/*</div>*/}
        </div>
    );
}

export default Chat;