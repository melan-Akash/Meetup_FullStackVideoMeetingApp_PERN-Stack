import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const DEFAULT_CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create Nodemailer Transporter using createTransport
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Generates modern HTML layout wrapper
 */
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .wrapper {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #0055ff 0%, #3b82f6 100%);
      padding: 30px 40px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .body-content {
      padding: 35px 40px;
    }
    .card {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background: #0055ff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0, 85, 255, 0.35);
    }
    .footer {
      text-align: center;
      padding: 20px 40px;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      background-color: #fafbfc;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo">MeetUp<span style="color: #93c5fd;">.</span></h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Next-Gen Video Collaboration</p>
    </div>
    
    <div class="body-content">
      ${content}
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">This email was sent from your MeetUp Video Conference service.</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} MeetUp Inc. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Send Meeting Invitation Email
 */
export const sendMeetingInvite = async ({
  recipientEmails,
  meetingId,
  title,
  scheduledAt,
  duration = 30,
  description = '',
  hostName = 'Great Stack',
  clientUrl
}) => {
  const base = clientUrl || DEFAULT_CLIENT_URL;
  const meetingLink = `${base}/meeting/${meetingId}`;
  const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">
      You're Invited to a Meeting
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      <strong>${hostName}</strong> has invited you to join a scheduled video conference on MeetUp.
    </p>

    <div class="card">
      <div style="font-size: 11px; font-weight: 700; color: #0055ff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
        Topic
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
        ${title || 'Scheduled Conference'}
      </div>

      <table style="width: 100%; font-size: 13px; color: #334155;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; width: 80px;"><strong>When:</strong></td>
          <td style="padding: 4px 0;"><strong>${formattedDate}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;"><strong>Duration:</strong></td>
          <td style="padding: 4px 0;">${duration} minutes</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;"><strong>Meeting ID:</strong></td>
          <td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #0055ff;">${meetingId}</td>
        </tr>
      </table>

      ${description ? `
        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
          <strong>Agenda:</strong> ${description}
        </div>
      ` : ''}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${meetingLink}" class="btn" target="_blank">Join Meeting Now</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
      Or copy and paste this link in your browser:<br/>
      <a href="${meetingLink}" style="color: #0055ff; word-break: break-all;">${meetingLink}</a>
    </p>
  `;

  const mailOptions = {
    from: `"MeetUp Video" <${EMAIL_USER}>`,
    to: Array.isArray(recipientEmails) ? recipientEmails.join(', ') : recipientEmails,
    subject: `Meeting Invitation: ${title} - ${formattedDate}`,
    html: emailWrapper(content),
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * 2. Send Instant Live Call Invite Email
 */
export const sendInstantInvite = async ({
  recipientEmail,
  meetingId,
  hostName = 'Host',
  clientUrl
}) => {
  const base = clientUrl || DEFAULT_CLIENT_URL;
  const meetingLink = `${base}/meeting/${meetingId}`;

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">
      Join Live Meeting in Progress
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      <strong>${hostName}</strong> is waiting for you in an active video meeting room right now!
    </p>

    <div class="card" style="text-align: center; padding: 26px;">
      <div style="font-size: 12px; color: #059669; font-weight: 700; margin-bottom: 8px;">
        ● ROOM LIVE NOW
      </div>
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
        Meeting Code: <span style="font-family: monospace; color: #0055ff;">${meetingId}</span>
      </div>
      <p style="font-size: 13px; color: #64748b; margin: 0;">Click below to jump directly into the conversation.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${meetingLink}" class="btn" target="_blank">Join Call Instantly</a>
    </div>
  `;

  const mailOptions = {
    from: `"MeetUp Video" <${EMAIL_USER}>`,
    to: recipientEmail,
    subject: `⚡ Urgent: ${hostName} invited you to join a live video meeting`,
    html: emailWrapper(content),
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * 3. Send Welcome Email on User Registration
 */
export const sendWelcomeEmail = async ({
  email,
  fullName = 'User',
  clientUrl
}) => {
  const base = clientUrl || DEFAULT_CLIENT_URL;
  const dashboardLink = `${base}/dashboard`;

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">
      Welcome to MeetUp, ${fullName}! 🎉
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Thank you for joining MeetUp Video Conferencing. Your account is ready with unlimited HD meetings, real-time interactive whiteboard, screen sharing, and recording.
    </p>

    <div class="card">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 10px;">
        Quick Start Features:
      </div>
      <ul style="padding-left: 20px; margin: 0; font-size: 13px; color: #475569; line-height: 1.8;">
        <li>🚀 Start or schedule meetings with a single click</li>
        <li>🤖 AI-Powered meeting summarization and real-time translation</li>
        <li>🎨 Interactive multi-user collaborative Whiteboard</li>
        <li>🔒 Secure WebRTC encrypted peer-to-peer streams</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardLink}" class="btn" target="_blank">Go to Dashboard</a>
    </div>
  `;

  const mailOptions = {
    from: `"MeetUp Video" <${EMAIL_USER}>`,
    to: email,
    subject: `🎉 Welcome to MeetUp - Start Collaborating`,
    html: emailWrapper(content),
  };

  return await transporter.sendMail(mailOptions);
};
