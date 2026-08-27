import { 
  sendMeetingInvite, 
  sendInstantInvite, 
  sendWelcomeEmail 
} from '../services/emailService.js';

/**
 * Controller to send meeting invitations to attendee emails
 * Route: POST /api/email/send-invite
 */
export const handleSendMeetingInvite = async (req, res) => {
  const { recipientEmails, meetingId, title, scheduledAt, duration, description, hostName } = req.body;

  if (!recipientEmails || !meetingId) {
    return res.status(400).json({ error: "Missing required fields (recipientEmails, meetingId)" });
  }

  try {
    const info = await sendMeetingInvite({
      recipientEmails,
      meetingId,
      title,
      scheduledAt: scheduledAt || new Date().toISOString(),
      duration: duration || 30,
      description,
      hostName: hostName || 'Host'
    });

    return res.status(200).json({
      success: true,
      message: "Invitation email(s) dispatched successfully",
      messageId: info.messageId
    });
  } catch (error) {
    console.error("Error sending meeting invitation email:", error);
    return res.status(500).json({ error: "Failed to dispatch invitation email", details: error.message });
  }
};

/**
 * Controller to send an instant room join invite
 * Route: POST /api/email/send-instant-invite
 */
export const handleSendInstantInvite = async (req, res) => {
  const { recipientEmail, meetingId, hostName } = req.body;

  if (!recipientEmail || !meetingId) {
    return res.status(400).json({ error: "Missing recipientEmail or meetingId" });
  }

  try {
    const info = await sendInstantInvite({
      recipientEmail,
      meetingId,
      hostName: hostName || 'Host'
    });

    return res.status(200).json({
      success: true,
      message: "Instant invite email sent successfully",
      messageId: info.messageId
    });
  } catch (error) {
    console.error("Error sending instant invite email:", error);
    return res.status(500).json({ error: "Failed to dispatch instant invite", details: error.message });
  }
};

/**
 * Controller to send welcome onboarding email
 * Route: POST /api/email/send-welcome
 */
export const handleSendWelcomeEmail = async (req, res) => {
  const { email, fullName } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const info = await sendWelcomeEmail({
      email,
      fullName: fullName || 'User'
    });

    return res.status(200).json({
      success: true,
      message: "Welcome email sent successfully",
      messageId: info.messageId
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return res.status(500).json({ error: "Failed to dispatch welcome email", details: error.message });
  }
};
