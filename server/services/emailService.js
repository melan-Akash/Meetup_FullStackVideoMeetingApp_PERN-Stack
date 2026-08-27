import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || 'melonakash2002@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'srzlfpcpjeoivmbo';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .container {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0055ff 0%, #3b82f6 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .body {
      padding: 36px 30px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 22px;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background: #0055ff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 85, 255, 0.3);
    }
    .footer {
      background: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">MeetUp Video</div>
      <h1>HD Video Conference</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0;">Protected with end-to-end WebRTC encryption.</p>
      <p style="margin: 6px 0 0 0;">© 2026 MeetUp Inc. All rights reserved.</p>
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
  hostName = 'Great Stack'
}) => {
  const meetingLink = `${CLIENT_URL}/meeting/${meetingId}`;
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
  hostName = 'Host'
}) => {
  const meetingLink = `${CLIENT_URL}/meeting/${meetingId}`;

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
  fullName = 'User'
}) => {
  const dashboardLink = `${CLIENT_URL}/dashboard`;

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">
      Welcome to MeetUp, ${fullName}! 🎉
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Thank you for joining MeetUp Video Conferencing. Your account is ready with unlimited HD meetings, real-time interactive whiteboard, screen sharing, and recording.
    </p>

    <div class="card">
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
        What you can do with MeetUp:
      </div>
      <ul style="font-size: 13px; color: #475569; padding-left: 20px; margin: 0; line-height: 1.8;">
        <li>Host instant and scheduled video meetings with zero delay</li>
        <li>Collaborate with real-time Whiteboard & live notes</li>
        <li>Share screens, record meetings, and chat seamlessly</li>
        <li>Enjoy end-to-end peer-to-peer security</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardLink}" class="btn" target="_blank">Go to My Dashboard</a>
    </div>
  `;

  const mailOptions = {
    from: `"MeetUp Video" <${EMAIL_USER}>`,
    to: email,
    subject: `Welcome to MeetUp HD Video, ${fullName}! 🚀`,
    html: emailWrapper(content),
  };

  return await transporter.sendMail(mailOptions);
};
