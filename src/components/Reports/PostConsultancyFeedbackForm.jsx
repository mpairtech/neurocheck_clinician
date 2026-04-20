import { useState, useRef, useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

/* ───────────────────────────────────────────── */
const SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "summaryOfKeyFindings", label: "Summary of Key Findings" },
  { key: "adhdRelatedFindings", label: "ADHD-Related Findings" },
  { key: "autismRelatedFindings", label: "Autism-Related Findings" },
  {
    key: "sensoryInteroceptiveEmotionalFindings",
    label: "Sensory, Interoceptive & Emotional Findings",
  },
  {
    key: "sleepPhysicalHealthFactors",
    label: "Sleep & Physical Health Factors",
  },
  { key: "functionalImpact", label: "Functional Impact" },
  {
    key: "integratedClinicalImpressions",
    label: "Integrated Clinical Impressions",
  },
  { key: "overallFormulation", label: "Overall Formulation" },
  {
    key: "recommendationsSupportiveStrategies",
    label: "Recommendations & Supportive Strategies",
  },
  { key: "diagnosticOutcome", label: "Diagnostic Outcome" },
];

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["clean"],
];

const QUILL_MODULES = { toolbar: TOOLBAR };
const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
];

/* ───────────────────────────────────────────── */
const buildNotesPayload = (values) => {
  return {
    sections: SECTIONS.map(({ key, label }) => ({
      heading: label,
      content: values[key] || "",
    })),
  };
};

/* ───────────── Reusable Editor ───────────── */
const QuillEditor = ({ value, onChange }) => {
  const { quill, quillRef } = useQuill({
    modules: QUILL_MODULES,
    formats: QUILL_FORMATS,
  });

  useEffect(() => {
    if (quill) {
      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });
    }
  }, [quill]);

  return <div ref={quillRef} className="report-quill" />;
};

/* ───────────────────────────────────────────── */
const PostConsultancyFeedbackForm = ({ onSubmit, onCancel, existingSections = [] }) => {

  const initial = SECTIONS.reduce((acc, { key, label }) => {
  const existing = existingSections.find((s) => s.heading === label);
  return { ...acc, [key]: existing?.content || "" };
}, {});

  const [values, setValues] = useState(initial);
  const [activeSection, setActiveSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const isUpdate = existingSections.length > 0;

const sectionRefs = useRef({});
  const [sections, setSections] = useState(SECTIONS);

  const [error, setError] = useState("");

  const handleChange = (key, html) => {
    setValues((prev) => ({ ...prev, [key]: html }));
  };

  const scrollTo = (key) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveSection(key);
  };

  const handleLabelChange = (key, newLabel) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, label: newLabel } : s)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFilled = sections.every(({ key }) => hasContent(key));

    if (!allFilled) {
      setError("Please fill all sections before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const payload = buildNotesPayload(values);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const hasContent = (key) => {
    const stripped = values[key]?.replace(/<[^>]*>/g, "").trim();
    return stripped?.length > 0;
  };

 const filledCount = sections.filter(({ key }) => hasContent(key)).length;

  const allFilled = sections.every(({ key }) => hasContent(key));
  
  return (
    <div className="min-h-screen bg-white font-sans ">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-6 bg-slate-100 shadow-sm ">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="  text-xs">
              ← Back
            </button>
          )}
          <p className="text-teal-800 font-semibold text-xl">
            Post Consultancy Feedback Form
          </p>
        </div>

        <span className="text-white/60 text-xs">
          {filledCount} / {SECTIONS.length} sections filled
        </span>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
          {sections.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => scrollTo(key)}
              className={`block w-full text-left px-3 py-2 rounded text-sm ${
                activeSection === key
                  ? "bg-[#114654] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 space-y-10 ">
          <form onSubmit={handleSubmit} id="report-form">
            {sections.map(({ key, label }, index) => (
              <div
                key={key}
                ref={(el) => (sectionRefs.current[key] = el)}
                className="bg-white rounded-lg border my-2"
              >
                <div className="px-4 py-4 border-b bg-gray-100 flex items-center justify-center gap-2 ">
                  <span className="text-sm text-gray-500 font-medium">
                    {index + 1}.
                  </span>

                  <input
                    value={label}
                    onChange={(e) => handleLabelChange(key, e.target.value)}
                    className="text-sm font-semibold bg-transparent border-b outline-none w-full "
                  />
                </div>

                <div className="p-4">
                  <QuillEditor
                    value={values[key]}
                    onChange={(html) => handleChange(key, html)}
                  />
                </div>
              </div>
            ))}
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="border px-4 py-1.5 rounded"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              form="report-form"
              disabled={submitting || !allFilled}
              className="bg-[#114654] text-white px-6 py-1.5 rounded disabled:opacity-50"
            >
              {submitting ? (isUpdate ? "Updating..." : "Saving...") : (isUpdate ? "Update Report" : "Save Report")}

            </button>
          </div>
        </main>
      </div>

      {/* Quill styles */}
      <style>{`
        .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-radius: 8px 8px 0 0;
        }
        .ql-container {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
          min-height: 140px;
        }
      `}</style>
    </div>
  );
};

export default PostConsultancyFeedbackForm;
