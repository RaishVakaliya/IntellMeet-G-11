import { render } from "@react-email/render";
import React from "react";
import OtpEmail from "../emails/OtpEmail.js";

const sendEmailViaBrevo = async ({ toEmail, toName, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL ||
    process.env.SENDER_EMAIL ||
    process.env.EMAIL_USER ||
    "chatlight.service@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "IntellMeet Security";

  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is not configured in environment variables.",
    );
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send email via Brevo API.");
  }

  return data;
};

export const sendOtpEmail = async ({ toEmail, toName, otp }) => {
  const html = await render(
    React.createElement(OtpEmail, { name: toName, otp }),
  );

  const data = await sendEmailViaBrevo({
    toEmail,
    toName,
    subject: `${otp} is your IntellMeet verification code`,
    html,
  });

  return { success: true, messageId: data.messageId || data.messageIds?.[0] };
};
