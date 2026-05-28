import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeText } from "@/lib/directus";

export const runtime = "nodejs";

type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  website?: string;
  turnstileToken?: string;
  locale?: string;
};

type MailLocale = "de" | "en" | "fr" | "sr";

const EMAIL_COPY: Record<
  MailLocale,
  {
    defaultSubject: string;
    heading: string;
    nameLabel: string;
    emailLabel: string;
    subjectLabel: string;
    noSubjectLabel: string;
    messageLabel: string;
  }
> = {
  de: {
    defaultSubject: "Neue Kontaktanfrage über Portfolio",
    heading: "Neue Kontaktanfrage",
    nameLabel: "Name",
    emailLabel: "E-Mail",
    subjectLabel: "Betreff",
    noSubjectLabel: "(kein Betreff)",
    messageLabel: "Nachricht",
  },
  en: {
    defaultSubject: "New contact request via portfolio",
    heading: "New contact request",
    nameLabel: "Name",
    emailLabel: "Email",
    subjectLabel: "Subject",
    noSubjectLabel: "(no subject)",
    messageLabel: "Message",
  },
  fr: {
    defaultSubject: "Nouvelle demande de contact via le portfolio",
    heading: "Nouvelle demande de contact",
    nameLabel: "Nom",
    emailLabel: "E-mail",
    subjectLabel: "Sujet",
    noSubjectLabel: "(sans sujet)",
    messageLabel: "Message",
  },
  sr: {
    defaultSubject: "Novi kontakt upit preko portfolija",
    heading: "Novi kontakt upit",
    nameLabel: "Ime",
    emailLabel: "E-mail",
    subjectLabel: "Tema",
    noSubjectLabel: "(bez teme)",
    messageLabel: "Poruka",
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[^\u0000-\u001F\u007F]{2,120}$/u;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;

// In-Memory-Limiter reicht lokal/single-instance; für Cluster wäre Redis sinnvoll.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const firstForwardedIp = forwardedFor.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip") || "";
  return firstForwardedIp || realIp || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return false;
}

async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const enforceCaptcha = process.env.TURNSTILE_ENFORCE !== "false";

  if (!enforceCaptcha) {
    return true;
  }

  if (!secret || !token) {
    return false;
  }

  const verificationBody = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verificationBody.toString(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secureRaw = process.env.SMTP_SECURE;

  if (!host || !portRaw || !user || !pass) {
    throw new Error("Missing SMTP configuration in environment variables");
  }

  const port = Number(portRaw);
  const secure =
    typeof secureRaw === "string" ? secureRaw.toLowerCase() === "true" : false;

  if (!Number.isFinite(port)) {
    throw new Error("Invalid SMTP_PORT value");
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
}

function validatePayload(payload: ContactPayload): string | null {
  if (!payload.name || !payload.email || !payload.message) {
    return "Missing required fields";
  }

  // Honeypot-Feld muss leer bleiben; Bots füllen es typischerweise aus.
  if (payload.website) {
    return "Invalid payload";
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return "Invalid email address";
  }

  if (!NAME_PATTERN.test(payload.name)) {
    return "Invalid name";
  }

  if (
    payload.name.length > 120 ||
    (payload.subject !== undefined && payload.subject.length > 200)
  ) {
    return "Input exceeds maximum allowed length";
  }

  if (payload.message.length > 5000) {
    return "Message is too long";
  }

  if (payload.message.length < 10) {
    return "Message is too short";
  }

  return null;
}

function resolveMailLocale(locale?: string): MailLocale {
  if (locale === "de" || locale === "en" || locale === "fr" || locale === "sr") {
    return locale;
  }

  return "de";
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit schützt den Mail-Endpoint vor Burst-Spam.
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await request.json()) as Partial<ContactPayload>;
    const payload: ContactPayload = {
      name: sanitizeText(body.name),
      email: sanitizeText(body.email),
      subject: sanitizeText(body.subject),
      message: sanitizeText(body.message),
      website: sanitizeText(body.website),
      turnstileToken: sanitizeText(body.turnstileToken),
      locale: sanitizeText(body.locale).toLowerCase(),
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Captcha wird optional per Env erzwungen, um lokale Entwicklung zu entkoppeln.
    const captchaValid = await verifyTurnstile(
      payload.turnstileToken,
      clientIp,
    );
    if (!captchaValid) {
      return NextResponse.json(
        { error: "Captcha validation failed" },
        { status: 400 },
      );
    }

    const smtpConfig = getSmtpConfig();
    const toAddress =
      process.env.CONTACT_TO_EMAIL ?? "contactform@portfolio.ned-it.de";
    const fromAddress =
      process.env.SMTP_FROM ?? `Portfolio Kontakt <${smtpConfig.auth.user}>`;

    const transporter = nodemailer.createTransport(smtpConfig);
    const mailLocale = resolveMailLocale(payload.locale);
    const copy = EMAIL_COPY[mailLocale];
    const safeSubject = payload.subject || copy.noSubjectLabel;

    await transporter.sendMail({
      from: fromAddress,
      to: toAddress,
      replyTo: payload.email,
      subject: payload.subject || copy.defaultSubject,
      text: [
        `${copy.nameLabel}: ${payload.name}`,
        `${copy.emailLabel}: ${payload.email}`,
        `${copy.subjectLabel}: ${safeSubject}`,
        "",
        `${copy.messageLabel}:`,
        payload.message,
      ].join("\n"),
      html: `
        <h2>${escapeHtml(copy.heading)}</h2>
        <p><strong>${escapeHtml(copy.nameLabel)}:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>${escapeHtml(copy.emailLabel)}:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>${escapeHtml(copy.subjectLabel)}:</strong> ${escapeHtml(
          safeSubject,
        )}</p>
        <hr />
        <p><strong>${escapeHtml(copy.messageLabel)}:</strong></p>
        <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[contact-api] send failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Contact API endpoint is reachable" },
    { status: 200 },
  );
}
