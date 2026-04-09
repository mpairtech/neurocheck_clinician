import { getAllappointments, updateSchedule , updateAppointment } from "../../api/assessment";
import Header from "../../components/ui-reusable/Header";
import { formatDate } from "../../components/utils/formateDate";
import { AuthContext } from "../../Provider/AuthProvider";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { MdEditCalendar, MdVideoCall } from "react-icons/md";
import { IoEyeSharp, IoCalendarSharp } from "react-icons/io5";
import { FaUserEdit, FaSearch } from "react-icons/fa";
import { PiVideoCameraBold } from "react-icons/pi";
import { BiSortAlt2 } from "react-icons/bi";
import { HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import Modal from "../../components/ui-reusable/Modal";
import { IoFilter } from "react-icons/io5";
import { convertToUTC, formatLondonTime } from "../../components/utils/timeConvertforUTC";
import toast from "react-hot-toast";


const statusColors = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  Confirmed: "bg-green-100 text-green-700 border-green-200",
  Rescheduled: "bg-orange-100 text-orange-700 border-orange-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Unknown: "bg-gray-100 text-gray-700 border-gray-200",
};

const callStatusColors = {
  Active: "text-green-600 bg-green-50", //meeting running
  Escalated: "text-blue-600 bg-blue-50", //priority
  Resolved: "text-purple-600 bg-purple-50", //completed
  Dropped: "text-orange-600 bg-orange-50", //disconnected
  Scheduled: "text-purple-600 bg-purple-50", //upcoming, not done
  Missed: "text-red-600 bg-red-50", //patient didn't joined
};



