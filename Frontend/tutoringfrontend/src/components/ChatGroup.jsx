import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
const ChatGroup = () => {
    const { objectGroup } = useParams();

    return (
        <div>
            <Chat chatId={objectGroup} isGroupChat={true} />
        </div>
    );
};

export default ChatGroup;


