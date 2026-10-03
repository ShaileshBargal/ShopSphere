import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter using Google Gmail App Password SMTP.
 * Requires EMAIL_USER and EMAIL_APP_PASSWORD in backend/.env
 */
export const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  // Remove any spaces if user pasted a grouped 16-character Google App password (e.g. "abcd efgh ijkl mnop")
  const pass = process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
};

/**
 * Sends generic email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Email Warning] EMAIL_USER or EMAIL_APP_PASSWORD is not configured in backend/.env');
    throw new Error(
      'Email service not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD (Google App Password) in backend/.env'
    );
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"ShopSphere Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || 'ShopSphere Notification',
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
  return info;
};

/**
 * Sends specialized OTP Email for Password Reset
 */
export const sendOtpEmail = async (toEmail, otp, name = 'Valued Customer') => {
  const subject = `Your ShopSphere Password Reset OTP: ${otp}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 22px; font-weight: 800; color: #0d9488; text-decoration: none; margin-bottom: 24px; display: inline-block; letter-spacing: -0.5px; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f766e; font-family: Consolas, Monaco, monospace; margin: 0; }
        .otp-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #0d9488; margin-top: 6px; }
        .badge { display: inline-block; background: #fef2f2; color: #991b1b; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">🛍️ ShopSphere</div>
        <div class="title">Password Reset Request</div>
        <p class="text">
          Hello ${name},<br/><br/>
          We received a request to reset your password for your ShopSphere account. Please use the following 6-digit One-Time Password (OTP) to complete the reset:
        </p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-label">6-Digit Verification Code</div>
        </div>
        <div class="badge">⏱️ This OTP is valid for 10 minutes</div>
        <p class="text" style="font-size: 13px; color: #64748b;">
          If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized access. Never share this code with anyone.
        </p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere Inc. All rights reserved.<br/>
          Secure verification powered by Google App Password SMTP Service.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${name},\n\nYour ShopSphere Password Reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.\n\nShopSphere Security`;

  return await sendEmail({ to: toEmail, subject, html, text });
};
