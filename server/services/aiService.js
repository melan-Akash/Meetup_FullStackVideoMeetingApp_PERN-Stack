import dotenv from 'dotenv';
import dns from 'node:dns';

// Ensure IPv4 first on Node.js to prevent IPv6 timeout issues
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/auto';

/**
 * Generic caller for OpenRouter API
 */
export const callOpenRouter = async (messages, model = DEFAULT_MODEL) => {
  if (!OPENROUTER_KEY) {
    throw new Error("Missing OPENROUTER_KEY in environment variables");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'MeetUp Video Conference'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

/**
 * 1. Generates Structured Meeting Summary & Action Items
 */
export const generateMeetingSummary = async ({
  title = 'Meeting Session',
  messages = [],
  notes = '',
  participants = []
}) => {
  const participantsList = participants.map(p => p.name || p.userName || 'Attendee').join(', ');
  const chatTranscript = messages.map(m => `${m.senderName || 'User'}: ${m.text || ''}`).join('\n');

  const systemPrompt = `You are an elite Executive Assistant and AI Meeting Note-Taker for MeetUp Video Conferencing.
Your task is to analyze the meeting's transcript, shared notes, and participant list to produce a high-impact, professional executive summary formatted in clean Markdown.

Follow this exact structure:
# 📋 Executive Summary: [Meeting Title]

### 🎯 Key Discussion Points
- Bullet point key themes and topics discussed.

### 💡 Key Decisions Made
- Bullet point any agreements, resolutions, or decisions made during the call.

### 📌 Action Items & Next Steps
- [ ] Task 1 (Assigned to / Due date if mentioned)
- [ ] Task 2
- [ ] Task 3

### 👥 Participant Roster
List of active attendees.

Keep the summary concise, clear, professional, and actionable.`;

  const userPrompt = `Meeting Title: ${title}
Participants: ${participantsList || 'Great Stack & Team'}
Shared Notes:
${notes || 'No manual notes typed.'}

Live Chat Transcript:
${chatTranscript || 'No chat messages sent.'}

Please generate the structured executive summary now.`;

  return await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);
};

/**
 * 2. In-Meeting AI Co-Pilot / Assistant Conversation
 */
export const askAICoPilot = async ({
  query,
  meetingContext = {},
  history = []
}) => {
  const systemPrompt = `You are MeetUp AI Co-Pilot, an intelligent, helpful in-meeting AI assistant.
You have access to the current meeting context:
Meeting Room ID: ${meetingContext.roomID || 'N/A'}
Topic: ${meetingContext.title || 'Live Conference'}
Notes: ${meetingContext.notes || 'None'}
Recent Chat: ${meetingContext.recentChat || 'None'}

Help the user by answering questions, summarizing discussion points, drafting emails/follow-ups, or explaining technical concepts clearly and concisely. Format responses using clean markdown.`;

  const formattedHistory = Array.isArray(history) 
    ? history.slice(-6).map(h => ({ role: h.role || (h.sender === 'user' ? 'user' : 'assistant'), content: h.content || h.text || '' }))
    : [];

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: query }
  ];

  return await callOpenRouter(messagesPayload);
};

/**
 * 3. AI Real-Time Text Translation
 */
export const translateText = async ({
  text,
  targetLanguage = 'Sinhala'
}) => {
  const systemPrompt = `You are a real-time multilingual translation engine.
Translate the user's text into ${targetLanguage} accurately, keeping the natural tone and conversational context.
Output ONLY the translated text without explanations, quotes, or markdown wrappers.`;

  return await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ]);
};
