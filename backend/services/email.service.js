const nodemailer = require('nodemailer');
const {
  getWelcomeTemplate,
  getEmailVerificationTemplate,
  getApplicationSubmittedTemplate,
  getStatusUpdateTemplate,
  getPasswordResetTemplate,
  getBroadcastTemplate
} = require('./emailTemplates');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email service ready to send messages');
  }
});

const sendEmail = async (to, type, data) => {
  try {
    if (!to) {
      console.error('No recipient email provided');
      return { error: 'No recipient email' };
    }

    let subject = '';
    let html = '';
    
    // Get frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    switch (type) {
      case 'welcome':
        subject = 'Welcome to KaboDitsha! 🎉';
        html = getWelcomeTemplate(data.user);
        break;
      case 'emailVerification':
        subject = 'Verify Your Email - KaboDitsha';
        const token = data.verificationToken;
        const verificationUrl = data.verificationUrl || `${frontendUrl}/verify-email?token=${token}`;
        console.log('Generated verification URL:', verificationUrl);
        html = getEmailVerificationTemplate(data.user, verificationUrl);
        break;
      case 'applicationSubmitted':
        subject = 'Application Submitted - KaboDitsha';
        html = getApplicationSubmittedTemplate(data.user, data.application);
        break;
      case 'statusUpdate':
        subject = 'Application Status Update - KaboDitsha';
        html = getStatusUpdateTemplate(data.user, data.application);
        break;
      case 'passwordReset':
        subject = 'Password Reset Request - KaboDitsha';
        const resetToken = data.resetToken;
        const resetUrl = data.resetUrl || `${frontendUrl}/reset-password?token=${resetToken}`;
        html = getPasswordResetTemplate(data.user, resetUrl);
        break;
      case 'broadcast':
        subject = data.subject;
        html = getBroadcastTemplate(data);
        break;
      default:
        console.error('Unknown email type:', type);
        throw new Error('Unknown email type');
    }
    
    const mailOptions = {
      from: `"KaboDitsha" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    
    console.log(`Sending ${type} email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };