"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import type { ContactContent } from "@/lib/directus";
import "./ContactSection.css";

interface ContactSectionProps {
  content?: ContactContent | null;
}

export default function ContactSection({ content }: ContactSectionProps) {
  const t = useTranslations("contact");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasCaptcha = Boolean(turnstileSiteKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!hasCaptcha || !turnstileContainerRef.current) return;

    function renderWidget() {
      const w = window as any;
      if (!w.turnstile || !turnstileContainerRef.current) return;
      const isMobile = window.matchMedia("(max-width: 480px)").matches;

      // Remove previous widget if any
      if (turnstileWidgetIdRef.current !== undefined) {
        try {
          w.turnstile.remove(turnstileWidgetIdRef.current);
        } catch {}
        turnstileWidgetIdRef.current = undefined;
      }

      turnstileWidgetIdRef.current = w.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: turnstileSiteKey,
          theme: "light",
          size: isMobile ? "compact" : "normal",
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
        },
      );
    }

    const w = window as any;
    if (w.turnstile) {
      renderWidget();
    } else {
      // Script already loaded but window.turnstile not yet ready
      w.__turnstilePendingRender = renderWidget;
    }

    return () => {
      const ww = window as any;
      if (turnstileWidgetIdRef.current !== undefined && ww.turnstile) {
        try {
          ww.turnstile.remove(turnstileWidgetIdRef.current);
        } catch {}
        turnstileWidgetIdRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCaptcha, turnstileSiteKey]);

  const labels = {
    title: content?.title ?? t("title"),
    description: content?.description ?? t("description"),
    nameLabel: content?.nameLabel ?? t("name_label"),
    emailLabel: content?.emailLabel ?? t("email_label"),
    subjectLabel: content?.subjectLabel ?? t("subject_label"),
    messageLabel: content?.messageLabel ?? t("message_label"),
    submit: content?.submitLabel ?? t("submit"),
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      turnstileToken: turnstileToken,
    };

    if (!payload.name || !payload.email || !payload.message) {
      setFeedback({
        type: "error",
        message: t("error_required"),
      });
      return;
    }

    if (hasCaptcha && !payload.turnstileToken) {
      setFeedback({
        type: "error",
        message: t("error_captcha"),
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Request failed");
      }

      setFeedback({ type: "success", message: t("success") });
      form.reset();
      setTurnstileToken("");
      const w = window as any;
      if (w.turnstile && turnstileWidgetIdRef.current !== undefined) {
        w.turnstile.reset(turnstileWidgetIdRef.current);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        message: msg || t("error_generic"),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-header">
          <h2>{labels.title}</h2>
          <p>{labels.description}</p>
        </div>

        {hasCaptcha ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
            onLoad={() => {
              const w = window as any;
              if (w.__turnstilePendingRender) {
                w.__turnstilePendingRender();
                w.__turnstilePendingRender = undefined;
              }
            }}
          />
        ) : null}

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-field">
            <span>{labels.nameLabel}</span>
            <input
              type="text"
              name="name"
              placeholder={t("name_placeholder")}
              autoComplete="name"
              maxLength={120}
              required
            />
          </label>

          <label className="contact-field">
            <span>{labels.emailLabel}</span>
            <input
              type="email"
              name="email"
              placeholder={t("email_placeholder")}
              autoComplete="email"
              maxLength={160}
              required
            />
          </label>

          <label className="contact-field">
            <span>{labels.subjectLabel}</span>
            <input
              type="text"
              name="subject"
              placeholder={t("subject_placeholder")}
              maxLength={200}
            />
          </label>

          <label className="contact-field contact-field-full">
            <span>{labels.messageLabel}</span>
            <textarea
              name="message"
              rows={6}
              placeholder={t("message_placeholder")}
              maxLength={5000}
              required
            />
          </label>

          <div className="contact-honeypot" aria-hidden="true">
            <label>
              Leave this field empty
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          {hasCaptcha ? (
            <div className="contact-field contact-field-full contact-field-captcha">
              <div ref={turnstileContainerRef}></div>
            </div>
          ) : null}

          <button
            type="submit"
            className="contact-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("submitting") : labels.submit}
          </button>

          <p className="contact-privacy-note">
            {t("privacy_notice")}{" "}
            <Link href="/datenschutz">{t("privacy_notice_link")}</Link>.
          </p>

          {feedback ? (
            <p
              className={`contact-feedback contact-feedback-${feedback.type}`}
              role="status"
              aria-live="polite"
            >
              {feedback.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
