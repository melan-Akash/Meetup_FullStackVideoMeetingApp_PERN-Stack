import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../config/socket";
import toast from "react-hot-toast";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
};

export const useWebRTC = (roomId, user, onMeetingEnded, enabled = true) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]); // Array of { socketId, userId, userName, stream, audioEnabled, videoEnabled, isHandRaised, isScreenSharing }
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    
    // Screen Sharing State
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef(null);

    // Raise Hand & Reactions State
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [reactions, setReactions] = useState([]); // Array of { id, emoji, userName, timestamp }

    const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection
    const localStreamRef = useRef(null);

    // Initialize local camera & mic media stream
    const initLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.warn("Camera/microphone primary access note:", error.message);
            // Fallback: try audio only or video only
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = audioStream;
                setLocalStream(audioStream);
                setVideoEnabled(false);
                return audioStream;
            } catch (err) {
                console.warn("Audio fallback note:", err.message);
                return null;
            }
        }
    }, []);

    // Helper: Swap video track across all active RTCPeerConnection sender tracks
    const replaceTrackOnPeers = useCallback((newVideoTrack) => {
        peersRef.current.forEach((peer) => {
            const sender = peer.getSenders().find((s) => s.track && s.track.kind === "video");
            if (sender && newVideoTrack) {
                sender.replaceTrack(newVideoTrack).catch((err) => console.error("Error replacing track:", err));
            }
        });
    }, []);

    // Create RTCPeerConnection for a target socket
    const createPeerConnection = useCallback((targetSocketId, targetUser) => {
        if (peersRef.current.has(targetSocketId)) {
            return peersRef.current.get(targetSocketId);
        }

        const peer = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks (camera or screen share) to peer connection
        const activeStream = screenStreamRef.current || localStreamRef.current;
        if (activeStream) {
            activeStream.getTracks().forEach((track) => {
                peer.addTrack(track, activeStream);
            });
        }

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    targetSocketId,
                    senderSocketId: socket.id,
                    candidate: event.candidate,
                });
            }
        };

        // Handle incoming remote stream tracks
        peer.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteUsers((prev) => {
                const existingIndex = prev.findIndex((u) => u.socketId === targetSocketId);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        stream: remoteStream,
                    };
                    return updated;
                } else {
                    return [
                        ...prev,
                        {
                            socketId: targetSocketId,
                            userId: targetUser?.userId,
                            userName: targetUser?.userName || "Participant",
                            stream: remoteStream,
                            audioEnabled: targetUser?.audioEnabled ?? true,
                            videoEnabled: targetUser?.videoEnabled ?? true,
                            isHandRaised: targetUser?.isHandRaised ?? false,
                            isScreenSharing: targetUser?.isScreenSharing ?? false,
                        },
                    ];
                }
            });
        };

        peersRef.current.set(targetSocketId, peer);
        return peer;
    }, []);

    // Main WebRTC & Socket signaling setup effect
    useEffect(() => {
        if (!roomId || !user || !enabled) return;

        let isMounted = true;

        const startSession = async () => {
            await initLocalStream();

            if (!isMounted) return;

            if (!socket.connected) {
                socket.connect();
            }

            // Emit join room
            socket.emit("join-room", {
                roomId,
                user,
                audioEnabled: true,
                videoEnabled: true,
            });

            // 1. Receive all existing users in room
            socket.on("all-users", (existingUsers) => {
                existingUsers.forEach((existingUser) => {
                    const peer = createPeerConnection(existingUser.socketId, existingUser);

                    peer.createOffer()
                        .then((offer) => peer.setLocalDescription(offer))
                        .then(() => {
                            socket.emit("offer", {
                                targetSocketId: existingUser.socketId,
                                callerSocketId: socket.id,
                                sdp: peer.localDescription,
                            });
                        })
                        .catch((err) => console.error("Error creating offer:", err));
                });
            });

            // 2. Someone new joined
            socket.on("user-joined", (newUser) => {
                toast(`${newUser.userName} joined the meeting`, { icon: "👋" });
                createPeerConnection(newUser.socketId, newUser);
            });

            // 3. Receive offer
            socket.on("offer", async ({ callerSocketId, sdp, callerUser }) => {
                const peer = createPeerConnection(callerSocketId, callerUser);
                try {
                    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);

                    socket.emit("answer", {
                        targetSocketId: callerSocketId,
                        responderSocketId: socket.id,
                        sdp: peer.localDescription,
                    });
                } catch (err) {
                    console.error("Error handling offer:", err);
                }
            });

            // 4. Receive answer
            socket.on("answer", async ({ responderSocketId, sdp }) => {
                const peer = peersRef.current.get(responderSocketId);
                if (peer) {
                    try {
                        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
                    } catch (err) {
                        console.error("Error setting remote description:", err);
                    }
                }
            });

            // 5. Receive ICE candidate
            socket.on("ice-candidate", async ({ senderSocketId, candidate }) => {
                const peer = peersRef.current.get(senderSocketId);
                if (peer && candidate) {
                    try {
                        await peer.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        console.error("Error adding ICE candidate:", err);
                    }
                }
            });

            // 6. Handle peer media toggles
            socket.on("user-toggled-audio", ({ socketId, audioEnabled }) => {
                setRemoteUsers((prev) => prev.map((u) => (u.socketId === socketId ? { ...u, audioEnabled } : u)));
            });

            socket.on("user-toggled-video", ({ socketId, videoEnabled }) => {
                setRemoteUsers((prev) => prev.map((u) => (u.socketId === socketId ? { ...u, videoEnabled } : u)));
            });

            // 7. Handle screen share from peer
            socket.on("user-screen-share-toggled", ({ socketId, isSharing }) => {
                setRemoteUsers((prev) => prev.map((u) => (u.socketId === socketId ? { ...u, isScreenSharing: isSharing } : u)));
            });

            // 8. Handle Raise Hand from peer
            socket.on("user-raised-hand", ({ socketId, userName, isHandRaised }) => {
                setRemoteUsers((prev) => prev.map((u) => (u.socketId === socketId ? { ...u, isHandRaised } : u)));
                if (isHandRaised) {
                    toast(`${userName} raised their hand!`, { icon: "✋" });
                }
            });

            // 9. Handle Floating Reaction
            socket.on("receive-reaction", (reactionData) => {
                setReactions((prev) => [...prev, reactionData]);
                // Clean up reaction after 4 seconds
                setTimeout(() => {
                    setReactions((prev) => prev.filter((r) => r.id !== reactionData.id));
                }, 4000);
            });

            // 10. Handle peer left
            socket.on("user-left", ({ socketId, user: leftUser, username }) => {
                const name = leftUser?.userName || username || "A participant";
                toast(`${name} left the meeting`);
                
                const peer = peersRef.current.get(socketId);
                if (peer) {
                    peer.close();
                    peersRef.current.delete(socketId);
                }
                setRemoteUsers((prev) => prev.filter((u) => u.socketId !== socketId));
            });

            // 11. Handle meeting ended
            socket.on("meeting-ended", ({ message }) => {
                toast.error(message || "This meeting has ended");
                if (onMeetingEnded) {
                    onMeetingEnded(message);
                }
            });
        };

        startSession();

        // Cleanup
        return () => {
            isMounted = false;

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }

            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
            }

            peersRef.current.forEach((peer) => peer.close());
            peersRef.current.clear();

            socket.off("all-users");
            socket.off("user-joined");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("user-toggled-audio");
            socket.off("user-toggled-video");
            socket.off("user-screen-share-toggled");
            socket.off("user-raised-hand");
            socket.off("receive-reaction");
            socket.off("user-left");
            socket.off("meeting-ended");

            socket.disconnect();
        };
    }, [roomId, user?.id, enabled, createPeerConnection, initLocalStream, onMeetingEnded]);

    // ====================================================
    // SCREEN SHARING CONTROLS
    // ====================================================
    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false,
            });

            screenStreamRef.current = screenStream;
            const screenVideoTrack = screenStream.getVideoTracks()[0];

            // When user clicks the browser's built-in "Stop sharing" button
            screenVideoTrack.onended = () => {
                stopScreenShare();
            };

            // Replace video track on all active peer connections
            replaceTrackOnPeers(screenVideoTrack);

            // Update local stream state for user preview
            setLocalStream(screenStream);
            setIsScreenSharing(true);

            socket.emit("toggle-screen-share", { roomId, isSharing: true });
            toast.success("Screen sharing started");
        } catch (err) {
            if (err.name !== "NotAllowedError") {
                toast.error("Could not start screen sharing");
                console.error("Screen share error:", err);
            }
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }

        // Restore original camera video track
        if (localStreamRef.current) {
            const cameraVideoTrack = localStreamRef.current.getVideoTracks()[0];
            if (cameraVideoTrack) {
                replaceTrackOnPeers(cameraVideoTrack);
            }
            setLocalStream(localStreamRef.current);
        }

        setIsScreenSharing(false);
        socket.emit("toggle-screen-share", { roomId, isSharing: false });
        toast("Screen sharing stopped");
    };

    const toggleScreenShare = () => {
        if (isScreenSharing) {
            stopScreenShare();
        } else {
            startScreenShare();
        }
    };

    // ====================================================
    // RAISE HAND CONTROLS
    // ====================================================
    const toggleRaiseHand = () => {
        const nextState = !isHandRaised;
        setIsHandRaised(nextState);

        socket.emit("raise-hand", {
            roomId,
            isHandRaised: nextState,
            userName: user?.fullName || user?.name || "You",
            userId: user?.id,
        });

        if (nextState) {
            toast("You raised your hand", { icon: "✋" });
        } else {
            toast("You lowered your hand");
        }
    };

    // ====================================================
    // EMOJI REACTION CONTROLS
    // ====================================================
    const sendReaction = (emoji) => {
        const reactionData = {
            id: `react_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            socketId: socket.id,
            userName: user?.fullName || user?.name || "You",
            emoji,
            timestamp: Date.now(),
        };

        // Local state
        setReactions((prev) => [...prev, reactionData]);
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== reactionData.id));
        }, 4000);

        // Broadcast to peers
        socket.emit("send-reaction", {
            roomId,
            emoji,
            userName: user?.fullName || user?.name || "Participant",
        });
    };

    // ====================================================
    // AUDIO / VIDEO TOGGLES
    // ====================================================
    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                const newState = !audioEnabled;
                audioTrack.enabled = newState;
                setAudioEnabled(newState);
                socket.emit("toggle-audio", { roomId, audioEnabled: newState });
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                const newState = !videoEnabled;
                videoTrack.enabled = newState;
                setVideoEnabled(newState);
                socket.emit("toggle-video", { roomId, videoEnabled: newState });
            }
        }
    };

    // End meeting (Host action)
    const endMeeting = useCallback(() => {
        if (roomId) {
            socket.emit("end-meeting", { roomId });
        }
    }, [roomId]);

    return {
        localStream,
        remoteUsers,
        audioEnabled,
        videoEnabled,
        isScreenSharing,
        isHandRaised,
        reactions,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        toggleRaiseHand,
        sendReaction,
        endMeeting,
    };
};

export default useWebRTC;
