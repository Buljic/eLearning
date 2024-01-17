import React, {useEffect} from "react";

const Chat=(chatId,isGroupChat)=>{//ako je group chat onda proslijedujemo groupchatid a inace samo id te osobe
    if(!isGroupChat)
    {
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
    }

//TODO BOLJI ce pristup biti napraviti algoritam za kreiranje idija ili jednostavno mozda auto increment
// umjesto pravljenja dinamickih endpointa jer cemo tako moci koristiti jedan endpoint za 2 usera a u isto
// vrijeme moci jednostavno to praviti jer ce sve biti u nekoj tabeli spremljeno
}

export default Chat;






