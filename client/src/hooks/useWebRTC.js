import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../config/socket";
import toast from "react-hot-toast";
import api from "../config/api";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
    ],
};

export const useWebRTC = (roomId, user, onMeetingEnded, enabled = true, isHost = false) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]); // Array of { socketId, userId, userName, avatarUrl, stream, audioEnabled, videoEnabled, isHandRaised, isScreenSharing, isHost }
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    
    // Screen Sharing State
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef(null);

    // Raise Hand & Reactions State
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [reactions, setReactions] = useState([]);

    // Host Moderation State
    const [isWaitingInLobby, setIsWaitingInLobby] = useState(false);
    const [isRoomLocked, setIsRoomLocked] = useState(false);
    const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(false);
    const [waitingUsers, setWaitingUsers] = useState([]);

    const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection
    const candidateQueueRef = useRef(new Map()); // socketId -> RTCIceCandidate[]
    const remoteStreamsMap = useRef(new Map()); // socketId -> MediaStream
    const localStreamRef = useRef(null);

    // Helper to flush queued ICE candidates
    const flushCandidates = async (targetSocketId, peer) => {
        const queue = candidateQueueRef.current.get(targetSocketId) || [];
        while (queue.length > 0) {
            const candidate = queue.shift();
            try {
                await peer.addIceCandidate(candidate);
            } catch (err) {
                console.warn("Failed adding queued ICE candidate:", err);
            }
        }
        candidateQueueRef.current.delete(targetSocketId);
    };

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
            console.warn("Camera/mic access warning:", error.message);
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = audioStream;
                setLocalStream(audioStream);
                setVideoEnabled(false);
                return audioStream;
            } catch (err) {
                console.warn("Audio fallback access warning:", err.message);
                return null;
            }
        }
    }, []);

    // Swap video track across all active RTCPeerConnection sender tracks
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

        // Add local tracks to peer connection
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

        // Handle incoming remote stream tracks (Support both event.streams and track events)
        peer.ontrack = (event) => {
            let remoteStream = event.streams[0];
            if (!remoteStream) {
                if (!remoteStreamsMap.current.has(targetSocketId)) {
                    remoteStreamsMap.current.set(targetSocketId, new MediaStream());
                }
                remoteStream = remoteStreamsMap.current.get(targetSocketId);
                remoteStream.addTrack(event.track);
            }

            setRemoteUsers((prev) => {
                const existingIndex = prev.findIndex((u) => u.socketId === targetSocketId);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        stream: remoteStream,
                        userName: targetUser?.userName || targetUser?.username || updated[existingIndex].userName || "Participant",
                        avatarUrl: targetUser?.avatarUrl || targetUser?.imageUrl || updated[existingIndex].avatarUrl
                    };
                    return updated;
                } else {
                    return [
                        ...prev,
                        {
                            socketId: targetSocketId,
                            userId: targetUser?.userId || targetUser?.id,
                            userName: targetUser?.userName || targetUser?.username || "Participant",
                            avatarUrl: targetUser?.avatarUrl || targetUser?.imageUrl,
                            stream: remoteStream,
                            audioEnabled: targetUser?.audioEnabled ?? true,
                            videoEnabled: targetUser?.videoEnabled ?? true,
                            isHandRaised: targetUser?.isHandRaised ?? false,
                            isScreenSharing: targetUser?.isScreenSharing ?? false,
                            isHost: targetUser?.isHost ?? false,
                        },
                    ];
                }
            });
        };

        // Store peer
        peersRef.current.set(targetSocketId, peer);

        // Register in remoteUsers state so participant name/card renders immediately
        setRemoteUsers((prev) => {
            if (prev.some((u) => u.socketId === targetSocketId)) return prev;
            return [
                ...prev,
                {
                    socketId: targetSocketId,
                    userId: targetUser?.userId || targetUser?.id,
                    userName: targetUser?.userName || targetUser?.username || "Participant",
                    avatarUrl: targetUser?.avatarUrl || targetUser?.imageUrl,
                    stream: null,
                    audioEnabled: targetUser?.audioEnabled ?? true,
                    videoEnabled: targetUser?.videoEnabled ?? true,
                    isHandRaised: targetUser?.isHandRaised ?? false,
                    isScreenSharing: targetUser?.isScreenSharing ?? false,
                    isHost: targetUser?.isHost ?? false,
                },
            ];
        });

        return peer;
    }, []);

    // Main WebRTC & Socket signaling setup effect
    useEffect(() => {
        if (!roomId || !enabled) return;

        let isMounted = true;

        const startSession = async () => {
            await initLocalStream();

            if (!isMounted) return;

            // Log join to PostgreSQL
            if (user?.id) {
                api.post('/meetings/join-log', {
                    meetingID: roomId,
                    userID: user.id
                }).catch(() => {});
            }

            const currentUserData = {
                id: user?.id || `guest_${Date.now()}`,
                userId: user?.id || `guest_${Date.now()}`,
                fullName: user?.fullName || user?.name || 'Guest User',
                name: user?.fullName || user?.name || 'Guest User',
                userName: user?.fullName || user?.name || 'Guest User',
                imageUrl: user?.imageUrl || null,
                avatarUrl: user?.imageUrl || null
            };

            const emitJoin = () => {
                socket.emit("join-room", {
                    roomId,
                    roomID: roomId,
                    user: currentUserData,
                    audioEnabled: true,
                    videoEnabled: true,
                    isHost,
                });
            };

            // Ensure socket is connected and then emit join-room
            if (socket.connected) {
                emitJoin();
            } else {
                socket.once("connect", emitJoin);
                socket.connect();
            }

            // Also re-join on reconnection
            socket.on("connect", emitJoin);

            // 1. Receive all existing users in room
            socket.on("all-users", (existingUsers) => {
                if (!Array.isArray(existingUsers)) return;

                existingUsers.forEach((existingUser) => {
                    const peer = createPeerConnection(existingUser.socketId, existingUser);

                    peer.createOffer()
                        .then((offer) => peer.setLocalDescription(offer))
                        .then(() => {
                            socket.emit("offer", {
                                targetSocketId: existingUser.socketId,
                                callerSocketId: socket.id,
                                sdp: peer.localDescription,
                                callerUser: currentUserData
                            });
                        })
                        .catch((err) => console.error("Error creating offer:", err));
                });
            });

            // 2. Someone new joined
            socket.on("user-joined", (newUser) => {
                toast(`${newUser.userName || newUser.username || 'Someone'} joined the meeting`, { icon: "👋" });
                createPeerConnection(newUser.socketId, newUser);
            });

            // 3. Receive offer
            socket.on("offer", async ({ callerSocketId, sdp, callerUser }) => {
                const peer = createPeerConnection(callerSocketId, callerUser);
                try {
                    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
                    await flushCandidates(callerSocketId, peer);

                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);

                    socket.emit("answer", {
                        targetSocketId: callerSocketId,
                        responderSocketId: socket.id,
                        sdp: peer.localDescription,
                        responderUser: currentUserData
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
                        await flushCandidates(responderSocketId, peer);
                    } catch (err) {
                        console.error("Error setting remote description:", err);
                    }
                }
            });

            // 5. Receive ICE candidate with robust queueing
            socket.on("ice-candidate", async ({ senderSocketId, candidate }) => {
                if (!candidate) return;
                const peer = peersRef.current.get(senderSocketId);

                if (peer && peer.remoteDescription && peer.remoteDescription.type) {
                    try {
                        await peer.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        console.warn("Error adding ICE candidate:", err);
                    }
                } else {
                    const queue = candidateQueueRef.current.get(senderSocketId) || [];
                    queue.push(new RTCIceCandidate(candidate));
                    candidateQueueRef.current.set(senderSocketId, queue);
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
                candidateQueueRef.current.delete(socketId);
                remoteStreamsMap.current.delete(socketId);
                setRemoteUsers((prev) => prev.filter((u) => u.socketId !== socketId));
            });

            // 11. HOST MODERATION INCOMING EVENTS
            socket.on("force-muted", ({ message }) => {
                if (localStreamRef.current) {
                    const audioTrack = localStreamRef.current.getAudioTracks()[0];
                    if (audioTrack) {
                        audioTrack.enabled = false;
                        setAudioEnabled(false);
                    }
                }
                toast(message || "You have been muted by the host.", { icon: "🔇" });
            });

            socket.on("user-kicked", ({ message }) => {
                toast.error(message || "You have been removed from the meeting by the host.");
                if (onMeetingEnded) {
                    onMeetingEnded(message);
                }
            });

            socket.on("meeting-locked", ({ message }) => {
                toast.error(message || "This meeting is locked by the host.");
                if (onMeetingEnded) {
                    onMeetingEnded(message);
                }
            });

            socket.on("waiting-in-lobby", () => {
                setIsWaitingInLobby(true);
            });

            socket.on("user-admitted", ({ existingUsers }) => {
                setIsWaitingInLobby(false);
                toast.success("Host has admitted you to the meeting! 🎉");
                if (Array.isArray(existingUsers)) {
                    existingUsers.forEach((existingUser) => {
                        const peer = createPeerConnection(existingUser.socketId, existingUser);
                        peer.createOffer()
                            .then((offer) => peer.setLocalDescription(offer))
                            .then(() => {
                                socket.emit("offer", {
                                    targetSocketId: existingUser.socketId,
                                    callerSocketId: socket.id,
                                    sdp: peer.localDescription,
                                    callerUser: currentUserData
                                });
                            });
                    });
                }
            });

            socket.on("user-denied", ({ message }) => {
                toast.error(message || "The host denied your request to enter.");
                if (onMeetingEnded) {
                    onMeetingEnded(message);
                }
            });

            socket.on("room-lock-changed", ({ isLocked }) => {
                setIsRoomLocked(isLocked);
                toast(isLocked ? "Meeting has been locked by the host 🔒" : "Meeting has been unlocked 🔓");
            });

            socket.on("waiting-room-changed", ({ isWaitingRoomEnabled }) => {
                setIsWaitingRoomEnabled(isWaitingRoomEnabled);
            });

            socket.on("waiting-users-updated", (users) => {
                setWaitingUsers(users || []);
                if (users && users.length > 0 && isHost) {
                    toast(`${users[users.length - 1].userName} is in the waiting room`, { icon: "🚪" });
                }
            });

            socket.on("meeting-ended", ({ message }) => {
                toast(message || "Meeting ended by host.");
                if (onMeetingEnded) {
                    onMeetingEnded(message);
                }
            });
        };

        startSession();

        return () => {
            isMounted = false;
            socket.emit("leave-room", { roomId });
            
            // Clean peer connections
            peersRef.current.forEach((peer) => peer.close());
            peersRef.current.clear();
            candidateQueueRef.current.clear();
            remoteStreamsMap.current.clear();

            // Stop local tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
            }

            // Remove socket listeners
            socket.off("connect");
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
            socket.off("force-muted");
            socket.off("user-kicked");
            socket.off("meeting-locked");
            socket.off("waiting-in-lobby");
            socket.off("user-admitted");
            socket.off("user-denied");
            socket.off("room-lock-changed");
            socket.off("waiting-room-changed");
            socket.off("waiting-users-updated");
            socket.off("meeting-ended");
        };
    }, [roomId, user?.id, enabled, isHost, createPeerConnection, initLocalStream, onMeetingEnded]);

    // Media Controls
    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                const nextState = !audioTrack.enabled;
                audioTrack.enabled = nextState;
                setAudioEnabled(nextState);
                socket.emit("toggle-audio", { roomId, audioEnabled: nextState });
            }
        }
    }, [roomId]);

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                const nextState = !videoTrack.enabled;
                videoTrack.enabled = nextState;
                setVideoEnabled(nextState);
                socket.emit("toggle-video", { roomId, videoEnabled: nextState });
            }
        }
    }, [roomId]);

    const toggleScreenShare = useCallback(async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStreamRef.current = screenStream;
                setIsScreenSharing(true);

                const screenVideoTrack = screenStream.getVideoTracks()[0];
                replaceTrackOnPeers(screenVideoTrack);
                socket.emit("toggle-screen-share", { roomId, isSharing: true });

                screenVideoTrack.onended = () => {
                    setIsScreenSharing(false);
                    screenStreamRef.current = null;
                    if (localStreamRef.current) {
                        const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
                        replaceTrackOnPeers(originalVideoTrack);
                    }
                    socket.emit("toggle-screen-share", { roomId, isSharing: false });
                };
            } catch (err) {
                console.warn("Screen share cancelled or failed:", err.message);
            }
        } else {
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
                screenStreamRef.current = null;
            }
            setIsScreenSharing(false);
            if (localStreamRef.current) {
                const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
                replaceTrackOnPeers(originalVideoTrack);
            }
            socket.emit("toggle-screen-share", { roomId, isSharing: false });
        }
    }, [isScreenSharing, replaceTrackOnPeers, roomId]);

    const toggleRaiseHand = useCallback(() => {
        const nextState = !isHandRaised;
        setIsHandRaised(nextState);
        socket.emit("raise-hand", {
            roomId,
            userId: user?.id,
            userName: user?.fullName || user?.name || "Participant",
            isHandRaised: nextState,
        });
    }, [isHandRaised, roomId, user]);

    const sendReaction = useCallback((emoji) => {
        socket.emit("send-reaction", {
            roomId,
            emoji,
            userName: user?.fullName || user?.name || "Participant",
        });
    }, [roomId, user]);

    // Host Moderation Actions
    const muteParticipant = useCallback((targetSocketId) => {
        socket.emit("mute-user", { roomId, targetSocketId });
        toast.success("Muted participant");
    }, [roomId]);

    const muteAll = useCallback(() => {
        socket.emit("mute-all", { roomId });
        toast.success("Muted all participants");
    }, [roomId]);

    const kickParticipant = useCallback((targetSocketId) => {
        socket.emit("kick-user", { roomId, targetSocketId });
        toast.success("Removed participant from meeting");
    }, [roomId]);

    const toggleLockMeeting = useCallback(() => {
        const nextState = !isRoomLocked;
        setIsRoomLocked(nextState);
        socket.emit("toggle-lock-meeting", { roomId, isLocked: nextState });
    }, [isRoomLocked, roomId]);

    const toggleWaitingRoom = useCallback(() => {
        const nextState = !isWaitingRoomEnabled;
        setIsWaitingRoomEnabled(nextState);
        socket.emit("toggle-waiting-room", { roomId, isWaitingRoomEnabled: nextState });
        toast.success(nextState ? "Waiting Room enabled 🛡️" : "Waiting Room disabled");
    }, [isWaitingRoomEnabled, roomId]);

    const admitUser = useCallback((targetSocketId) => {
        socket.emit("admit-user", { roomId, targetSocketId });
        toast.success("Participant admitted to call! 🚪");
    }, [roomId]);

    const denyUser = useCallback((targetSocketId) => {
        socket.emit("deny-user", { roomId, targetSocketId });
        toast.success("Participant denied");
    }, [roomId]);

    const endMeeting = useCallback(() => {
        socket.emit("end-meeting", { roomId });
        if (onMeetingEnded) {
            onMeetingEnded("You have ended the meeting session.");
        }
    }, [onMeetingEnded, roomId]);

    return {
        localStream,
        remoteUsers,
        audioEnabled,
        videoEnabled,
        isScreenSharing,
        isHandRaised,
        reactions,
        isWaitingInLobby,
        isRoomLocked,
        isWaitingRoomEnabled,
        waitingUsers,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        toggleRaiseHand,
        sendReaction,
        muteParticipant,
        muteAll,
        kickParticipant,
        toggleLockMeeting,
        toggleWaitingRoom,
        admitUser,
        denyUser,
        endMeeting,
    };
};

export default useWebRTC;
