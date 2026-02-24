import {useParams} from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
const ChatTo=()=>{
    const {objectUser}=useParams();

    return (
        <div>
            <Chat chatId={objectUser} isGroupChat={false}></Chat>

        </div>
    );
}
export default ChatTo;