const Appointments = () => {
  const { userData } = useContext(AuthContext) || {};
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [callStatusModal, setCallStatusModal] = useState(false); // ✅ New
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointment, setAppointment] = useState([]);
  const [notes, setNotes] = useState("");
  const [confirmReschedule, setConfirmReschedule] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newCallStatus, setNewCallStatus] = useState(""); // ✅ New

  const [rescheduleTimezone, setRescheduleTimezone] = useState("Europe/London");

  const fetchAppointments = async () => {
    const res = await getAllappointments();
    const rawData = res?.payload?.filter(
      (i) => i?.clinicianId === Number(userData?.id),
    );
    console.log(rawData);
    setAppointment(rawData);
  };

  useEffect(() => {
    fetchAppointments();
  }, [userData?.id]);

  const closeModal = () => {
    setShowModal(false);
  };

  const closeRescheduleModal = () => {
    setRescheduleModal(false);
    setRescheduleTimezone("Europe/London"); // ✅ reset
  };

  const closeFeedBackModal = () => {
    setFeedbackModal(false);
  };

  // ✅ New: Close call status modal
  const closeCallStatusModal = () => {
    setCallStatusModal(false);
    setNewCallStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedAppointment?.tries >= 3) {
      alert(
        "This patient has already reached the maximum number of reschedules (3).",
      );
      return;
    }



    const payload = {
      userId: selectedAppointment?.userId,
      patientId: selectedAppointment?.patientId,
      time: appointmentDate
        ? convertToUTC(appointmentDate, rescheduleTimezone)
        : null,
      timezone: rescheduleTimezone,
      clinicianId: selectedAppointment?.clinicianId,
      status: "Rescheduled",
      metting_status: "Scheduled",
      tries: (selectedAppointment?.tries || 0) + 1,
    };

    await updateSchedule(selectedAppointment?.id, payload);
    setRescheduleModal(false);
    fetchAppointments();
  };


  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (selectedAppointment?.tries >= 3) {
  //     alert(
  //       "This patient has already reached the maximum number of reschedules (3).",
  //     );
  //     return;
  //   }

  //   const payload = {
  //     userId: selectedAppointment?.userId,
  //     patientId: selectedAppointment?.patientId,
  //     time: appointmentDate,
  //     clinicianId: selectedAppointment?.clinicianId,
  //     status: "Rescheduled",
  //     metting_status: "Scheduled",
  //     tries: (selectedAppointment?.tries || 0) + 1,
  //   };

  //   const result = await updateSchedule(selectedAppointment?.id, payload);

  //   setRescheduleModal(false);
  //   fetchAppointments();
  // };

 const handleSubmitFeedback = async (e) => {
   e.preventDefault();
   await updateAppointment(selectedAppointment?.id, { feedback: notes });

   setFeedbackModal(false);
   fetchAppointments();
 };

  // ✅ New: Update call status
  const handleUpdateCallStatus = async (e) => {
    e.preventDefault();

    const payload = {
      userId: selectedAppointment?.userId,
      patientId: selectedAppointment?.patientId,
      time: selectedAppointment?.time,
      clinicianId: selectedAppointment?.clinicianId,
      status: selectedAppointment?.status,
      metting_status: newCallStatus, // ✅ Updated call status
      tries: selectedAppointment?.tries,
    };

    try {
      await updateSchedule(selectedAppointment?.id, payload);
      alert("Call status updated successfully!");
      setCallStatusModal(false);
      setNewCallStatus("");
      fetchAppointments(); // ✅ Refresh data
    } catch (error) {
      alert("Failed to update call status");
      console.error(error);
    }
  };

  // Filter appointments
  const filteredAppointments = appointment?.filter((appt) => {
    const matchesSearch = appt.patient?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || appt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

 
  
  
  const handleMarkCompleted = async (appt) => {
    try {
      // if (appt.metting_status !== "Resolved") {
      //   alert("Complete the meeting first (set status to Resolved)");
      //   return;
      // }

      if (!appt.feedback || !appt.feedback.trim()) {
        toast("Please add feedback before completing");
        return;
      }

      const payload = {
        ...appt,
        status: "Completed", 
      };

      await updateSchedule(appt.id, payload);

      toast.success("Appointment marked as completed!");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast("Failed to update status");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 ">
      <Header
        title="Appointments"
        description="Manage your consultations, reschedule appointments, and track patient meetings"
      />
      <div className="p-6 mx-auto">
        {/* Filters and Search */}
        <div className=" flex justify-end  slate-200 mb-4 ">
          <div className="flex  gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 w-auto">
              <div className="relative">
                <IoFilter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none"
                  size={16}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Appointment Status
                  </th>
                  <th className="px-12 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Call Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Retries
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 py-6">
                {filteredAppointments?.map((appt) => (
                  <tr
                    key={appt.id}
                    className="hover:bg-slate-50 transition-colors  "
                  >
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white font-semibold text-sm">
                          {appt.patient?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "NA"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {appt.patient?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 ">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[appt.status] || statusColors.Unknown
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 ">
                      <p className="font-medium text-slate-900 text-xs">
                        {new Date(appt.time).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Europe/London",
                        })}
                      </p>
                    </td>
                    <td className="px-6 ">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          callStatusColors[appt.metting_status] ||
                          "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {appt.metting_status}
                      </span>
                    </td>
                    <td className="px-6  text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          appt.tries >= 3
                            ? "bg-red-100 text-red-700"
                            : appt.tries >= 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {appt.tries}
                      </span>
                    </td>
                    <td className="px-6 ">
                      <div className="flex justify-center items-center gap-2">
                        <a
                          href={appt.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Join Video Call"
                        >
                          <PiVideoCameraBold className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                        </a>

                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <IoEyeSharp className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                        </button>

                        {/* ✅ New: Update Call Status Button */}
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setNewCallStatus(appt.metting_status);
                            setCallStatusModal(true);
                          }}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                          title="Update Call Status"
                        >
                          <HiCheckCircle className="w-5 h-5 text-slate-600 group-hover:text-green-600" />
                        </button>

                        <button
                          onClick={() => {
                            if (appt.metting_status !== "Resolved") return;
                            setSelectedAppointment(appt);
                            setFeedbackModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors group ${
                            appt.metting_status === "Resolved"
                              ? "hover:bg-purple-50"
                              : "opacity-40 cursor-not-allowed"
                          }`}
                          title={
                            appt.metting_status === "Resolved"
                              ? "Add Feedback"
                              : "Complete meeting first to add feedback"
                          }
                          disabled={appt.metting_status !== "Resolved"}
                        >
                          <FaUserEdit
                            className={`w-5 h-5 ${
                              appt.metting_status === "Resolved"
                                ? "text-slate-600 group-hover:text-purple-600"
                                : "text-slate-400"
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => {
                            if (appt.tries >= 3) return;
                            setSelectedAppointment(appt);
                            setConfirmReschedule(true);
                          }}
                          className={`p-2 rounded-lg transition-colors group ${
                            appt.tries >= 3
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-orange-50"
                          }`}
                          title={
                            appt.tries >= 3
                              ? "Maximum reschedules reached"
                              : "Reschedule"
                          }
                          disabled={appt.tries >= 3}
                        >
                          <MdEditCalendar
                            className={`w-5 h-5 ${
                              appt.tries >= 3
                                ? "text-slate-400"
                                : "text-slate-600 group-hover:text-orange-600"
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => handleMarkCompleted(appt)}
                          className={`p-2 rounded-lg transition-colors group ${
                            appt.metting_status === "Resolved" && appt.feedback
                              ? "hover:bg-green-50"
                              : "opacity-40 cursor-not-allowed"
                          }`}
                          title={
                            appt.metting_status === "Resolved" && appt.feedback
                              ? "Mark as Completed"
                              : "Finish meeting & add feedback first"
                          }
                          disabled={
                            !(
                              appt.metting_status === "Resolved" &&
                              appt.feedback
                            )
                          }
                        >
                          <HiCheckCircle className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAppointments?.length === 0 && (
              <div className="text-center py-12">
                <IoCalendarSharp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  No appointments found
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Reschedule Modal */}
        {selectedAppointment && (
          <Modal
            classname="w-[90vw] md:w-[28vw]"
            isOpen={confirmReschedule}
            closeModal={() => setConfirmReschedule(false)}
            title="Confirm Reschedule"
          >
            <div className="text-sm text-slate-700 space-y-4">
              <p>Are you sure you want to reschedule this appointment?</p>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  onClick={() => setConfirmReschedule(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all"
                  onClick={() => {
                    setConfirmReschedule(false);
                    setRescheduleModal(true);
                  }}
                >
                  Yes, Reschedule
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* View Details Modal */}
        {selectedAppointment && (
          <Modal
            classname="w-[45vw] max-h-[70vh]"
            isOpen={showModal}
            closeModal={closeModal}
            title={
              <div className="flex items-center justify-between gap-4 w-full pr-8">
                <span>Appointment Details</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    statusColors[selectedAppointment.status]
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
            }
          >
            <div className="space-y-2">
              <div className="px-4 py-2 bg-slate-50 rounded-lg flex items-center gap-4 w-full">
                <p className="text-sm text-slate-600 mb-1">Patient Name</p>
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.displayName}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Call Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      callStatusColors[selectedAppointment.metting_status]
                    }`}
                  >
                    {selectedAppointment.metting_status}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Date & Time</p>
                  <p className="font-medium text-slate-900 text-sm">
                    {new Date(selectedAppointment.time).toLocaleString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Europe/London",
                      },
                    )}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">
                    Number of Retries
                  </p>
                  <p className="font-semibold text-slate-900">
                    {selectedAppointment.tries}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Diagnosis</p>
                <p className="text-slate-900">
                  {selectedAppointment.diagnosis ?? "N/A"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Notes</p>
                <p className="text-slate-900">
                  {selectedAppointment.notes_from_review ?? "N/A"}
                </p>
              </div>
            </div>
          </Modal>
        )}

        {/* Reschedule Modal */}
        {selectedAppointment && (
          <Modal
            classname="w-[90vw] md:w-[32vw]"
            isOpen={rescheduleModal}
            closeModal={closeRescheduleModal}
            title="Reschedule Appointment"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timezone
                </label>
                <select
                  value={rescheduleTimezone}
                  onChange={(e) => setRescheduleTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg 
                     bg-slate-50 text-sm focus:outline-none 
                     focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Europe/London">UK Time — auto GMT/BST</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select New Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {selectedAppointment?.tries >= 2 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ Warning: This appointment has been rescheduled{" "}
                    {selectedAppointment.tries} time(s). Maximum limit is 3.
                  </p>
                </div>
              )}

              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-3 font-medium shadow-sm transition-all"
                type="submit"
              >
                Confirm Reschedule
              </button>
            </form>
          </Modal>
        )}

        {/* ✅ New: Call Status Update Modal */}
        {selectedAppointment && (
          <Modal
            classname="w-[90vw] md:w-[32vw]"
            isOpen={callStatusModal}
            closeModal={closeCallStatusModal}
            title="Update Call Status"
          >
            <form onSubmit={handleUpdateCallStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Call Status
                </label>
                <select
                  value={newCallStatus}
                  onChange={(e) => setNewCallStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Status --</option>
                  <option value="Scheduled">Scheduled (Upcoming)</option>
                  <option value="Active">Active (Meeting Running)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                  <option value="Missed">Missed (Patient didn't join)</option>
                  <option value="Dropped">Dropped (Disconnected)</option>
                  <option value="Escalated">Escalated (Priority)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong>{" "}
                  {selectedAppointment.metting_status}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeCallStatusModal}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-3 font-medium shadow-sm transition-all"
                  type="submit"
                >
                  Update Status
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Feedback Modal */}
        {selectedAppointment && (
          <Modal
            classname="w-[65vw] lg:w-[34vw] h-auto"
            isOpen={feedbackModal}
            closeModal={closeFeedBackModal}
            title="Post Appointment Feedback"
          >
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block font-medium text-sm text-slate-700 mb-2">
                  Clinician Notes Post Consultation
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-36 rounded-lg border border-slate-200 p-4 bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter your notes here..."
                />
              </div>

              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-3 font-medium shadow-sm transition-all"
                type="submit"
              >
                Submit Feedback
              </button>
            </form>
          </Modal>
        )}
      </div>{" "}
    </div>
  );
};

export default Appointments;
