import {
  getTemplateBySlug,
  type ResourceTemplate,
} from "~/app/(homepage)/_lib/resource-templates";

const MIME_TYPE = "text/plain; charset=utf-8";

/** Renders the template as a plain-text document with an aligned table. */
function templateToText(template: ResourceTemplate): string {
  const lines: string[] = [
    template.title,
    "=".repeat(Math.max(template.title.length, 1)),
    "",
    `For: ${template.audience}`,
    "",
    template.description,
    "",
  ];

  const [header, ...body] = template.rows;
  if (header?.length) {
    // Column widths follow the longest cell so the table lines up.
    const widths = header.map((_, col) =>
      Math.max(1, ...template.rows.map((row) => (row[col] ?? "").length))
    );
    const renderRow = (row: string[]) =>
      widths
        .map((width, col) => (row[col] ?? "").padEnd(width, " "))
        .join("  ")
        .trimEnd();

    lines.push(renderRow(header));
    lines.push(widths.map((width) => "-".repeat(width)).join("  "));
    for (const row of body) {
      lines.push(renderRow(row));
    }
    lines.push("");
  }

  lines.push("Free template from Zedu - zedu.chat/resources");
  return `${lines.join("\n")}\n`;
}

export async function buildTemplateFile(slug: string) {
  const template = getTemplateBySlug(slug);
  if (!template) return null;
  const content = Buffer.from(templateToText(template), "utf8");
  return {
    template,
    content,
    mimeType: MIME_TYPE,
    fileName: template.fileName,
  };
}
