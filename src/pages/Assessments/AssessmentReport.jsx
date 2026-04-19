import {
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const T = {
    dark: "#0F6E56",
    mid: "#1D9E75",
    light: "#E1F5EE",
    text: "#085041",
};

const S = {
    page: {
        background: "#fff",
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
        fontFamily: "'Georgia', serif",
        fontSize: "13px",
        color: "#1a1a1a",
        position: "relative",
        border: "1px solid #ddd",
        boxSizing: "border-box",
        pageBreakAfter: "always",
    },
    topBar: {
        height: "8px",
        background: T.dark,
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
    },
    coverBody: {
        padding: "80px 60px 60px",
        display: "flex",
        flexDirection: "column",
        height: "1123px",
    },
    inner: { padding: "48px 60px 100px" },
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${T.dark}`,
        paddingBottom: "8px",
        marginBottom: "32px",
        fontSize: "11px",
        color: T.dark,
        fontFamily: "'Arial', sans-serif",
        fontWeight: "600",
        letterSpacing: "0.3px",
    },
    footer: {
        position: "absolute",
        bottom: "24px",
        left: "60px",
        right: "60px",
        borderTop: "0.5px solid #ccc",
        paddingTop: "10px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "#888",
        fontFamily: "'Arial', sans-serif",
    },
    sectionRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "14px",
        marginTop: "28px",
    },
    badge: {
        background: T.dark,
        color: "#fff",
        width: "24px",
        height: "24px",
        minWidth: "24px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "bold",
        fontFamily: "'Arial', sans-serif",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "bold",
        color: T.dark,
        fontFamily: "'Georgia', serif",
    },
    subHeading: {
        fontWeight: "bold",
        fontSize: "13px",
        marginBottom: "8px",
        marginTop: "16px",
        fontFamily: "'Arial', sans-serif",
        textAlign: "left",
    },
    body: {
        lineHeight: "1.7",
        marginBottom: "10px",
        textAlign: "justify",
    },
    bullet: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        marginBottom: "5px",
        lineHeight: "1.5",
        paddingLeft: "16px",
    },
    dot: {
        width: "5px",
        height: "5px",
        minWidth: "5px",
        borderRadius: "50%",
        background: "#1a1a1a",
        marginTop: "6px",
    },
    infoTable: { width: "100%", borderCollapse: "collapse", marginTop: "32px" },
    infoRow: { borderBottom: "1px solid #e0e0e0" },
    infoLabel: {
        padding: "10px 16px",
        color: T.dark,
        fontWeight: "bold",
        fontSize: "12px",
        fontFamily: "'Arial', sans-serif",
        width: "180px",
        background: "#f8fdfb",
    },
    infoValue: {
        padding: "10px 16px",
        fontSize: "13px",
        fontFamily: "'Arial', sans-serif",
    },
    highlightBox: {
        background: T.light,
        border: `1px solid ${T.mid}`,
        borderRadius: "4px",
        padding: "10px 16px",
        marginBottom: "8px",
        marginTop: "18px",
    },
    outcomeBox: {
        background: T.dark,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "4px",
        marginBottom: "10px",
        fontFamily: "'Arial', sans-serif",
        fontWeight: "bold",
        fontSize: "14px",
    },
    divider: {
        width: "80px",
        height: "3px",
        background: T.dark,
        margin: "20px 0",
    },
    confidential: {
        color: "#999",
        fontSize: "11px",
        letterSpacing: "1px",
        fontFamily: "'Arial', sans-serif",
        marginTop: "auto",
        paddingTop: "40px",
    },
};

const Bullet = ({ children }) => (
    <div style={S.bullet}>
        <div style={S.dot} />
        <span style={{ lineHeight: "1.6", textAlign: "left" }}>{children}</span>
    </div>
);

const Section = ({ num, title }) => (
    <div style={S.sectionRow}>
        <div style={S.badge}>{num}</div>
        <span style={S.sectionTitle}>{title}</span>
    </div>
);

const BoldEntry = ({ label, children }) => (
    <div style={{ marginBottom: "10px", paddingLeft: "16px", textAlign: "left" }}>
        <span style={{ fontWeight: "bold", fontFamily: "'Arial', sans-serif" }}>
            {label}:{" "}
        </span>
        <span style={{ lineHeight: "1.6" }}>{children}</span>
    </div>
);

const PageHeader = () => (
    <div style={S.pageHeader}>
        <span>NeuroCheck Pro</span>
        <span>Private and Confidential</span>
    </div>
);

const PageFooter = ({ name, date, page, total }) => (
    <div style={S.footer}>
        <span>
            {name} | {date}
        </span>
        <span>NeuroCheck Pro Ltd | Private and Confidential</span>
        <span>
            Page {page}
            {total ? ` of ${total}` : ""}
        </span>
    </div>
);

const PAGE_H = 915;

function quillToText(html = "") {
    if (!html) return "";
    const withBullets = html
        .replace(/<li[^>]*>/gi, "\n• ")
        .replace(/<\/li>/gi, "");
    return withBullets
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function renderDynamicContent(text) {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("• "))
            return <Bullet key={i}>{trimmed.slice(2)}</Bullet>;
        return <p key={i} style={S.body}>{trimmed}</p>;
    });
}

function makeBlocks(data, submission, today, feedbackSections = []) {
    const blocks = [];
    const add = (el, h) => blocks.push({ el, h });

    let sectionNum = 1;

    // ── Dynamic clinician sections ──────────────────────────────────────────
    feedbackSections.forEach((section) => {
        const plainText = quillToText(section.content);
        const lineCount = plainText
            .split("\n")
            .filter((l) => l.trim())
            .reduce((acc, line) => acc + Math.ceil(line.length / 92), 0);
        const contentH = lineCount * 22;
        const totalH = 58 + Math.max(30, contentH);

        add(
          <div
            key={`section-${sectionNum}`}   style={{ pageBreakInside: "avoid" }} >
            <div>
              <Section
                num={sectionNum}
                title={section.heading || `Section ${sectionNum}`}
              />
            </div>
            <div>{renderDynamicContent(plainText)}</div>
          </div>,
          totalH,
        );
        sectionNum++;
    });

    // ── AI submission summaries ─────────────────────────────────────────────
    if (submission?.length > 0) {
        add(
            <div key={`section-${sectionNum}`}>
                <Section num={sectionNum} title="Assessment Summary" />
                {submission.flatMap((item) =>
                    item.summaries?.map((summary, i) => {
                        const clean = summary.summary
                            ?.replace(/[*#_`>]+/g, "")
                            ?.replace(/-{3,}/g, "")
                            ?.trim() || "";
                        return (
                            <div key={`summary-${i}`}>
                                <div style={{ ...S.subHeading, marginTop: "20px", color: T.dark }}>
                                    {summary.questionType}
                                </div>
                                <p style={S.body}>{clean}</p>
                            </div>
                        );
                    }) || []
                )}
            </div>,
            submission.flatMap(i => i.summaries || []).reduce((acc, s) => {
                const clean = s.summary?.replace(/[*#_`>]+/g, "").replace(/-{3,}/g, "").trim() || "";
                return acc + Math.ceil(clean.length / 92) * 22 + 40;
            }, 58),
        );
        sectionNum++; // ← increment
    }

    // ── Review notes ────────────────────────────────────────────────────────
    if (data.reviewNotes) {
        const h = Math.ceil(data.reviewNotes.length / 92) * 22 + 58;
        add(
            <div key={`section-${sectionNum}`}>
                <Section num={sectionNum} title="Clinician Review Notes" />
                <p style={S.body}>{data.reviewNotes}</p>
            </div>,
            Math.max(80, h),
        );
        sectionNum++; // ← increment
    }

    // ── Diagnostic Outcome ──────────────────────────────────────────────────
    if (data.clinicianDiagnosis) {
        const diagnoses = data.clinicianDiagnosis
            .split(/[,;\/\n]+/)
            .map((d) => d.trim())
            .filter(Boolean);

        add(
            <div key={`section-${sectionNum}`}>
                <Section num={sectionNum} title="Diagnostic Outcome" />
                <p style={{ ...S.body, marginBottom: "18px" }}>
                    The assessment findings are consistent with:
                </p>
                {diagnoses.map((d, i) => (
                    <div key={i} style={S.outcomeBox}>{d}</div>
                ))}
                <p style={{ ...S.body, marginTop: "16px" }}>
                    Both conditions are lifelong neurodevelopmental differences that have
                    shaped the individual's cognitive, sensory, emotional, and functional
                    profile.
                </p>
            </div>,
            58 + diagnoses.length * 48 + 120,
        );
        sectionNum++; // ← increment
    }

    // ── End of report ───────────────────────────────────────────────────────
    add(
        <div style={{ textAlign: "center", marginTop: "60px", paddingTop: "20px", borderTop: "0.5px solid #ddd" }}>
            <p style={{ fontSize: "13px", color: "#555", fontFamily: "'Arial', sans-serif" }}>
                End of Report
            </p>
            <p style={{ fontSize: "11px", color: "#999", fontFamily: "'Arial', sans-serif", marginTop: "4px" }}>
                NeuroCheck Pro Ltd | Private and Confidential
            </p>
        </div>,
        80,
    );

    return blocks;
}

