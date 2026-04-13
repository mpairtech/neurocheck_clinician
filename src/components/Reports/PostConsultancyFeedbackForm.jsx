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
const PostConsultancyFeedbackForm = ({ onSubmit, onCancel }) => {
  const initial = SECTIONS.reduce(
    (acc, { key }) => ({ ...acc, [key]: "" }),
    {},
  );

  const [values, setValues] = useState(initial);
  const [activeSection, setActiveSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const sectionRefs = useRef({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFilled = SECTIONS.every(({ key }) => hasContent(key));

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

  const filledCount = SECTIONS.filter(({ key }) => hasContent(key)).length;

  const allFilled = SECTIONS.every(({ key }) => hasContent(key));
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
            Consultancy Report Form
          </p>
        </div>

        <span className="text-white/60 text-xs">
          {filledCount} / {SECTIONS.length} sections filled
        </span>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
          {SECTIONS.map(({ key, label }) => (
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
        <main className="flex-1 p-4 space-y-6">
          <form onSubmit={handleSubmit} id="report-form">
            {SECTIONS.map(({ key, label }, index) => (
              <div
                key={key}
                ref={(el) => (sectionRefs.current[key] = el)}
                className="bg-white rounded-lg border"
              >
                <div className="px-4 py-2 border-b bg-gray-50">
                  <h2 className="text-xs font-semibold">
                    {index + 1}. {label}
                  </h2>
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
              {submitting ? "Saving..." : "Save Report"}
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
