const nodemailer = require("nodemailer");
const dns = require("dns");

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Fallback for older Node versions
}

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 587;
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4, // Force IPv4 connection to prevent ENETUNREACH on Render and cloud hosts
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendOtpEmail = async (email, otp, purposeTitle) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Healthcare Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Verification Code for ${purposeTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #005555; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Healthcare Portal</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1a202c; margin-top: 0; font-size: 18px;">Security Verification</h2>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
            We received a request for <b>${purposeTitle}</b> associated with this email address. Use the verification code below to proceed:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #005555; background-color: #e6f4f4; padding: 14px 28px; border-radius: 8px; border: 1px dashed #005555;">
              ${otp}
            </span>
          </div>
          <p style="color: #718096; font-size: 13px; margin-bottom: 0; text-align: center;">
            ⏱️ This code will expire in <b>5 minutes</b>.<br/>
            If you did not make this request, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f7fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #edf2f7;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            Healthcare App © All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
