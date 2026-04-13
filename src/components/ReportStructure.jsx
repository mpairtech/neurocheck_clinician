// const ReportStructure = ({ data = {}, submission = [] }) => {
//   console.log(data);
//   console.log(submission);

//   return (
//     <div className="w-full text-gray-900 font-sans">
//       {/* TITLE */}
//       <h2 className="text-xl font-semibold mb-4">Report of ADHD Adult</h2>

//       {/* MAIN TABLE */}
//       <table className="w-full border border-gray-300 border-collapse text-sm mb-6">
//         <tbody>
//           <tr>
//             <td className="w-[30%] border border-gray-300 p-3 font-medium bg-gray-50">
//               Patient Name
//             </td>
//             <td className="border border-gray-300 p-3">
//               {data?.patientName || "XX YY"}
//             </td>
//           </tr>

//           <tr>
//             <td className="border border-gray-300 p-3 font-medium bg-gray-50">
//               Age
//             </td>
//             <td className="border border-gray-300 p-3">{data?.age || "YY"}</td>
//           </tr>

//           <tr>
//             <td className="border border-gray-300 p-3 font-medium bg-gray-50">
//               Demographics
//             </td>
//             <td className="border border-gray-300 p-3">
//               {data?.demographics || "XX"}
//             </td>
//           </tr>

//           <tr>
//             <td className="border border-gray-300 p-3 font-medium bg-gray-50">
//               Clinician Diagnosis
//             </td>
//             <td className="border border-gray-300 p-3">
//               {data?.clinicianDiagnosis || ""}
//             </td>
//           </tr>

//           <tr>
//             <td className="border border-gray-300 p-3 font-medium bg-gray-50">
//               Clinician Notes from Review
//             </td>
//             <td className="border border-gray-300 p-3">
//               {data?.reviewNotes || ""}
//             </td>
//           </tr>

//           <tr>
//             <td className="border border-gray-300 p-3 font-medium bg-gray-50">
//               Clinician Notes Post Consultation
//             </td>
//             <td className="border border-gray-300 p-3">
//               {data?.postConsultNotes || ""}
//             </td>
//           </tr>
//         </tbody>
//       </table>
//       {submission.map((item, i) => (
//         <div key={i}>
//           <p className="text-sm text-gray-800">
//             {item.summaries?.map((summary, j) => (
//               <div key={j}>
//                 <Section
//                   title={summary?.questionType}
//                   text={summary?.summary || ""}
//                 />
//                 {/* <p className="text-[#4B4B4B] text-base font-semibold">
//                 {summary?.questionType}
//               </p>
//               <p className="text-xs font-normal text-[#3C3C4399] text-justify whitespace-pre-line mt-1">
//                 {summary?.summary
//                   ?.replace(/[*#_`>]+/g, "")
//                   ?.replace(/-{3,}/g, "")
//                   ?.trim()}
//               </p> */}
//               </div>
//             ))}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ================= SUB COMPONENT ================= */
// const Section = ({ title, text }) => (
//   <div className="mb-4">
//     <h3 className="font-semibold mb-1">{title}</h3>
//     <p className="text-sm text-gray-800">{text}</p>
//   </div>
// );

// export default ReportStructure;

import { useState } from "react";
import Modal from "./ui-reusable/Modal";

const ReportStructure = ({ data = {}, submission = [] }) => {
  const [showFullReport, setShowFullReport] = useState(false);

  // Parse clinician post consultation notes
  let parsedSections = [];

  try {
    const parsed = JSON.parse(data?.postConsultNotes || "{}");
    parsedSections = parsed?.sections || [];
  } catch (e) {
    parsedSections = [];
  }

  const cleanText = (html) => html?.replace(/<[^>]*>/g, "") || "";

  return (
    <div className="w-full text-gray-900 font-sans">
      {/* ================= TITLE ================= */}
      <h2 className="text-xl font-semibold mb-4">Report of ADHD Adult</h2>

      {/* ================= MAIN TABLE ================= */}
      <table className="w-full border border-gray-300 border-collapse text-sm mb-4">
        <tbody>
          <tr>
            <td className="w-[30%] border p-3 font-medium bg-gray-50">
              Patient Name
            </td>
            <td className="border p-3">{data?.patientName || "-"}</td>
          </tr>

          <tr>
            <td className="border p-3 font-medium bg-gray-50">Age</td>
            <td className="border p-3">{data?.age || "-"}</td>
          </tr>

          <tr>
            <td className="border p-3 font-medium bg-gray-50">Demographics</td>
            <td className="border p-3">{data?.demographics || "-"}</td>
          </tr>

          <tr>
            <td className="border p-3 font-medium bg-gray-50">
              Clinician Diagnosis
            </td>
            <td className="border p-3">{data?.clinicianDiagnosis || "-"}</td>
          </tr>

          <tr>
            <td className="border p-3 font-medium bg-gray-50">
              Clinician Notes from Review
            </td>
            <td className="border p-3">{data?.reviewNotes || "-"}</td>
          </tr>

          {/* ================= POST CONSULTATION PREVIEW ================= */}
          <tr>
            <td className="border p-3 font-medium bg-gray-50">
              Post Consultation Notes
            </td>

            <td className="border p-3">
              {parsedSections.length > 0 ? (
                <div className="space-y-1">
                  {parsedSections.slice(0, 2).map((s, i) => (
                    <p key={i} className="text-xs text-gray-600 truncate">
                      <span className="font-medium">{s.heading}:</span>{" "}
                      {cleanText(s.content).slice(0, 40)}...
                    </p>
                  ))}

                  <button
                    onClick={() => setShowFullReport(true)}
                    className="text-blue-600 text-xs underline mt-1"
                  >
                    View full report
                  </button>
                </div>
              ) : (
                "-"
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= SUBMISSION DETAILS ================= */}
      {submission.map((item, i) => (
        <div key={i} className="mb-4">
          {item.summaries?.map((summary, j) => (
            <Section
              key={j}
              title={summary?.questionType}
              text={summary?.summary || ""}
            />
          ))}
        </div>
      ))}

      {/* ================= MODAL ================= */}
      <Modal
        classname="w-[80vw] max-h-[80vh] overflow-y-auto"
        isOpen={showFullReport}
        closeModal={() => setShowFullReport(false)}
        title="Clinician Notes - Full Report"
      >
        <div className="space-y-5">
          {parsedSections.map((section, index) => (
            <div key={index} className="border-b pb-3">
              <h3 className="font-semibold text-sm mb-1">{section.heading}</h3>

              <div
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: section.content,
                }}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

/* ================= SUB COMPONENT ================= */
const Section = ({ title, text }) => (
  <div className="mb-3">
    <h3 className="font-semibold text-sm mb-1">{title}</h3>
    <p className="text-sm text-gray-700">{text}</p>
  </div>
);

export default ReportStructure;