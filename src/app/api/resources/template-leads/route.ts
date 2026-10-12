import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTemplateBySlug } from "~/app/(homepage)/_lib/resource-templates";

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
  }

  const downloadUrl = `${origin}/api/resources/templates/${template.slug}/download`;
  const fileUrl = `${origin}/api/resources/templates/${template.slug}/file`;
  const unsubscribeUrl = `${origin}/api/resources/newsletter/unsubscribe?email=${encodeURIComponent(lead.email)}`;

  // No email provider is configured in this repo, so the confirmation email
  // content is returned in the response for the client to display (and for a
  // future provider to send without changing the contract).
  return NextResponse.json({
    success: true,
    downloadUrl,
    confirmationEmail: {
      to: lead.email,
      subject: `Your ${template.title} is ready`,
      fileUrl,
      unsubscribeUrl,
    },
  });
}
