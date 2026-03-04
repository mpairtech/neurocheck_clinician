
import { useEffect, useState } from "react";
import { getAllanswers, getSubmissionByPatientId } from "../api/assessment";
import TextAns from "./ui-reusable/TextAns";

const SubmissionDetails = ({
  patientId,
  assessmentId,
  score,
  time,
  rawSubmissions = [],
}) => {
  const [answers, setAnswers] = useState({});
  const [questionTypes, setQuestionTypes] = useState([]);
  const [patient, setPatient] = useState(null);
  const [activeType, setActiveType] = useState("");
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      // Step 1: get all questionTypes (same as AI Summary)
      const submissionRes = await getSubmissionByPatientId(
        patientId,
        assessmentId,
      );
      const raw = submissionRes?.payload || [];
      if (!raw.length) return;

      setPatient(raw[0].patient);
      setSubmissions(raw);

      // Extract ordered questionType names (same order as AI Summary)
      

      const answersRes = await getAllanswers({ patientId, assessmentId });
      const answersRaw = answersRes?.payload || [];
      console.log(answersRaw);

      const grouped = answersRaw.reduce((acc, item) => {
        const type =
          item.question?.questionType?.name ||
          item.question?.questionType ||
          item.questionType;
        if (!type) return acc;
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      const typeNames = Object.keys(grouped);

      console.log("grouped", grouped);
      setAnswers(grouped);
      setQuestionTypes(typeNames);
      setActiveType(typeNames[0]);
    };
    fetchData();
  }, [patientId, assessmentId]);

  if (!patient) return null;

  const activeAnswers = answers[activeType] || [];
  const isActiveTypeExternal = activeAnswers.some(
    (ans) => ans.question?.variant === "external",
  );

  const matchedSubmission = submissions.find(
    (s) =>
      s.questionType?.trim().toLowerCase() === activeType?.trim().toLowerCase(),
  );
  
  // console.log("activeType:", JSON.stringify(activeType));
  // console.log(
  //   "rawSub types:",
  //   rawSubmissions.map((s) => JSON.stringify(s.questionType)),
  // );
 
  // console.log("matchedSubmission:", matchedSubmission);
  // console.log("isActiveTypeExternal:", isActiveTypeExternal);

  return (
    <div className="px-4 ">
      {/* Tabs — order same as AI Summary */}
      {/* <h2 className="font-semibold text-left pb-2">Question Categories</h2> */}

      <div className="flex gap-2 mt-0 overflow-x-auto tab-scroll max-w-[79vw] border p-3 rounded-md bg-white">
  
        {questionTypes.map((type) => {
          const isExternalType = answers[type]?.some(
            (ans) => ans.question?.variant === "external",
          );

          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 ${
                activeType === type
                  ? "bg-amber-200/60"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {type}
              {isExternalType && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 text-blue-800 font-semibold">
                  External
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto">
        {isActiveTypeExternal && matchedSubmission && (
          <div className="p-3 border rounded-md bg-cyan-50 text-xs space-y-1 text-start">
            <p>
              <span className="font-semibold">Reviewer Name </span>
              {matchedSubmission.reviewer_name || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Occupation </span>
              {matchedSubmission.reviewer_occupation || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Relation </span>
              {matchedSubmission.reviewer_relation || "N/A"}
            </p>
          </div>
        )}
        {activeAnswers.length === 0 && (
          <p className="text-sm text-gray-400">
            No answers found for this section.
          </p>
        )}

        {activeAnswers.map((ans) => {
          const isExternal = ans.question?.variant === "external";

          if (isExternal) {
            return (
              <div
                key={ans.id}
                className="p-3 border rounded-md bg-blue-50 space-y-1 text-left"
              >
                <p className="text-sm font-medium">{ans.question?.questions}</p>
                <p className="text-sm">
                  <span className="font-semibold">Answer</span> {ans.answer}
                </p>
                {/* <p className="text-xs text-gray-600">
                  <span className="font-semibold">Source:</span>{" "}
                  {ans.extraInfo?.source || "N/A"}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Remarks:</span>{" "}
                  {ans.extraInfo?.remarks || "N/A"}
                </p> */}
              </div>
            );
          }
          

          return (
            <TextAns
              key={ans.id}
              text={ans.question?.questions}
              answer={ans.answer}
            />
          );
        })}
      </div>
    </div>
  );
};;;

export default SubmissionDetails;
