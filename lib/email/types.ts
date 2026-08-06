import type { ReactElement } from "react";

export type EmailAddress = {
  name?: string;
  address: string;
};

export type EmailContent = {
  subject: string;
  text: string;
  html: string | ReactElement;
};

export type SendEmailInput = EmailContent & {
  to: EmailAddress | string;
  replyTo?: EmailAddress | string;
};

export type SendEmailResult =
  | { ok: true; skipped: false; messageId: string }
  | { ok: true; skipped: true; messageId: null; reason: string }
  | { ok: false; skipped: false; error: string };
