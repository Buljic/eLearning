import React from "react";
import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import config from '../config.js';
const ChatGroup = () => {
    const { objectGroup } = useParams();
    console.log("Ovo je groupId " + objectGroup);

    return (
        <div>
            <Chat chatId={objectGroup} isGroupChat={true} />
        </div>
    );
};

export default ChatGroup;


