import { NextRequest, NextResponse } from "next/server";
import { buildTemplateFile } from "~/app/(homepage)/_lib/template-files";

// Stable public file link used in confirmation emails. Serves the same
// content as the download route with an inline disposition.
interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const file = await buildTemplateFile(slug);
  if (!file) {
    return NextResponse.json(
      { error: "Template not found." },
      {
        status: 404,
      }
    );
  }
  return new NextResponse(new Uint8Array(file.content), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${file.template.fileName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
