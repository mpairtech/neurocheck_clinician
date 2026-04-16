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

function makeBlocks(data, submission, today) {
  const blocks = [];
  const add = (el, h) => blocks.push({ el, h });

  add(<Section num="1" title="Introduction" />, 58);
  add(
    <p style={S.body}>
      This report summarises the outcome of a comprehensive neurodevelopmental
      assessment exploring attention, executive functioning, sensory processing,
      social communication, and developmental history. The assessment was
      completed using a neuro-affirmative, strengths-based framework that
      recognises neurodivergence as a natural variation in human cognition.
    </p>,
    90,
  );
  add(
    <p style={S.body}>
      Findings across clinical interview, developmental history, structured
      diagnostic tools, functional assessments, and sensory/emotional profiling
      are highly consistent with a combined ADHD/Autistic neurotype.
    </p>,
    72,
  );

  add(<Section num="2" title="Summary of Key Findings" />, 58);
  add(<div style={S.subHeading}>Neurodevelopmental Profile Overview</div>, 30);
  add(
    <p style={S.body}>
      Across all assessment components, there is a coherent pattern of lifelong
      neurodivergence characterised by:
    </p>,
    55,
  );
  add(
    <Bullet>Childhood-onset attentional and behavioural differences</Bullet>,
    26,
  );
  add(
    <Bullet>
      Persistent executive functioning challenges (organisation, working memory,
      initiation, inhibition, emotional regulation)
    </Bullet>,
    40,
  );
  add(
    <Bullet>
      Autistic-type social communication and sensory features (sensory
      hyperreactivity, literal interpretation, preference for routine,
      difficulty with group conversations)
    </Bullet>,
    40,
  );
  add(
    <Bullet>
      High masking and compensation, contributing to fatigue and functional
      strain
    </Bullet>,
    26,
  );
  add(
    <p style={{ ...S.body, marginTop: "10px" }}>
      This reflects a dual neurodevelopmental presentation, not isolated traits.
    </p>,
    46,
  );

  submission?.forEach((item) => {
    item.summaries?.forEach((summary) => {
      const clean =
        summary.summary
          ?.replace(/[*#_`>]+/g, "")
          ?.replace(/-{3,}/g, "")
          ?.trim() || "";
      const lines = Math.ceil(clean.length / 80);
      const estimatedH = lines * 18 + 60;
      add(
        <div key={summary.questionType}>
          <div style={{ ...S.subHeading, marginTop: "20px", color: T.dark }}>
            {summary.questionType}
          </div>
          <p style={S.body}>{clean}</p>
        </div>,
        estimatedH,
      );
    });
  });

  add(<Section num="3" title="ADHD-Related Findings" />, 58);
  add(<div style={S.subHeading}>Strongly Supportive Evidence</div>, 30);
  add(
    <p style={S.body}>Multiple tools provide robust evidence for ADHD:</p>,
    40,
  );
  add(
    <BoldEntry label="DIVA Interview">
      Clear childhood onset, cross-setting impact, and persistence of
      inattentive + hyperactive/impulsive traits into adulthood.
    </BoldEntry>,
    44,
  );
  add(
    <BoldEntry label="BRIEF-A">
      Broad executive functioning differences across inhibition, emotional
      regulation, cognitive flexibility, and working memory.
    </BoldEntry>,
    44,
  );
  add(
    <BoldEntry label="Weiss Functional Impairment Scale">
      Significant impact across daily living, occupational tasks, emotional
      regulation, and social functioning.
    </BoldEntry>,
    44,
  );
  add(
    <BoldEntry label="ADHD Quality of Life Scale">
      Executive functioning is the most affected domain, particularly task
      initiation, completion, time management, and financial organisation.
    </BoldEntry>,
    44,
  );
  add(<div style={S.subHeading}>Mixed or Less Supportive Evidence</div>, 30);
  add(
    <BoldEntry label="ASRS self-report">
      Does not show a classic ADHD screening pattern (common in high-masking
      adults).
    </BoldEntry>,
    36,
  );
  add(
    <BoldEntry label="External ASRS ratings">
      Mixed, context-dependent observations.
    </BoldEntry>,
    30,
  );
  add(
    <p style={{ ...S.body, fontStyle: "italic", marginTop: "10px" }}>
      Interpretation
    </p>,
    28,
  );
  add(
    <p style={S.body}>
      Structured clinical interviews and functional measures carry greater
      diagnostic weight than screening tools. Overall evidence strongly supports
      ADHD, Combined Presentation.
    </p>,
    72,
  );

  add(<Section num="4" title="Autism-Related Findings" />, 58);
  add(<div style={S.subHeading}>Strongly Supportive Evidence</div>, 30);
  add(
    <BoldEntry label="RAADS-R">
      Lifelong social communication differences, sensory hyperreactivity,
      literal language processing, and need for routine.
    </BoldEntry>,
    44,
  );
  add(
    <BoldEntry label="ADI-R">
      Childhood sensory-focused interests, insistence on sameness, reduced
      reciprocal conversation, limited imaginative play, and reduced peer
      engagement.
    </BoldEntry>,
    44,
  );
  add(
    <BoldEntry label="Camouflaging Measures">
      High levels of masking, compensation, and assimilation.
    </BoldEntry>,
    36,
  );
  add(
    <BoldEntry label="Sensory Profile">
      Complex sensory modulation pattern with both hypersensitivity and
      sensory-seeking behaviours.
    </BoldEntry>,
    44,
  );
  add(<div style={S.subHeading}>Mixed or Nuanced Evidence</div>, 30);
  add(
    <BoldEntry label="AQ">
      Shows a blend of strengths (warmth, humour, imagination, emotional
      awareness) and challenges (sensory sensitivity, difficulty with group
      conversations).
    </BoldEntry>,
    44,
  );
  add(
    <p style={{ ...S.body, fontStyle: "italic", marginTop: "10px" }}>
      Interpretation
    </p>,
    28,
  );
  add(
    <p style={S.body}>
      The combination of developmental history, sensory profile, RAADS-R, and
      camouflaging measures provides strong evidence for Autism Spectrum
      Condition, consistent with individuals who are articulate, socially warm,
      and highly compensatory.
    </p>,
    80,
  );

  add(
    <Section num="5" title="Sensory, Interoceptive & Emotional Findings" />,
    58,
  );
  add(
    <Bullet>High sensitivity to noise, light, textures, and touch</Bullet>,
    26,
  );
  add(
    <Bullet>Sensory-seeking behaviours (movement, tactile input)</Bullet>,
    26,
  );
  add(
    <Bullet>
      Good emotional awareness, though articulation may require effort
      (borderline alexithymia on TAS-20)
    </Bullet>,
    40,
  );
  add(
    <Bullet>
      Emotional regulation difficulties linked to executive functioning and
      sensory load
    </Bullet>,
    40,
  );
  add(
    <Bullet>
      Interoceptive awareness intact, with some avoidance of discomfort (MAIA-2)
    </Bullet>,
    40,
  );
  add(
    <p style={{ ...S.body, marginTop: "8px" }}>
      These findings align with an autistic sensory profile and ADHD-related
      emotional impulsivity.
    </p>,
    50,
  );

  add(<Section num="6" title="Sleep & Physical Health Factors" />, 58);
  add(
    <Bullet>
      Possible sleep-disordered breathing (snoring, gasping, non-restorative
      sleep)
    </Bullet>,
    26,
  );
  add(<Bullet>Restless legs symptoms</Bullet>, 26);
  add(<Bullet>Endocrine concerns</Bullet>, 26);
  add(<Bullet>Mild liver marker elevation</Bullet>, 26);
  add(
    <Bullet>Knee injury requiring physiotherapy and hydrotherapy</Bullet>,
    26,
  );
  add(
    <p style={{ ...S.body, marginTop: "8px" }}>
      These factors may amplify attentional, emotional, and cognitive load.
    </p>,
    50,
  );

  add(<Section num="7" title="Functional Impact" />, 58);
  add(<p style={S.body}>Persistent functional impact is noted in:</p>, 36);
  add(<Bullet>Organisation and planning</Bullet>, 26);
  add(<Bullet>Task initiation and follow-through</Bullet>, 26);
  add(<Bullet>Emotional regulation</Bullet>, 26);
  add(<Bullet>Managing clutter and daily living tasks</Bullet>, 26);
  add(<Bullet>Occupational functioning</Bullet>, 26);
  add(<Bullet>Coping with change or sensory overload</Bullet>, 26);
  add(
    <p style={{ ...S.body, marginTop: "8px" }}>
      Social functioning is a relative strength, though masking contributes to
      fatigue and burnout.
    </p>,
    50,
  );

  add(<Section num="8" title="Integrated Clinical Impressions" />, 58);
  add(<div style={S.subHeading}>Autism Spectrum Condition</div>, 30);
  add(<p style={S.body}>There is strong evidence of:</p>, 36);
  add(<Bullet>Childhood social communication differences</Bullet>, 26);
  add(
    <Bullet>Sensory-focused interests and insistence on sameness</Bullet>,
    26,
  );
  add(
    <Bullet>
      Literal interpretation and reduced reciprocal conversation in childhood
    </Bullet>,
    26,
  );
  add(<Bullet>Persistent sensory hyperreactivity</Bullet>, 26);
  add(<Bullet>High masking and compensation</Bullet>, 26);
  add(
    <Bullet>
      Difficulties with change, group communication, and social energy
      regulation
    </Bullet>,
    26,
  );
  add(<Bullet>A complex sensory modulation profile</Bullet>, 26);
  add(
    <p style={{ ...S.body, marginTop: "8px" }}>
      This profile is consistent with Autism Spectrum Condition.
    </p>,
    50,
  );
  add(<div style={S.subHeading}>ADHD – Combined Presentation</div>, 30);
  add(<p style={S.body}>There is strong evidence of:</p>, 36);
  add(
    <Bullet>
      Childhood onset of inattentive and hyperactive/impulsive traits
    </Bullet>,
    26,
  );
  add(<Bullet>Persistence into adulthood</Bullet>, 26);
  add(<Bullet>Significant executive dysfunction</Bullet>, 26);
  add(<Bullet>Cross-domain functional impairment</Bullet>, 26);
  add(<Bullet>Emotional dysregulation</Bullet>, 26);
  add(
    <Bullet>Internal restlessness replacing childhood hyperactivity</Bullet>,
    26,
  );
  add(
    <p style={{ ...S.body, marginTop: "8px" }}>
      This aligns with ADHD, Combined Presentation.
    </p>,
    50,
  );

  add(<Section num="9" title="Overall Formulation" />, 58);
  add(
    <p style={S.body}>
      The combined profile suggests a lifelong neurodivergent developmental
      trajectory characterised by:
    </p>,
    55,
  );
  add(<Bullet>ADHD-related executive functioning differences</Bullet>, 26);
  add(
    <Bullet>Autistic-related sensory and communication differences</Bullet>,
    26,
  );
  add(
    <Bullet>
      High masking leading to fatigue, burnout, and functional strain
    </Bullet>,
    26,
  );
  add(
    <Bullet>
      Strengths in imagination, empathy, humour, and relational warmth
    </Bullet>,
    26,
  );
  add(
    <Bullet>
      A mismatch between cognitive ability and day-to-day functioning
    </Bullet>,
    26,
  );
  add(
    <Bullet>Sleep and sensory factors that increase cognitive load</Bullet>,
    26,
  );
  add(
    <div style={S.highlightBox}>
      <span
        style={{
          color: T.dark,
          fontWeight: "bold",
          fontFamily: "'Arial', sans-serif",
          fontSize: "13px",
        }}
      >
        This is not a picture of inadequacy but of someone who has worked
        extremely hard to navigate life without appropriate recognition or
        support.
      </span>
    </div>,
    70,
  );

  add(<Section num="10" title="Recommendations & Supportive Strategies" />, 58);
  add(<div style={S.subHeading}>Lifestyle & Wellbeing</div>, 30);
  add(<Bullet>Maintain a healthy, nutrient-dense diet</Bullet>, 26);
  add(
    <Bullet>
      Maintain consistent sleep routines; consider GP referral for
      sleep-disordered breathing
    </Bullet>,
    40,
  );
  add(<Bullet>Continue physiotherapy and hydrotherapy</Bullet>, 26);
  add(
    <Bullet>
      Engage in regular exercise, including high-intensity activity where safe
    </Bullet>,
    26,
  );
  add(
    <Bullet>
      Prioritise calm, low-stimulus environments for restorative time
    </Bullet>,
    26,
  );
  add(<div style={S.subHeading}>Practical Supports</div>, 30);
  add(
    <Bullet>
      Use external memory aids (digital reminders, calendars, alarms)
    </Bullet>,
    26,
  );
  add(
    <Bullet>
      Continue delegating numerical/financial tasks where helpful
    </Bullet>,
    26,
  );
  add(
    <Bullet>Maintain structured routines that support predictability</Bullet>,
    26,
  );
  add(<div style={S.subHeading}>Emotional & Social Support</div>, 30);
  add(<Bullet>Engage with supportive friends and networks</Bullet>, 26);
  add(
    <Bullet>Consider neurodivergent-affirming therapeutic spaces</Bullet>,
    26,
  );
  add(<Bullet>Explore peer-led neurodivergent communities</Bullet>, 26);
  add(<div style={S.subHeading}>Optional Medical Pathways</div>, 30);
  add(
    <Bullet>
      ADHD medication may be considered if functional challenges persist
    </Bullet>,
    26,
  );
  add(
    <Bullet>
      GP review recommended for endocrine concerns, sleep issues, or memory
      changes
    </Bullet>,
    40,
  );

  if (data.reviewNotes) {
    add(<Section num="—" title="Clinician Review Notes" />, 58);
    add(
      <p style={S.body}>{data.reviewNotes}</p>,
      Math.ceil(data.reviewNotes.length / 80) * 18 + 20,
    );
  }
  if (data.postConsultNotes) {
    add(<Section num="—" title="Post-Consultation Notes" />, 58);
    add(
      <p style={S.body}>{data.postConsultNotes}</p>,
      Math.ceil(data.postConsultNotes.length / 80) * 18 + 20,
    );
  }

  add(<Section num="11" title="Diagnostic Outcome" />, 58);
  add(
    <p style={{ ...S.body, marginBottom: "18px" }}>
      The assessment findings are consistent with:
    </p>,
    36,
  );

  const diagnoses = data.clinicianDiagnosis
    ? data.clinicianDiagnosis
        .split(/[,;\/\n]+/)
        .map((d) => d.trim())
        .filter(Boolean)
    : ["Autism Spectrum Condition", "ADHD – Combined Presentation"];

  diagnoses.forEach((d) => {
    add(<div style={S.outcomeBox}>{d}</div>, 48);
  });

  add(
    <p style={{ ...S.body, marginTop: "16px" }}>
      Both conditions are lifelong neurodevelopmental differences that have
      shaped the individual's cognitive, sensory, emotional, and functional
      profile.
    </p>,
    72,
  );
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
            {data.assessmentName  || "-"}
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
  const [currentPage, setCurrentPage] = useState(0);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const blocks = makeBlocks(data, submission, today);
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

  // ── "preview" or "full" mode: show navigator + page view ─────────────────
  return (
    <div>
      {/* ── PAGE NAVIGATOR ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          style={{
            padding: "7px 18px",
            background: currentPage === 0 ? "#ccc" : T.dark,
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: currentPage === 0 ? "default" : "pointer",
            fontFamily: "'Arial', sans-serif",
            fontSize: "12px",
          }}
        >
          ← Prev
        </button>

        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {allPages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: currentPage === i ? T.dark : "#fff",
                color: currentPage === i ? "#fff" : T.dark,
                border: `1.5px solid ${T.dark}`,
                cursor: "pointer",
                fontSize: "11px",
                fontFamily: "'Arial', sans-serif",
                fontWeight: currentPage === i ? "bold" : "normal",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(allPages.length - 1, p + 1))
          }
          disabled={currentPage === allPages.length - 1}
          style={{
            padding: "7px 18px",
            background: currentPage === allPages.length - 1 ? "#ccc" : T.dark,
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: currentPage === allPages.length - 1 ? "default" : "pointer",
            fontFamily: "'Arial', sans-serif",
            fontSize: "12px",
          }}
        >
          Next →
        </button>
      </div>

      {/* ── CURRENT PAGE PREVIEW ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "8px",
        }}
      >
        <div style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          {allPages[currentPage]}
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#777",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        Page {currentPage + 1} of {allPages.length}
      </p>

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
