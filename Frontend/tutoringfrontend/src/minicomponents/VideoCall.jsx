import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import config from '../config';

const VideoCall = () => {
    const [localStream, setLocalStream] = useState(null);
    const [users, setUsers] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [peerConnections, setPeerConnections] = useState({});
    const stompClientRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const pendingPeerConnections = useRef([]);
    const myUser = JSON.parse(sessionStorage.getItem("myUser")); // Assuming you store user info in sessionStorage

    useEffect(() => {
        // Initialize WebSocket connection
        const socket = new SockJS(`${config.BASE_URL}/api/ws/videoCall`);
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;

        stompClient.connect({}, frame => {
            console.log('CONNECTED: ' + frame);

            stompClient.subscribe('/queue/videoCall', message => {
                const msg = JSON.parse(message.body);
                console.log('RECEIVED MESSAGE: ', msg);
                if (msg.type === 'offer') {
                    handleOffer(msg);
                } else if (msg.type === 'answer') {
                    handleAnswer(msg);
                } else if (msg.type === 'ice-candidate') {
                    handleNewICECandidateMsg(msg);
                } else if (msg.type === 'join') {
                    handleUserJoined(msg.sender, msg.existingUsers);
                    console.log('USER JOINED: ' + msg.sender);
                } else if (msg.type === 'leave') {
                    handleUserLeft(msg.sender);
                    console.log('USER LEFT: ' + msg.sender);
                } else if (msg.type === 'existingUsers') {
                    handleExistingUsers(msg.existingUsers);
                    console.log('EXISTING USERS: ', msg.existingUsers);
                }
            });

            // Notify other users of the new user
            stompClient.send('/app/videoCall/join', {}, JSON.stringify({ type: 'join', sender: myUser.username }));
        });

        // Get user media
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    setLocalStream(stream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                    console.log('LOCAL STREAM SET');

                    // Create peer connections for pending users
                    pendingPeerConnections.current.forEach(username => {
                        createPeerConnection(username);
                    });
                    pendingPeerConnections.current = [];
                })
                .catch(error => {
                    console.error('Error accessing media devices.', error);
                });
        } else {
            console.error('navigator.mediaDevices not supported.');
        }

        return () => {
            // Cleanup on component unmount
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [myUser.username]);

    // Handle localStream changes to create pending peer connections
    useEffect(() => {
        if (localStream) {
            console.log('LOCAL STREAM UPDATED');
            pendingPeerConnections.current.forEach(username => {
                createPeerConnection(username);
            });
            pendingPeerConnections.current = [];
        }
    }, [localStream]);

    const handleUserJoined = (username, existingUsers) => {
        if (!users.includes(username)) {
            setUsers(prevUsers => [...prevUsers, username]);
        }
        if (existingUsers) {
            existingUsers.forEach(existingUser => {
                if (!users.includes(existingUser) && existingUser !== myUser.username) {
                    setUsers(prevUsers => [...prevUsers, existingUser]);
                    if (localStream) {
                        createPeerConnection(existingUser);
                    } else {
                        pendingPeerConnections.current.push(existingUser);
                    }
                }
            });
        }
        if (localStream) {
            createPeerConnection(username);
            console.log('UPDATED USERS LIST: ', [...users, username]);
        } else {
            console.log('Local stream not set yet, delaying peer connection creation.');
            pendingPeerConnections.current.push(username);
        }
    };

    const handleExistingUsers = (existingUsers) => {
        if (existingUsers) {
            existingUsers.forEach(username => {
                if (!users.includes(username) && username !== myUser.username) {
                    setUsers(prevUsers => [...prevUsers, username]);
                    if (localStream) {
                        createPeerConnection(username);
                    } else {
                        console.log('Local stream not set yet, delaying peer connection creation for existing users.');
                        pendingPeerConnections.current.push(username);
                    }
                }
            });
        }
    };

    const handleUserLeft = (username) => {
        if (peerConnections[username]) {
            peerConnections[username].close();
            const newPeerConnections = { ...peerConnections };
            delete newPeerConnections[username];
            setPeerConnections(newPeerConnections);
        }

        const newUsers = users.filter(user => user !== username);
        setUsers(newUsers);

        const newRemoteStreams = { ...remoteStreams };
        delete newRemoteStreams[username];
        setRemoteStreams(newRemoteStreams);

        console.log('UPDATED USERS LIST: ', newUsers);
    };

    const createPeerConnection = (username) => {
        if (!localStream) {
            console.log('LOCAL STREAM IS NULL WHEN CREATING PEER CONNECTION FOR: ', username);
            return;
        }

        const pc = new RTCPeerConnection();

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                stompClientRef.current.send('/app/videoCall/ice-candidate', {}, JSON.stringify({
                    type: 'ice-candidate',
                    target: username,
                    candidate: event.candidate,
                }));
                console.log('ICE CANDIDATE SENT: ', event.candidate);
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prevStreams => ({
                ...prevStreams,
                [username]: event.streams[0]
            }));
            console.log(`REMOTE STREAM ADDED FOR USER: ${username}`, event.streams[0]);
        };

        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });
        console.log('LOCAL STREAM TRACKS ADDED TO PEER CONNECTION FOR: ', username);

        setPeerConnections(prevConnections => ({
            ...prevConnections,
            [username]: pc,
        }));

        console.log('PEER CONNECTION CREATED FOR: ', username);
        return pc;
    };

    const handleOffer = async (offer) => {
        const pc = createPeerConnection(offer.sender);
        if (!pc) {
            console.log('Peer connection not created for offer from: ', offer.sender);
            return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        stompClientRef.current.send('/app/videoCall/answer', {}, JSON.stringify({
            type: 'answer',
            target: offer.sender,
            sdp: pc.localDescription,
        }));
        console.log('ANSWER SENT TO: ', offer.sender);
    };

    const handleAnswer = async (answer) => {
        const pc = peerConnections[answer.sender];
        if (!pc) {
            console.log('Peer connection not found for answer from: ', answer.sender);
            return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(answer.sdp));
        console.log('ANSWER RECEIVED FROM: ', answer.sender);
    };

    const handleNewICECandidateMsg = (msg) => {
        const pc = peerConnections[msg.sender];
        if (!pc) {
            console.log('Peer connection not found for ICE candidate from: ', msg.sender);
            return;
        }
        const candidate = new RTCIceCandidate(msg.candidate);
        pc.addIceCandidate(candidate)
            .then(() => {
                console.log('ICE CANDIDATE ADDED: ', msg.candidate);
            })
            .catch(error => {
                console.error('Error adding ICE candidate: ', error);
            });
        console.log('ICE CANDIDATE RECEIVED FROM: ', msg.sender);
    };

    const handleMuteUnmute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
            console.log('AUDIO TOGGLED: ', localStream.getAudioTracks()[0].enabled);
        }
    };

    const handleCameraToggle = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
            console.log('VIDEO TOGGLED: ', localStream.getVideoTracks()[0].enabled);
        }
    };
    const handleScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                localStream.getVideoTracks()[0].enabled = true;
                console.log('Screen sharing stopped, re-enabling local video');
            };

            const sender = Object.values(peerConnections)
                .flatMap(pc => pc.getSenders())
                .find(s => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
                console.log('Screen sharing started');
            }
        } catch (err) {
            console.error('Error sharing screen:', err);
        }
    };

    useEffect(() => {
        Object.keys(remoteStreams).forEach(username => {
            const videoElement = remoteVideoRefs.current[username];
            if (videoElement && remoteStreams[username]) {
                videoElement.srcObject = remoteStreams[username];
                console.log(`STREAM SET FOR USER: ${username}`, remoteStreams[username]);
            }
        });
    }, [remoteStreams]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
                <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: 'auto' }} />
                <p>{myUser.username} (You)</p>
            </div>
            {users.map(username => (
                <div key={username}>
                    <video
                        ref={el => remoteVideoRefs.current[username] = el}
                        autoPlay
                        style={{ width: '100%', height: 'auto' }}
                    />
                    <p>{username}</p>
                </div>
            ))}
            <button onClick={handleMuteUnmute}>Mute/Unmute</button>
            <button onClick={handleCameraToggle}>Camera On/Off</button>
            <button onClick={handleScreenShare}>Share Screen</button>
        </div>
    );
};

export default VideoCall;