
import { Bell, Calendar } from "lucide-react";
import toast from "react-hot-toast";

import { AiOutlinePoweroff } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const DashboardHeader = ({ userData, stats, onLogout }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleGuidelineClick = () => {
    navigate("/guidelines");
  };
  // ✅ Update handleLogoutConfirm:
  const handleLogoutConfirm = () => {
    setShowConfirm(false);
    toast.success("Logged out successfully");
    setTimeout(() => {
      onLogout();
    }, 1000);
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          {/* LEFT */}
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900">
              Good afternoon, {userData?.name || ""}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              You have {stats.pendingReviews} pending reviews and{" "}
              {stats.upcomingAppointments} appointments today
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex gap-3 items-center">
            <button
              onClick={handleGuidelineClick}
              className="bg-emerald-600 p-2 rounded-lg text-white text-xs"
            >
              View Guidelines
            </button>

            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* ✅ Logout button */}
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
                onClick={handleLogoutConfirm}
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
};;

export default DashboardHeader;
