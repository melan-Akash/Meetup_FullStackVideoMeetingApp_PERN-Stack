// Dummy data & assets for frontend

export const assets = {
    logo: "/logo.svg",
    favicon: "/favicon.svg",
    loginBg: "/login_bg.png",
    protectedBg: "/protected_bg.png",
    layoutBg: "/layout_bg.png",
};

export const dummyAvatars = {
    alexRivera: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    sarahChen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    marcusVance: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    elenaRostova: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    davidKim: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
};

export const dummyUser = {
    id: "user_mock_001",
    fullName: "Great Stack",
    firstName: "Great",
    lastName: "Stack",
    name: "Great Stack",
    email: "user.greatstack@gmail.com",
    primaryEmailAddress: {
        emailAddress: "user.greatstack@gmail.com",
    },
    imageUrl: dummyAvatars.alexRivera,
    avatar: dummyAvatars.alexRivera,
    plan: "PREMIUM",
};

export const dummyStats = {
    plan: "PREMIUM",
    monthlyCount: 3,
    monthlyLimit: null,
    maxParticipants: 100,
    meetingsHosted: 3,
    totalMinutes: 450,
    storageUsed: "1.2 GB",
};

export const dummySessions = [
    {
        id: 1,
        meetingId: "gcd-rfm-rie",
        meetingID: "gcd-rfm-rie",
        title: "Great Stack's Meeting",
        status: "active",
        createdAt: "2026-08-25T16:04:00.000Z",
        formattedDate: "Aug 25, 2026, 04:04 PM",
        endedAt: null,
        host: {
            id: "user_mock_001",
            name: "Great Stack",
            email: "user.greatstack@gmail.com",
        },
        participants: [
            {
                id: "user_mock_001",
                name: "Great Stack",
                email: "user.greatstack@gmail.com",
                joinedAt: "04:04 PM",
            },
            {
                id: "user_mock_002",
                name: "Sarah Chen",
                email: "sarah.chen@example.com",
                joinedAt: "04:05 PM",
            },
            {
                id: "user_mock_003",
                name: "Marcus Vance",
                email: "marcus.vance@example.com",
                joinedAt: "04:06 PM",
            },
            {
                id: "user_mock_004",
                name: "Elena Rostova",
                email: "elena.rostova@example.com",
                joinedAt: "04:08 PM",
            },
        ],
        messages: [
            {
                id: "m1",
                senderId: "user_mock_001",
                senderName: "Great Stack",
                text: "Welcome to the live conference everyone!",
                timestamp: "2026-08-25T16:05:00.000Z",
            },
            {
                id: "m2",
                senderId: "user_mock_002",
                senderName: "Sarah Chen",
                text: "Hello! Audio and video are working perfectly.",
                timestamp: "2026-08-25T16:06:10.000Z",
            },
        ],
    },
    {
        id: 2,
        meetingId: "ndy-suc-vdm",
        meetingID: "ndy-suc-vdm",
        title: "Great Stack's Meeting",
        status: "ended",
        createdAt: "2026-08-25T15:34:00.000Z",
        formattedDate: "Aug 25, 2026, 03:34 PM",
        endedAt: "2026-08-25T15:55:00.000Z",
        host: {
            id: "user_mock_001",
            name: "Great Stack",
            email: "user.greatstack@gmail.com",
        },
        participants: [
            {
                id: "user_mock_001",
                name: "Great Stack",
                email: "user.greatstack@gmail.com",
                joinedAt: "03:34 PM",
                leftAt: "03:55 PM",
            },
        ],
        messages: [],
    },
    {
        id: 3,
        meetingId: "eye-zod-khn",
        meetingID: "eye-zod-khn",
        title: "Great Stack's Meeting",
        status: "ended",
        createdAt: "2026-08-24T19:09:00.000Z",
        formattedDate: "Aug 24, 2026, 07:09 PM",
        endedAt: "2026-08-24T19:40:00.000Z",
        host: {
            id: "user_mock_001",
            name: "Great Stack",
            email: "user.greatstack@gmail.com",
        },
        participants: [
            {
                id: "user_mock_001",
                name: "Great Stack",
                email: "user.greatstack@gmail.com",
                joinedAt: "07:09 PM",
                leftAt: "07:40 PM",
            },
            {
                id: "user_mock_005",
                name: "David Kim",
                email: "david.kim@example.com",
                joinedAt: "07:11 PM",
                leftAt: "07:38 PM",
            },
        ],
        messages: [
            {
                id: "m20",
                senderId: "user_mock_001",
                senderName: "Great Stack",
                text: "Thanks for joining the sync session.",
                timestamp: "2026-08-24T19:15:00.000Z",
            },
            {
                id: "m21",
                senderId: "user_mock_005",
                senderName: "David Kim",
                text: "All clear on the roadmap targets.",
                timestamp: "2026-08-24T19:20:00.000Z",
            },
        ],
    },
];

export const dummyMeetingDetails = {
    id: 101,
    meetingId: "gcd-rfm-rie",
    meetingID: "gcd-rfm-rie",
    title: "Great Stack's Meeting",
    status: "active",
    createdAt: new Date().toISOString(),
    host: {
        id: "user_mock_001",
        name: "Great Stack",
        email: "user.greatstack@gmail.com",
    },
};

export const dummyRemoteParticipants = [
    {
        socketId: "socket_sarah_002",
        userId: "user_mock_002",
        userName: "Sarah Chen",
        username: "Sarah Chen",
        stream: null,
        audioEnabled: true,
        videoEnabled: true,
    },
    {
        socketId: "socket_marcus_003",
        userId: "user_mock_003",
        userName: "Marcus Vance",
        username: "Marcus Vance",
        stream: null,
        audioEnabled: false,
        videoEnabled: true,
    },
    {
        socketId: "socket_elena_004",
        userId: "user_mock_004",
        userName: "Elena Rostova",
        username: "Elena Rostova",
        stream: null,
        audioEnabled: true,
        videoEnabled: false,
    },
];

export const dummyInitialChatMessages = [
    {
        id: "chat_01",
        senderId: "user_mock_002",
        senderName: "Sarah Chen",
        text: "Hey Alex! Can you hear me clearly?",
        time: "02:15 PM",
        timestamp: new Date().toISOString(),
    },
];

export default {
    assets,
    dummyAvatars,
    dummyUser,
    dummyStats,
    dummySessions,
    dummyMeetingDetails,
    dummyRemoteParticipants,
    dummyInitialChatMessages,
};
