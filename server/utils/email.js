const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn(
      '[email] SMTP settings not configured. OTP emails will be logged to console instead of sent.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendOtpEmail(to, code) {
  const from = process.env.EMAIL_FROM || 'no-reply@feedback-intel.local';
  const subject = 'Your FeedbackIntel verification code';
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;

  const t = getTransporter();
  if (!t) {
    console.log(
      `[email] Would send OTP email to ${to}: code=${code} (configure SMTP to actually send).`
    );
    return;
  }

  await t.sendMail({ from, to, subject, text });
}

module.exports = { sendOtpEmail };

