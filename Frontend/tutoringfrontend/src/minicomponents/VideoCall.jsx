import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const VideoCall = ({ groupId }) => {
    const [stream, setStream] = useState(null);
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);
    const isProfessor = myUser.accountType === "PROFESOR";
    const token = sessionStorage.getItem("token");
    const [isCalling, setIsCalling] = useState(false);
    const [shareScreen, setShareScreen] = useState(false);

    const startCall = () => {
        setIsCalling(true);
    };

    const stopCall = () => {
        setIsCalling(false);
        socketRef.current.emit("end call");
        peersRef.current.forEach(peer => peer.peer.destroy());
        setPeers([]);
    };

    useEffect(() => {
        if (isCalling) {
            socketRef.current = io.connect("http://localhost:8080/video-call");
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                setStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
                socketRef.current.emit("join room", JSON.stringify({ groupId, token }));
                socketRef.current.on("all users", users => {
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

                socketRef.current.on("user joined", payload => {
                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    });

                    setPeers(users => [...users, peer]);
                });

                socketRef.current.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                });

                socketRef.current.on("user left", id => {
                    const peerObj = peersRef.current.find(p => p.peerID === id);
                    if (peerObj) {
                        peerObj.peer.destroy();
                    }
                    const peers = peersRef.current.filter(p => p.peerID !== id);
                    peersRef.current = peers;
                    setPeers(peers);
                });

                socketRef.current.on("call ended", () => {
                    stopCall();
                });
            });

            return () => {
                socketRef.current.disconnect();
            };
        }
    }, [isCalling]);

    const toggleShareScreen = async () => {
        if (!shareScreen) {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
            peersRef.current.forEach(({ peer }) => {
                peer.replaceTrack(stream.getVideoTracks()[0], screenStream.getVideoTracks()[0], stream);
            });
            setStream(screenStream);
            setShareScreen(true);
        } else {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            peersRef.current.forEach(({ peer }) => {
                peer.replaceTrack(stream.getVideoTracks()[0], userStream.getVideoTracks()[0], stream);
            });
            setStream(userStream);
            setShareScreen(false);
        }
    };

    function createPeer(userToSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <div>
            <h2>Video poziv</h2>
            {isProfessor && !isCalling && <button onClick={startCall}>Započni poziv</button>}
            {isProfessor && isCalling && <button onClick={stopCall}>Zaustavi poziv</button>}
            {isCalling && (
                <>
                    <video ref={userVideo} autoPlay muted style={{ width: "300px" }} />
                    {peers.map((peer, index) => {
                        return <Video key={index} peer={peer} />;
                    })}
                    {isProfessor && (
                        <>
                            <button onClick={toggleShareScreen}>{shareScreen ? "Zaustavi dijeljenje ekrana" : "Podijeli ekran"}</button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const Video = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, []);

    return <video ref={ref} autoPlay style={{ width: "300px" }} />;
};

export default VideoCall;
