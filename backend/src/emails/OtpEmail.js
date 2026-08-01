import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";

export function OtpEmail({ name, otp }) {
  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(
      Body,
      { style: mainStyle },
      React.createElement(
        Container,
        { style: containerStyle },
        React.createElement(
          Section,
          { style: headerStyle },
          React.createElement(Heading, { style: logoText }, "IntellMeet"),
        ),
        React.createElement(
          Section,
          { style: cardStyle },
          React.createElement(
            Heading,
            { style: titleStyle },
            "Verify Your Email",
          ),
          React.createElement(
            Text,
            { style: textStyle },
            "Hi ",
            React.createElement(
              "strong",
              { style: highlightText },
              name || "there",
            ),
            ",",
          ),
          React.createElement(
            Text,
            { style: textStyle },
            "Thank you for signing up for IntellMeet. Use the 4-digit verification code below to activate your account:",
          ),
          React.createElement(
            Section,
            { style: otpBoxStyle },
            React.createElement(Text, { style: otpTextStyle }, otp),
          ),
          React.createElement(
            Text,
            { style: expiryTextStyle },
            "⏱️ This code expires in ",
            React.createElement("strong", null, "5 minutes"),
            " and can only be used once.",
          ),
          React.createElement(Hr, { style: hrStyle }),
          React.createElement(
            Text,
            { style: footerTextStyle },
            "If you did not request this email, please ignore it or contact our support team.",
          ),
        ),
        React.createElement(
          Section,
          { style: footerContainerStyle },
          React.createElement(
            Text,
            { style: copyrightTextStyle },
            `© ${new Date().getFullYear()} IntellMeet Inc. Enterprise Real-Time Collaboration.`,
          ),
        ),
      ),
    ),
  );
}

export default OtpEmail;

const mainStyle = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "40px 0",
};

const containerStyle = {
  margin: "0 auto",
  maxWidth: "520px",
  padding: "0 20px",
};

const headerStyle = {
  paddingBottom: "24px",
};

const logoText = {
  color: "#2563eb",
  fontSize: "28px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  margin: "0",
  textAlign: "center",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "36px 32px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
};

const titleStyle = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px 0",
  textAlign: "center",
};

const textStyle = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const highlightText = {
  color: "#0f172a",
};

const otpBoxStyle = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "12px",
  margin: "24px 0",
  padding: "20px 0",
  textAlign: "center",
};

const otpTextStyle = {
  color: "#1d4ed8",
  fontSize: "36px",
  fontWeight: "800",
  letterSpacing: "12px",
  margin: "0",
  fontFamily: 'monospace, "Courier New", Courier',
  textAlign: "center",
};

const expiryTextStyle = {
  color: "#d97706",
  fontSize: "13px",
  textAlign: "center",
  margin: "0 0 20px 0",
};

const hrStyle = {
  borderColor: "#e2e8f0",
  margin: "24px 0 16px 0",
};

const footerTextStyle = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
  textAlign: "center",
};

const footerContainerStyle = {
  marginTop: "24px",
  textAlign: "center",
};

const copyrightTextStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center",
};
