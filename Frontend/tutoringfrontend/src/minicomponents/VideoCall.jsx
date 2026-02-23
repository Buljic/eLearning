import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import config from '../config';
import { getSessionUser } from '../utils/sessionUser.js';

const VideoCall = ({ groupId }) => {
    const [users, setUsers] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [connecting, setConnecting] = useState(true);
    const [error, setError] = useState('');

    const myUser = useMemo(() => getSessionUser(), []);
    const myUsername = myUser?.username;
    const roomId = groupId ? String(groupId) : null;

    const stompClientRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const peerConnectionsRef = useRef({});
    const pendingIceCandidatesRef = useRef({});
    const cameraTrackRef = useRef(null);

    const sendSignal = useCallback((destination, payload) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            return;
        }
        stompClientRef.current.publish({
            destination,
            body: JSON.stringify(payload),
        });
    }, []);

    const addUser = useCallback((username) => {
        if (!username || username === myUsername) {
            return;
        }
        setUsers((prev) => (prev.includes(username) ? prev : [...prev, username]));
    }, [myUsername]);

    const removeUser = useCallback((username) => {
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
    }, []);

    const flushPendingIceCandidates = useCallback(async (sender) => {
        const pc = peerConnectionsRef.current[sender];
        const pending = pendingIceCandidatesRef.current[sender] || [];
        if (!pc || pending.length === 0 || !pc.remoteDescription) {
            return;
        }
        for (const candidate of pending) {
            try {
                await pc.addIceCandidate(candidate);
            } catch (flushError) {
                console.error('Failed to flush ICE candidate:', flushError);
            }
        }
        pendingIceCandidatesRef.current[sender] = [];
    }, []);

    const createPeerConnection = useCallback((remoteUsername) => {
        const existing = peerConnectionsRef.current[remoteUsername];
        if (existing) {
            return existing;
        }
        if (!localStreamRef.current) {
            return null;
        }

        const pc = new RTCPeerConnection({ iceServers: config.ICE_SERVERS });

        localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({ ...prev, [remoteUsername]: event.streams[0] }));
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

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
                removeUser(remoteUsername);
            }
        };

        peerConnectionsRef.current[remoteUsername] = pc;
        return pc;
    }, [myUsername, removeUser, roomId, sendSignal]);

    const createOffer = useCallback(async (remoteUsername) => {
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
        } catch (offerError) {
            console.error('Error creating offer:', offerError);
        }
    }, [createPeerConnection, myUsername, roomId, sendSignal]);

    const handleOffer = useCallback(async (message) => {
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
        } catch (handleOfferError) {
            console.error('Error handling offer:', handleOfferError);
        }
    }, [addUser, createPeerConnection, flushPendingIceCandidates, myUsername, roomId, sendSignal]);

    const handleAnswer = useCallback(async (message) => {
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
        } catch (handleAnswerError) {
            console.error('Error handling answer:', handleAnswerError);
        }
    }, [flushPendingIceCandidates, myUsername]);

    const handleIceCandidate = useCallback(async (message) => {
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
        } catch (candidateError) {
            console.error('Invalid ICE candidate payload:', candidateError);
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
        } catch (iceError) {
            console.error('Error adding ICE candidate:', iceError);
        }
    }, [createPeerConnection, myUsername]);

    useEffect(() => {
        if (!myUsername) {
            setError('Morate biti prijavljeni da biste koristili video poziv.');
            setConnecting(false);
            return;
        }
        if (!roomId) {
            setError('Video poziv mora biti vezan za grupu.');
            setConnecting(false);
            return;
        }

        let mounted = true;
        setConnecting(true);
        setError('');

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (!mounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                localStreamRef.current = stream;
                cameraTrackRef.current = stream.getVideoTracks()[0] || null;
                setLocalStream(stream);

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
                    setConnecting(false);

                    client.subscribe(`/user/queue/videoCall/${roomId}`, (rawMessage) => {
                        const message = JSON.parse(rawMessage.body);

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

                client.onStompError = () => {
                    setError('Greska u signalizaciji video poziva. Pokusajte ponovo.');
                };

                client.activate();
            })
            .catch((mediaError) => {
                console.error('Error accessing media devices:', mediaError);
                setConnecting(false);
                setError('Pristup kameri/mikrofonu nije dozvoljen.');
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
            remoteVideoRefs.current = {};
            setUsers([]);
            setRemoteStreams({});

            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }
        };
    }, [addUser, createOffer, handleAnswer, handleIceCandidate, handleOffer, myUsername, removeUser, roomId, sendSignal]);

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

            Object.values(peerConnectionsRef.current).forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(screenTrack);
                }
            });

            const currentStream = localStreamRef.current;
            const audioTrack = currentStream.getAudioTracks()[0];
            const composedStream = new MediaStream([screenTrack, ...(audioTrack ? [audioTrack] : [])]);
            setLocalStream(composedStream);

            screenTrack.onended = () => {
                const cameraTrack = cameraTrackRef.current;
                if (!cameraTrack) {
                    return;
                }
                Object.values(peerConnectionsRef.current).forEach((pc) => {
                    const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(cameraTrack);
                    }
                });

                const restoredStream = new MediaStream([cameraTrack, ...(audioTrack ? [audioTrack] : [])]);
                setLocalStream(restoredStream);
            };
        } catch (shareError) {
            console.error('Error sharing screen:', shareError);
        }
    };

    return (
        <Paper sx={{ border: '1px solid #d6dde6', borderRadius: 3, background: '#f8fafc', p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                <Chip label={connecting ? 'Povezivanje...' : 'Povezano'} color={connecting ? 'warning' : 'success'} size="small" />
                <Chip label={`U sobi: ${users.length + 1}`} size="small" />
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={toggleMute}>
                    {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button variant="outlined" onClick={toggleCamera}>
                    {cameraEnabled ? 'Camera Off' : 'Camera On'}
                </Button>
                <Button variant="contained" onClick={handleScreenShare}>
                    Share Screen
                </Button>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
                <Box sx={{ background: '#e7eef6', p: 1, borderRadius: 2 }}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', borderRadius: 8, background: '#000', minHeight: 160 }}
                    />
                    <Typography sx={{ mt: 1, fontWeight: 600 }}>
                        {myUsername} (You)
                    </Typography>
                </Box>

                {users.map((username) => (
                    <Box key={username} sx={{ background: '#e7eef6', p: 1, borderRadius: 2 }}>
                        <video
                            ref={(el) => {
                                remoteVideoRefs.current[username] = el;
                            }}
                            autoPlay
                            playsInline
                            style={{ width: '100%', borderRadius: 8, background: '#000', minHeight: 160 }}
                        />
                        <Typography sx={{ mt: 1, fontWeight: 600 }}>{username}</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default VideoCall;


