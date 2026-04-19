import {
    getAllappointments,
    getSubmissionByPatientId,
    updateSchedule,
} from "../../api/assessment";
import { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/ui-reusable/Header";
import SubmissionDetailsCard from "../../components/ui-reusable/SubmissionDetailsCard";
import SubmissionDetails from "../../components/SubmissionDetails";
import { getAge } from "../../components/utils/ageConverter";
import { AuthContext } from "../../Provider/AuthProvider";
import ReportStructure from "../../components/Reports/ReportStructure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../../components/ui-reusable/Modal";
import AssessmentReport from "./AssessmentReport";
import PostConsultancyFeedbackForm from "../../components/Reports/PostConsultancyFeedbackForm";

const tabs = ["AI Summary", "View Assessment details", "Consultancy Report"];

const AssessmentDetails = () => {
    const { patientId, assessmentId } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext) || {};

    const reportRef = useRef(null);
    const [submission, setSubmission] = useState([]);
    const [appointment, setAppointment] = useState([]);
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [notes, setNotes] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [rawSubmissions, setRawSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReportForm, setShowReportForm] = useState(false);

    const [previewModal, setPreviewModal] = useState(false);

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
                        clinician: item.clinician,
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
    if (!data)
        return (
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

    const hasFeedback =
        Array.isArray(patientAppointment?.feedback?.sections) &&
        patientAppointment.feedback.sections.length > 0;

    /* ---------------- REPORT DATA SHAPE ---------------- */
    const reportData = {
        patientName: data.patient.name,
        age: getAge(data.patient.dateOfBirth),
        demographics: data.patient.demographics,
        clinician: data.clinician.name || "",
        assessmentName: data.assessment.name || "",
        regNo: data.clinician.regNo,
        reviewNotes: patientAppointment?.notes_from_review || "",
        postConsultNotes:
            patientAppointment?.feedback?.sections
                ?.map((s) => `${s.heading}: ${s.content}`)
                .join("\n") || "",
        feedbackSections: patientAppointment?.feedback?.sections || [],
        clinicianDiagnosis: patientAppointment?.diagnosis || "",
    };

    const handleDownloadReport = () => {
        reportRef.current?.downloadPDF();
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

    const handleReportFormSubmit = async (formattedNotes) => {
        if (!selectedAppointment) return;

        const payload = {
            feedback: {
                sections: formattedNotes.sections,
            },
        };

        await updateSchedule(selectedAppointment.id, payload);

        setShowReportForm(false);
        fetchAppointments();
    };

    if (showReportForm) {
        return (
            <PostConsultancyFeedbackForm
                onSubmit={handleReportFormSubmit}
                onCancel={() => setShowReportForm(false)}
            />
        );
    }
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

            <AssessmentReport
                ref={reportRef}
                mode="hidden"
                data={reportData}
                submission={submission}
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
                            className={`pb-3 ${activeTab === tab
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
                    <>
                        <ReportStructure
                            ref={reportRef}
                            data={{
                                assessmentName: data.assessment.name || "",
                                patientName: data.patient.name,
                                age: getAge(data.patient.dateOfBirth),
                                demographics: data.patient.demographics,
                                clinician: data.clinician.name || "",
                                reviewNotes: patientAppointment?.notes_from_review || "",
                                postConsultNotes: patientAppointment?.feedback || "",
                            }}
                            submission={submission}
                        />
                        <div>
                            <div className="mt-16">
                                <h2 className="text-lg font-semibold text-[#114654] mb-1">
                                    Consultancy Report Ready
                                </h2>
                                <p className="text-sm text-gray-500">
                                    To preview the full report or download it as a PDF,{" "}
                                    <span
                                        onClick={() => setPreviewModal(true)}
                                        className="text-[#18697f] underline cursor-pointer hover:text-[#0d3a45] font-semibold"
                                    >
                                        click here
                                    </span>
                                </p>
                            </div>
                            {/* <button
                  onClick={() => setPreviewModal(true)}
                  className="border border-[#114654] cursor-pointer text-[#114654] px-6 py-2 text-sm rounded-full hover:bg-[#f0f7fa] transition-colors mt-3"
                >
                  👁 Preview Report
                </button> */}
                        </div>
                        {/* <AssessmentReport
                ref={reportRef}
                data={{
                  patientName: data.patient.name,
                  age: getAge(data.patient.dateOfBirth),
                  demographics: data.patient.demographics,
                  clinicianDiagnosis: patientAppointment?.diagnosis || "",
                  reviewNotes: patientAppointment?.notes_from_review || "",
                  postConsultNotes: patientAppointment?.feedback || "",
                }}
                submission={submission}
              /> */}
                    </>
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
                            {/* <button
                  onClick={() => {
                    setSelectedAppointment(patientAppointment);
                    setFeedbackModal(true);
                  }}
                  className="bg-[#114654] cursor-pointer text-white px-5 py-2 text-xs rounded-full"
                >
                  Add Feedback
                </button> */}
                            {/* )} */}
                            <button
                                onClick={() => {
                                    setSelectedAppointment(patientAppointment);
                                    setShowReportForm(true);
                                }}
                                className="bg-[#114654] cursor-pointer text-white px-5 py-2 text-xs rounded-full"
                            >
                                Clinician Notes Post Consultation
                            </button>

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

                {/* ── PREVIEW MODAL ── */}
                <Modal
                    classname=""
                    isOpen={previewModal}
                    closeModal={() => setPreviewModal(false)}
                    title="Consultancy Report Preview"
                >
                    {/* Scrollable container so the wide report doesn't break layout */}
                    <div className="pb-2">
                        <AssessmentReport
                            mode="preview"
                            data={reportData}
                            submission={submission}
                        />
                    </div>
                </Modal>

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
