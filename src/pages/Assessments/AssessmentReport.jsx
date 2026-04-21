import {
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
    useEffect,
    useMemo,
} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ─── Theme ─────────────────────────────────────────────────────────────────
const T = { dark: "#0B756E", mid: "#0B756E", light: "#f0faf9", text: "#0B756E" };

// ─── A4 constants ──────────────────────────────────────────────────────────
const A4_W = 794;
const A4_H = 1123;
const SIDE_PAD = 60;
const HEADER_TOP = 48;
const HEADER_H = 75;
const FOOTER_H = 60;
const CONTENT_H = A4_H - HEADER_H - FOOTER_H - 60;

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
    page: {
        background: "#fff",
        width: `${A4_W}px`,
        height: `${A4_H}px`,
        minHeight: `${A4_H}px`,
        maxHeight: `${A4_H}px`,
        margin: "0 auto",
        fontFamily: "'Georgia', serif",
        fontSize: "13px",
        color: "#1a1a1a",
        position: "relative",
        border: "1px solid #ddd",
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
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
        height: "100%",
        boxSizing: "border-box",
    },
    contentZone: {
        position: "absolute",
        top: `${HEADER_H}px`,
        left: `${SIDE_PAD}px`,
        right: `${SIDE_PAD}px`,
        height: `${CONTENT_H}px`,
        overflow: "hidden",
    },
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `3px solid ${T.dark}`,
        paddingBottom: "8px",
        marginBottom: "32px",
        fontSize: "11px",
        fontFamily: "'Arial', sans-serif",
        fontWeight: "600",
        letterSpacing: "0.3px",
        position: "absolute",
        top: `${HEADER_TOP}px`,
        left: `${SIDE_PAD}px`,
        right: `${SIDE_PAD}px`,
    },
    footer: {
        position: "absolute",
        bottom: "24px",
        left: `${SIDE_PAD}px`,
        right: `${SIDE_PAD}px`,
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
        paddingBottom: "7px",
        borderBottom: "0.5px solid #ccc",
    },
    badge: {
        background: T.dark,
        color: "#fff",
        width: "28px",
        height: "28px",
        minWidth: "24px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "bold",
        fontFamily: "'Poppins', sans-serif",
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
        fontFamily: "'Arial', sans-serif",
    },
    infoTable: { width: "100%", borderCollapse: "collapse", marginTop: "32px", textAlign: "left" },
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
    infoValue: { padding: "10px 16px", fontSize: "13px", fontFamily: "'Arial', sans-serif" },
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
    divider: { width: "300px", height: "5px", background: T.dark, margin: "20px auto" },
    confidential: {
        color: "#999",
        fontSize: "11px",
        letterSpacing: "1px",
        fontFamily: "'Arial', sans-serif",
        marginTop: "auto",
        paddingTop: "40px",
    },
};

// ─── Quill HTML renderer ───────────────────────────────────────────────────
const quillStyles = `
  .ql-report h1,.ql-report h2,.ql-report h3{font-family:'Georgia',serif;color:#0B756E;margin:14px 0;line-height:1.3}
  .ql-report h1{font-size:20px}.ql-report h2{font-size:17px}.ql-report h3{font-size:15px}
  .ql-report p{font-family:'Arial',sans-serif;font-size:13px;line-height:1.7;margin-bottom:10px;text-align:justify;color:#1a1a1a}
  .ql-report strong{font-weight:bold}.ql-report em{font-style:italic}.ql-report u{text-decoration:underline}
  .ql-report ul,.ql-report ol{padding-left:24px;margin-bottom:10px;font-family:'Arial',sans-serif;font-size:13px;line-height:1.6;color:#1a1a1a;text-align:left}
  .ql-report ul{list-style-type:disc}.ql-report ol{list-style-type:decimal}
  .ql-report li{margin-bottom:4px}
`;
function renderQuillHtml(html = "") {
    if (!html || html.replace(/<[^>]*>/g, "").trim() === "") return null;
    return (
        <>
            <style>{quillStyles}</style>
            <div className="ql-report" dangerouslySetInnerHTML={{ __html: html }} />
        </>
    );
}

// ─── Primitive UI pieces ───────────────────────────────────────────────────
const SectionHeader = ({ num, title }) => (
    <div style={S.sectionRow}>
        <div style={S.badge}>{num}</div>
        <span style={S.sectionTitle}>{title}</span>
    </div>
);

const PageHeader = () => (
    <div style={S.pageHeader}>
        <span style={{ color: T.dark }}>NeuroCheck Pro</span>
        <span style={{ color: "#888" }}>Private and Confidential</span>
    </div>
);

const PageFooter = ({ name, date, page }) => (
    <div style={S.footer}>
        <span>{name} | {date}</span>
        <span>NeuroCheck Pro Ltd | Private and Confidential</span>
        <span>Page {page}</span>
    </div>
);

