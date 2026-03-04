import {useParams} from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import { Alert } from "@mui/material";
const ChatTo=()=>{
    const {objectUser}=useParams();
    const targetUserId = Number(objectUser);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return <Alert severity="error">Neispravan korisnik za chat.</Alert>;
    }

    return (
        <div>
            <Chat chatId={targetUserId} isGroupChat={false}></Chat>

        </div>
    );
}
export default ChatTo;











