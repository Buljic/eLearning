// src/minicomponents/VideoCall.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import config from '../config';

const VideoCall = ({ groupId }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [peerConnections, setPeerConnections] = useState({});
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    useEffect(() => {
        // Initialize WebSocket connection
        socketRef.current = io(config.WS_BASE_URL);
        socketRef.current.emit('join', { groupId });

        // Handle WebSocket events
        socketRef.current.on('offer', handleOffer);
        socketRef.current.on('answer', handleAnswer);
        socketRef.current.on('ice-candidate', handleNewICECandidateMsg);
        socketRef.current.on('user-joined', handleUserJoined);
        socketRef.current.on('user-left', handleUserLeft);

        // Get user media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Notify other users of the new user
                socketRef.current.emit('ready', { groupId });
            });

        return () => {
            // Cleanup on component unmount
            socketRef.current.disconnect();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [groupId]);

    const handleUserJoined = (userId) => {
        createPeerConnection(userId);
        socketRef.current.emit('offer', { userId, sdp: peerConnections[userId].localDescription });
    };

    const handleUserLeft = (userId) => {
        if (peerConnections[userId]) {
            peerConnections[userId].close();
            const newPeerConnections = { ...peerConnections };
            delete newPeerConnections[userId];
            setPeerConnections(newPeerConnections);
        }

        const newRemoteStreams = { ...remoteStreams };
        delete newRemoteStreams[userId];
        setRemoteStreams(newRemoteStreams);
    };

    const createPeerConnection = (userId) => {
        const pc = new RTCPeerConnection();

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    target: userId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prevStreams => ({
                ...prevStreams,
                [userId]: event.streams[0]
            }));
        };

        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        pc.createOffer().then(sdp => {
            pc.setLocalDescription(sdp);
            socketRef.current.emit('offer', {
                target: userId,
                sdp: pc.localDescription,
            });
        });

        setPeerConnections(prevConnections => ({
            ...prevConnections,
            [userId]: pc,
        }));

        return pc;
    };

    const handleOffer = async (offer) => {
        const pc = createPeerConnection(offer.sender);
        await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('answer', {
            target: offer.sender,
            sdp: pc.localDescription,
        });
    };

    const handleAnswer = async (answer) => {
        const pc = peerConnections[answer.sender];
        await pc.setRemoteDescription(new RTCSessionDescription(answer.sdp));
    };

    const handleNewICECandidateMsg = (msg) => {
        const pc = peerConnections[msg.sender];
        const candidate = new RTCIceCandidate(msg.candidate);
        pc.addIceCandidate(candidate);
    };

    const handleMuteUnmute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
        }
    };

    const handleCameraToggle = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
        }
    };

    const handleScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                localStream.getVideoTracks()[0].enabled = true;
            };

            const sender = peerConnections[Object.keys(peerConnections)[0]].getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        } catch (err) {
            console.error('Error sharing screen:', err);
        }
    };

    useEffect(() => {
        Object.keys(remoteStreams).forEach(userId => {
            const videoElement = remoteVideoRefs.current[userId];
            if (videoElement && remoteStreams[userId]) {
                videoElement.srcObject = remoteStreams[userId];
            }
        });
    }, [remoteStreams]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: 'auto' }} />
            {Object.keys(remoteStreams).map(userId => (
                <video
                    key={userId}
                    ref={el => remoteVideoRefs.current[userId] = el}
                    autoPlay
                    style={{ width: '100%', height: 'auto' }}
                />
            ))}
            <button onClick={handleMuteUnmute}>Mute/Unmute</button>
            <button onClick={handleCameraToggle}>Camera On/Off</button>
            <button onClick={handleScreenShare}>Share Screen</button>
        </div>
    );
};

export default VideoCall;
