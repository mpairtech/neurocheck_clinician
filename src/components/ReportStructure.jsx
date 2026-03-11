const ReportStructure = ({ data = {}, submission = [] }) => {
  console.log(data);
  console.log(submission);
  
  return (
    <div className="w-full text-gray-900 font-sans">
      {/* TITLE */}
      <h2 className="text-xl font-semibold mb-4">Report of ADHD Adult</h2>

      {/* MAIN TABLE */}
      <table className="w-full border border-gray-300 border-collapse text-sm mb-6">
        <tbody>
          <tr>
            <td className="w-[30%] border border-gray-300 p-3 font-medium bg-gray-50">
              Patient Name
            </td>
            <td className="border border-gray-300 p-3">
              {data?.patientName || "XX YY"}
            </td>
          </tr>

          <tr>
            <td className="border border-gray-300 p-3 font-medium bg-gray-50">
              Age
            </td>
            <td className="border border-gray-300 p-3">{data?.age || "YY"}</td>
          </tr>

          <tr>
            <td className="border border-gray-300 p-3 font-medium bg-gray-50">
              Demographics
            </td>
            <td className="border border-gray-300 p-3">
              {data?.demographics || "XX"}
            </td>
          </tr>

          <tr>
            <td className="border border-gray-300 p-3 font-medium bg-gray-50">
              Clinician Diagnosis
            </td>
            <td className="border border-gray-300 p-3">
              {data?.clinicianDiagnosis || ""}
            </td>
          </tr>

          <tr>
            <td className="border border-gray-300 p-3 font-medium bg-gray-50">
              Clinician Notes from Review
            </td>
            <td className="border border-gray-300 p-3">
              {data?.reviewNotes || ""}
            </td>
          </tr>

          <tr>
            <td className="border border-gray-300 p-3 font-medium bg-gray-50">
              Clinician Notes Post Consultation
            </td>
            <td className="border border-gray-300 p-3">
              {data?.postConsultNotes || ""}
            </td>
          </tr>
        </tbody>
      </table>
      {submission.map((item, i) => (
        <div key={i}>
          <p className="text-sm text-gray-800">
            {item.summaries?.map((summary, j) => (
              <div key={j}>
                <Section
                  title={summary?.questionType}
                  text={summary?.summary || ""}
                />
                {/* <p className="text-[#4B4B4B] text-base font-semibold">
                {summary?.questionType}
              </p>
              <p className="text-xs font-normal text-[#3C3C4399] text-justify whitespace-pre-line mt-1">
                {summary?.summary
                  ?.replace(/[*#_`>]+/g, "")
                  ?.replace(/-{3,}/g, "")
                  ?.trim()}
              </p> */}
              </div>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ================= SUB COMPONENT ================= */
const Section = ({ title, text }) => (
  <div className="mb-4">
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-gray-800">{text}</p>
  </div>
);

export default ReportStructure;
