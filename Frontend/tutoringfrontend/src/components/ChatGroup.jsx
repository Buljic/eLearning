import React from "react";
import {useParams} from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";

const ChatGroup =()=>{
const {objectGroup}=useParams();
console.log("Ovo je groupId"+objectGroup);

return (
    <div>
        <Chat chatId={objectGroup} isGroupChat={true}></Chat>
    </div>
)
}
export default ChatGroup;

