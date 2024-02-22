import React, {useEffect, useRef, useState} from "react";

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {act} from "react-dom/test-utils";


function determineEndpoints(isGroupChat, chatId, myUserId) {
    if (isGroupChat) {
        return {
            receiveEndpoint: `/queue/${chatId}`,
            sendEndpoint: `/app/${chatId}`,
            baseEndpoint: `${chatId}`
        };
    } else {

        const isMyUserIdLess = myUserId < chatId;
        const base = isMyUserIdLess ? `${myUserId}/${chatId}` : `${chatId}/${myUserId}`;
        return {
            receiveEndpoint: `/queue/${base}`,
            sendEndpoint: `/app/${base}`,
            baseEndpoint: base
        };
    }
}

const Chat=({chatId,isGroupChat})=>{//ako je group chat onda proslijedujemo groupchatid a inace samo id te osobe

    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);

    const stompClient=useRef(null);
    const[ourEndpointToReceive,setOurEndpointToReceive]=useState('');
    const[ourEndpointToSend,setOurEndpointToSend]=useState('');
    const[baseEndpoint,setBaseEndpoint]=useState('');//TODO skrati s 3 varijable na jednu i koristi ovu




    useEffect(() => {
        const allEndpoints = determineEndpoints(isGroupChat, chatId, myUser.id);
        setOurEndpointToReceive(allEndpoints.receiveEndpoint);
        setOurEndpointToSend(allEndpoints.sendEndpoint);
        setBaseEndpoint(allEndpoints.baseEndpoint);

        // Odredjivanje pravog endpointa na osnovu tipa chata
        let socket;
        if (isGroupChat) {
            socket = new SockJS('http://localhost:8080/api/chatGroup');
        } else {
            socket = new SockJS('http://localhost:8080/api/chatTo');
        }
        stompClient.current = Stomp.over(socket);

        let subscription;
        let activeConnection = false;

        stompClient.current.connect({}, function (frame) {
            console.log('Povezano: ' + frame);
            activeConnection = true;

            subscription = stompClient.current.subscribe(allEndpoints.receiveEndpoint, (messageOutput) => {
                appendMessage(messageOutput.body, isGroupChat);
            });
        });

        async function fetchPreviousMessages() {
            let fetchEndpoint = '';
            if (isGroupChat) {
                fetchEndpoint = `http://localhost:8080/api/${chatId}/getOldGroupMessages`;
            } else {
                fetchEndpoint = `http://localhost:8080/api/${myUser.id}/${chatId}/getOldDirectMessages`;
            }
            const response = await fetch(fetchEndpoint, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                console.log("Problem prilikom dohvatanja starih poruka");
                return;
            }
            const poruke = await response.json();
            poruke.reverse();
            poruke.forEach(poruka => {
                appendMessage(JSON.stringify(poruka), isGroupChat);
            });
        }

        fetchPreviousMessages();

        return () => {
            if (activeConnection && stompClient.current) {
                stompClient.current.disconnect(() => {
                    console.log('Diskonektovan!');
                });
            }
        };
    }, [chatId, isGroupChat, myUser.id]);

    function appendMessage(neformatiranaPoruka, isGroupChat) {
        const messageBody = JSON.parse(neformatiranaPoruka);
        let chatBox = document.getElementById('chatBox');
        let messageElement = document.createElement('div');

        messageElement.innerText = messageBody.message_text;

        if (isGroupChat) {
            messageElement.className = messageBody.sender !== myUser.id ? 'received-message' : 'sent-message';
        } else {
            messageElement.className = messageBody.user2 === myUser.id ? 'received-message' : 'sent-message';
        }

        chatBox.appendChild(messageElement);
    }

    function sendMessage()
    {
        if(!isGroupChat)
        {

        let messageElement = document.getElementById('messageInput');
        let messageText = messageElement.value; //value se koristi za input field a ne innerText(on za <p> i sl)
        if (messageText.trim() !== '')//da nije prazno
        {
            console.log(messageText+"OVO JE PORUKA");
            const chatMessage={
                message_text:messageText,
                user2:chatId
            };
            stompClient.current.send(ourEndpointToSend, {}, JSON.stringify(chatMessage)/*JSON.stringify(messageText,chatId)*/);
            messageElement.value = '';
        }
    }else{
            let messageElement = document.getElementById('messageInput');
            let messageText = messageElement.value; //value se koristi za input field a ne innerText(on za <p> i sl)
            if (messageText.trim() !== '')//da nije prazno
            {
                console.log(messageText+"OVO JE PORUKA ZA GROUP");
                const chatMessage={
                    message_text:messageText,
                    sender:myUser.id
                };
                stompClient.current.send(ourEndpointToSend, {}, JSON.stringify(chatMessage)/*JSON.stringify(messageText,chatId)*/);
                messageElement.value = '';
                console.log(ourEndpointToReceive+"OVO JE TAJ ENDPOINT");
            }
        }
    }




    return (
        <div>
            <h1>Dopisivanje {myUser.id} sa {chatId}</h1>

            <div id="chatBox">
            </div>
            {/*TODO POSTAVI KONFIGURACIJU POSTO RADIMO S VITEOM*/}

                <div className="input-area">
                    <input type="text" id="messageInput" />
                    <button type="submit" onClick={sendMessage}>Slanje</button>
                </div>
        </div>
    );
}

export default Chat;