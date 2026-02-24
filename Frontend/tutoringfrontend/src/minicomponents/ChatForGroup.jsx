import Chat from "./Chat.jsx";

const ChatForGroup = ({ chatId, isGroupChat = true }) => {
  return <Chat chatId={chatId} isGroupChat={isGroupChat} />;
};

export default ChatForGroup;
