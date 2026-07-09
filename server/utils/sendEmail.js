const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    text: text || '',
    html: html || '',
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

// Email templates
const getPasswordResetEmail = (name, resetUrl) => ({
  subject: 'Password Reset Request — CustomFlex',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 32px; }
        h2 { color: #f1f5f9; font-size: 24px; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; }
        .footer { margin-top: 32px; color: #475569; font-size: 13px; }
        .expire { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 12px; margin: 24px 0; font-size: 14px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">CustomFlex</div>
          <h2>Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your CustomFlex password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <div class="expire">⏱ This link expires in 30 minutes</div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <div class="footer">© 2025 CustomFlex. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `,
});

const getWelcomeEmail = (name) => ({
  subject: 'Welcome to CustomFlex! 🎨',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 32px; }
        h2 { color: #f1f5f9; font-size: 24px; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; }
        .footer { margin-top: 32px; color: #475569; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">CustomFlex</div>
          <h2>Welcome to CustomFlex, ${name}! 🎨</h2>
          <p>You've just joined the most creative marketplace on the web. Start designing your first custom product today!</p>
          <p>With CustomFlex you can:</p>
          <p>🎨 Design custom artwork, clothing, and accessories<br>
          🛍️ Purchase your unique creations<br>
          🌟 Share with the community and earn refunds<br>
          💫 Discover amazing designs from other creators</p>
          <br>
          <a href="${process.env.CLIENT_URL}/choose" class="btn">Start Creating</a>
          <div class="footer">© 2025 CustomFlex. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `,
});

const getRefundEligibleEmail = (name, orderNumber, amount) => ({
  subject: `🎉 You're eligible for a refund! — Order ${orderNumber}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 32px; }
        .amount { font-size: 48px; font-weight: 800; color: #22c55e; margin: 24px 0; }
        h2 { color: #f1f5f9; font-size: 24px; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">CustomFlex</div>
          <h2>🎉 Refund Eligible!</h2>
          <p>Hi ${name}, great news! Your design has reached the community engagement threshold.</p>
          <div class="amount">$${amount.toFixed(2)}</div>
          <p>Order: <strong>${orderNumber}</strong></p>
          <p>Your refund request is now under admin review. You'll receive another email once it's processed.</p>
          <div class="footer">© 2025 CustomFlex. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `,
});

module.exports = { sendEmail, getPasswordResetEmail, getWelcomeEmail, getRefundEligibleEmail };