// ─── Block renderers ───────────────────────────────────────────────────────

function BlockFeedbackSection({ block }) {
    return (
        <div>
            <SectionHeader num={block.sectionNum} title={block.heading || `Section ${block.sectionNum}`} />
            {renderQuillHtml(block.content)}
        </div>
    );
}

function BlockEndOfReport() {
    return (
        <div style={{ minHeight: "120px" }}>
            <div style={{ textAlign: "center", marginTop: "60px", paddingTop: "10px", borderTop: "0.5px solid #ddd" }}>
                <p style={{ fontSize: "13px", color: "#555", fontFamily: "'Arial', sans-serif", paddingTop: "1px" }}>End of Report</p>
                <p style={{ fontSize: "11px", color: "#999", fontFamily: "'Arial', sans-serif", marginTop: "4px" }}>
                    NeuroCheck Pro Ltd | Private and Confidential
                </p>
            </div>
        </div>
    );
}

function renderBlock(block) {
    switch (block.type) {
        case "feedbackSection": return <BlockFeedbackSection block={block} />;
        case "endOfReport": return <BlockEndOfReport />;
        default: return null;
    }
}

// ─── Build flat block list from all data sources ───────────────────────────
function buildBlocks(data, submission) {
    const blocks = [];
    let sectionNum = 1;

    // 1. Clinician feedback sections (Quill HTML)
    (data.feedbackSections || []).forEach((section) => {
        blocks.push({ type: "feedbackSection", sectionNum, heading: section.heading, content: section.content });
        sectionNum++;
    });

    // 5. End of report (always last)
    blocks.push({ type: "endOfReport" });

    return blocks;
}

// ─── Pagination algorithm ──────────────────────────────────────────────────
function paginateBlocks(blocksWithHeights) {
    const pages = [[]];
    let cursor = 0;

    const currentPage = () => pages[pages.length - 1];
    const newPage = () => { pages.push([]); cursor = 0; };

    blocksWithHeights.forEach((block, blockIdx) => {
        let remaining = block.measuredH;
        let clipTop = 0;

        while (remaining > 0) {
            const available = CONTENT_H - cursor;
            if (available <= 0) { newPage(); continue; }

            const sliceH = Math.min(remaining, available);
            currentPage().push({ blockIdx, clipTop, clipH: sliceH, y: cursor });

            clipTop += sliceH;
            remaining -= sliceH;
            cursor += sliceH;

            if (remaining > 0) newPage();
        }
    });

    // Drop any empty trailing pages
    while (pages.length > 0 && pages[pages.length - 1].length === 0) pages.pop();

    return pages;
}

// ─── Inner page ────────────────────────────────────────────────────────────
function InnerPage({ slices, blocksWithHeights, pageNum, totalPages, patientName, today }) {
    return (
        <div style={S.page}>
            <PageHeader />
            <div style={S.contentZone}>
                {slices.map((slice, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            top: `${slice.y}px`,
                            left: 0,
                            right: 0,
                            height: `${slice.clipH}px`,
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ transform: `` }}>
                            {renderBlock(blocksWithHeights[slice.blockIdx])}
                        </div>
                    </div>
                ))}
            </div>
            <PageFooter name={patientName} date={today} page={pageNum} />
        </div>
    );
}

