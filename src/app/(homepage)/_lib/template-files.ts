import {
  getTemplateBySlug,
  type ResourceTemplate,
} from "~/app/(homepage)/_lib/resource-templates";

function escapeCsvCell(cell: string) {
  if (/[",\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function templateToCsv(template: ResourceTemplate) {
  return template.rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

export function templateToText(template: ResourceTemplate) {
  const widths = template.rows[0].map((_, col) =>
    Math.max(...template.rows.map((row) => (row[col] ?? "").length))
  );
  const lines = template.rows.map((row, rowIndex) => {
    const line = row
      .map((cell, col) => (cell ?? "").padEnd(widths[col], " "))
      .join(" | ");
    if (rowIndex === 0) {
      return `${line}\n${widths.map((w) => "-".repeat(w)).join("-+-")}`;
    }
    return line;
  });
  return [
    template.title,
    "Free template from Zedu (https://zedu.chat/resources?category=templates)",
    "",
    ...lines,
    "",
  ].join("\n");
}

export function buildTemplateFile(slug: string) {
  const template = getTemplateBySlug(slug);
  if (!template) return null;
  const content =
    template.fileKind === "csv"
      ? templateToCsv(template)
      : templateToText(template);
  return {
    template,
    content,
    mimeType:
      template.fileKind === "csv"
        ? "text/csv;charset=utf-8"
        : "text/plain;charset=utf-8",
  };
}
