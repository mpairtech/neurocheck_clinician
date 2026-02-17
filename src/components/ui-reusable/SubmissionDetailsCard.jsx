import React, { useState, useRef, useEffect } from "react";
import { FiMoreVertical } from "react-icons/fi";
import p1 from "../../../public/svg/user-img.svg";

import { getAge } from "../utils/ageConverter";
import { timeConverter } from "../utils/timeconverter";

const SubmissionDetailsCard = ({
  name,
  age,
  timeAgo,
  status,
  childCondition,
  summary,
  description,
  onViewFullAssessment,
  onRateSummary,
  onBookVideo,
  onAcceptCase,
  ratings,
  patientId,
}) => {
  console.log("summary", summary);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colors = {
    completed: "bg-[#EBF6EC] text-[#4CAF50]",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusKey =
    status && status.trim() !== "" ? status.toLowerCase() : "pending";
  const statusClass = colors[statusKey] || colors.pending;

  return (
    <div className="">
     

      <div className="flex-1">
        <div className="flex flex-row gap-2">
          <p className="font-semibold text-sm mt-2 text-[#4B4B4B]">
            {childCondition}
          </p>
          <p
            className={`px-2 py-0.5 mt-[10px] md:hidden rounded-md text-xs ${statusClass}`}
          >
            {(status || "").toUpperCase()}
          </p>
          
          <p className="px-2 py-0.5 mt-[8px]  rounded-md text-xs ">
            rating:{ratings}
          </p>
        </div>
        <p className="text-[#3C3C4399] text-xs mt-1 text-left ">{description}</p>
        <div className="flex flex-col items-start justify-start  gap-4 mt-4">
          {summary.map((item, index) => (
            <div key={index}>
              <p className="text-[#4B4B4B] text-base font-semibold">
                {item?.questionType}
              </p>
              <p className="text-xs font-normal text-[#3C3C4399] text-justify whitespace-pre-line mt-1">
                {item?.summary
                  ?.replace(/[*#_`>]+/g, "")
                  ?.replace(/-{3,}/g, "")
                  ?.trim()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailsCard;
