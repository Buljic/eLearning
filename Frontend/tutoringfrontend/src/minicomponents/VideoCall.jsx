import { useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import config from '../config';

const VideoCall = ({ groupId }) => {
    const [users, setUsers] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    const myUser = useMemo(() => JSON.parse(sessionStorage.getItem('myUser')), []);
    const myUsername = myUser?.username;
    const roomId = String(groupId ?? 'global');

    const stompClientRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const peerConnectionsRef = useRef({});
    const pendingIceCandidatesRef = useRef({});

    const addUser = (username) => {
        if (!username || username === myUsername) {
            return;
        }
        setUsers((prev) => (prev.includes(username) ? prev : [...prev, username]));
    };

    const removeUser = (username) => {
        const pc = peerConnectionsRef.current[username];
        if (pc) {
            pc.close();
            delete peerConnectionsRef.current[username];
        }

        delete pendingIceCandidatesRef.current[username];
        setUsers((prev) => prev.filter((user) => user !== username));
        setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[username];
            return next;
        });
    };

    const sendSignal = (destination, payload) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            return;
        }
        stompClientRef.current.publish({
            destination,
            body: JSON.stringify(payload),
        });
    };

    const flushPendingIceCandidates = async (sender) => {
        const pc = peerConnectionsRef.current[sender];
        const pending = pendingIceCandidatesRef.current[sender] || [];
        if (!pc || pending.length === 0 || !pc.remoteDescription) {
            return;
        }

        for (const candidate of pending) {
            try {
                await pc.addIceCandidate(candidate);
            } catch (error) {
                console.error('Failed to flush ICE candidate:', error);
            }
        }

        pendingIceCandidatesRef.current[sender] = [];
    };

    const createPeerConnection = (remoteUsername) => {
        const existing = peerConnectionsRef.current[remoteUsername];
        if (existing) {
            return existing;
        }

        if (!localStreamRef.current) {
            return null;
        }

        const pc = new RTCPeerConnection();

        localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({
                ...prev,
                [remoteUsername]: event.streams[0],
            }));
        };

        pc.onicecandidate = (event) => {
            if (!event.candidate) {
                return;
            }

            sendSignal('/app/videoCall/ice-candidate', {
                type: 'ice-candidate',
                roomId,
                sender: myUsername,
                target: remoteUsername,
                candidate: JSON.stringify(event.candidate),
            });
        };

        peerConnectionsRef.current[remoteUsername] = pc;
        return pc;
    };

    const createOffer = async (remoteUsername) => {
        const pc = createPeerConnection(remoteUsername);
        if (!pc) {
            return;
        }

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal('/app/videoCall/offer', {
                type: 'offer',
                roomId,
                sender: myUsername,
                target: remoteUsername,
                sdp: JSON.stringify(pc.localDescription),
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    };

    const handleOffer = async (message) => {
        if (message.target !== myUsername || message.sender === myUsername || !message.sdp) {
            return;
        }

        addUser(message.sender);
        const pc = createPeerConnection(message.sender);
        if (!pc) {
            return;
        }

        try {
            const remoteDescription = JSON.parse(message.sdp);
            await pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));
            await flushPendingIceCandidates(message.sender);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal('/app/videoCall/answer', {
                type: 'answer',
                roomId,
                sender: myUsername,
                target: message.sender,
                sdp: JSON.stringify(pc.localDescription),
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    const handleAnswer = async (message) => {
        if (message.target !== myUsername || message.sender === myUsername || !message.sdp) {
            return;
        }

        const pc = peerConnectionsRef.current[message.sender];
        if (!pc) {
            return;
        }

        try {
            const remoteDescription = JSON.parse(message.sdp);
            await pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));
            await flushPendingIceCandidates(message.sender);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (message) => {
        if (message.target !== myUsername || message.sender === myUsername || !message.candidate) {
            return;
        }

        const pc = createPeerConnection(message.sender);
        if (!pc) {
            return;
        }

        let parsedCandidate;
        try {
            parsedCandidate = new RTCIceCandidate(JSON.parse(message.candidate));
        } catch (error) {
            console.error('Invalid ICE candidate payload:', error);
            return;
        }

        if (!pc.remoteDescription) {
            const pending = pendingIceCandidatesRef.current[message.sender] || [];
            pending.push(parsedCandidate);
            pendingIceCandidatesRef.current[message.sender] = pending;
            return;
        }

        try {
            await pc.addIceCandidate(parsedCandidate);
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    };

    useEffect(() => {
        if (!myUsername) {
            return;
        }

        let mounted = true;
        const client = new Client({
            webSocketFactory: () => new SockJS(`${config.BASE_URL}/api/ws/videoCall`),
            reconnectDelay: 3000,
            debug: () => {},
        });
        stompClientRef.current = client;

        client.onConnect = () => {
            if (!mounted) {
                return;
            }

            client.subscribe(`/topic/videoCall/${roomId}`, (rawMessage) => {
                const message = JSON.parse(rawMessage.body);
                if (message.roomId && message.roomId !== roomId) {
                    return;
                }

                switch (message.type) {
                    case 'join':
                        if (message.sender && message.sender !== myUsername) {
                            addUser(message.sender);
                            createOffer(message.sender);
                        }
                        break;
                    case 'leave':
                        removeUser(message.sender);
                        break;
                    case 'existingUsers':
                        if (message.target === myUsername && Array.isArray(message.existingUsers)) {
                            message.existingUsers.forEach((username) => addUser(username));
                        }
                        break;
                    case 'offer':
                        handleOffer(message);
                        break;
                    case 'answer':
                        handleAnswer(message);
                        break;
                    case 'ice-candidate':
                        handleIceCandidate(message);
                        break;
                    default:
                        break;
                }
            });

            sendSignal('/app/videoCall/join', {
                type: 'join',
                roomId,
                sender: myUsername,
            });
        };
        client.activate();

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (!mounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                localStreamRef.current = stream;
                setLocalStream(stream);
            })
            .catch((error) => {
                console.error('Error accessing media devices:', error);
            });

        return () => {
            mounted = false;

            sendSignal('/app/videoCall/leave', {
                type: 'leave',
                roomId,
                sender: myUsername,
            });

            Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
            peerConnectionsRef.current = {};
            pendingIceCandidatesRef.current = {};

            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }
        };
    }, [myUsername, roomId]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        Object.keys(remoteStreams).forEach((username) => {
            const videoElement = remoteVideoRefs.current[username];
            if (videoElement) {
                videoElement.srcObject = remoteStreams[username];
            }
        });
    }, [remoteStreams]);

    const toggleMute = () => {
        if (!localStreamRef.current) {
            return;
        }
        const track = localStreamRef.current.getAudioTracks()[0];
        if (!track) {
            return;
        }
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
    };

    const toggleCamera = () => {
        if (!localStreamRef.current) {
            return;
        }
        const track = localStreamRef.current.getVideoTracks()[0];
        if (!track) {
            return;
        }
        track.enabled = !track.enabled;
        setCameraEnabled(track.enabled);
    };

    const handleScreenShare = async () => {
        if (!localStreamRef.current) {
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];

            Object.values(peerConnectionsRef.current).forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(screenTrack);
                }
            });

            if (cameraTrack) {
                screenTrack.onended = () => {
                    Object.values(peerConnectionsRef.current).forEach((pc) => {
                        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(cameraTrack);
                        }
                    });
                };
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    return (
        <div style={{ border: '1px solid #d6dde6', borderRadius: 12, background: '#f8fafc', padding: 16 }}>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={toggleMute} style={{ padding: '8px 12px' }}>
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button onClick={toggleCamera} style={{ padding: '8px 12px' }}>
                    {cameraEnabled ? 'Camera Off' : 'Camera On'}
                </button>
                <button onClick={handleScreenShare} style={{ padding: '8px 12px' }}>
                    Share Screen
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                <div style={{ background: '#e7eef6', padding: 10, borderRadius: 10 }}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', borderRadius: 8, background: '#000' }}
                    />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                        {myUsername} (You)
                    </p>
                </div>

                {users.map((username) => (
                    <div key={username} style={{ background: '#e7eef6', padding: 10, borderRadius: 10 }}>
                        <video
                            ref={(el) => {
                                remoteVideoRefs.current[username] = el;
                            }}
                            autoPlay
                            playsInline
                            style={{ width: '100%', borderRadius: 8, background: '#000' }}
                        />
                        <p style={{ margin: '8px 0 0 0', fontWeight: 600 }}>{username}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoCall;
