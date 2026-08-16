import type { Transporter } from "nodemailer";
import type { ReactElement } from "react";
import type { SendEmailInput, SendEmailResult } from "@/lib/email/types";

type EmailRuntimeConfig = {
  fromName: string;
  fromAddress: string;
  replyTo: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
};

let cachedTransporter: Transporter | null = null;

function getRequiredEnv(value: string | undefined, name: string) {
  if (!value?.trim()) {
    throw new Error(`${name} is not configured.`);
  }
  return value.trim();
}

export function isEmailConfigured() {
  return Boolean(
    process.env.EMAIL_FROM_NAME &&
      process.env.EMAIL_FROM_ADDRESS &&
      process.env.EMAIL_REPLY_TO &&
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USERNAME &&
      process.env.SMTP_PASSWORD
  );
}

function getEmailRuntimeConfig(): EmailRuntimeConfig {
  const smtpPort = Number.parseInt(getRequiredEnv(process.env.SMTP_PORT, "SMTP_PORT"), 10);
  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    throw new Error("SMTP_PORT must be a valid positive number.");
  }

  return {
    fromName: getRequiredEnv(process.env.EMAIL_FROM_NAME, "EMAIL_FROM_NAME"),
    fromAddress: getRequiredEnv(process.env.EMAIL_FROM_ADDRESS, "EMAIL_FROM_ADDRESS"),
    replyTo: getRequiredEnv(process.env.EMAIL_REPLY_TO, "EMAIL_REPLY_TO"),
    smtpHost: getRequiredEnv(process.env.SMTP_HOST, "SMTP_HOST"),
    smtpPort,
    smtpUsername: getRequiredEnv(process.env.SMTP_USERNAME, "SMTP_USERNAME"),
    smtpPassword: getRequiredEnv(process.env.SMTP_PASSWORD, "SMTP_PASSWORD"),
  };
}

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const { createTransport } = await import("nodemailer");
  const config = getEmailRuntimeConfig();
  cachedTransporter = createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUsername,
      pass: config.smtpPassword,
    },
  });
  return cachedTransporter;
}

function formatAddress(value: string | { address: string; name?: string }) {
  if (typeof value === "string") return value;
  return value.name ? `"${value.name}" <${value.address}>` : value.address;
}

async function renderHtml(value: string | ReactElement) {
  if (typeof value === "string") return value;
  const { renderToStaticMarkup } = await import("react-dom/server");
  return `<!doctype html>${renderToStaticMarkup(value)}`;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { ok: true, skipped: true, messageId: null, reason: "Email service is not configured." };
  }

  const config = getEmailRuntimeConfig();
  const transporter = await getTransporter();
  const message = await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromAddress}>`,
    to: formatAddress(input.to),
    replyTo: formatAddress(input.replyTo ?? config.replyTo),
    subject: input.subject,
    text: input.text,
    html: await renderHtml(input.html),
  });

  return { ok: true, skipped: false, messageId: message.messageId ?? "" };
}
