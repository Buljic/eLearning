// src/context/SocketContext.js
import React, { createContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import config from "./config.js"; // Make sure the path matches where your config file is located

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socketRef = useRef();

    useEffect(() => {
        // Establish the WebSocket connection
        socketRef.current = io(config.WS_BASE_URL, {
            path: '/api/ws/'
        });

        // Cleanup on component unmount
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef}>
            {children}
        </SocketContext.Provider>
    );
};