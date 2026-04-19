import {
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
    useEffect,
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
        width: "300px",
        height: "5px",
        background: T.dark,
        margin: "20px auto",
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

// Plain section heading — used in the hidden PDF layer
const Section = ({ num, title }) => (
    <div style={S.sectionRow}>
        <div style={S.badge}>{num}</div>
        <span style={S.sectionTitle}>{title}</span>
    </div>
);

// Editable section heading — used in the visible UI layer
const EditableSection = ({
    num,
    title,
    isEditing,
    editValue,
    onStartEdit,
    onChangeValue,
    onCommit,
    onKeyDown,
}) => (
    <div style={S.sectionRow}>
        <div style={S.badge}>{num}</div>
        {isEditing ? (
            <input
                autoFocus
                value={editValue}
                onChange={(e) => onChangeValue(e.target.value)}
                onBlur={onCommit}
                onKeyDown={onKeyDown}
                style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: T.dark,
                    fontFamily: "'Georgia', serif",
                    border: "none",
                    borderBottom: `2px solid ${T.mid}`,
                    outline: "none",
                    background: "transparent",
                    width: "100%",
                    padding: "2px 4px",
                }}
            />
        ) : (
            <span
                onClick={onStartEdit}
                title="Click to edit heading"
                style={{
                    ...S.sectionTitle,
                    cursor: "text",
                    borderBottom: "1px dashed transparent",
                    transition: "border-color 0.15s",
                    padding: "2px 4px",
                    borderRadius: "2px",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.borderBottomColor = T.mid)
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.borderBottomColor = "transparent")
                }
            >
                {title}
            </span>
        )}
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
        return (
            <p key={i} style={S.body}>
                {trimmed}
            </p>
        );
    });
}

