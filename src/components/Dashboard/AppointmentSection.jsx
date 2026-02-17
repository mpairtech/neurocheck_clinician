import { useState, useEffect, useContext } from "react";
import { HiClock } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";
import { getAllsubmissions,getAllappointments  } from "../../api/assessment";
import { getAge } from "../utils/ageConverter";


const statusBadge = {
  pending: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  in_review: "bg-blue-100 text-blue-700",
};

const AppointmentSection = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext) || {};
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // Fetch API data
  const fetchData = async () => {
    if (!userData?.id) return;

    try {
      // Fetch recent submissions
      const res = await getAllsubmissions();
      const rawSubmissions = res?.payload?.filter(
        (item) =>
          item?.assessment?.type === "premium" &&
          item?.clinicianId === Number(userData.id),
      );

      const groupedSubmissions = Object.values(
        rawSubmissions?.reduce((acc, item) => {
          const key = `${item.patientId}-${item.assessmentId}-${item.userId}`;
          if (!acc[key]) {
            acc[key] = {
              id: item.id,
              patientId: item.patientId,
              assessmentId: item.assessmentId,
              patientName: item.patient?.name,
              assessmentType: item.assessment?.name,
              age: item.patient?.dateOfBirth,
              submittedAt: item.assessment?.createdAt,
              status: item.status,
              urgency: item.assessment?.urgency || "normal",
            };
          }
          return acc;
        }, {}),
      );
      setRecentSubmissions(groupedSubmissions);

      // Fetch upcoming appointments

    const aptRes = await getAllappointments();

    const upcoming = aptRes?.payload
      ?.filter(
        (apt) =>
          apt?.clinicianId === Number(userData.id) &&
          apt?.status !== "Cancelled", // optional filter
      )
      ?.map((apt) => ({
        id: apt.id,
        patientId: apt.patientId,
        patientName: apt.patient?.name,
        condition: apt.condition,
        time: apt.time,
        status: apt.status,
        metting_status: apt.metting_status,
      }));

    setUpcomingAppointments(upcoming);

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Left: Recent Submissions */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="text-start">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Submissions
              </h2>
              <p className="text-xs text-slate-600">
                Latest assessment submissions requiring review
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 ">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-semibold text-sm">
                      {submission.patientName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {submission.patientName}
                      </h3>
                      {/* {submission.urgency === "high" && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            Urgent
                          </span>
                        )} */}

                      <div
                        className={`px-3 py-0.5 text-xs font-medium rounded-full ${
                          statusBadge[submission.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {submission.status?.replace("_", " ").toUpperCase()}
                      </div>
                    </div>

                    {/* <p className="text-xs text-slate-500 mt-1">
                        {submission.submittedAt}
                      </p> */}
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 ">
                      {submission.assessmentType}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/assessment/${submission.patientId}/${submission.assessmentId}`,
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Review →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              No recent Assessments
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => navigate("/assessments")}
            className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            View All Assessments
          </button>
        </div>
      </div>

      {/* Right: Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
          <p className="text-xs text-slate-600">
            {upcomingAppointments.length} appointments
          </p>
        </div>

        <div className="p-4 space-y-3">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HiClock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(apt.time).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 text-sm">
                  {apt.patientName}
                </h3>
                <p className="text-xs text-slate-600 mt-1">{apt.condition}</p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              No appointments today
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() =>
              navigate(
                `/appointments`,
              )
            }
            className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            View Full Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSection;
