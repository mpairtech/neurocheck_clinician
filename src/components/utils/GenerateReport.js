import jsPDF from "jspdf";
import { getAge } from "./ageConverter";

/* ─────────────────────────────────────────────
   COLOR PALETTE  (matches the design images)
───────────────────────────────────────────── */
const NAVY = [10, 61, 82]; // #0A3D52 – headings, bold labels
const TEAL = [0, 107, 125]; // #006B7D – section underlines, accent
const RED_CONF = [196, 48, 48]; // #C43030 – "PRIVATE AND CONFIDENTIAL"
const GRAY_HDR = [130, 130, 130]; // page header / footer
const GRAY_BODY = [60, 60, 60]; // body text
const DIVIDER = [200, 210, 215]; // table row dividers

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const W = 595; // A4 width  (pt)
const H = 842; // A4 height (pt)
const MARGIN = 50;
const CW = W - MARGIN * 2; // usable content width
const LABEL_W = 130; // left-column width for info tables

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** Running page counter. We track it manually. */
let currentPage = 1;

const setColor = (doc, rgb) => doc.setTextColor(...rgb);
const setDraw = (doc, rgb) => doc.setDrawColor(...rgb);

/** Draw the header on every page EXCEPT page 1. */
function addPageHeader(doc) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, GRAY_HDR);
  doc.text("NeuroCheck Pro  |  Private and Confidential", MARGIN, 28);
}

