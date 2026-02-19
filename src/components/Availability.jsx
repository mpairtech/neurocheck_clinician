 import {
  addClinicianAvailabilty,
  getCinicianAvailabilityById,
  updateClinicianAvailability, 
} from "../api/user";
import { AuthContext } from "../Provider/AuthProvider";
import { useContext, useEffect, useState } from "react";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const Availability = () => {
  const { userData } = useContext(AuthContext) || {};
  const [availabilityType, setAvailabilityType] = useState("Select");
  const [timeSlots, setTimeSlots] = useState([
    { day: "Saturday", start: "", end: "" },
  ]);
  const [availability, setAvailability] = useState([]);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ day: "", time: "", endTime: "" });

  const availabilityTypes = ["Select", "All day", "Specific day"];
  const days = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const formatTime = (t) => {
    if (!t) return "";
    if (t.length === 8) return t;
    return t + ":00";
  };

  // time "09:00:00" → "09:00" (input type=time এর জন্য)
  const toInputTime = (t) => {
    if (!t) return "";
    return t.slice(0, 5);
  };

  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { day: "Saturday", start: "", end: "" }]);
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const getAvailability = async () => {
    const data = await getCinicianAvailabilityById(userData?.id);
    setAvailability(data?.payload);
  };

  useEffect(() => {
    getAvailability();
  }, [userData?.id]);

  const handleAddLeave = async () => {
    if (!userData?.id) return;
    if (availabilityType === "Select") {
      alert("Select availability type");
      return;
    }

    const validSlots = timeSlots.filter((slot) => slot.start && slot.end);
    if (validSlots.length === 0) {
      alert("Select time first");
      return;
    }

    const payload = validSlots.map((slot) => ({
      availabilityType:
        availabilityType === "All day" ? "all_day" : "specific_day",
      day: slot.day,
      time: slot.start + ":00",
      endTime: slot.end + ":00",
      userId: String(userData.id),
    }));

    const result = await addClinicianAvailabilty(payload);
    console.log(result);
    getAvailability();
    setAvailabilityType("Select");
    setTimeSlots([{ day: "Saturday", start: "", end: "" }]);
  };

  // ── Edit handlers ──
  const handleEditClick = (leave) => {
    setEditingId(leave.id);
    setEditRow({
      day: leave.day,
      time: toInputTime(leave.time),
      endTime: toInputTime(leave.endTime),
    });
  };

  const handleEditChange = (field, value) => {
    setEditRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async (leave) => {
    const payload = {
      availabilityType: leave.availabilityType,
      day: editRow.day,
      time: formatTime(editRow.time),
      endTime: formatTime(editRow.endTime),
      userId: String(userData.id),
    };

    const result = await updateClinicianAvailability(leave.id, payload);
    console.log("Update result:", result);
    setEditingId(null);
    getAvailability();
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditRow({ day: "", time: "", endTime: "" });
  };

  return (
    <div className="w-full flex flex-row gap-20 px-8">
      {/* Left - Add form (same as before) */}
      <div className="w-1/3 flex flex-col gap-4 space-y-4">
        <div>
          <label className="block mb-4 text-[#5A5A5A] font-semibold text-sm text-start">
            Availability type
          </label>
          <select
            className="w-full border outline-none text-sm text-[#5A5A5A] border-[#E1E1E1] rounded p-2"
            value={availabilityType}
            onChange={(e) => setAvailabilityType(e.target.value)}
          >
            {availabilityTypes.map((type) => (
              <option className="text-xs" key={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {(availabilityType === "All day" ||
          availabilityType === "Specific day") &&
          timeSlots.map((slot, index) => (
            <div key={index} className="flex gap-2">
              {availabilityType === "Specific day" && (
                <select
                  className="border text-sm text-[#5A5A5A] outline-none border-[#E1E1E1] rounded p-2"
                  value={slot.day}
                  onChange={(e) =>
                    handleSlotChange(index, "day", e.target.value)
                  }
                >
                  {days.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              )}
              <input
                type="time"
                step="60"
                className="flex-1 min-w-32 border text-sm text-[#5A5A5A] outline-none border-[#E1E1E1] rounded p-2"
                value={slot.start}
                onChange={(e) =>
                  handleSlotChange(index, "start", e.target.value)
                }
              />
              <input
                type="time"
                step="60"
                className="flex-1 min-w-32 border text-sm text-[#5A5A5A] outline-none border-[#E1E1E1] rounded p-2"
                value={slot.end}
                onChange={(e) => handleSlotChange(index, "end", e.target.value)}
              />
              {availabilityType === "Specific day" &&
                index === timeSlots.length - 1 && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-[#E1E1E1] rounded bg-gray-100 hover:bg-gray-200"
                    onClick={handleAddSlot}
                  >
                    +
                  </button>
                )}
            </div>
          ))}

        <div className="flex justify-center">
          <button
            type="button"
            className="bg-[#0A4863] text-sm w-full text-white p-2 rounded-4xl"
            onClick={handleAddLeave}
          >
            Add Availability
          </button>
        </div>
      </div>

      {/* Right - Table with inline edit */}
      <div className="w-2/3 mt-[4.5rem] flex justify-center">
        {availability?.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <table className="min-w-full border border-[#E1E1E1] text-sm">
            <thead className="bg-gray-50 text-[#5A5A5A] font-semibold">
              <tr>
                <th className="p-2 border border-[#E1E1E1]">Day</th>
                <th className="p-2 border border-[#E1E1E1]">Start</th>
                <th className="p-2 border border-[#E1E1E1]">End</th>
                <th className="p-2 border border-[#E1E1E1]">Action</th>
              </tr>
            </thead>
            <tbody>
              {availability?.map((leave) =>
                editingId === leave.id ? (
                  // ── Editing Row ──
                  <tr
                    key={leave.id}
                    className="border-t border-[#E1E1E1] bg-blue-50"
                  >
                    <td className="p-2 border border-[#E1E1E1]">
                      <select
                        className="border border-[#E1E1E1] rounded p-1 text-sm outline-none"
                        value={editRow.day}
                        onChange={(e) =>
                          handleEditChange("day", e.target.value)
                        }
                      >
                        {days.map((day) => (
                          <option key={day}>{day}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border border-[#E1E1E1]">
                      <input
                        type="time"
                        step="60"
                        className="border border-[#E1E1E1] rounded p-1 text-sm outline-none"
                        value={editRow.time}
                        onChange={(e) =>
                          handleEditChange("time", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 border border-[#E1E1E1]">
                      <input
                        type="time"
                        step="60"
                        className="border border-[#E1E1E1] rounded p-1 text-sm outline-none"
                        value={editRow.endTime}
                        onChange={(e) =>
                          handleEditChange("endTime", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 border border-[#E1E1E1]">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditSave(leave)}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Save"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-red-400 hover:text-red-600 transition"
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // ── Normal Row ──
                  <tr
                    key={leave.id}
                    className="border-t border-[#E1E1E1] hover:bg-gray-50"
                  >
                    <td className="p-2 border border-[#E1E1E1]">{leave.day}</td>
                    <td className="p-2 border border-[#E1E1E1]">
                      {leave.time}
                    </td>
                    <td className="p-2 border border-[#E1E1E1]">
                      {leave.endTime}
                    </td>
                    <td className="p-2 border border-[#E1E1E1] text-center">
                      <button
                        onClick={() => handleEditClick(leave)}
                        className="text-[#0A4863] hover:text-blue-800 transition"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Availability;
