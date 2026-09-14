import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

const BRAND = {
  50: "#ecfdf3",
  100: "#d1fae0",
  200: "#a7f3c8",
  500: "#16a34a",
  600: "#0f7a3b",
  700: "#0c5f2f",
  900: "#0a3d20",
};
const GOLD = "#d9b65c";
const GOLD_DARK = "#b8892f";

const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="faraidGoldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3d98a" />
      <stop offset="50%" stop-color="#d9b65c" />
      <stop offset="100%" stop-color="#b8892f" />
    </linearGradient>
    <linearGradient id="faraidGreenGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#146b3a" />
      <stop offset="100%" stop-color="#0c5f2f" />
    </linearGradient>
    <radialGradient id="faraidSheen" cx="35%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <polygon points="32.00,2.00 39.65,13.52 53.21,10.79 50.48,24.35 62.00,32.00 50.48,39.65 53.21,53.21 39.65,50.48 32.00,62.00 24.35,50.48 10.79,53.21 13.52,39.65 2.00,32.00 13.52,24.35 10.79,10.79 24.35,13.52" fill="url(#faraidGreenGrad)" stroke="url(#faraidGoldGrad)" stroke-width="1.4" stroke-linejoin="round" />
  <polygon points="41.76,8.44 44.73,19.27 55.56,22.24 50.00,32.00 55.56,41.76 44.73,44.73 41.76,55.56 32.00,50.00 22.24,55.56 19.27,44.73 8.44,41.76 14.00,32.00 8.44,22.24 19.27,19.27 22.24,8.44 32.00,14.00" fill="none" stroke="url(#faraidGoldGrad)" stroke-width="0.9" opacity="0.85" />
  <polygon points="32.00,2.40 34.60,5.00 32.00,7.60 29.40,5.00" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="51.09,10.31 53.69,12.91 51.09,15.51 48.49,12.91" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="59.00,29.40 61.60,32.00 59.00,34.60 56.40,32.00" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="51.09,48.49 53.69,51.09 51.09,53.69 48.49,51.09" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="32.00,56.40 34.60,59.00 32.00,61.60 29.40,59.00" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="12.91,48.49 15.51,51.09 12.91,53.69 10.31,51.09" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="5.00,29.40 7.60,32.00 5.00,34.60 2.40,32.00" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <polygon points="12.91,10.31 15.51,12.91 12.91,15.51 10.31,12.91" fill="url(#faraidGoldGrad)" stroke="#8a6a1f" stroke-width="0.3" />
  <circle cx="32" cy="32" r="18.5" fill="none" stroke="url(#faraidGoldGrad)" stroke-width="0.6" opacity="0.7" />
  <circle cx="32" cy="32" r="15.5" fill="url(#faraidGreenGrad)" stroke="url(#faraidGoldGrad)" stroke-width="1.8" />
  <circle cx="32" cy="32" r="15.5" fill="url(#faraidSheen)" />
  <circle cx="32" cy="32" r="12.3" fill="none" stroke="#d9b65c" stroke-width="0.5" opacity="0.55" />
  <text x="32.6" y="38.3" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-weight="700" fill="#04200f" opacity="0.55">F</text>
  <text x="32" y="37.6" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-weight="700" fill="url(#faraidGoldGrad)">F</text>
</svg>
`.trim();

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function svgToPngDataUrl(svgString, size = 128) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportResultPdf(result, t = {}) {
  const appName = t.appName || "Fara'id AI";
  const tagline = t.tagline || "Islamic Inheritance Intelligence";
  const L = {
    netEstate: t.netEstate || "Net Estate",
    wasiyyahApplied: t.wasiyyahApplied || "Wasiyyah Applied",
    distributable: t.distributable || "Distributable Estate",
    notes: t.notesTitle || "Notes",
    estateSummary: t.pdf?.estateSummary || "Estate Summary",
    distributionBreakdown: t.pdf?.distributionBreakdown || "Distribution Breakdown",
    heir: t.pdf?.heir || "Heir",
    share: t.pdf?.share || "Share",
    amount: t.pdf?.amount || "Amount",
    generated: t.pdf?.generated || "Generated",
  };

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const [r700, g700, b700] = hexToRgb(BRAND[700]);
  const [r600, g600, b600] = hexToRgb(BRAND[600]);
  const [r50, g50, b50] = hexToRgb(BRAND[50]);
  const [gr, gg, gb] = hexToRgb(GOLD);
  const [gdr, gdg, gdb] = hexToRgb(GOLD_DARK);

  doc.setFillColor(r700, g700, b700);
  doc.rect(0, 0, pageWidth, 32, "F");

  try {
    const logoPng = await svgToPngDataUrl(LOGO_SVG, 128);
    doc.addImage(logoPng, "PNG", margin, 6, 20, 20);
  } catch {
    // logo rasterization failed — continue without it
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(appName, margin + 26, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(gr, gg, gb);
  doc.text(tagline, margin + 26, 23);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`${L.generated}: ${new Date().toLocaleDateString()}`, pageWidth - margin, 28, { align: "right" });

  let y = 42;

  function sectionHeading(text) {
    doc.setTextColor(r600, g600, b600);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(text, margin, y);
    y += 3;
    doc.setDrawColor(gdr, gdg, gdb);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
  }

  sectionHeading(L.estateSummary);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text(`${L.netEstate}: ${Number(result.net_estate).toLocaleString()} ${result.currency}`, margin, y);
  y += 7;
  doc.text(`${L.wasiyyahApplied}: ${Number(result.wasiyyah_applied).toLocaleString()} ${result.currency}`, margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(r700, g700, b700);
  doc.text(
    `${L.distributable}: ${Number(result.distributable_estate).toLocaleString()} ${result.currency}`,
    margin,
    y
  );
  y += 12;

  sectionHeading(L.distributionBreakdown);

  doc.setFillColor(r700, g700, b700);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(L.heir, margin + 2, y);
  doc.text(L.share, margin + 95, y);
  doc.text(L.amount, pageWidth - margin - 2, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  (result.breakdown || []).forEach((b, i) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    if (i % 2 === 0) {
      doc.setFillColor(r50, g50, b50);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 7, "F");
    }
    doc.setTextColor(30, 30, 30);
    const namesTxt = b.names?.length ? ` (${b.names.filter(Boolean).join(", ")})` : "";
    const name = `${t.heirs?.[b.heir_type] || b.label}${b.count > 1 ? ` x${b.count}` : ""}${namesTxt}`;
    doc.text(name, margin + 2, y);
    doc.text(`${b.share_fraction} (${b.share_percent}%)`, margin + 95, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r700, g700, b700);
    doc.text(`${Number(b.amount_total).toLocaleString()} ${result.currency}`, pageWidth - margin - 2, y, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    y += 7;
  });

  if (result.notes?.length) {
    y += 6;
    sectionHeading(L.notes);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    result.notes.forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, pageWidth - margin * 2 - 4);
      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + 2, y);
        y += 5.5;
      });
    });
  }

  doc.save(`faraid-result-${Date.now()}.pdf`);
}

export async function exportResultDocx(result, t = {}) {
  const appName = t.appName || "Fara'id AI";
  const tagline = t.tagline || "Islamic Inheritance Intelligence";
  const L = {
    netEstate: t.netEstate || "Net Estate",
    wasiyyahApplied: t.wasiyyahApplied || "Wasiyyah Applied",
    distributable: t.distributable || "Distributable Estate",
    notes: t.notesTitle || "Notes",
    estateSummary: t.pdf?.estateSummary || "Estate Summary",
    distributionBreakdown: t.pdf?.distributionBreakdown || "Distribution Breakdown",
    heir: t.pdf?.heir || "Heir",
    share: t.pdf?.share || "Share",
    amount: t.pdf?.amount || "Amount",
    generated: t.pdf?.generated || "Generated",
  };

  let logoImage = null;
  try {
    const pngDataUrl = await svgToPngDataUrl(LOGO_SVG, 128);
    const buf = await (await fetch(pngDataUrl)).arrayBuffer();
    logoImage = new ImageRun({ data: buf, transformation: { width: 46, height: 46 } });
  } catch {
    logoImage = null;
  }

  function heading(text) {
    return new Paragraph({
      children: [new TextRun({ text, bold: true, color: "0C5F2F", size: 26 })],
      spacing: { before: 200, after: 100 },
      border: { bottom: { color: "B8892F", space: 4, style: "single", size: 4 } },
    });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: [L.heir, L.share, L.amount].map(
      (h) =>
        new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          shading: { fill: "0C5F2F" },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })] })],
        })
    ),
  });

  const dataRows = (result.breakdown || []).map(
    (b, i) =>
      new TableRow({
        children: [
          new Paragraph(
            `${t.heirs?.[b.heir_type] || b.label}${b.count > 1 ? ` x${b.count}` : ""}${
              b.names?.length ? ` (${b.names.filter(Boolean).join(", ")})` : ""
            }`
          ),
          new Paragraph(`${b.share_fraction} (${b.share_percent}%)`),
          new Paragraph({
            children: [
              new TextRun({
                text: `${Number(b.amount_total).toLocaleString()} ${result.currency}`,
                bold: true,
                color: "0C5F2F",
              }),
            ],
          }),
        ].map(
          (p) =>
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              shading: { fill: i % 2 === 0 ? "ECFDF3" : "FFFFFF" },
              children: [p],
            })
        ),
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              ...(logoImage ? [logoImage] : []),
              new TextRun({ text: `   ${appName}`, bold: true, size: 40, color: "0C5F2F" }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: tagline, italics: true, size: 20, color: "B8892F" }),
            ],
            border: { bottom: { color: "D9B65C", space: 6, style: "single", size: 6 } },
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `${L.generated}: ${new Date().toLocaleDateString()}`,
            spacing: { after: 300 },
          }),

          heading(L.estateSummary),
          new Paragraph({ text: `${L.netEstate}: ${Number(result.net_estate).toLocaleString()} ${result.currency}` }),
          new Paragraph({
            text: `${L.wasiyyahApplied}: ${Number(result.wasiyyah_applied).toLocaleString()} ${result.currency}`,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${L.distributable}: ${Number(result.distributable_estate).toLocaleString()} ${result.currency}`,
                bold: true,
                color: "0C5F2F",
              }),
            ],
            spacing: { after: 100 },
          }),

          heading(L.distributionBreakdown),
          new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }),

          ...(result.notes?.length
            ? [heading(L.notes), ...result.notes.map((n) => new Paragraph({ text: `• ${n}` }))]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, `faraid-result-${Date.now()}.docx`);
}
