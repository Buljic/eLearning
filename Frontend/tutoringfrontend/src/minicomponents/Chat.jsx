import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { format } from "date-fns";
import config from '../config.js';
function determineEndpoints(isGroupChat, chatId, myUserId) {
    if (isGroupChat) {
        return {
            receiveEndpoint: `/queue/${chatId}`,
            sendEndpoint: `/app/${chatId}`,
            baseEndpoint: `${chatId}`
        };
    } else {
        const isMyUserIdLess = myUserId < chatId;
        const base = isMyUserIdLess ? `${myUserId}/${chatId}` : `${chatId}/${myUserId}`;
        return {
            receiveEndpoint: `/queue/${base}`,
            sendEndpoint: `/app/${base}`,
            baseEndpoint: base
        };
    }
}

const Chat = ({ chatId, isGroupChat }) => {
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    const stompClient = useRef(null);
    const [ourEndpointToReceive, setOurEndpointToReceive] = useState("");
    const [ourEndpointToSend, setOurEndpointToSend] = useState("");
    const [baseEndpoint, setBaseEndpoint] = useState("");
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    useEffect(() => {
        if (!chatId) return; // Avoid further execution if chatId is not available

        const allEndpoints = determineEndpoints(isGroupChat, chatId, myUser.id);
        setOurEndpointToReceive(allEndpoints.receiveEndpoint);
        setOurEndpointToSend(allEndpoints.sendEndpoint);
        setBaseEndpoint(allEndpoints.baseEndpoint);

        if (!stompClient.current) {
            let socket;
            if (isGroupChat) {
                socket = new SockJS("http://localhost:8080/api/chatGroup");
            } else {
                socket = new SockJS("http://localhost:8080/api/chatTo");
            }
            stompClient.current = Stomp.over(socket);

            stompClient.current.connect({}, function (frame) {
                console.log("Connected: " + frame);

                stompClient.current.subscribe(allEndpoints.receiveEndpoint, (messageOutput) => {
                    const message = JSON.parse(messageOutput.body);
                    console.log("Received message: ", message);
                    appendMessage(message, isGroupChat);
                });
            });
        }

        fetchPreviousMessages();

        return () => {
            if (stompClient.current && stompClient.current.connected) {
                stompClient.current.disconnect(() => {
                    console.log("Disconnected!");
                });
            }
        };
    }, [chatId, isGroupChat, myUser.id]);

    const appendMessage = (messageBody, isGroupChat) => {
        const messageTime = messageBody.id && messageBody.id.time
            ? format(new Date(messageBody.id.time), "yyyy-MM-dd HH:mm:ss")
            : format(new Date(), "yyyy-MM-dd HH:mm:ss");

        const messageElement = {
            id: messageBody.id ? messageBody.id.time : new Date().toISOString(),
            text: messageBody.message_text,
            time: messageTime,
            sender: messageBody.senderName || messageBody.sender_name,
            senderId: messageBody.senderId || (messageBody.id ? messageBody.id.user1 : myUser.id),
            user1: messageBody.id ? messageBody.id.user1 : myUser.id,
            user2: messageBody.id ? messageBody.id.user2 : chatId,
        };

        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, messageElement];
            return updatedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        });
    };

    const fetchPreviousMessages = async () => {
        if (!hasMoreMessages) return;

        let fetchEndpoint = '';
        if (isGroupChat) {
            fetchEndpoint = `http://localhost:8080/api/${chatId}/getOldGroupMessages?page=${page}&size=10`;
        } else {
            fetchEndpoint = `http://localhost:8080/api/${myUser.id}/${chatId}/getOldDirectMessages?page=${page}&size=10`;
        }
        try {
            const response = await fetch(fetchEndpoint, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                console.log("Problem fetching old messages");
                return;
            }
            const messagesData = await response.json();
            console.log("Fetched messages: ", messagesData);
            if (messagesData.length === 0) {
                setHasMoreMessages(false);
            } else {
                const newMessages = messagesData.map(msg => ({
                    id: msg.id.time, // Using the time as a unique identifier
                    text: msg.messageText,
                    time: format(new Date(msg.id.time), "yyyy-MM-dd HH:mm:ss"),
                    sender: msg.senderName || msg.sender_name,
                    senderId: msg.id.user1,  // Assuming user1 is the senderId
                    user1: msg.id.user1,
                    user2: msg.id.user2,
                }));
                setMessages(prevMessages => {
                    const updatedMessages = [...newMessages, ...prevMessages];
                    return updatedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
                });
                setPage(prevPage => prevPage + 1);
            }
        } catch (error) {
            console.log("Error fetching old messages: ", error);
        }
    };

    const sendMessage = () => {
        let messageElement = document.getElementById("messageInput");
        let messageText = messageElement.value;
        if (messageText.trim() !== "") {
            const chatMessage = {
                message_text: messageText,
                senderId: myUser.id,
                senderName: myUser.username,  // Adding senderName
                user2: !isGroupChat ? chatId : undefined,
            };
            stompClient.current.send(ourEndpointToSend, {}, JSON.stringify(chatMessage));
            messageElement.value = '';
        }
    };

    if (!chatId) return "Učitavanje...";

    return (
        <div>
            <h1>Dopisivanje {myUser.id} sa {chatId}</h1>

            <button onClick={fetchPreviousMessages}>Učitaj više</button>

            <div id="chatBox">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.senderId === myUser.id ? 'sent-message' : 'received-message'}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.senderId === myUser.id ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                            <span style={{ backgroundColor: msg.senderId === myUser.id ? '#b3e5fc' : '#f1f1f1', borderRadius: '10px', padding: '10px', maxWidth: '70%' }}>
                                <b>{msg.text}</b>
                                <br />
                                <span style={{ fontSize: '10px', color: 'gray', textAlign: 'right' }}><i>{msg.time}</i></span>
                                <br />
                                <span style={{ fontSize: '12px', color: 'black', textAlign: 'right' }}>{msg.sender}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="input-area">
                <input type="text" id="messageInput" />
                <button type="submit" onClick={sendMessage}>Slanje</button>
            </div>
        </div>
    );
}

export default Chat;
