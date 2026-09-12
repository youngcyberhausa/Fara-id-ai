import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

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

export function exportResultPdf(result, appName = "Fara'id AI") {
  const doc = new jsPDF();
  const margin = 15;
  let y = 20;

  doc.setFontSize(16);
  doc.text(appName, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Report generated: ${new Date().toLocaleDateString()}`, margin, y);
  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Net Estate: ${Number(result.net_estate).toLocaleString()} ${result.currency}`, margin, y);
  y += 7;
  doc.text(`Wasiyyah Applied: ${Number(result.wasiyyah_applied).toLocaleString()} ${result.currency}`, margin, y);
  y += 7;
  doc.text(`Distributable Estate: ${Number(result.distributable_estate).toLocaleString()} ${result.currency}`, margin, y);
  y += 10;

  doc.setFontSize(13);
  doc.text("Distribution Breakdown", margin, y);
  y += 8;
  doc.setFontSize(11);

  (result.breakdown || []).forEach((b) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const name = `${b.label}${b.count > 1 ? ` x${b.count}` : ""}`;
    doc.text(name, margin, y);
    doc.text(`${b.share_fraction} (${b.share_percent}%)`, margin + 80, y);
    doc.text(`${Number(b.amount_total).toLocaleString()} ${result.currency}`, margin + 140, y);
    y += 7;
  });

  if (result.notes?.length) {
    y += 5;
    doc.setFontSize(13);
    doc.text("Notes", margin, y);
    y += 8;
    doc.setFontSize(10);
    result.notes.forEach((n) => {
      const lines = doc.splitTextToSize(`• ${n}`, 180);
      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 6;
      });
    });
  }

  doc.save(`faraid-result-${Date.now()}.pdf`);
}

export async function exportResultDocx(result, appName = "Fara'id AI") {
  const headerRow = new TableRow({
    children: ["Heir", "Share", "Amount"].map(
      (h) =>
        new TableCell({
          width: { size: 33, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
        })
    ),
  });

  const dataRows = (result.breakdown || []).map(
    (b) =>
      new TableRow({
        children: [
          new Paragraph(`${b.label}${b.count > 1 ? ` x${b.count}` : ""}`),
          new Paragraph(`${b.share_fraction} (${b.share_percent}%)`),
          new Paragraph(`${Number(b.amount_total).toLocaleString()} ${result.currency}`),
        ].map((p) => new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [p] })),
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: appName, heading: HeadingLevel.HEADING1 }),
          new Paragraph({
            text: `Report generated: ${new Date().toLocaleDateString()}`,
            spacing: { after: 200 },
          }),
          new Paragraph({ text: `Net Estate: ${Number(result.net_estate).toLocaleString()} ${result.currency}` }),
          new Paragraph({
            text: `Wasiyyah Applied: ${Number(result.wasiyyah_applied).toLocaleString()} ${result.currency}`,
          }),
          new Paragraph({
            text: `Distributable Estate: ${Number(result.distributable_estate).toLocaleString()} ${result.currency}`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Distribution Breakdown",
            heading: HeadingLevel.HEADING2,
            spacing: { after: 100 },
          }),
          new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          ...(result.notes?.length
            ? [
                new Paragraph({
                  text: "Notes",
                  heading: HeadingLevel.HEADING2,
                  spacing: { before: 200, after: 100 },
                }),
                ...result.notes.map((n) => new Paragraph({ text: `• ${n}` })),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, `faraid-result-${Date.now()}.docx`);
}
