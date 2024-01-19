import React, {useEffect} from "react";

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Chat=({chatId,isGroupChat})=>{//ako je group chat onda proslijedujemo groupchatid a inace samo id te osobe
    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);
    if(!isGroupChat)
    {
        useEffect(()=>{
            // const websocket=new WebSocket('ws://localhost:8080/chat');
            const socket=new SockJS('http://localhost:8080/api/chatTo');//navodno znati ce se da je ovdje veza ta
            const stompClient=Stomp.over(socket);//koristimo socket iznad kao argument za ovaj stompClient

            stompClient.connect({},function(frame){
                console.log('Povezano:'+frame);

                if(myUser.id<chatId/*parseInt(objectUser)*/)
                {
                    stompClient.subscribe('/queue/'+myUser.id.toString()+'/'+/*objectUser.*/chatId.toString(),function (messageOutput) {

                        // appendMessage(messageOutput.body,chatId); TODO ovdje kao treba da se filtrira cija je poruka

                    });//todo finish
                }else {
                    stompClient.subscribe('/queue/'+chatId.toString()+'/'+myUser.id.toString(),function (messageOutput) {

                    });

                }
            });
            function appendMessage(messageBody, sender) {

            }

        },[]);
    }

//TODO BOLJI ce pristup biti napraviti algoritam za kreiranje idija ili jednostavno mozda auto increment
// umjesto pravljenja dinamickih endpointa jer cemo tako moci koristiti jedan endpoint za 2 usera a u isto
// vrijeme moci jednostavno to praviti jer ce sve biti u nekoj tabeli spremljeno

    return (
        <div>
            <h1>Dopisivanje {myUser.id} sa {chatId}</h1>

            <div id="chatBox">
            </div>
            {/*TODO POSTAVI KONFIGURACIJU POSTO RADIMO S VITEOM*/}
            <input type="text" id="messageInput"></input>

        </div>
    );
}



export default Chat;






