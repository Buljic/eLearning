import React, { useEffect, useRef, useState, useContext } from 'react';
import SimplePeer from 'simple-peer';

import Video from "./Video.jsx"; // Make sure you have a context for WebSockets

const VideoCall = ({ groupId }) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useContext(SocketContext);
    const userVideo = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;

            socketRef.current.emit('join room', groupId);

            socketRef.current.on('all users', users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    });
                    peers.push(peer);
                });
                setPeers(peers);
            });

            socketRef.current.on('user joined', payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on('receiving returned signal', payload => {
                const item = peersRef.current.find(p => p.peerID === payload.callerID);
                item.peer.signal(payload.signal);
            });
        });

        // Clean up function
        return () => {
            socketRef.current.off('user joined');
            socketRef.current.off('all users');
            socketRef.current.off('receiving returned signal');
        };
    }, [groupId]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socketRef.current.emit('sending signal', { userToSignal, callerID, signal });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socketRef.current.emit('returning signal', { callerID, signal });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <div className="video-call-container">
            <video playsInline muted ref={userDatabase} autoPlay className="user-video" />
            {peers.map((peer, index) => (
                <Video key={index} peer={peer} />
            ))}
        </div>
    );
};

export default VideoCall;
