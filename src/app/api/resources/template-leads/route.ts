import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTemplateBySlug } from "~/app/(homepage)/_lib/resource-templates";
import {
  sendTemplateConfirmationEmail,
  templateConfirmationSubject,
} from "~/emails/template-confirmation";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  role: z.string().trim().max(120).optional().default(""),
  templateSlug: z.string().trim().min(1, "Choose a template"),
  consent: z.boolean(),
  // Honeypot field: real users leave it empty.
  website: z.string().max(500).optional().default(""),
  source: z.string().trim().max(200).optional().default("direct"),
});

export interface TemplateLead {
  name: string;
  email: string;
  role: string;
  templateSlug: string;
  consent: boolean;
  source: string;
  timestamp: string;
  subscribed: boolean;
}

const leads: TemplateLead[] = [];
const newsletterSubscribers = new Set<string>();
const attemptsByIp = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const attempts = (attemptsByIp.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );
  attempts.push(now);
  attemptsByIp.set(ip, attempts);
  return attempts.length > RATE_LIMIT_MAX;
}

export function getTemplateLeads() {
  return leads;
}

// Newsletter consent opt-in: same backend endpoint the homepage footer uses
// (PostRequest("/newsletter")), so it needs no new configuration — only the
// existing NEXT_PUBLIC_BASE_URL. Best-effort by design: a backend hiccup must
// never block the template download the user actually asked for.
async function subscribeToNewsletter(email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${baseUrl}/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[templates] newsletter opt-in failed: ${res.status}`);
    }
  } catch (error) {
    console.warn(
      "[templates] newsletter opt-in failed:",
      error instanceof Error ? error.message : "unknown error"
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      {
        status: 400,
      }
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Check the highlighted fields." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  // Honeypot: silently accept spam so bots learn nothing.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ success: true, downloadUrl: null });
  }

  const template = getTemplateBySlug(data.templateSlug);
  if (!template) {
    return NextResponse.json({ error: "Unknown template." }, { status: 404 });
  }

  const origin = new URL(req.url).origin;
  const lead: TemplateLead = {
    name: data.name,
    email: data.email.toLowerCase(),
    role: data.role ?? "",
    templateSlug: template.slug,
    consent: data.consent,
    source: data.source || "direct",
    timestamp: new Date().toISOString(),
    subscribed: data.consent,
  };
  leads.push(lead);
  if (data.consent) {
    newsletterSubscribers.add(lead.email);
    await subscribeToNewsletter(lead.email);
  }

  const downloadUrl = `${origin}/api/resources/templates/${template.slug}/download`;
  const fileUrl = `${origin}/api/resources/templates/${template.slug}/file`;
  const unsubscribeUrl = `${origin}/api/resources/newsletter/unsubscribe?email=${encodeURIComponent(lead.email)}`;

  const subject = templateConfirmationSubject(template.title);
  // Provider is optional: with RESEND_* vars unset (as in this repo today)
  // nothing is sent and the original JSON contract is preserved, so the
  // client keeps rendering the same content it always has.
  const emailSent = await sendTemplateConfirmationEmail({
    to: lead.email,
    name: lead.name,
    templateTitle: template.title,
    fileUrl,
    unsubscribeUrl,
  });

  return NextResponse.json({
    success: true,
    downloadUrl,
    confirmationEmail: {
      to: lead.email,
      subject,
      fileUrl,
      unsubscribeUrl,
      sent: emailSent,
    },
  });
}
