import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

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

    const appendMessage = (messageBody, isGroupChat) => {
        let chatBox = document.getElementById("chatBox");
        let messageElement = document.createElement("div");

        messageElement.innerText = messageBody.message_text;

        if (isGroupChat) {
            messageElement.className = messageBody.sender !== myUser.id ? "received-message" : "sent-message";
        } else {
            messageElement.className = messageBody.user2 === myUser.id ? "received-message" : "sent-message";
        }

        chatBox.appendChild(messageElement);
    };

    const fetchPreviousMessages = async () => {
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
                console.log("Problem prilikom dohvatanja starih poruka");
                return;
            }
            const poruke = await response.json();
            console.log("Fetched messages: ", poruke);
            poruke.reverse();
            setMessages(prevMessages => [...poruke, ...prevMessages]);
            setPage(prevPage => prevPage + 1);
        } catch (error) {
            console.log("Greška prilikom dohvatanja starih poruka: ", error);
        }
    };

    useEffect(() => {
        const allEndpoints = determineEndpoints(isGroupChat, chatId, myUser.id);
        setOurEndpointToReceive(allEndpoints.receiveEndpoint);
        setOurEndpointToSend(allEndpoints.sendEndpoint);
        setBaseEndpoint(allEndpoints.baseEndpoint);

        let socket;
        if (isGroupChat) {
            socket = new SockJS("http://localhost:8080/api/chatGroup");
        } else {
            socket = new SockJS("http://localhost:8080/api/chatTo");
        }
        stompClient.current = Stomp.over(socket);

        let activeConnection = false;

        stompClient.current.connect({}, function (frame) {
            console.log("Povezano: " + frame);
            activeConnection = true;

            stompClient.current.subscribe(allEndpoints.receiveEndpoint, (messageOutput) => {
                appendMessage(JSON.parse(messageOutput.body), isGroupChat);
            });
        });

        fetchPreviousMessages();

        return () => {
            if (activeConnection && stompClient.current) {
                stompClient.current.disconnect(() => {
                    console.log("Diskonektovan!");
                });
            }
        };
    }, [chatId, isGroupChat, myUser.id]);

    const sendMessage = () => {
        let messageElement = document.getElementById("messageInput");
        let messageText = messageElement.value;
        if (messageText.trim() !== "") {
            if (!isGroupChat) {
                const chatMessage = {
                    message_text: messageText,
                    user2: chatId
                };
                stompClient.current.send(ourEndpointToSend, {}, JSON.stringify(chatMessage));
            } else {
                const chatMessage = {
                    message_text: messageText,
                    sender: myUser.id
                };
                stompClient.current.send(ourEndpointToSend, {}, JSON.stringify(chatMessage));
            }
            messageElement.value = '';
        }
    };

    return (
        <div>
            <h1>Dopisivanje {myUser.id} sa {chatId}</h1>

            <div id="chatBox">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.id.user1 === myUser.id ? 'sent-message' : 'received-message'}>
                        {msg.messageText}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input type="text" id="messageInput" />
                <button type="submit" onClick={sendMessage}>Slanje</button>
            </div>
            <button onClick={fetchPreviousMessages}>Učitaj više</button>
        </div>
    );
}

export default Chat;
