import { Bell } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { AiOutlinePoweroff } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";
import toast from "react-hot-toast";

const Header = ({
  title,
  description,
 
}) => {
  const { userData, handleLogout } = useContext(AuthContext) || {};
    const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
    const [showConfirm, setShowConfirm] = useState(false);

  
  const navigate = useNavigate();

const handleGuidelineClick = () => {
  navigate("/guidelines"); // same tab
  };
  
  const handleLogoutClick = () => {
    handleLogout();
    setShowConfirm(false);
    setShowTooltip(false);
    toast.success("Logged Out Successfully!");
    localStorage.removeItem("accessToken");
    navigate("/signin", { replace: true });
  };


  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          {/* LEFT */}
          <div className="text-left ">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {description && (
              <p className="text-slate-600 text-sm mt-1">{description}</p>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex gap-3 items-center">
            {/* View Guidelines */}
            <button
              onClick={handleGuidelineClick}
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors p-2 rounded-lg text-white text-xs font-medium"
            >
              View Guidelines
            </button>

            {/* Notification */}
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Logout */}
            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Logout"
            >
              <AiOutlinePoweroff className="w-5 h-5 text-slate-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Confirm Logout
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 text-sm rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;


// import { useEffect, useRef, useState } from "react";
// import { LuMessageSquareMore } from "react-icons/lu";
// import { RiShutDownLine } from "react-icons/ri";
// import { IoMdNotificationsOutline } from "react-icons/io";
// import { useNavigate } from "react-router-dom";

// const Header = ({ title, description }) => {
//   // const [time, setTime] = useState("");
//   const [showTooltip, setShowTooltip] = useState(false);
//   const tooltipRef = useRef(null);

//   const navigation = useNavigate();

//   // Set current time and update every minute
//   // useEffect(() => {
//   //   const updateTime = () => {
//   //     const now = new Date();
//   //     const formatted = now.toLocaleTimeString([], {
//   //       hour: "numeric",
//   //       minute: "2-digit",
//   //       hour12: true,
//   //     });
//   //     setTime(formatted);
//   //   };

//   //   updateTime();
//   //   const interval = setInterval(updateTime, 60000);
//   //   return () => clearInterval(interval);
//   // }, []);

//   // Close tooltip on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         tooltipRef.current &&
//         !tooltipRef.current.contains(event.target)
//       ) {
//         setShowTooltip(false);
//       }
//     };

//     if (showTooltip) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showTooltip]);

//   const toggleTooltip = () => {
//     setShowTooltip((prev) => !prev);
//   };

//   const handleLogout = () => {
//     //console.log("Logging out...");
//     setShowTooltip(false);
//     localStorage.removeItem("accessToken");
//     navigation.replace("/signin");

//   };

//   return (
//     <div className="flex-1 mb-8 relative ">

//       <div className="flex flex-col md:flex-row md:justify-between md:items-center">
//         <h1 className="text-2xl font-bold">{title}</h1>
//         <div className="md:block hidden">
//           <div className="flex relative">
//             {/* <button>
//               <LuMessageSquareMore size={20} className="text-[#114654] cursor-pointer" />
//             </button> */}
//             <button>
//               <IoMdNotificationsOutline size={23} className="text-[#114654] mx-2 cursor-pointer" />
//             </button>
//             <button onClick={toggleTooltip}>
//                 <RiShutDownLine size={21} className="text-[#114654] cursor-pointer" />
//             </button>

//             <div className="relative" ref={tooltipRef}>
//               {showTooltip && (
//                 <div className="absolute cursor-pointer right-0 mt-8 w-24 bg-white border border-gray-300 rounded shadow-md z-10">
//                   <button
//                     onClick={handleLogout}
//                     className="w-full px-3 py-2 cursor-pointer text-sm text-left hover:bg-gray-100"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-col text-[#3B3B3B] font-semibold text-lg md:flex-row md:justify-between">
//         <p className="mt-2 text-xs text-[#6C6C6C]">{description}</p>
//         {/* {time && (
//           <p className="text-2xl md:block hidden font-medium text-[#3B3B3B] mt-2 md:mt-0">
//             {time}
//           </p>
//         )} */}
//       </div>
//     </div>
//   );
// };

// export default Header;
