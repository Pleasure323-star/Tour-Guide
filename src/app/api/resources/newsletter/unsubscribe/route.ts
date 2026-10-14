import { NextRequest, NextResponse } from "next/server";

// Unsubscribe link target from confirmation emails. With no email provider
// or database in this repo, unsubscribes are acknowledged and logged; wire
// a real list-removal here when a provider is added.
export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email") ?? "";
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }
  console.info(`[templates] newsletter unsubscribe: ${email.toLowerCase()}`);
  return NextResponse.json({
    success: true,
    message: `You have been unsubscribed (${email.toLowerCase()}).`,
  });
}
