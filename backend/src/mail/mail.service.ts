import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from = process.env.RESEND_FROM_EMAIL || 'Rezwoan <noreply@rezwoan.me>';
  private readonly to = process.env.CONTACT_TO_EMAIL || 'frezwoan@gmail.com';

  constructor() {
    const key = process.env.RESEND_API_KEY;
    this.resend = key ? new Resend(key) : null;
    if (!this.resend) this.logger.warn('RESEND_API_KEY not set — emails will be skipped (still logged).');
  }

  /** Notify the owner of a new contact submission + send the visitor an auto-reply. */
  async sendContact(p: ContactPayload): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[mail skipped] contact from ${p.email}: ${p.subject || '(no subject)'}`);
      return;
    }
    const subjectLine = `New contact from ${p.name}${p.subject ? ': ' + p.subject : ''}`;
    try {
      await this.resend.emails.send({
        from: this.from,
        to: this.to,
        replyTo: p.email,
        subject: subjectLine,
        html: ownerHtml(p),
        text: ownerText(p),
      });
      await this.resend.emails.send({
        from: this.from,
        to: p.email,
        subject: 'Thanks for reaching out — Rezwoan',
        html: replyHtml(p),
        text: replyText(p),
      });
    } catch (err) {
      this.logger.error(`Resend send failed: ${(err as Error).message}`);
      // best-effort: the submission is already persisted by the caller.
    }
  }
}

function esc(s = ''): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
}

function ownerHtml(p: ContactPayload): string {
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#5B4FE0;margin:0 0 8px">New portfolio message</h2>
    <p style="margin:0 0 16px;color:#555">Someone reached out via rezwoan.me</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#888;width:90px">Name</td><td><b>${esc(p.name)}</b></td></tr>
      <tr><td style="padding:6px 0;color:#888">Email</td><td><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#888">Subject</td><td>${esc(p.subject || '—')}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:#f6f6fb;border-radius:10px;white-space:pre-wrap">${esc(p.message)}</div>
  </div>`;
}
function ownerText(p: ContactPayload): string {
  return `New portfolio message\nName: ${p.name}\nEmail: ${p.email}\nSubject: ${p.subject || '-'}\n\n${p.message}`;
}
function replyHtml(p: ContactPayload): string {
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#5B4FE0">Thanks, ${esc(p.name.split(' ')[0] || p.name)}!</h2>
    <p>I got your message and I'll get back to you within 1–2 days. In the meantime, feel free to check out my work and connect:</p>
    <p>
      <a href="https://github.com/Rezwoan">GitHub</a> ·
      <a href="https://linkedin.com/in/din-muhammad-rezwoan-b4b87020a">LinkedIn</a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">— Din Muhammad Rezwoan · rezwoan.me</p>
  </div>`;
}
function replyText(p: ContactPayload): string {
  return `Thanks, ${p.name}! I got your message and will reply within 1-2 days.\n— Rezwoan · rezwoan.me`;
}
