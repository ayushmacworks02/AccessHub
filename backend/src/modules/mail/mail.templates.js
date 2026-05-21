import { env } from "../../config/env.js";

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const buildPasswordResetEmail = ({ name, resetUrl, expiresInMinutes }) => {
  const safeName = escapeHtml(name || "User");
  const safeResetUrl = escapeHtml(resetUrl);
  const safeAppName = escapeHtml(env.mailFromName);

  const subject = `${env.mailFromName} password reset request`;

  const text = [
    `Hello ${name || "User"},`,
    "",
    `We received a request to reset your ${env.mailFromName} password.`,
    `Reset your password using this link: ${resetUrl}`,
    "",
    `This link will expire in ${expiresInMinutes} minutes.`,
    "",
    "If you did not request this, you can safely ignore this email.",
    "",
    `${env.mailFromName}`,
  ].join("\n");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,sans-serif;color:#111827;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f7f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:28px 28px 12px 28px;">
                    <h1 style="margin:0;font-size:22px;line-height:1.3;color:#111827;">
                      Password reset request
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 0 28px;">
                    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#374151;">
                      Hello ${safeName},
                    </p>
                    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#374151;">
                      We received a request to reset your ${safeAppName} password.
                    </p>
                    <p style="margin:0 0 24px 0;">
                      <a href="${safeResetUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600;">
                        Reset password
                      </a>
                    </p>
                    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#6b7280;">
                      This link will expire in ${expiresInMinutes} minutes.
                    </p>
                    <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#6b7280;">
                      If you did not request this, you can safely ignore this email.
                    </p>
                    <p style="margin:0 0 18px 0;font-size:13px;line-height:1.6;color:#6b7280;">
                      If the button does not work, copy and paste this URL into your browser:
                    </p>
                    <p style="word-break:break-all;margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#374151;">
                      ${safeResetUrl}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">
                      ${safeAppName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return {
    subject,
    text,
    html,
  };
};