// ─── makeBlocks ───────────────────────────────────────────────────────────────
// editable=false  → uses plain <Section> (for the hidden PDF layer)
// editable=true   → uses <EditableSection> with edit callbacks (for visible UI)
// ─────────────────────────────────────────────────────────────────────────────
function makeBlocks(
    data,
    submission,
    today,
    feedbackSections = [],
    { editable = false, editingIdx = null, editValue = "", onStart, onChange, onCommit, onKeyDown } = {},
) {
    const blocks = [];
    const add = (el, h) => blocks.push({ el, h });

    let sectionNum = 1;

    // ── Dynamic clinician sections ──────────────────────────────────────────
    feedbackSections.forEach((section, idx) => {
        const plainText = quillToText(section.content);
        const lineCount = plainText
            .split("\n")
            .filter((l) => l.trim())
            .reduce((acc, line) => acc + Math.ceil(line.length / 92), 0);
        const contentH = lineCount * 22;
        const totalH = 58 + Math.max(30, contentH);

        const headingEl = editable ? (
            <EditableSection
                num={sectionNum}
                title={section.heading || `Section ${sectionNum}`}
                isEditing={editingIdx === idx}
                editValue={editValue}
                onStartEdit={() => onStart?.(idx)}
                onChangeValue={(v) => onChange?.(v)}
                onCommit={() => onCommit?.()}
                onKeyDown={onKeyDown}
            />
        ) : (
            <Section num={sectionNum} title={section.heading || `Section ${sectionNum}`} />
        );

        add(
            <div key={`section-${sectionNum}`}>
                {headingEl}
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
                {editable ? (
                    // "Assessment Summary" is auto-generated — not user-editable
                    <Section num={sectionNum} title="Assessment Summary" />
                ) : (
                    <Section num={sectionNum} title="Assessment Summary" />
                )}
                {submission.flatMap((item) =>
                    item.summaries?.map((summary, i) => {
                        const clean =
                            summary.summary
                                ?.replace(/[*#_`>]+/g, "")
                                ?.replace(/-{3,}/g, "")
                                ?.trim() || "";
                        return (
                            <div key={`summary-${i}`}>
                                <div
                                    style={{
                                        ...S.subHeading,
                                        marginTop: "20px",
                                        color: T.dark,
                                    }}
                                >
                                    {summary.questionType}
                                </div>
                                <p style={S.body}>{clean}</p>
                            </div>
                        );
                    }) || []
                )}
            </div>,
            submission
                .flatMap((i) => i.summaries || [])
                .reduce((acc, s) => {
                    const clean =
                        s.summary
                            ?.replace(/[*#_`>]+/g, "")
                            .replace(/-{3,}/g, "")
                            .trim() || "";
                    return acc + Math.ceil(clean.length / 92) * 22 + 40;
                }, 58),
        );
        sectionNum++;
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
        sectionNum++;
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
                    <div key={i} style={S.outcomeBox}>
                        {d}
                    </div>
                ))}
                <p style={{ ...S.body, marginTop: "16px" }}>
                    Both conditions are lifelong neurodevelopmental differences that have
                    shaped the individual's cognitive, sensory, emotional, and functional
                    profile.
                </p>
            </div>,
            58 + diagnoses.length * 48 + 120,
        );
        sectionNum++;
    }

    // ── End of report ───────────────────────────────────────────────────────
    add(
        <div
            style={{
                textAlign: "center",
                marginTop: "60px",
                paddingTop: "20px",
                borderTop: "0.5px solid #ddd",
            }}
        >
            <p
                style={{
                    fontSize: "13px",
                    color: "#555",
                    fontFamily: "'Arial', sans-serif",
                }}
            >
                End of Report
            </p>
            <p
                style={{
                    fontSize: "11px",
                    color: "#999",
                    fontFamily: "'Arial', sans-serif",
                    marginTop: "4px",
                }}
            >
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
                    <p style={S.confidential}>PRIVATE AND CONFIDENTIAL</p>
                </table>
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

// ─── AddSectionModal ──────────────────────────────────────────────────────────
// A simple modal/drawer to add a new custom section with heading + content.
// ─────────────────────────────────────────────────────────────────────────────
function AddSectionModal({ onAdd, onClose }) {
    const [heading, setHeading] = useState("");
    const [content, setContent] = useState("");

    const handleAdd = () => {
        const trimmedHeading = heading.trim();
        if (!trimmedHeading) return;
        onAdd({ heading: trimmedHeading, content: content.trim() });
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "32px",
                    width: "520px",
                    maxWidth: "90vw",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                    fontFamily: "'Arial', sans-serif",
                }}
                onKeyDown={handleKeyDown}
            >
                {/* Modal header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <span
                        style={{
                            fontSize: "17px",
                            fontWeight: "bold",
                            color: T.dark,
                            fontFamily: "'Georgia', serif",
                        }}
                    >
                        Add New Section
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "20px",
                            cursor: "pointer",
                            color: "#888",
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Heading field */}
                <label
                    style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: T.dark,
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Section Heading *
                </label>
                <input
                    autoFocus
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="e.g. Background History"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        border: `1px solid ${heading.trim() ? T.mid : "#ddd"}`,
                        borderRadius: "6px",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "20px",
                        fontFamily: "'Georgia', serif",
                        color: "#1a1a1a",
                        transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = T.mid)}
                    onBlur={(e) =>
                    (e.currentTarget.style.borderColor = heading.trim()
                        ? T.mid
                        : "#ddd")
                    }
                />

                {/* Content field */}
                <label
                    style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: T.dark,
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Content
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter section content. Use • at the start of a line for bullet points."
                    rows={6}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "13px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        outline: "none",
                        boxSizing: "border-box",
                        resize: "vertical",
                        fontFamily: "'Georgia', serif",
                        lineHeight: "1.6",
                        color: "#1a1a1a",
                        transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = T.mid)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
                />
                <p
                    style={{
                        fontSize: "11px",
                        color: "#999",
                        marginTop: "6px",
                        marginBottom: "24px",
                    }}
                >
                    Tip: Start a line with • to create a bullet point.
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "9px 22px",
                            borderRadius: "20px",
                            border: "1px solid #ccc",
                            background: "#fff",
                            fontSize: "13px",
                            cursor: "pointer",
                            color: "#555",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!heading.trim()}
                        style={{
                            padding: "9px 22px",
                            borderRadius: "20px",
                            border: "none",
                            background: heading.trim() ? T.dark : "#ccc",
                            color: "#fff",
                            fontSize: "13px",
                            cursor: heading.trim() ? "pointer" : "default",
                            fontWeight: "bold",
                            transition: "background 0.15s",
                        }}
                    >
                        Add Section
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── mode prop ────────────────────────────────────────────────────────────────
// "hidden"  → only the off-screen PDF container is rendered (no visible UI)
// "preview" → page navigator + page preview shown, download button hidden
// "full"    → everything shown including own download button (default / standalone)
// ─────────────────────────────────────────────────────────────────────────────

