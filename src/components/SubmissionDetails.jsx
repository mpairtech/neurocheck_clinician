
import { useEffect, useState } from "react";
import { getAllanswers } from "../api/assessment";
import TextAns from "./ui-reusable/TextAns";

const SubmissionDetails = ({ patientId, assessmentId, score, time }) => {
  const [answers, setAnswers] = useState({});
  const [patient, setPatient] = useState(null);
  const [activeType, setActiveType] = useState("");

  useEffect(() => {
    if (!patientId) return;

    const fetch = async () => {
      const data = await getAllanswers({ patientId, assessmentId });
      const raw = data?.payload || [];

      console.log("ppp", raw);

      if (!raw.length) return;

      setPatient(raw[0].patient);

      // const grouped = raw.reduce((acc, item) => {
      //   const type = item.question?.questionType?.name;
      //   if (!acc[type]) acc[type] = [];
      //   acc[type].push(item);
      //   return acc;
      // }, {});

      const grouped = raw.reduce((acc, item) => {
        const variant = item.question?.variant;

        // 👇 tab name decide
        const type =
          variant === "external"
            ? `${item.question?.questionType?.name} - External`
            : item.question?.questionType?.name;

        if (!acc[type]) acc[type] = [];
        acc[type].push(item);

        return acc;
      }, {});

      setAnswers(grouped);
      setActiveType(Object.keys(grouped)[0]);
    };

    fetch();
  }, [patientId]);

  if (!patient) return null;

  const activeAnswers = answers[activeType] || [];

  return (
    <div className="p-4">

      <div className="flex gap-2 mt-0 overflow-x-auto">
        {Object.keys(answers).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1 rounded-full text-xs ${
              activeType === type
                ? "bg-amber-100"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto">
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

          // ✅ Normal question
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
