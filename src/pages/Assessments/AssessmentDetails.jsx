import { getAllappointments, getSubmissionByPatientId, updateSchedule } from "../../api/assessment";
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/ui-reusable/Header";
import SubmissionDetailsCard from "../../components/ui-reusable/SubmissionDetailsCard";
import SubmissionDetails from "../../components/SubmissionDetails";
import { getAge } from "../../components/utils/ageConverter";
import { AuthContext } from "../../Provider/AuthProvider";
import ReportStructure from "../../components/ReportStructure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../../components/ui-reusable/Modal";
import { generateConsultancyReport } from "../../components/utils/GenerateReport";


const tabs = ["AI Summary", "View Assessment details", "Consultancy Report"];

const AssessmentDetails = () => {
  const { patientId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext) || {};

  const [submission, setSubmission] = useState([]);
  const [appointment, setAppointment] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [rawSubmissions, setRawSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  

  /* ---------------- FETCH APPOINTMENTS ---------------- */
  const fetchAppointments = async () => {
    const res = await getAllappointments();
    const rawData = res?.payload?.filter(
      (i) => i?.clinicianId === Number(userData?.id),
    );
    setAppointment(rawData || []);
  };

  useEffect(() => {
    if (userData?.id) fetchAppointments();
  }, [userData?.id]);

  /* ---------------- FETCH SUBMISSION ---------------- */
  const fetchSubmission = async () => {
    const result = await getSubmissionByPatientId(patientId, assessmentId);

    const grouped = Object.values(
      result?.payload?.reduce((acc, item) => {
        const key = `${item.patientId}-${item.assessmentId}`;

        if (!acc[key]) {
          acc[key] = {
            patient: item.patient,
            assessment: item.assessment,
            assessmentId: item.assessmentId,
            status: item.status,
            createdAt: item.createdAt,
            summaries: [],
            score: item.score,
          };
        }

        acc[key].summaries.push({
          questionType: item.questionType,
          summary: item.summary,
        });

        return acc;
      }, {}),
    );
    const payload = result?.payload || [];
    setRawSubmissions(payload);
    setSubmission(grouped || []);
  };

  useEffect(() => {
    if (patientId) fetchSubmission();
  }, [patientId, assessmentId]);

  const data = submission[0];
  if (!data) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

        <p className="text-sm text-gray-500">Loading assessment details...</p>
      </div>
    </div>
  );

  /* ---------------- TAB UTILS ---------------- */
  const index = tabs.indexOf(activeTab);
  const isFirst = index === 0;
  const isLast = index === tabs.length - 1;

  /* ---------------- APPOINTMENT LOGIC ---------------- */
  const submissionPatientId = data?.patient?.id;

  const patientAppointment = appointment?.find(
    (a) => a?.patientId === submissionPatientId,
  );

  const hasAppointmentForPatient = Boolean(patientAppointment);

  const isReportGenerated =
    patientAppointment?.status?.toString().trim().toLowerCase() === "completed";

  const hasFeedback = patientAppointment?.feedback.trim();

  /* ---------------- PDF GENERATE ---------------- */
  // const generateConsultancyReport = () => {
  //   const doc = new jsPDF({ unit: "pt", format: "a4" });

  //   let y = 40;

  //   /* ================= TITLE ================= */
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(18);
  //   doc.text("Consultancy Report", 40, y);

  //   y += 25;

  //   /* ================= MAIN INFO TABLE ================= */
  //   autoTable(doc, {
  //     startY: y,
  //     body: [
  //       ["Patient Name", data.patient.name],
  //       ["Age", `${getAge(data.patient.dateOfBirth)} years`],
  //       ["Demographics", data.patient.demographics || ""],
  //       ["Clinician Diagnosis", patientAppointment?.diagnosis || ""],
  //       [
  //         "Clinician Notes from Review",
  //         patientAppointment?.notes_from_review || "",
  //       ],
  //       [
  //         "Clinician Notes Post Consultation",
  //         patientAppointment?.feedback || "",
  //       ],
  //     ],
  //     theme: "grid",
  //     styles: {
  //       fontSize: 10,
  //       cellPadding: 8,
  //       valign: "top",
  //     },
  //     columnStyles: {
  //       0: { cellWidth: 180, fontStyle: "bold", fillColor: [245, 245, 245] },
  //       1: { cellWidth: 330 },
  //     },
  //   });

  //   y = doc.lastAutoTable.finalY + 20;

  //   /* ================= SUMMARY SECTIONS ================= */
  //   submission.forEach((item) => {
  //     item.summaries?.forEach((summary) => {
  //       // Section Title
  //       doc.setFont("helvetica", "bold");
  //       doc.setFontSize(13);
  //       doc.text(summary.questionType, 40, y);

  //       y += 10;

  //       // Section Body
  //       doc.setFont("helvetica", "normal");
  //       doc.setFontSize(10);

  //       const cleanText =
  //         summary.summary
  //           ?.replace(/[*#_`>]+/g, "")
  //           ?.replace(/-{3,}/g, "")
  //           ?.trim() || "";

  //       const textLines = doc.splitTextToSize(cleanText, 520);
  //       doc.text(textLines, 40, y);

  //       y += textLines.length * 14 + 15;

  //       // Page break
  //       if (y > 760) {
  //         doc.addPage();
  //         y = 40;
  //       }
  //     });
  //   });

  //   /* ================= SAVE ================= */
  //   doc.save("consultancy-report.pdf");
  // };

//  const generateConsultancyReport = () => {
//    const doc = new jsPDF({ unit: "pt", format: "a4" });
//    const W = 595;
//    const MARGIN = 30;
//    const CONTENT_W = W - MARGIN * 2;

//    doc.setFillColor(10, 61, 82);
//    doc.rect(0, 0, W, 72, "F");

//    doc.setFillColor(200, 168, 75);
//    doc.rect(0, 72, W, 3, "F");

//    doc.setFont("helvetica", "bold");
//    doc.setFontSize(20);
//    doc.setTextColor(255, 255, 255);
//    doc.text("NeuroCheck Pro", MARGIN, 32);

//    doc.setFont("helvetica", "normal");
//    doc.setFontSize(9);
//    doc.setTextColor(168, 208, 222);

//    doc.setFontSize(9);
//    doc.setTextColor(194, 221, 230);

//    doc.setFillColor(240, 246, 249);
//    doc.rect(0, 75, W, 38, "F");
//    doc.setDrawColor(208, 228, 236);
//    doc.setLineWidth(0.5);
//    doc.line(0, 113, W, 113);

//    const patientDate = new Date().toLocaleDateString("en-GB", {
//      day: "2-digit",
//      month: "short",
//      year: "numeric",
//    });

//    // Assessment removed from header
//    const fields = [
//      ["PATIENT NAME", data.patient.name],
//      ["AGE", `${getAge(data.patient.dateOfBirth)} yrs`],
//      ["DATE", patientDate],
//    ];

//    fields.forEach(([label, value], i) => {
//      const x = MARGIN + i * 130;
//      doc.setFont("helvetica", "normal");
//      doc.setFontSize(7.5);
//      doc.setTextColor(90, 122, 138);
//      doc.text(label, x, 88);
//      doc.setFont("helvetica", "bold");
//      doc.setFontSize(10);
//      doc.setTextColor(10, 61, 82);
//      doc.text(value || "—", x, 102);
//    });

//    const LEFT_W = 160;
//    const BODY_Y = 120;

//    doc.setDrawColor(208, 228, 236);
//    doc.setLineWidth(0.5);
//    doc.line(MARGIN + LEFT_W, BODY_Y, MARGIN + LEFT_W, 760);

//    const sectionLabel = (text, y) => {
//      doc.setFont("helvetica", "bold");
//      doc.setFontSize(7.5);
//      doc.setTextColor(90, 122, 138);
//      doc.text(text.toUpperCase(), MARGIN, y);
//      doc.setDrawColor(224, 238, 244);
//      doc.line(MARGIN, y + 3, MARGIN + LEFT_W - 8, y + 3);
//    };

//    const smallText = (text, x, y, maxW) => {
//      doc.setFont("helvetica", "normal");
//      doc.setFontSize(9);
//      doc.setTextColor(51, 51, 51);
//      const lines = doc.splitTextToSize(text, maxW);
//      doc.text(lines, x, y);
//      return lines.length * 12;
//    };

//    let ly = BODY_Y + 14;

//    // Assessment name moved to left column
//    sectionLabel("Assessment", ly);
//    ly += 10;
//    ly += smallText(data.assessment.name || "—", MARGIN, ly, LEFT_W - 8);
//    ly += 10;

//    sectionLabel("Diagnosis", ly);
//    ly += 10;

//    doc.setFont("helvetica", "bold");
//    doc.setFontSize(8.5);
//    doc.setTextColor(90, 122, 138);
//    doc.text("Primary", MARGIN, ly);
//    ly += 10;
//    ly += smallText(
//      patientAppointment?.diagnosis || "Pending",
//      MARGIN,
//      ly,
//      LEFT_W - 8,
//    );
//    ly += 6;

//    doc.setFont("helvetica", "bold");
//    doc.setFontSize(8.5);
//    doc.setTextColor(90, 122, 138);
//    doc.text("Score", MARGIN, ly);
//    ly += 10;
//    doc.setFont("helvetica", "bold");
//    doc.setFontSize(10);
//    doc.setTextColor(10, 61, 82);
//    doc.text(String(submission[0]?.score ?? "—"), MARGIN, ly);
//    ly += 16;

//    doc.setFont("helvetica", "bold");
//    doc.setFontSize(8.5);
//    doc.setTextColor(90, 122, 138);
//    doc.text("Demographics", MARGIN, ly);
//    ly += 10;
//    ly += smallText(data.patient.demographics || "—", MARGIN, ly, LEFT_W - 8);
//    ly += 12;

//    sectionLabel("Review Notes", ly);
//    ly += 10;
//    ly += smallText(
//      patientAppointment?.notes_from_review || "—",
//      MARGIN,
//      ly,
//      LEFT_W - 8,
//    );

//    // ── Rx SYMBOL ──
//    const RX = MARGIN + LEFT_W + 12;
//  doc.setFont("helvetica", "bold");
//  doc.setFontSize(20);
//  doc.setTextColor(10, 61, 82);
//  doc.text("Rx", RX, BODY_Y + 28);

//    // ── SUMMARIES HIDDEN ──

//    // ── POST-CONSULT NOTES + FEEDBACK BOX ──
//    let ry = BODY_Y + 46;
//    const RX_W = CONTENT_W - LEFT_W - 16;

//    const postConsultText = patientAppointment?.feedback
//      ? `${patientAppointment.feedback}`
//      : null;

//    const feedbackText = patientAppointment?.feedback || null;

//    if (postConsultText || feedbackText) {
//      ry += 4;
//      const RX_W = CONTENT_W - LEFT_W - 16;

//      // combine both into one box
//      const combinedLines = [];

//      if (patientAppointment?.feedback) {
//        combinedLines.push(
//          ...doc.splitTextToSize("Post-Consultation Notes", RX_W - 16),
//        );
//      }

//      // Build the box content
//      const noteLines = patientAppointment?.feedback
//        ? doc.splitTextToSize(patientAppointment.feedback, RX_W - 16)
//        : [];

//      const feedbackLines = patientAppointment?.feedback
//        ? doc.splitTextToSize(patientAppointment.feedback, RX_W - 16)
//        : [];

//      // POST-CONSULT NOTES box
//      if (patientAppointment?.feedback) {
//        const noteContent = doc.splitTextToSize(
//          patientAppointment.feedback,
//          RX_W - 16,
//        );
//        const boxH = noteContent.length * 11 + 24;

//        doc.setFillColor(248, 251, 253);
//        doc.setDrawColor(208, 228, 236);
//        doc.setLineWidth(0.5);
//        doc.roundedRect(RX, ry, RX_W, boxH, 3, 3, "FD");

//        doc.setFont("helvetica", "bold");
//        doc.setFontSize(7.5);
//        doc.setTextColor(90, 122, 138);
//        doc.text("POST-CONSULTATION NOTES", RX + 10, ry + 12);

//        doc.setFont("helvetica", "normal");
//        doc.setFontSize(9);
//        doc.setTextColor(51, 51, 51);
//        doc.text(noteContent, RX + 10, ry + 24);

//        ry += boxH + 10;
//      }

//      // FEEDBACK box
//      if (patientAppointment?.feedback) {
//        const fbContent = doc.splitTextToSize(
//          patientAppointment.feedback,
//          RX_W - 16,
//        );
//        const fbBoxH = fbContent.length * 11 + 24;

//        doc.setFillColor(240, 249, 244);
//        doc.setDrawColor(180, 220, 200);
//        doc.setLineWidth(0.5);
//        doc.roundedRect(RX, ry, RX_W, fbBoxH, 3, 3, "FD");

//        doc.setFont("helvetica", "bold");
//        doc.setFontSize(7.5);
//        doc.setTextColor(60, 140, 100);
//        doc.text("CLINICIAN FEEDBACK", RX + 10, ry + 12);

//        doc.setFont("helvetica", "normal");
//        doc.setFontSize(9);
//        doc.setTextColor(51, 51, 51);
//        doc.text(fbContent, RX + 10, ry + 24);

//        ry += fbBoxH + 12;
//      }
//    }

//    // ── FOOTER ──
//    const FOOTER_Y = 790;
//    doc.setFillColor(250, 252, 253);
//    doc.rect(0, FOOTER_Y - 10, W, 52, "F");
//    doc.setDrawColor(208, 228, 236);
//    doc.setLineWidth(0.5);
//    doc.line(0, FOOTER_Y - 10, W, FOOTER_Y - 10);

//    doc.setFont("helvetica", "normal");
//    doc.setFontSize(8);
//    doc.setTextColor(153, 153, 153);
//    const validity = doc.splitTextToSize(
//      "This prescription is valid for 30 days from date of issue. Dispensed by licensed pharmacy only.",
//      190,
//    );
//    doc.text(validity, MARGIN, FOOTER_Y + 4);

//    doc.setDrawColor(10, 61, 82);
//    doc.setLineWidth(0.5);
//    doc.line(W - MARGIN - 130, FOOTER_Y + 2, W - MARGIN, FOOTER_Y + 2);

//    doc.setFont("helvetica", "normal");
//    doc.setFontSize(8);
//    doc.setTextColor(90, 122, 138);
//    const clinicianLines = [`Dr. ${userData?.name || "Clinician"}`];
//    clinicianLines.forEach((line, i) => {
//      const tw = doc.getTextWidth(line);
//      doc.text(line, W - MARGIN - tw, FOOTER_Y + 14 + i * 11);
//    });

//    doc.save(
//      `prescription-${data.patient.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
//    );
  //  };
  
  const handleDownloadReport = () => {
    generateConsultancyReport({
      data,
      submission,
      patientAppointment,
      userData,
      rawSubmissions,
    });
  };

  /* ---------------- FEEDBACK SUBMIT ---------------- */
  const closeFeedBackModal = () => {
    setFeedbackModal(false);
    setNotes("");
    setSelectedAppointment(null);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const payload = {
      feedback: notes,
    };
    await updateSchedule(selectedAppointment.id, payload);

    closeFeedBackModal();
    fetchAppointments();
  };

  /* ---------------- NAVIGATION ---------------- */
  const handleMakeDiagnosis = () => {
    navigate(`/prescription/${patientId}`);
  };

  /* ======================= UI ======================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 ">
      <Header
        title="Assessment Submission Details"
        description="Review assessment submission details and complete consultancy report "
      />

      {/* PROFILE */}
      <div className="bg-[#f8f5ed] rounded-xl p-6 mb-2">
        <h1 className="text-2xl font-semibold">{data.patient.name}</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-10 mb-2 text-sm">
          <Info
            label="Age"
            value={`${getAge(data.patient.dateOfBirth)} years`}
          />
          <Info label="Assessment" value={data.assessment.name} />
          <Info label="Status" value={data.status} />
          <Info label="Type" value="Patient Assessment" />
        </div>
      </div>
      <div className="space-y-6  p-4 ">
        {/* TABS */}
        <div className="border-b flex gap-6 text-sm font-medium">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 ${
                activeTab === tab
                  ? "border-b-2 cursor-pointer border-[#114654] text-[#114654]"
                  : "text-gray-500 cursor-pointer"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === "AI Summary" &&
          submission.map((item, i) => (
            <SubmissionDetailsCard
              key={i}
              name={item.patient.name}
              status={item.status}
              summary={item.summaries}
              childCondition={item.assessment.category}
              description={item.assessment.description}
            />
          ))}

        {activeTab === "View Assessment details" &&
          submission.map((item, i) => (
            <SubmissionDetails
              key={i}
              patientId={item.patient.id}
              assessmentId={item?.assessmentId}
              time={item.createdAt}
              score={item.score}
              rawSubmissions={rawSubmissions}
            />
          ))}

        {activeTab === "Consultancy Report" && (
          <ReportStructure
            data={{
              patientName: data.patient.name,
              age: getAge(data.patient.dateOfBirth),
              demographics: data.patient.demographics,
              clinicianDiagnosis: patientAppointment?.diagnosis || "",
              reviewNotes: patientAppointment?.notes_from_review || "",
              postConsultNotes: patientAppointment?.feedback || "",
            }}
            submission={submission}
          />
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-3 pt-6">
          {!isFirst && (
            <button
              onClick={() => setActiveTab(tabs[index - 1])}
              className="border border-[#114654] cursor-pointer text-[#114654] px-5 py-2 text-xs rounded-full"
            >
              Previous
            </button>
          )}

          {!isLast && (
            <button
              onClick={() => setActiveTab(tabs[index + 1])}
              className="bg-[#114654] cursor-pointer text-white px-5 py-2 text-xs rounded-full"
            >
              Next
            </button>
          )}

          {isLast && (
            <>
              {/* {isReportGenerated && ( */}
                <button
                  onClick={handleDownloadReport}
                  className="bg-[#114654] cursor-pointer text-white px-5 py-2 text-xs rounded-full"
                >
                  Download Report
                </button>
              {/* )} */}

              {/* {isReportGenerated && !hasFeedback && ( */}
                <button
                  onClick={() => {
                    setSelectedAppointment(patientAppointment);
                    setFeedbackModal(true);
                  }}
                  className="bg-[#114654] cursor-pointer text-white px-5 py-2 text-xs rounded-full"
                >
                  Add Feedback
                </button>
              {/* )} */}

              {!hasAppointmentForPatient && (
                <button
                  onClick={handleMakeDiagnosis}
                  className="bg-[#114654] cursor-pointer text-white px-5 py-2 text-xs rounded-full"
                >
                  Make diagnosis report
                </button>
              )}
            </>
          )}
        </div>

        {/* FEEDBACK MODAL */}
        <Modal
          classname="w-[65vw] lg:w-[34vw]"
          isOpen={feedbackModal}
          closeModal={closeFeedBackModal}
          title="Post Appointment Feedback"
        >
          <form onSubmit={handleSubmitFeedback}>
            <label className="block font-medium text-sm mb-2">
              Clinician Notes Post Consultation
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-36 rounded border p-4"
              required
            />

            <button
              type="submit"
              className="w-full mt-4 bg-[#0A4863] text-white py-2 rounded-lg"
            >
              Submit
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AssessmentDetails;

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 uppercase text-xs">{label}</p>
    <p className="font-medium mt-1">{value}</p>
  </div>
);