const AssessmentReport = forwardRef(function AssessmentReport(
    { data = {}, submission = [], mode = "full", onSectionsChange },
    ref,
) {
    const reportRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    // ── Local sections state ────────────────────────────────────────────────
    const [sections, setSections] = useState(data.feedbackSections || []);

    // Sync if parent updates feedbackSections
    useEffect(() => {
        setSections(data.feedbackSections || []);
    }, [data.feedbackSections]);

    // ── Heading edit state ──────────────────────────────────────────────────
    const [editingIdx, setEditingIdx] = useState(null);
    const [editValue, setEditValue] = useState("");

    const startEdit = (idx) => {
        setEditingIdx(idx);
        setEditValue(sections[idx]?.heading || "");
    };

    const commitEdit = useCallback(() => {
        if (editingIdx === null) return;
        const trimmed = editValue.trim();
        if (!trimmed) {
            setEditingIdx(null);
            return;
        }
        const updated = sections.map((s, i) =>
            i === editingIdx ? { ...s, heading: trimmed } : s,
        );
        setSections(updated);
        onSectionsChange?.(updated);
        setEditingIdx(null);
    }, [editingIdx, editValue, sections, onSectionsChange]);

    const handleHeadingKeyDown = (e) => {
        if (e.key === "Enter") commitEdit();
        if (e.key === "Escape") setEditingIdx(null);
    };

    // ── Add section modal ───────────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddSection = (newSection) => {
        const updated = [...sections, newSection];
        setSections(updated);
        onSectionsChange?.(updated);
    };

    // ── Today ───────────────────────────────────────────────────────────────
    const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    // ── Build blocks ────────────────────────────────────────────────────────
    // Visible UI: editable headings
    const editableBlocks = makeBlocks(data, submission, today, sections, {
        editable: true,
        editingIdx,
        editValue,
        onStart: startEdit,
        onChange: setEditValue,
        onCommit: commitEdit,
        onKeyDown: handleHeadingKeyDown,
    });

    // Hidden PDF layer: plain headings (no edit chrome)
    const pdfBlocks = makeBlocks(data, submission, today, sections, {
        editable: false,
    });

    const editableContentPages = splitIntoPages(editableBlocks);
    const pdfContentPages = splitIntoPages(pdfBlocks);
    const totalPages = 1 + pdfContentPages.length;

    // ── Download ────────────────────────────────────────────────────────────
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

    useImperativeHandle(
        ref,
        () => ({ downloadPDF: handleDownload }),
        [handleDownload],
    );

    // ── Page arrays ─────────────────────────────────────────────────────────
    // Visible (editable) pages
    const visiblePages = [
        <CoverPage key="cover" data={data} today={today} />,
        ...editableContentPages.map((pageBlocks, i) => (
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

    // PDF (plain) pages — rendered off-screen for html2canvas
    const pdfPages = [
        <CoverPage key="cover" data={data} today={today} />,
        ...pdfContentPages.map((pageBlocks, i) => (
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

    // ── "hidden" mode ────────────────────────────────────────────────────────
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
                {pdfPages.map((page, i) => (
                    <div key={i} data-pdf-page="true">
                        {page}
                    </div>
                ))}
            </div>
        );
    }

    // ── "preview" / "full" mode ──────────────────────────────────────────────
    return (
        <div>
            {/* ── ADD SECTION MODAL ── */}
            {showAddModal && (
                <AddSectionModal
                    onAdd={handleAddSection}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {/* ── TOOLBAR ── */}
            {(mode === "full" || mode === "preview") && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                        padding: "0 4px",
                    }}
                >
                    <span
                        style={{
                            fontSize: "11px",
                            color: "#999",
                            fontFamily: "'Arial', sans-serif",
                            marginRight: "auto",
                        }}
                    >
                        💡 Click any section title to rename it
                    </span>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            background: "transparent",
                            color: T.dark,
                            border: `1.5px solid ${T.dark}`,
                            borderRadius: "20px",
                            padding: "7px 18px",
                            fontSize: "13px",
                            fontFamily: "'Arial', sans-serif",
                            cursor: "pointer",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        + Add Section
                    </button>
                </div>
            )}

            {/* ── SCROLLABLE PAGES (editable) ── */}
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
                {visiblePages.map((page, i) => (
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

            {/* ── DOWNLOAD BUTTON (full mode only) ── */}
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

            {/* ── HIDDEN PDF LAYER (plain, no edit chrome) ── */}
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
                {pdfPages.map((page, i) => (
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