// ─── Cover page ────────────────────────────────────────────────────────────
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
                    <h1 style={{ fontSize: "40px", fontWeight: "bold", color: T.dark, marginBottom: "8px", fontFamily: "'Georgia', serif" }}>
                        NeuroCheck Pro
                    </h1>
                    <p style={{ fontSize: "16px", color: "#444", marginBottom: "6px", fontFamily: "'Arial', sans-serif" }}>
                        Your Assessment Report
                    </p>
                    <p style={{ color: T.dark, fontWeight: "bold", fontFamily: "'Arial', sans-serif", fontSize: "15px" }}>
                        {data.assessmentName || "-"}
                    </p>
                    <div style={S.divider} />
                </div>
                <table style={S.infoTable}>
                    <tbody style={{ border: "1px solid #e0e0e0" }}>
                        {rows.map(([label, value]) => (
                            <tr key={label} style={S.infoRow}>
                                <td style={S.infoLabel}>{label}</td>
                                <td style={S.infoValue}>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                    <p style={S.confidential}>PRIVATE AND CONFIDENTIAL</p>
                </table>
            </div>
        </div>
    );
}

// ─── PaginatedContent ──────────────────────────────────────────────────────
function PaginatedContent({ blocks, patientName, today }) {
    const measureRef = useRef(null);
    const [pages, setPages] = useState(null);
    const [blocksWithHeights, setBlocksWithHeights] = useState(null);

    const contentWidth = A4_W - SIDE_PAD * 2;

    useEffect(() => {
        if (!measureRef.current) return;
        setPages(null);
        setBlocksWithHeights(null);

        const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(() => {
                if (!measureRef.current) return;

                const els = measureRef.current.querySelectorAll("[data-block-idx]");
                const heights = {};
                els.forEach((el) => {
                    heights[parseInt(el.dataset.blockIdx, 10)] = el.getBoundingClientRect().height;
                });

                const bwh = blocks.map((block, i) => ({
                    ...block,
                    measuredH: Math.max(heights[i] ?? 80, 1),
                }));

                setBlocksWithHeights(bwh);
                setPages(paginateBlocks(bwh));
            });
        });

        return () => cancelAnimationFrame(raf1);
    }, [blocks]);

    const totalInnerPages = pages ? pages.length : 1;
    const totalPages = 1 + totalInnerPages;

    return (
        <>
            {/* ✅ ALWAYS mounted — no {!pages} guard */}
            <div
                ref={measureRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: "-9999px",
                    width: `${contentWidth}px`,
                    opacity: 0,
                    pointerEvents: "none",
                    zIndex: -1,
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "13px",
                    color: "#1a1a1a",
                }}
                aria-hidden="true"
            >
                {blocks.map((block, i) => (
                    <div key={i} data-block-idx={i}>
                        {renderBlock(block)}
                    </div>
                ))}
            </div>

            {/* Loading placeholder */}
            {!pages && (
                <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "#aaa", fontFamily: "'Arial', sans-serif", fontSize: "13px" }}>
                        Preparing report…
                    </p>
                </div>
            )}

            {/* Paginated inner pages */}
            {pages && blocksWithHeights && pages.map((slices, pageIdx) => (
                <div
                    key={pageIdx}
                    data-pdf-page="true"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)", flexShrink: 0 }}
                >
                    <InnerPage
                        slices={slices}
                        blocksWithHeights={blocksWithHeights}
                        pageNum={pageIdx + 2}
                        totalPages={totalPages}
                        patientName={patientName}
                        today={today}
                    />
                </div>
            ))}
        </>
    );
}

// ─── Main exported component ───────────────────────────────────────────────
const AssessmentReport = forwardRef(function AssessmentReport(
    { data = {}, submission = [], mode = "full" },
    ref,
) {
    const [downloading, setDownloading] = useState(false);

    const today = useMemo(
        () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
        [],
    );

    // Rebuild blocks only when the relevant data actually changes
    const blocks = useMemo(
        () => buildBlocks(data, submission),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            JSON.stringify(data.feedbackSections),
            JSON.stringify(submission),
            data.reviewNotes,
            data.clinicianDiagnosis,
        ],
    );

    const handleDownload = useCallback(async () => {
        setDownloading(true);
        try {
            const pageEls = document.querySelectorAll("[data-pdf-page]");
            if (!pageEls.length) { console.error("No [data-pdf-page] elements found"); return; }

            const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
            const PDF_W = 595.28, PDF_H = 841.89;

            for (let i = 0; i < pageEls.length; i++) {
                const canvas = await html2canvas(pageEls[i], {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    windowWidth: A4_W,
                    windowHeight: A4_H,
                    width: A4_W,
                    height: A4_H,
                    x: 0, y: 0, scrollX: 0, scrollY: 0,
                    logging: false,
                });
                if (i > 0) pdf.addPage();
                pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, PDF_W, PDF_H);
            }

            const safeName = (data.patientName || "report").replace(/\s+/g, "-").toLowerCase();
            pdf.save(`neurocheck-report-${safeName}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setDownloading(false);
        }
    }, [data.patientName]);

    useImperativeHandle(ref, () => ({ downloadPDF: handleDownload }), [handleDownload]);

    const coverNode = (
        <div data-pdf-page="true" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)", flexShrink: 0 }}>
            <CoverPage data={data} today={today} />
        </div>
    );

    // ── Hidden mode (parent controls download trigger) ────────────────────
    if (mode === "hidden") {
        return (
            <div
                style={{ position: "fixed", top: 0, left: "-9999px", width: `${A4_W}px`, opacity: 0, pointerEvents: "none", zIndex: -1 }}
                aria-hidden="true"
            >
                {coverNode}
                <PaginatedContent blocks={blocks} patientName={data.patientName || "Patient"} today={today} />
            </div>
        );
    }

    // ── Preview / Full mode ───────────────────────────────────────────────
    return (
        <div>
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
                {coverNode}
                <PaginatedContent
                    blocks={blocks}
                    patientName={data.patientName || "Patient"}
                    today={today}
                />
            </div>

            {mode === "full" && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
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
                                <span style={{
                                    width: "14px", height: "14px",
                                    border: "2px solid #fff", borderTopColor: "transparent",
                                    borderRadius: "50%", display: "inline-block",
                                    animation: "spin 0.8s linear infinite",
                                }} />
                                Generating PDF…
                            </>
                        ) : "⬇ Download PDF Report"}
                    </button>
                </div>
            )}

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
});

export default AssessmentReport;