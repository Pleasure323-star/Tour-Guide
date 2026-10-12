import { Workbook, type Border } from "exceljs";
import {
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import {
  getTemplateBySlug,
  type ResourceTemplate,
} from "~/app/(homepage)/_lib/resource-templates";

const MIME_TYPES: Record<ResourceTemplate["fileType"], string> = {
  PDF: "application/pdf",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  CSV: "text/csv;charset=utf-8",
};

/** Brand purple used for table headers in generated files (#5F5FE1). */
const BRAND = rgb(95 / 255, 95 / 255, 225 / 255);
const TEXT = rgb(0.13, 0.14, 0.17);
const MUTED = rgb(0.42, 0.44, 0.5);
const BORDER = rgb(0.84, 0.86, 0.89);
const ALT_ROW = rgb(0.96, 0.965, 0.985);

function escapeCsvCell(cell: string) {
  if (/[",\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function templateToCsv(template: ResourceTemplate) {
  return template.rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

/** Greedy word-wrap using real font metrics so lines fit the given width. */
function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  font: PDFFont
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

interface PdfTableOptions {
  x: number;
  y: number;
  contentWidth: number;
  regular: PDFFont;
  bold: PDFFont;
}

/** Draws a bordered, zebra-striped table; returns the cursor Y below it. */
function drawPdfTable(
  page: ReturnType<PDFDocument["addPage"]>,
  rows: string[][],
  { x, y, contentWidth, regular, bold }: PdfTableOptions
): number {
  const [header, ...body] = rows;
  const colCount = header.length;
  const fontSize = 9;
  const lineH = 12;
  const padding = 6;
  const rowMinH = 20;

  // Column widths proportional to the longest cell in each column.
  const weights = header.map((_, col) =>
    Math.max(...rows.map((row) => (row[col] ?? "").length), 1)
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const colWidths = weights.map(
    (weight) => (weight / totalWeight) * contentWidth
  );

  const layoutRow = (row: string[], font: PDFFont) => {
    const lines = row.map((cell, col) =>
      wrapText(cell ?? "", colWidths[col] - padding * 2, fontSize, font)
    );
    const height = Math.max(
      rowMinH,
      Math.max(...lines.map((line) => line.length)) * lineH + padding * 2
    );
    return { lines, height };
  };

  let cursor = y;

  const drawRow = (
    row: string[],
    font: PDFFont,
    isHeader: boolean,
    zebraIndex: number
  ) => {
    const { lines, height } = layoutRow(row, font);
    const background = isHeader
      ? BRAND
      : zebraIndex % 2 === 1
        ? ALT_ROW
        : rgb(1, 1, 1);

    page.drawRectangle({
      x,
      y: cursor - height,
      width: contentWidth,
      height,
      color: background,
      borderColor: BORDER,
      borderWidth: 0.5,
    });

    // Vertical column dividers.
    let dividerX = x;
    for (let col = 0; col < colCount - 1; col += 1) {
      dividerX += colWidths[col];
      page.drawLine({
        start: { x: dividerX, y: cursor },
        end: { x: dividerX, y: cursor - height },
        thickness: 0.5,
        color: BORDER,
      });
    }

    // Cell text, top-aligned with padding.
    let textX = x;
    lines.forEach((cellLines, col) => {
      let textY = cursor - padding - fontSize;
      cellLines.forEach((line) => {
        page.drawText(line, {
          x: textX + padding,
          y: textY,
          size: fontSize,
          font,
          color: isHeader ? rgb(1, 1, 1) : TEXT,
        });
        textY -= lineH;
      });
      textX += colWidths[col];
    });

    cursor -= height;
  };

  drawRow(header, bold, true, 0);
  body.forEach((row, index) => drawRow(row, regular, false, index));
  return cursor;
}

async function buildPdf(template: ResourceTemplate): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(template.title);
  pdf.setAuthor("Zedu");
  pdf.setSubject(template.description);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // A4 portrait.
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 48;
  const contentWidth = width - margin * 2;
  let y = height - margin;

  page.drawText(template.title, {
    x: margin,
    y: y - 18,
    size: 18,
    font: bold,
    color: TEXT,
  });
  y -= 34;

  page.drawText(template.audience, {
    x: margin,
    y: y - 10,
    size: 10,
    font: regular,
    color: MUTED,
  });
  y -= 18;

  for (const line of wrapText(
    template.description,
    contentWidth,
    10,
    regular
  )) {
    page.drawText(line, {
      x: margin,
      y: y - 10,
      size: 10,
      font: regular,
      color: TEXT,
    });
    y -= 14;
  }
  y -= 16;

  const tableBottom = drawPdfTable(page, template.rows, {
    x: margin,
    y,
    contentWidth,
    regular,
    bold,
  });

  page.drawText("Free template from Zedu - zedu.chat/resources", {
    x: margin,
    y: tableBottom - 18,
    size: 8,
    font: regular,
    color: MUTED,
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

const THIN_BORDER: Border = {
  style: "thin",
  color: { argb: "FFD0D5DD" },
};
const ALL_BORDERS = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

async function buildXlsx(template: ResourceTemplate): Promise<Buffer> {
  const workbook = new Workbook();
  workbook.creator = "Zedu";

  // Worksheet names are capped at 31 chars and cannot contain []:*?/\.
  const sheetName = template.title.replace(/[[\]:*?/\\]/g, "").slice(0, 31);
  const sheet = workbook.addWorksheet(sheetName);

  const [header, ...body] = template.rows;
  sheet.columns = header.map((title, col) => ({
    header: title,
    key: `col${col}`,
    width: Math.min(
      40,
      Math.max(
        12,
        Math.max(...template.rows.map((row) => (row[col] ?? "").length)) + 4
      )
    ),
  }));
  sheet.addRows(body);

  // Header styling: bold white on brand purple, frozen.
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.eachCell((cell) => {
    cell.border = ALL_BORDERS;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF5F5FE1" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  headerRow.height = 22;

  // Body styling: zebra stripes, borders, wrapped text.
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.eachCell((cell) => {
      cell.border = ALL_BORDERS;
      cell.alignment = { vertical: "top", wrapText: true };
      if (index % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F6FB" },
        };
      }
    });
    row.height = 20;
  });

  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function buildDocx(template: ResourceTemplate): Promise<Buffer> {
  const headerRow = new TableRow({
    tableHeader: true,
    children: template.rows[0].map(
      (cell) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: "5F5FE1" },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: cell, bold: true, color: "FFFFFF" }),
              ],
            }),
          ],
        })
    ),
  });

  const bodyRows = template.rows.slice(1).map(
    (row, index) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              ...(index % 2 === 1
                ? { shading: { type: ShadingType.CLEAR, fill: "F5F6FB" } }
                : {}),
              children: [
                new Paragraph({
                  children: cell ? [new TextRun(cell)] : [],
                }),
              ],
            })
        ),
      })
  );

  const document = new Document({
    creator: "Zedu",
    title: template.title,
    description: template.description,
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: template.title, bold: true, size: 36 }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: template.audience,
                italics: true,
                color: "667085",
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun(template.description)],
            spacing: { after: 240 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...bodyRows],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Free template from Zedu - zedu.chat/resources",
                color: "667085",
                size: 16,
              }),
            ],
            spacing: { before: 240 },
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(document);
}

async function generateFile(template: ResourceTemplate): Promise<Buffer> {
  switch (template.fileType) {
    case "PDF":
      return buildPdf(template);
    case "XLSX":
      return buildXlsx(template);
    case "DOCX":
      return buildDocx(template);
    case "CSV":
      return Buffer.from(templateToCsv(template), "utf8");
  }
}

export async function buildTemplateFile(slug: string) {
  const template = getTemplateBySlug(slug);
  if (!template) return null;
  const content = await generateFile(template);
  return {
    template,
    content,
    mimeType: MIME_TYPES[template.fileType],
    fileName: template.fileName,
  };
}