function splitIntoPages(blocks) {
    const pages = [[]];
    let usedH = 0;
    for (const block of blocks) {
        if (usedH + block.h > PAGE_H && pages[pages.length - 1].length > 0) {
            pages.push([]);
            usedH = 0;
        }
        pages[pages.length - 1].push(block);
        usedH += block.h;
    }
    return pages;
}

function CoverPage({ data, today }) {
    const rows = [
        ["Name", data.patientName || "—"],
        ["Age", data.age || "—"],
        ["Assessment Date", today],
        ["Clinician", data.clinician || "—"],
        ["Registration", data.regNo || "—"],
    ];
    return (
        <div style={S.page}>
            <div style={S.topBar} />
            <div style={S.coverBody}>
                <div style={{ marginTop: "80px", textAlign: "left" }}>
                    <h1
                        style={{
                            fontSize: "40px",
                            fontWeight: "bold",
                            color: "#1a1a1a",
                            marginBottom: "8px",
                            fontFamily: "'Georgia', serif",
                        }}
                    >
                        NeuroCheck Pro
                    </h1>
                    <p
                        style={{
                            fontSize: "16px",
                            color: "#444",
                            marginBottom: "6px",
                            fontFamily: "'Arial', sans-serif",
                        }}
                    >
                        Your Assessment Report
                    </p>
                    <p
                        style={{
                            color: T.dark,
                            fontWeight: "bold",
                            fontFamily: "'Arial', sans-serif",
                            fontSize: "15px",
                        }}
                    >
                        {data.assessmentName || "-"}
                    </p>
                    <div style={S.divider} />
                </div>
                <table style={S.infoTable}>
                    <tbody>
                        {rows.map(([label, value]) => (
                            <tr key={label} style={S.infoRow}>
                                <td style={S.infoLabel}>{label}</td>
                                <td style={S.infoValue}>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={S.confidential}>PRIVATE AND CONFIDENTIAL</p>
            </div>
        </div>
    );
}

function InnerPage({ blocks, pageNum, totalPages, patientName, today }) {
    return (
        <div style={S.page}>
            <div style={S.inner}>
                <PageHeader />
                {blocks.map((b, i) => (
                    <div key={i}>{b.el}</div>
                ))}
            </div>
            <PageFooter
                name={patientName}
                date={today}
                page={pageNum}
                total={totalPages}
            />
        </div>
    );
}

// ─── mode prop ────────────────────────────────────────────────────────────────
// "hidden"  → only the off-screen PDF container is rendered (no visible UI)
// "preview" → page navigator + page preview shown, download button hidden
// "full"    → everything shown including own download button (default / standalone)
// ─────────────────────────────────────────────────────────────────────────────

const AssessmentReport = forwardRef(function AssessmentReport(
    { data = {}, submission = [], mode = "full" },
    ref,
) {
    const reportRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const blocks = makeBlocks(data, submission, today, data.feedbackSections || []);
    const contentPages = splitIntoPages(blocks);
    const totalPages = 1 + contentPages.length;

    const handleDownload = useCallback(async () => {
        if (!reportRef.current) {
            console.error("reportRef is null — DOM not ready");
            return;
        }
        setDownloading(true);
        try {
            const pageEls = reportRef.current.querySelectorAll("[data-pdf-page]");
            if (pageEls.length === 0) {
                console.error("No [data-pdf-page] elements found");
                return;
            }
            const pdf = new jsPDF({
                unit: "pt",
                format: "a4",
                orientation: "portrait",
            });
            const A4_W = 595.28;
            const A4_H = 841.89;

            for (let i = 0; i < pageEls.length; i++) {
                const canvas = await html2canvas(pageEls[i], {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    windowWidth: 794,
                    windowHeight: 1123,
                    width: 794,
                    height: 1123,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    logging: false,
                });
                const imgData = canvas.toDataURL("image/jpeg", 0.95);
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, 0, A4_W, A4_H);
            }

            const safeName = (data.patientName || "report")
                .replace(/\s+/g, "-")
                .toLowerCase();
            pdf.save(`neurocheck-report-${safeName}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setDownloading(false);
        }
    }, [data.patientName]);

    // Expose downloadPDF to parent via ref
    useImperativeHandle(
        ref,
        () => ({
            downloadPDF: handleDownload,
        }),
        [handleDownload],
    );

    const allPages = [
        <CoverPage key="cover" data={data} today={today} />,
        ...contentPages.map((pageBlocks, i) => (
            <InnerPage
                key={i + 1}
                blocks={pageBlocks}
                pageNum={i + 2}
                totalPages={totalPages}
                patientName={data.patientName || "Patient"}
                today={today}
            />
        )),
    ];

    // ── "hidden" mode: render only the off-screen container, nothing visible ──
    if (mode === "hidden") {
        return (
            <div
                ref={reportRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "794px",
                    opacity: 0,
                    pointerEvents: "none",
                    zIndex: -1,
                }}
                aria-hidden="true"
            >
                {allPages.map((page, i) => (
                    <div key={i} data-pdf-page="true">
                        {page}
                    </div>
                ))}
            </div>
        );
    }

    // ── "preview" or "full" mode: show scrollable pages ─────────────────
    return (
        <div>
            {/* ── SCROLLABLE PAGES ── */}
            <div
                style={{
                    overflowY: "auto",
                    maxHeight: "80vh",
                    padding: "16px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "24px",
                }}
            >
                {allPages.map((page, i) => (
                    <div
                        key={i}
                        style={{
                            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                            flexShrink: 0,
                        }}
                    >
                        {page}
                    </div>
                ))}
            </div>

            {/* ── OWN DOWNLOAD BUTTON — only shown in "full" (standalone) mode ── */}
            {mode === "full" && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "16px",
                    }}
                >
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        style={{
                            background: downloading ? "#ccc" : T.dark,
                            color: "#fff",
                            border: "none",
                            borderRadius: "20px",
                            padding: "10px 28px",
                            fontSize: "13px",
                            fontFamily: "'Arial', sans-serif",
                            cursor: downloading ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        {downloading ? (
                            <>
                                <span
                                    style={{
                                        width: "14px",
                                        height: "14px",
                                        border: "2px solid #fff",
                                        borderTopColor: "transparent",
                                        borderRadius: "50%",
                                        display: "inline-block",
                                        animation: "spin 0.8s linear infinite",
                                    }}
                                />
                                Generating PDF…
                            </>
                        ) : (
                            "⬇ Download PDF Report"
                        )}
                    </button>
                </div>
            )}

            {/* ── HIDDEN FULL REPORT FOR html2canvas ── */}
            <div
                ref={reportRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "794px",
                    opacity: 0,
                    pointerEvents: "none",
                    zIndex: -1,
                }}
                aria-hidden="true"
            >
                {allPages.map((page, i) => (
                    <div key={i} data-pdf-page="true">
                        {page}
                    </div>
                ))}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
});

export default AssessmentReport;
