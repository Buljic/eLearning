import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import config from '../config.js';

const VideoCall = ({ groupId }) => {
    const [peers, setPeers] = useState([]);
    const userVideo = useRef();
    const peersRef = useRef([]);
    const userStream = useRef();
    const [stream, setStream] = useState(null);
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const stompClientRef = useRef();

    useEffect(() => {
        const socket = new SockJS(`${config.BASE_URL}/api/videoCall`);
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;

        stompClient.connect({}, () => {
            console.log('Connected to WebSocket');

            stompClient.subscribe(`/topic/call/${groupId}`, (message) => {
                const payload = JSON.parse(message.body);
                console.log('Received signal:', payload);
                handleSignal(payload);
            });

            stompClient.subscribe(`/user/queue/errors`, (message) => {
                const errorMessage = message.body;
                console.error('Error:', errorMessage);
                alert(errorMessage); // Display error to the user
            });
        }, error => {
            console.error('Error connecting to WebSocket:', error);
        });

        return () => {
            leaveCall();
            stompClient.disconnect();
        };
    }, [groupId]);

    const joinCall = () => {
        const storedUser = sessionStorage.getItem('myUser');
        const myUser = JSON.parse(storedUser);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    userVideo.current.srcObject = stream;
                    userStream.current = stream;
                    setStream(stream);
                    console.log('User media stream:', stream);

                    const joinPayload = {
                        type: 'join',
                        groupId: groupId,
                        userId: myUser.id,
                        username: myUser.username
                    };
                    stompClientRef.current.send(`/app/video/join/${groupId}`, {}, JSON.stringify(joinPayload));
                })
                .catch(error => {
                    console.error('Error accessing media devices.', error);
                });
        } else {
            console.error('Media devices not supported in this browser.');
        }
    };

    const leaveCall = () => {
        const storedUser = sessionStorage.getItem('myUser');
        const myUser = JSON.parse(storedUser);

        console.log('Leaving call');

        const leavePayload = {
            type: 'leave',
            groupId: groupId,
            userId: myUser.id,
            username: myUser.username
        };
        stompClientRef.current.send(`/app/video/leave/${groupId}`, {}, JSON.stringify(leavePayload));

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !cameraOn;
            setCameraOn(!cameraOn);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const shareScreen = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ cursor: true })
                .then(screenStream => {
                    const screenTrack = screenStream.getTracks()[0];
                    userStream.current.getVideoTracks()[0].stop();
                    userStream.current.addTrack(screenTrack);
                    screenTrack.onended = () => {
                        userStream.current.removeTrack(screenTrack);
                        joinCall();
                    };
                })
                .catch(error => {
                    console.error('Error accessing display media.', error);
                });
        } else {
            console.error('Display media not supported in this browser.');
        }
    };

    const handleSignal = (payload) => {
        const { type, signal, callerID } = payload;
        console.log('Handling signal:', payload);
        switch (type) {
            case 'user-joined':
                const peer = addPeer(signal, callerID, userStream.current);
                peersRef.current.push({
                    peerID: callerID,
                    peer,
                });
                setPeers(users => [...users, peer]);
                break;
            case 'receiving-returned-signal':
                const item = peersRef.current.find(p => p.peerID === callerID);
                if (item) {
                    console.log('Signaling peer:', item);
                    item.peer.signal(signal);
                }
                break;
            case 'user-left':
                const peerObj = peersRef.current.find(p => p.peerID === callerID);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const remainingPeers = peersRef.current.filter(p => p.peerID !== callerID);
                peersRef.current = remainingPeers;
                setPeers(remainingPeers);
                break;
            default:
                break;
        }
    };

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            const payload = {
                type: 'user-joined',
                userToSignal,
                callerID,
                signal
            };
            stompClientRef.current.send(`/app/video/signal/${groupId}`, {}, JSON.stringify(payload));
        });

        return peer;
    };

    const addPeer = (incomingSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            const payload = {
                type: 'receiving-returned-signal',
                callerID,
                signal
            };
            stompClientRef.current.send(`/app/video/signal/${groupId}`, {}, JSON.stringify(payload));
        });

        peer.signal(incomingSignal);

        return peer;
    };

    return (
        <div>
            <div>
                <button onClick={joinCall}>Join Call</button>
                <button onClick={leaveCall}>Leave Call</button>
                <button onClick={toggleCamera}>{cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}</button>
                <button onClick={toggleMic}>{micOn ? 'Mute' : 'Unmute'}</button>
                <button onClick={shareScreen}>Share Screen</button>
            </div>
            <video muted ref={userVideo} autoPlay playsInline style={{ width: '300px', height: '300px' }} />
            {peers.map((peer, index) => (
                <Video key={index} peer={peer} />
            ))}
        </div>
    );
};

const Video = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on('stream', stream => {
            ref.current.srcObject = stream;
        });
    }, [peer]);

    return <video ref={ref} autoPlay playsInline style={{ width: '300px', height: '300px' }} />;
};

export default VideoCall;
