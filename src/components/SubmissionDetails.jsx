
import { useEffect, useState } from "react";
import { getAllanswers, getSubmissionByPatientId } from "../api/assessment";
import TextAns from "./ui-reusable/TextAns";

const SubmissionDetails = ({ patientId, assessmentId, score, time }) => {
  const [answers, setAnswers] = useState({});
  const [questionTypes, setQuestionTypes] = useState([]); 
  const [patient, setPatient] = useState(null);
  const [activeType, setActiveType] = useState("");

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

      // Extract ordered questionType names (same order as AI Summary)
      // const typeNames = [
      //   ...new Set(raw.map((item) => item.questionType)),
      // ].filter(Boolean);
      // console.log("question type", typeNames);
      // setQuestionTypes(typeNames);
      // setActiveType(typeNames[0]);


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

      // ✅ grouped এর keys থেকে typeNames নাও
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

  return (
    <div className="px-4 ">
      {/* Tabs — order same as AI Summary */}
      {/* <h2 className="font-semibold text-left pb-2">Question Categories</h2> */}
     
      <div className="flex gap-2 mt-0 overflow-x-auto tab-scroll max-w-[79vw] border p-3 rounded-md bg-white">

        {questionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
              activeType === type
                ? "bg-amber-200/60"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto">
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
                className="p-3 border rounded-md bg-blue-50 space-y-1"
              >
                <p className="text-sm font-medium">{ans.question?.questions}</p>
                <p className="text-sm">
                  <span className="font-semibold">Answer:</span> {ans.answer}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Source:</span>{" "}
                  {ans.extraInfo?.source || "N/A"}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Remarks:</span>{" "}
                  {ans.extraInfo?.remarks || "N/A"}
                </p>
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
};

export default SubmissionDetails;
