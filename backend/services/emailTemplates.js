// backend/services/emailTemplates.js

// Welcome Email Template
const getWelcomeTemplate = (user) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to KaboDitsha</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2C1810 0%, #B45F3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .button:hover { opacity: 0.9; transform: translateY(-2px); }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to KaboDitsha! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>Thank you for joining <strong>KaboDitsha</strong> - Botswana's premier land management system.</p>
          
          <p>With KaboDitsha, you can:</p>
          <ul class="feature-list">
            <li>📝 <strong>Apply for land online</strong> - No more office visits</li>
            <li>👀 <strong>Track your application</strong> - Real-time queue position</li>
            <li>📎 <strong>Upload documents securely</strong> - Digital, no paper copies</li>
            <li>🔔 <strong>Receive instant notifications</strong> - Email + in-app alerts</li>
            <li>📍 <strong>Smart Board Matcher</strong> - Find the fastest land board</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            Need help? Visit our <a href="${frontendUrl}/faq" style="color: #B45F3A;">FAQ page</a> or contact your local Land Board.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          <p>Botswana Land Management System</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email Verification Template
const getEmailVerificationTemplate = (user, verificationUrl) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - KaboDitsha</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2C1810 0%, #B45F3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .button:hover { opacity: 0.9; transform: translateY(-2px); }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
        .warning { background: #FEF3C7; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 13px; border-left: 4px solid #F59E0B; }
        .code-box { background: #1a1a2e; color: #00ff88; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; word-break: break-all; margin: 15px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>Thank you for registering with <strong>KaboDitsha</strong>! Please verify your email address to complete your registration and start your land application journey.</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <div class="code-box">
            ${verificationUrl}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in <strong>24 hours</strong>. 
            If you didn't create an account with KaboDitsha, please ignore this email.
          </div>
          
          <p style="margin-top: 20px;">
            After verification, you can log in and:
            <ul>
              <li>Submit land applications online</li>
              <li>Track your queue position in real-time</li>
              <li>Upload documents securely</li>
              <li>Receive instant notifications</li>
            </ul>
          </p>
          
          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            Having trouble? Contact support at <a href="mailto:support@kaboditsha.gov.bw" style="color: #B45F3A;">support@kaboditsha.gov.bw</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          <p>Botswana Land Management System</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Application Submitted Template
const getApplicationSubmittedTemplate = (user, application) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Submitted - KaboDitsha</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2C1810 0%, #B45F3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
        .info-box { background: #E0F2FE; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #0EA5E9; }
        .status-badge { display: inline-block; background: #3B82F6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Submitted! 📝</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>Your land application has been successfully submitted to <strong>KaboDitsha</strong>.</p>
          
          <div class="info-box">
            <strong>📋 Application Details:</strong><br><br>
            <strong>Application Number:</strong> ${application.applicationNumber}<br>
            <strong>Land Board:</strong> ${application.landBoard?.name || 'Pending'}<br>
            <strong>Settlement Type:</strong> ${application.settlementType}<br>
            <strong>Purpose:</strong> ${application.purpose || 'Residential'}<br>
            <strong>Submission Date:</strong> ${new Date(application.submittedAt).toLocaleDateString()}<br>
            <strong>Status:</strong> <span class="status-badge">SUBMITTED</span>
          </div>
          
          <p>Your application is now in the queue for review. You can track its progress in real-time from your dashboard.</p>
          
          <div style="text-align: center;">
            <a href="${frontendUrl}/applications/${application.applicationId}" class="button">Track Application</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            You will receive email and in-app notifications when your application status changes.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          <p>Botswana Land Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Status Update Template
const getStatusUpdateTemplate = (user, application) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  // Defensive check - prevents errors
  if (!application || !application.status) {
    console.error('Missing application data for status update email', { user, application });
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Application Status Update - KaboDitsha</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${user?.fullName || 'Valued Applicant'},</h2>
            <p>Your application status has been updated. Please log in to your KaboDitsha account to view the details.</p>
            <div style="text-align: center;">
              <a href="${frontendUrl}/applications" class="button">View My Applications</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Status-specific configuration
  const statusConfig = {
    'SUBMITTED': { color: '#3B82F6', bg: '#EFF6FF', icon: '📋', message: 'Your application has been received and is in the queue.' },
    'UNDER_REVIEW': { color: '#F59E0B', bg: '#FEF3C7', icon: '🔍', message: 'Your application is being reviewed by Land Board officials.' },
    'DOCUMENTS_VERIFIED': { color: '#10B981', bg: '#D1FAE5', icon: '✅', message: 'Your documents have been verified. Final approval pending.' },
    'APPROVED': { color: '#22C55E', bg: '#DCFCE7', icon: '🎉', message: 'Congratulations! Your land application has been approved!' },
    'REJECTED': { color: '#EF4444', bg: '#FEE2E2', icon: '❌', message: 'Your application was not approved. Please check the reason provided.' },
    'WITHDRAWN': { color: '#6B7280', bg: '#F3F4F6', icon: '🚫', message: 'Your application has been withdrawn.' }
  };

  const config = statusConfig[application.status] || statusConfig['SUBMITTED'];
  const statusDisplay = application.status.replace('_', ' ');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update - KaboDitsha</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2C1810 0%, #B45F3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
        .info-box { background: ${config.bg}; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${config.color}; }
        .rejection-box { background: #FEE2E2; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #EF4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>There has been an update to your land application.</p>
          
          <div style="text-align: center;">
            <div class="status-badge" style="background: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color}40;">
              ${config.icon} New Status: ${statusDisplay}
            </div>
          </div>
          
          <div class="info-box">
            <strong>📋 Application Details:</strong><br><br>
            <strong>Application Number:</strong> ${application.applicationNumber}<br>
            <strong>Status:</strong> ${statusDisplay}<br>
            <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}
          </div>
          
          <p>${config.message}</p>
          
          ${application.status === 'REJECTED' && application.rejectionReason ? `
            <div class="rejection-box">
              <strong>❌ Reason for Rejection:</strong><br>
              ${application.rejectionReason}
            </div>
          ` : ''}
          
          ${application.status === 'APPROVED' ? `
            <div style="background: #DCFCE7; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
              <strong>🎉 Congratulations!</strong><br>
              Your land application has been approved. Please contact your local Land Board for next steps.
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${frontendUrl}/applications/${application.applicationId}" class="button">View Full Details</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            You will continue to receive updates as your application progresses.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          <p>Botswana Land Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password Reset Template
const getPasswordResetTemplate = (user, resetUrl) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - KaboDitsha</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2C1810 0%, #B45F3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
        .warning { background: #FEF3C7; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 13px; border-left: 4px solid #F59E0B; }
        .code-box { background: #1a1a2e; color: #00ff88; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; word-break: break-all; margin: 15px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>We received a request to reset your <strong>KaboDitsha</strong> account password.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <div class="code-box">
            ${resetUrl}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This password reset link will expire in <strong>1 hour</strong>.<br>
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            For security reasons, never share this link with anyone.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          <p>Botswana Land Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Broadcast Template (Admin mass email)
const getBroadcastTemplate = (data) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject} - KaboDitsha</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2C1810 0%, #B45F3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2C1810, #B45F3A); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.subject}</h1>
        </div>
        <div class="content">
          <p>Dear KaboDitsha User,</p>
          
          <div style="margin: 20px 0;">
            ${data.message}
          </div>
          
          <p>For more information, please log in to your KaboDitsha account or contact your local Land Board.</p>
          
          <div style="text-align: center;">
            <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 KaboDitsha. All rights reserved.</p>
          <p>Botswana Land Management System</p>
          <p><small>This is an automated message from the KaboDitsha administration. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getWelcomeTemplate,
  getEmailVerificationTemplate,
  getApplicationSubmittedTemplate,
  getStatusUpdateTemplate,
  getPasswordResetTemplate,
  getBroadcastTemplate
};