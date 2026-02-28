// import { useState, useRef, useEffect } from "react";
// import { FiMoreVertical } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { getAge } from "../utils/ageConverter";
// import { timeConverter } from "../utils/timeconverter";
// import p1 from "../../../public/svg/placeholder.png";
// import { FaStar } from "react-icons/fa";

// const AssessmentCard = ({
//   name,
//   age,
//   image,
//   timeAgo,
//   status,
//   childCondition,
//   description,
//   onViewFullAssessment,
//   onRateSummary,
//   onAcceptCase,
//   onDeclineCase,
//   ratings,
//   patientId,
//   assessmentId,
// }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const colors = {
//     completed: "bg-gray-100 text-gray-700 border-gray-200",
//     accepted: "bg-green-100 text-green-700 border-green-200",
//     pending: "bg-orange-100 text-orange-700 border-orange-200",
//     rejected: "bg-red-100 text-red-700 border-red-200",
//   };

//   const statusKey =
//     status && status.trim() !== "" ? status.toLowerCase() : "pending";
//   const statusClass = colors[statusKey] || colors.pending;

//   const handleCardClick = () => {
//     navigate(`/assessment/${patientId}/${assessmentId}`);
//   };

//   // Check if button should be disabled
//   const isDisabled =
//     status === "accepted" || status === "completed" || status === "rejected";

//   return (
//     <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex gap-4 flex-1">
//           <img
//             className="h-10 w-10 rounded-full object-cover"
//             src={image || p1}
//             alt={name}
//           />

//           <div className="flex-1">
//             <div className="flex items-center gap-2 flex-wrap">
//               {/* Clickable name */}
//               <h2
//                 onClick={handleCardClick}
//                 className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
//               >
//                 {name}
//               </h2>

//               <span className="text-xs text-gray-500">
//                 {timeConverter(timeAgo)}
//               </span>

//               {/* ✅ Changed from span to div with inline-flex */}
//               {ratings && (
//                 <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
//                   <FaStar className="text-amber-500 " size={20} />
//                   <span>{ratings}</span>
//                 </div>
//               )}
//             </div>

//             <p className="text-xs text-slate-500 text-left">
//               {getAge(age)} years
//             </p>

//             {/* Content - clickable area */}
//             <div onClick={handleCardClick} className="mt-2 cursor-pointer">
//               <p className="font-semibold text-sm text-slate-900">
//                 {childCondition}
//               </p>
//               <p className="text-slate-600 text-xs mt-1 line-clamp-2">
//                 {description}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Status Button with Menu */}
//         <div className="relative" ref={menuRef}>
//           <button
//             onClick={() => {
//               if (!isDisabled) {
//                 setMenuOpen((v) => !v);
//               }
//             }}
//             disabled={isDisabled}
//             className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${statusClass} ${
//               isDisabled
//                 ? "cursor-not-allowed "
//                 : "cursor-pointer hover:shadow-sm"
//             }`}
//             aria-haspopup="menu"
//             aria-expanded={menuOpen}
//             aria-label="Status menu"
//           >
//             {status && status.trim() !== "" ? status.toUpperCase() : "PENDING"}
//           </button>

//           {/* Dropdown Menu - Only show for pending status */}
//           {menuOpen && (status === "pending" || !status) && (
//             <div
//               role="menu"
//               className="absolute right-0 mt-2 w-32 bg-white text-center rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden"
//             >
//               <button
//                 onClick={() => {
//                   onAcceptCase?.();
//                   setMenuOpen(false);
//                 }}
//                 className="w-full px-4 py-3 hover:bg-green-50 cursor-pointer text-sm text-slate-700 hover:text-green-700 font-medium transition-colors border-b border-slate-100"
//                 role="menuitem"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={() => {
//                   onDeclineCase?.();
//                   setMenuOpen(false);
//                 }}
//                 className="w-full px-4 py-3 hover:bg-red-50 cursor-pointer text-sm text-slate-700 hover:text-red-700 font-medium transition-colors"
//                 role="menuitem"
//               >
//                 Decline
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssessmentCard;

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAge } from "../utils/ageConverter";
import { timeConverter } from "../utils/timeconverter";
import p1 from "../../../public/svg/placeholder.png";
import { FaStar } from "react-icons/fa";

const AssessmentCard = ({
  name,
  age,
  image,
  timeAgo,
  status,
  childCondition,
  description,
  onViewFullAssessment,
  onRateSummary,
  onAcceptCase,
  onDeclineCase,
  ratings,
  patientId,
  assessmentId,
}) => {
  const navigate = useNavigate();

  const statusKey =
    status && status.trim() !== "" ? status.toLowerCase() : "pending";

  const statusColors = {
    completed: " text-gray-700 ",
    accepted: " text-green-700 ",
    pending: " text-orange-700 ",
    rejected: " text-red-700 ",
  };

  const statusClass = statusColors[statusKey] || statusColors.pending;

  const isDisabled =
    statusKey === "accepted" ||
    statusKey === "completed" ||
    statusKey === "rejected";

  const handleCardClick = () => {
    navigate(`/assessment/${patientId}/${assessmentId}`);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <img
          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          src={image || p1}
          alt={name}
        />

        <div className="flex-1 min-w-0 relative">
          {/* Top row: name, time, ratings, status */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              onClick={handleCardClick}
              className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
            >
              {name}
            </h2>

            <span className="text-xs text-gray-500">
              {timeConverter(timeAgo)}
            </span>

            {ratings && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                <FaStar className="text-amber-500" size={12} />
                <span>{ratings}</span>
              </div>
            )}

            {/* ✅ Status badge after ratings */}
            <span
              className={`px-0 py-1 rounded-lg text-xs font-semibold  ${statusClass}`}
            >
              {statusKey}
            </span>
          </div>

          <p className="text-xs text-slate-500 text-left mt-0.5">
            {getAge(age)} years
          </p>

          {/* Clickable content */}
          <div onClick={handleCardClick} className="mt-2 cursor-pointer">
            <p className="font-semibold text-sm text-slate-900">
              {childCondition}
            </p>
            <p className="text-slate-600 text-xs mt-1 line-clamp-2">
              {description}
            </p>
          </div>

          {/*  Accept / Decline buttons */}
          <div className="absolute -top-3 right-2 flex gap-2 mt-3">
            <button
              onClick={() => !isDisabled && onAcceptCase?.()}
              disabled={isDisabled}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all
                ${
                  isDisabled
                    ? "bg-green-50 text-green-300  cursor-not-allowed"
                    : "bg-green-100 text-green-700  hover:bg-green-200 cursor-pointer"
                }`}
            >
              Accept
            </button>

            <button
              onClick={() => !isDisabled && onDeclineCase?.()}
              disabled={isDisabled}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all
                ${
                  isDisabled
                    ? "bg-red-50 text-red-300  cursor-not-allowed"
                    : "bg-red-100 text-red-700  hover:bg-red-200 cursor-pointer"
                }`}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard;