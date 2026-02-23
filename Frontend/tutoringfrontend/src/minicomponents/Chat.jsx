import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { format } from "date-fns";
import config from "../config.js";
import "../css/chat.css";
import { getSessionUser } from "../utils/sessionUser.js";

const MAX_MESSAGE_LENGTH = 4000;

function determineEndpoints(isGroupChat, chatId, myUserId) {
  const normalizedChatId = Number(chatId);
  if (!Number.isInteger(normalizedChatId) || normalizedChatId <= 0) {
    return null;
  }

  if (isGroupChat) {
    return {
      receiveEndpoint: `/user/queue/group/${normalizedChatId}`,
      sendEndpoint: `/app/${normalizedChatId}`,
    };
  }

  const isMyUserIdLess = myUserId < normalizedChatId;
  const base = isMyUserIdLess ? `${myUserId}/${normalizedChatId}` : `${normalizedChatId}/${myUserId}`;
  return {
    receiveEndpoint: `/user/queue/direct/${base}`,
    sendEndpoint: `/app/${base}`,
  };
}

const Chat = ({ chatId, isGroupChat }) => {
  const myUser = useMemo(() => getSessionUser(), []);
  const stompClientRef = useRef(null);

  const [endpoints, setEndpoints] = useState({ receiveEndpoint: "", sendEndpoint: "" });
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageText, setMessageText] = useState("");

  const appendMessage = useCallback((messageBody) => {
    const messageTime = messageBody.id?.time
      ? format(new Date(messageBody.id.time), "yyyy-MM-dd HH:mm:ss")
      : messageBody.time
        ? format(new Date(messageBody.time), "yyyy-MM-dd HH:mm:ss")
        : format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const messageElement = {
      id: messageBody.id?.time || messageBody.id || new Date().toISOString(),
      text: messageBody.messageText || messageBody.message_text || "",
      time: messageTime,
      sender: messageBody.senderName || messageBody.sender_name || "",
      senderId: messageBody.senderId || messageBody.id?.user1 || null,
      user1: messageBody.id?.user1 || messageBody.senderId || null,
      user2: messageBody.id?.user2 || chatId,
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, messageElement];
      return updatedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
    });
  }, [chatId]);

  const fetchPreviousMessages = useCallback(async (nextPage, reset = false) => {
    if (!hasMoreMessages && !reset) return;

    let fetchEndpoint = "";
    if (isGroupChat) {
      fetchEndpoint = `${config.BASE_URL}/api/${chatId}/getOldGroupMessages?page=${nextPage}&size=10`;
    } else {
      fetchEndpoint = `${config.BASE_URL}/api/${myUser.id}/${chatId}/getOldDirectMessages?page=${nextPage}&size=10`;
    }

    try {
      const response = await fetch(fetchEndpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return;
      }

      const messagesData = await response.json();
      if (messagesData.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      const normalized = messagesData.map((msg) => ({
        id: msg.id?.time || msg.time || msg.id,
        text: msg.messageText || msg.message_text || "",
        time: format(new Date(msg.id?.time || msg.time), "yyyy-MM-dd HH:mm:ss"),
        sender: msg.senderName || msg.sender_name || "",
        senderId: msg.id?.user1 || msg.senderId || null,
        user1: msg.id?.user1 || msg.senderId || null,
        user2: msg.id?.user2 || chatId,
      }));

      setMessages((prevMessages) => {
        const merged = reset ? normalized : [...normalized, ...prevMessages];
        return merged.sort((a, b) => new Date(a.time) - new Date(b.time));
      });

      setPage(nextPage + 1);
    } catch (error) {
      console.error("Error fetching old messages:", error);
    }
  }, [chatId, hasMoreMessages, isGroupChat, myUser.id]);

  useEffect(() => {
    if (!chatId || !myUser?.id) return;

    const resolvedEndpoints = determineEndpoints(isGroupChat, chatId, myUser.id);
    if (!resolvedEndpoints) {
      return;
    }
    setEndpoints(resolvedEndpoints);
    setMessages([]);
    setPage(0);
    setHasMoreMessages(true);

    const endpoint = isGroupChat ? "/api/chatGroup" : "/api/chatTo";
    const client = new Client({
      webSocketFactory: () => new SockJS(`${config.BASE_URL}${endpoint}`),
      reconnectDelay: 3000,
      debug: () => {},
    });

    client.onConnect = () => {
      client.subscribe(resolvedEndpoints.receiveEndpoint, (messageOutput) => {
        const message = JSON.parse(messageOutput.body);
        appendMessage(message);
      });
    };

    client.activate();
    stompClientRef.current = client;
    fetchPreviousMessages(0, true);

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [appendMessage, chatId, fetchPreviousMessages, isGroupChat, myUser]);

  const sendMessage = () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || trimmedMessage.length > MAX_MESSAGE_LENGTH || !stompClientRef.current?.connected) {
      return;
    }

    const chatMessage = {
      message_text: trimmedMessage,
      senderId: myUser.id,
      senderName: myUser.username,
      user2: !isGroupChat ? chatId : undefined,
    };

    stompClientRef.current.publish({
      destination: endpoints.sendEndpoint,
      body: JSON.stringify(chatMessage),
    });

    setMessageText("");
  };

  if (!chatId) return "Ucitavanje...";
  if (!myUser?.id) return "Niste prijavljeni.";
  if (!endpoints.receiveEndpoint || !endpoints.sendEndpoint) return "Neispravan chat.";

  return (
    <section className="chat-panel">
      <div className="chat-toolbar">
        <button className="chat-button-secondary" onClick={() => fetchPreviousMessages(page)}>
          Ucitaj vise
        </button>
      </div>

      <div className="chat-box">
        {messages.map((msg) => {
          const isMine = msg.senderId === myUser.id || msg.user1 === myUser.id;
          return (
            <div key={msg.id} className={`chat-row ${isMine ? "chat-row-mine" : "chat-row-other"}`}>
              <article className={`chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-other"}`}>
                <p className="chat-text">{msg.text}</p>
                <p className="chat-meta">{msg.time}</p>
                <p className="chat-author">{msg.sender}</p>
              </article>
            </div>
          );
        })}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Unesi poruku..."
        />
        <button className="chat-button-primary" type="button" onClick={sendMessage}>
          Slanje
        </button>
      </div>
    </section>
  );
};

export default Chat;