/** Draw page-number footer. */
function addPageFooter(doc, pageNum) {
  const label = `Page ${pageNum}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, GRAY_HDR);
  doc.text(label, W - MARGIN - doc.getTextWidth(label), H - 18);
}

/** Section heading with teal underline.  Returns new y. */
function sectionHeading(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setColor(doc, NAVY);
  doc.text(text, MARGIN, y); // ← bold navy heading
  setDraw(doc, TEAL);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y + 5, W - MARGIN, y + 5); // ← full width teal line below
  return y + 30;
}

/** Body paragraph. Returns new y. */
function bodyText(doc, text, y, maxWidth) {
  const MIN_HEIGHT = 36; 
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
    setColor(doc, GRAY_BODY);

     if (!text || text.trim() === "—" || text.trim() === "") {
       return y + MIN_HEIGHT; // ✅ return blank space instead of drawing nothing
     }
  const lines = doc.splitTextToSize(text || "—", maxWidth ?? CW);
  doc.text(lines, MARGIN, y);
  return y + Math.max(lines.length * 13, MIN_HEIGHT);
}

/** Info / detail table row pair (divider → label | value). Returns new y. */
function tableRow(doc, label, value, y, opts = {}) {
  //   const MIN_ROW_H = 30;
  const labelX = opts.labelX ?? MARGIN;
  const valueX = opts.valueX ?? MARGIN + LABEL_W;
  const maxValW = opts.maxValW ?? CW - LABEL_W;

  const lineHeight = 13;

  // divider
  if (!opts.skipTopLine) {
    setDraw(doc, DIVIDER);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, W - MARGIN, y);
  }

  y += 15;

  // label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  setColor(doc, NAVY);
  doc.text(label, labelX, y);

  // value lines
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setColor(doc, GRAY_BODY);

  const valLines = doc.splitTextToSize(value || "—", maxValW);

  let currentY = y;
  let firstPage = true;

  valLines.forEach((line, i) => {
    // page break check
    if (currentY + lineHeight > H - 50) {
      doc.addPage();
      currentPage += 1;
      addPageHeader(doc);
      addPageFooter(doc, currentPage);

      currentY = 55;

      // label only on first page
      if (!firstPage) {
        doc.setFont("helvetica", "bold");
        setColor(doc, NAVY);
        doc.text(label + " (cont.)", labelX, currentY);
      }

      currentY += 15;
      firstPage = false;
    }

    doc.text(line, valueX, currentY);
    currentY += lineHeight;
  });

  return currentY;
}
/** Close a table with a bottom divider. */
function tableClose(doc, y) {
  setDraw(doc, DIVIDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, W - MARGIN, y);
  return y + 6;
}

/** Page-break guard: if remaining space < needed, add new page. */
function maybePageBreak(doc, y, needed = 80) {
  if (y + needed > H - 50) {
    doc.addPage();
    currentPage += 1;
    addPageHeader(doc);
    addPageFooter(doc, currentPage);
    return 55;
  }
  return y;
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */

/**
 * @param {object}  data              – submission[0]
 * @param {array}   submission        – full submission array
 * @param {object}  patientAppointment
 * @param {object}  userData
 */
export function generateConsultancyReport({
  data,
  submission,
  patientAppointment,
  userData,
  rawSubmissions = [],
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  currentPage = 1;

  /* ══════════════════════════════════════════
     PAGE 1 – COVER
  ══════════════════════════════════════════ */

  // ── Title block (vertically centred ~⅓ from top) ──
  const titleY = 200;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  setColor(doc, TEAL);
  const titleTxt = "NeuroCheck Pro";
  doc.text(titleTxt, (W - doc.getTextWidth(titleTxt)) / 2, titleY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  setColor(doc, NAVY);
  const subTxt = "Your Assessment Report";
  doc.text(subTxt, (W - doc.getTextWidth(subTxt)) / 2, titleY + 26);

  // Teal decorative line
  setDraw(doc, TEAL);
  doc.setLineWidth(4);
  doc.line(W / 2 - 120, titleY + 56, W / 2 + 120, titleY + 56); // ← short centered line

  // Assessment type
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setColor(doc, TEAL);
  const assessTxt = data.assessment?.name || "Assessment";
  doc.text(assessTxt, (W - doc.getTextWidth(assessTxt)) / 2, titleY + 90);

  // PRIVATE AND CONFIDENTIAL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setColor(doc, RED_CONF);
  const confTxt = "PRIVATE AND CONFIDENTIAL";
  doc.text(confTxt, (W - doc.getTextWidth(confTxt)) / 2, titleY + 110); // ← এইটা

  // ── Info table ──
  let y1 = titleY + 146;

  const dobFormatted = data.patient?.dateOfBirth
    ? new Date(data.patient.dateOfBirth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const assessDateFormatted = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const regValue = userData?.registrationNumber
    ? `${userData.registrationNumber}${userData?.registrationBody ? ` (${userData.registrationBody})` : ""}`
    : "—";

  const page1Rows = [
    ["Name", data.patient?.name || "—"],
    ["Date of Birth", dobFormatted],
    ["Assessment Date", assessDateFormatted],
    ["Clinician", `${userData?.name || "—"}, ${userData?.role || "Clinician"}`],
    ["Registration", regValue],
  ];

  page1Rows.forEach(([label, value], i) => {
    if (i > 0) {
      setDraw(doc, DIVIDER);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, y1, W - MARGIN, y1);
    }
    y1 += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor(doc, NAVY);
    doc.text(label, MARGIN, y1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setColor(doc, GRAY_BODY);
    const valLines = doc.splitTextToSize(value || "—", CW - LABEL_W);
    doc.text(valLines, MARGIN + LABEL_W, y1);

    y1 += Math.max(valLines.length * 13, 14);
  });

  /* ══════════════════════════════════════════
     PAGE 2 – REPORT CONTENT
  ══════════════════════════════════════════ */
  doc.addPage();
  currentPage = 2;
  addPageHeader(doc);
  addPageFooter(doc, currentPage);

  let y = 55;

  // ── About This Report ──
  y = sectionHeading(doc, "About This Report", y);
  y = bodyText(
    doc,
    "This report summarises the outcome of your neurodevelopmental assessment with NeuroCheck Pro. " +
      "It is written for you to keep and, if you choose, to share with your GP, employer, school, or other professionals.",
    y,
  );
  y += 32;

  // ── Your Background ──
  y = maybePageBreak(doc, y, 60);
  y = sectionHeading(doc, "Your Background", y);
  y = bodyText(
    doc,
    data.patient?.demographics ||
      "Background information about the patient's developmental history, presenting concerns and relevant personal context " +
        "was gathered as part of this assessment.",
    y,
  );
  y += 32;

  // ── What We Did ──
  y = maybePageBreak(doc, y, 60);
  y = sectionHeading(doc, "What We Did", y);
  y = bodyText(
    doc,
    "Your assessment included a clinical interview and a number of standardised questionnaires. " +
      "Some were completed by you, and some by people who know you well.",
    y,
  );
  y += 32;

  // ── What We Found ──
  y = maybePageBreak(doc, y, 60);
  y = sectionHeading(doc, "What We Found", y);
  y += 4;

  submission.forEach((item) => {
    item.summaries?.forEach((summary) => {
      const cleanText =
        summary.summary
          ?.replace(/[*#_`>]+/g, "")
          ?.replace(/-{3,}/g, "")
          ?.trim() || "";
      if (!cleanText) return;

      y = maybePageBreak(doc, y, 40);
      const MIN_SUMMARY_H = 48; // ✅ ADD

      // Question-type label in teal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setColor(doc, TEAL);
      doc.text(summary.questionType || "", MARGIN, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      setColor(doc, GRAY_BODY);
      const lines = doc.splitTextToSize(cleanText, CW);

      // paginate long summaries
      let lineStart = 0;
      while (lineStart < lines.length) {
        const remaining = Math.floor((H - 55 - y) / 13);
        if (remaining <= 0) {
          y = maybePageBreak(doc, y + 100, 20); // force new page
        }
        const chunk = lines.slice(
          lineStart,
          lineStart + Math.max(remaining, 1),
        );
        doc.text(chunk, MARGIN, y);
        y += Math.max(chunk.length * 13, MIN_SUMMARY_H);
        lineStart += chunk.length;
        if (lineStart < lines.length) {
          y = maybePageBreak(doc, y + 100, 20);
        }
      }
      y += 20;
    });
  });

  y += 10;

  // ── Your Diagnosis ──
  y = maybePageBreak(doc, y, 120);
  y = sectionHeading(doc, "Your Diagnosis", y);

  const diagRows = [
    ["Diagnosis", patientAppointment?.diagnosis || "—"],
    ["Diagnostic Code", patientAppointment?.icd_code || "—"],
    // ["Additional Diagnosis", patientAppointment?.secondary_diagnosis || "—"],
    ["Outcome", patientAppointment?.diagnostic_certainty || "—"],
    ["Notes from Review", patientAppointment?.notes_from_review || "—"],
    ["Post Consultation Notes", patientAppointment?.feedback || "—"],
  ];

  diagRows.forEach(([label, value], i) => {
    y = maybePageBreak(doc, y, 30);
    y = tableRow(doc, label, value, y, { skipTopLine: i === 0 });
  });
  //   y = tableClose(doc, y);

  // Diagnosis explanation (italic, indented)
  if (patientAppointment?.diagnosis_explanation) {
    y += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    setColor(doc, TEAL);
    const expLines = doc.splitTextToSize(
      patientAppointment.diagnosis_explanation,
      CW,
    );
    doc.text(expLines, MARGIN, y);
    y += expLines.length * 13 + 6;
  }

  /* ── Clinician Details (page 3 or continuation) ── */
  doc.addPage();
  currentPage += 1;
  addPageHeader(doc);
  addPageFooter(doc, currentPage);

  let y3 = 55;
  y3 = sectionHeading(doc, "Clinician Details", y3);

  const reportDateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const clinicianRows = [
    ["Name", userData?.name || "—"],
    ["Qualifications", userData?.qualifications || "—"],
    ["Role", userData?.role || "Clinician"],
    ["Registration", regValue],
    ["Date", reportDateFormatted],
  ];

  clinicianRows.forEach(([label, value], i) => {
    y3 = tableRow(doc, label, value, y3, { skipTopLine: i === 0 });
  });
  //   tableClose(doc, y3);

  /* ══════════════════════════════════════════
     PAGE 4 – APPENDIX A: ASSESSMENT SCORES
  ══════════════════════════════════════════ */
  doc.addPage();
  currentPage += 1;
  addPageHeader(doc);
  addPageFooter(doc, currentPage);

  let y4 = 55;
  y4 = sectionHeading(doc, "Appendix A: Your Assessment Scores", y4);
  y4 = bodyText(
    doc,
    "Detailed results from each questionnaire, grouped by who completed it.",
    y4,
  );
  y4 += 20;

  // collect all domainScores from rawSubmissions
  const allDomainScores = {};
  rawSubmissions.forEach((item) => {
    if (item.domainScores && typeof item.domainScores === "object") {
      Object.entries(item.domainScores).forEach(([key, val]) => {
        allDomainScores[key] = val;
      });
    }
  });

  const domainEntries = Object.entries(allDomainScores);

  if (domainEntries.length > 0) {
    // Blue header row
    y4 = maybePageBreak(doc, y4, 30);
    doc.setFillColor(220, 235, 242);
    doc.rect(MARGIN, y4, CW, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor(doc, NAVY);
    doc.text("Completed by: You (Self-Report)", MARGIN + 8, y4 + 14);
    y4 += 22;

    domainEntries.forEach(([domain, { score, possible }], i) => {
      y4 = maybePageBreak(doc, y4, 28);

      // alternating row bg
      if (i % 2 === 0) {
        doc.setFillColor(248, 251, 253);
        doc.rect(MARGIN, y4, CW, 24, "F");
      }

      setDraw(doc, DIVIDER);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y4, MARGIN + CW, y4);

      y4 += 16;

      // domain name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(doc, NAVY);
      const domainLines = doc.splitTextToSize(domain, CW * 0.55);
      doc.text(domainLines, MARGIN + 6, y4);

      // score
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor(doc, GRAY_BODY);
      doc.text(`Score:`, MARGIN + CW * 0.58, y4);
      doc.setFont("helvetica", "bold");
      setColor(doc, NAVY);
      doc.text(
        `${score ?? "—"} out of ${possible ?? "—"}`,
        MARGIN + CW * 0.68,
        y4,
      );

      y4 += Math.max(domainLines.length * 13, 8);
    });

    // bottom border
    setDraw(doc, DIVIDER);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y4, MARGIN + CW, y4);
  } else {
    y4 = bodyText(doc, "No domain score data available.", y4);
  }

  /* ══════════════════════════════════════════
     PAGE 5 – APPENDIX B: WHAT YOUR INFORMANTS TOLD US
  ══════════════════════════════════════════ */
  doc.addPage();
  currentPage += 1;
  addPageHeader(doc);
  addPageFooter(doc, currentPage);

  let y5 = 55;
  y5 = sectionHeading(doc, "Appendix B: What Your Informants Told Us", y5);
  y5 = bodyText(
    doc,
    "Observations and questionnaire responses from people who contributed to your assessment.",
    y5,
  );
  y5 += 24;

  // Informant block from submission summaries if available
  submission.forEach((item) => {
    if (!item.summaries?.length) return;

    y5 = maybePageBreak(doc, y5, 50);

    // Informant name heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(doc, NAVY);
    doc.text(item.patient?.name || "Informant", MARGIN, y5);
    y5 += 18;

    // Info rows
    const infRows = [
      ["Relationship", "Self"],
      ["How they contributed", item.assessment?.name || "—"],
      [
        "Date",
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "—",
      ],
    ];

    infRows.forEach(([label, value], i) => {
      y5 = tableRow(doc, label, value, y5, { skipTopLine: i === 0 });
    });
    y5 = tableClose(doc, y5);
    y5 += 14;

    // Their Responses header
    y5 = maybePageBreak(doc, y5, 30);
    doc.setFillColor(220, 235, 242);
    doc.rect(MARGIN, y5, CW, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor(doc, NAVY);
    doc.text("Their Responses", MARGIN + 8, y5 + 14);
    y5 += 22;

    item.summaries?.forEach((summary, si) => {
      y5 = maybePageBreak(doc, y5, 28);

      if (si % 2 === 0) {
        doc.setFillColor(248, 251, 253);
        doc.rect(MARGIN, y5, CW, 24, "F");
      }

      setDraw(doc, DIVIDER);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y5, MARGIN + CW, y5);
      y5 += 16;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(doc, NAVY);
      const areaLines = doc.splitTextToSize(
        summary.questionType || "—",
        CW * 0.55,
      );
      doc.text(areaLines, MARGIN + 6, y5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor(doc, GRAY_BODY);
      doc.text("Score:", MARGIN + CW * 0.58, y5);

      y5 += Math.max(areaLines.length * 13, 8);
    });

    setDraw(doc, DIVIDER);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y5, MARGIN + CW, y5);
    y5 += 20;

    // What They Told Us
    y5 = maybePageBreak(doc, y5, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(doc, NAVY);
    doc.text("What They Told Us", MARGIN, y5);
    y5 += 16;

    const allSummaryText = item.summaries
      ?.map((s) =>
        s.summary
          ?.replace(/[*#_`>]+/g, "")
          ?.replace(/-{3,}/g, "")
          ?.trim(),
      )
      .filter(Boolean)
      .join(" ");

    if (allSummaryText) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      setColor(doc, TEAL);
      const lines = doc.splitTextToSize(
        allSummaryText.slice(0, 300) + "...",
        CW,
      );
      doc.text(lines, MARGIN, y5);
      y5 += lines.length * 13 + 10;
    }

    y5 += 10;
  });

  // ── END OF REPORT FOOTER ──
  const endY = Math.max(y5 + 40, H - 140);
  setDraw(doc, NAVY);
  doc.setLineWidth(1);
  doc.line(MARGIN, endY, W - MARGIN, endY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, NAVY);
  const endTxt = "End of Report";
  doc.text(endTxt, (W - doc.getTextWidth(endTxt)) / 2, endY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, GRAY_HDR);
  const subEndTxt = "NeuroCheck Pro Ltd  |  Private and Confidential";
  doc.text(subEndTxt, (W - doc.getTextWidth(subEndTxt)) / 2, endY + 34);

  /* ── Save ── */
  const safeName = (data.patient?.name || "patient")
    
    .replace(/\s+/g, "-")
    .toLowerCase();
  doc.save(`neurocheck-report-${safeName}.pdf`);
}
