import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

let cachedTransporter = null;
let cachedEtherealAccount = null;

const buildFromAddress = () => {
  return `"${env.mailFromName}" <${env.mailFromEmail}>`;
};

const createEtherealTransporter = async () => {
  if (!cachedEtherealAccount) {
    cachedEtherealAccount = await nodemailer.createTestAccount();
  }

  return nodemailer.createTransport({
    host: cachedEtherealAccount.smtp.host,
    port: cachedEtherealAccount.smtp.port,
    secure: cachedEtherealAccount.smtp.secure,
    auth: {
      user: cachedEtherealAccount.user,
      pass: cachedEtherealAccount.pass,
    },
  });
};

const createSmtpTransporter = () => {
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth:
      env.smtpUser && env.smtpPass
        ? {
            user: env.smtpUser,
            pass: env.smtpPass,
          }
        : undefined,
  });
};

const getTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (env.mailDriver === "smtp") {
    cachedTransporter = createSmtpTransporter();
    return cachedTransporter;
  }

  cachedTransporter = await createEtherealTransporter();
  return cachedTransporter;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: buildFromAddress(),
    to,
    subject,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log(`Ethereal email preview URL: ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
};

export const sendPasswordResetEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  return sendMail({
    to,
    subject,
    text,
    html,
  });
};