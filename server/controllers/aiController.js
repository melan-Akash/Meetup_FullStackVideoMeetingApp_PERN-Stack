import { 
  generateMeetingSummary, 
  askAICoPilot, 
  translateText 
} from '../services/aiService.js';
import { transporter } from '../services/emailService.js';

/**
 * Controller to generate AI Meeting Summary & Action Items
 * Route: POST /api/ai/summary
 */
export const handleGenerateSummary = async (req, res) => {
  const { title, messages, notes, participants } = req.body;

  try {
    const summary = await generateMeetingSummary({
      title: title || 'MeetUp Conference',
      messages: messages || [],
      notes: notes || '',
      participants: participants || []
    });

    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    return res.status(500).json({ error: "Failed to generate AI summary", details: error.message });
  }
};

/**
 * Controller for In-Meeting AI Co-Pilot / Assistant
 * Route: POST /api/ai/copilot
 */
export const handleAICoPilot = async (req, res) => {
  const { query, meetingContext, history } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const response = await askAICoPilot({
      query: query.trim(),
      meetingContext: meetingContext || {},
      history: history || []
    });

    return res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    console.error("AI Co-Pilot response failed:", error);
    return res.status(500).json({ error: "AI Co-Pilot encountered an error", details: error.message });
  }
};

/**
 * Controller for Real-Time Text Translation
 * Route: POST /api/ai/translate
 */
export const handleTranslate = async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text to translate is required" });
  }

  try {
    const translatedText = await translateText({
      text: text.trim(),
      targetLanguage: targetLanguage || 'Sinhala'
    });

    return res.status(200).json({
      success: true,
      translatedText
    });
  } catch (error) {
    console.error("AI Translation failed:", error);
    return res.status(500).json({ error: "Translation failed", details: error.message });
  }
};

/**
 * Controller to generate summary and email directly to host
 * Route: POST /api/ai/email-summary
 */
export const handleEmailSummary = async (req, res) => {
  const { recipientEmail, title, summary, hostName } = req.body;

  if (!recipientEmail || !summary) {
    return res.status(400).json({ error: "Recipient email and summary are required" });
  }

  try {
    const EMAIL_USER = process.env.EMAIL_USER || 'melonakash2002@gmail.com';
    const mailOptions = {
      from: `"MeetUp AI Assistant" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: `📋 AI Meeting Summary: ${title || 'Conference'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; padding: 30px;">
          <div style="background: linear-gradient(135deg, #0055ff 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 14px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">MeetUp AI Summary & Action Items</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Prepared for ${hostName || 'Host'}</p>
          </div>
          <div style="font-size: 14px; color: #1e293b; line-height: 1.7; white-space: pre-wrap;">
${summary}
          </div>
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            Generated automatically by MeetUp AI Co-Pilot • Powered by OpenRouter
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "AI Summary emailed successfully",
      messageId: info.messageId
    });
  } catch (error) {
    console.error("Emailing AI Summary failed:", error);
    return res.status(500).json({ error: "Failed to email summary", details: error.message });
  }
};
