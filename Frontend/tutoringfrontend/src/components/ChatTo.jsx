import React, {useEffect} from "react";
import {useParams} from "react-router-dom";
import useFetchUser from "../customHooks/useFetchUser.js";
import Chat from "../minicomponents/Chat.jsx";
const ChatTo=()=>{
    const {objectUser}=useParams();
    //const [ourUser,error,loading]=useFetchUser();

    console.log("korisnik je"+ objectUser);

    return (
        <div>
            <Chat chatId={objectUser} isGroupChat={false}></Chat>

        </div>
    );
}
export default ChatTo;











