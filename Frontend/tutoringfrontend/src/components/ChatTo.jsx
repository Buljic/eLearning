import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import { Alert, Container } from "@mui/material";

const ChatTo = () => {
    const { objectUser } = useParams();
    const targetUserId = Number(objectUser);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return <Alert severity="error" sx={{ m: 3 }}>Neispravan korisnik za chat.</Alert>;
    }

    return (
        <Container maxWidth="md" sx={{ py: 2 }}>
            <Chat chatId={targetUserId} isGroupChat={false} />
        </Container>
    );
};

export default ChatTo;
