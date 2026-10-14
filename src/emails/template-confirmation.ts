// Confirmation email for the Resources template lead form.
//
// Built as a plain HTML string on purpose: `@react-email/render` is only a
// transitive dependency here (pnpm blocks importing it directly) and this repo
// adds no dependencies without a ticket. Drop in a react-email template once a
// renderer is a declared dependency — the exported send function can stay.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function templateConfirmationSubject(templateTitle: string): string {
  return `Your ${templateTitle} is ready`;
}

export interface TemplateConfirmationEmail {
  to: string;
  name: string;
  templateTitle: string;
  fileUrl: string;
  unsubscribeUrl: string;
}

export function renderTemplateConfirmation(email: TemplateConfirmationEmail) {
  const subject = templateConfirmationSubject(email.templateTitle);
  const firstName = escapeHtml(email.name.split(/\s+/)[0] ?? email.name);
  const title = escapeHtml(email.templateTitle);
  const fileUrl = escapeHtml(email.fileUrl);
  const unsubscribeUrl = escapeHtml(email.unsubscribeUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;">
            <tr>
              <td style="background-color:#7141f8;padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;">Zedu</span>
                <span style="color:#e9e4ff;font-size:13px;"> Resources</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;color:#27272a;">Hi ${firstName},</p>
                <p style="margin:0 0 8px;font-size:18px;font-weight:bold;color:#18181b;">${title} is ready</p>
                <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.6;">
                  Thanks for grabbing this template from Zedu Resources. Your
                  download should have started automatically — if it did not,
                  use the button below.
                </p>
                <p style="margin:0 0 24px;">
                  <a href="${fileUrl}" style="display:inline-block;background-color:#7141f8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:bold;">Open your template</a>
                </p>
                <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Or copy this link:</p>
                <p style="margin:0 0 24px;font-size:13px;color:#71717a;">
                  <a href="${fileUrl}" style="color:#7141f8;word-break:break-all;">${fileUrl}</a>
                </p>
                <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
                <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                  You received this because you requested a template on Zedu
                  Resources. No longer want newsletter updates?
                  <a href="${unsubscribeUrl}" style="color:#7141f8;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${email.name.split(/\s+/)[0] ?? email.name},`,
    ``,
    `${email.templateTitle} is ready.`,
    ``,
    `Your download should have started automatically. If it did not, open your template here:`,
    email.fileUrl,
    ``,
    `You received this because you requested a template on Zedu Resources.`,
    `No longer want newsletter updates? Unsubscribe: ${email.unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

// Sends through the Resend REST API. The endpoint, key and from-address come
// from the environment (this repo forbids hardcoded URLs and secrets in git);
// when any of them is unset the function resolves to `false` and the caller
// keeps the original JSON response contract.
export async function sendTemplateConfirmationEmail(
  email: TemplateConfirmationEmail
): Promise<boolean> {
  const apiUrl = process.env.RESEND_API_URL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiUrl || !apiKey || !from) return false;

  const { subject, html, text } = renderTemplateConfirmation(email);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Resend rejects direct REST calls without a User-Agent.
        "User-Agent": "zedu-fe",
      },
      body: JSON.stringify({ from, to: [email.to], subject, html, text }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[templates] confirmation email failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(
      "[templates] confirmation email failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}
