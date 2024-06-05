import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const VideoCall = ({ groupId }) => {
    const [stream, setStream] = useState(null);
    const [peers, setPeers] = useState([]);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [shareScreen, setShareScreen] = useState(false);
    const [error, setError] = useState("");
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);
    const isProfessor = myUser.accountType === "PROFESOR";

    const startCall = () => {
        if (isProfessor) {
            setIsCalling(true);
        } else {
            alert("Samo profesori mogu započeti poziv.");
        }
    };

    const stopCall = () => {
        setIsCalling(false);
        socketRef.current.emit("end call");
        peersRef.current.forEach(peer => peer.peer.destroy());
        setPeers([]);
    };

    useEffect(() => {
        if (isCalling) {
            socketRef.current = io("http://localhost:8080/video-call", {
                withCredentials: true
            });

            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                setStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
                socketRef.current.emit("join room", JSON.stringify({ groupId, action: "start" }));
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

                socketRef.current.on("error", error => {
                    setError(error);
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

    const toggleMute = () => {
        stream.getAudioTracks()[0].enabled = !muted;
        setMuted(!muted);
    };

    const toggleCamera = () => {
        stream.getVideoTracks()[0].enabled = !cameraOff;
        setCameraOff(!cameraOff);
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
            {error && <div style={{ color: "red" }}>{error}</div>}
            {isProfessor && !isCalling && <button onClick={startCall}>Započni poziv</button>}
            {isProfessor && isCalling && <button onClick={stopCall}>Zaustavi poziv</button>}
            {!isProfessor && isCalling && <button onClick={stopCall}>Napusti poziv</button>}
            {isCalling && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <video ref={userVideo} autoPlay muted style={{ width: "300px" }} />
                        {peers.map((peer, index) => {
                            return <Video key={index} peer={peer} />;
                        })}
                    </div>
                    {isProfessor && (
                        <>
                            <button onClick={toggleShareScreen}>{shareScreen ? "Zaustavi dijeljenje ekrana" : "Podijeli ekran"}</button>
                        </>
                    )}
                    <button onClick={toggleMute}>{muted ? "Uključi zvuk" : "Isključi zvuk"}</button>
                    <button onClick={toggleCamera}>{cameraOff ? "Uključi kameru" : "Isključi kameru"}</button>
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
