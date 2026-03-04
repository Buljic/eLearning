import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import { Alert } from "@mui/material";
const ChatGroup = () => {
    const { objectGroup } = useParams();
    const groupId = Number(objectGroup);
    if (!Number.isInteger(groupId) || groupId <= 0) {
        return <Alert severity="error">Neispravna grupa za chat.</Alert>;
    }

    return (
        <div>
            <Chat chatId={groupId} isGroupChat={true} />
        </div>
    );
};

export default ChatGroup;


