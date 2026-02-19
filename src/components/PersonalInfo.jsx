

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, updateUserProfile } from "../api/user";
import { AuthContext } from "../Provider/AuthProvider";
import p1 from "../../public/svg/placeholder.png";
import {
  FaEdit,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCertificate,
  FaIdCard,
  FaTimes,
  FaSave,
  FaKey,
} from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import ChangePassword from "./Authentication/ChangePassword";


  // Reusable input field for the modal
const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    />
  </div>
);


const PersonalInfo = () => {
  const { userData, setUserData } = useContext(AuthContext) || {};
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Edit Profile States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userData?.id) {
        try {
          setLoading(true);
          const response = await getUserById(userData.id);
          setUserProfile(response?.payload || response);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserProfile();
  }, [userData?.id]);

  // Prefill form when modal opens
  const handleOpenEdit = () => {
    setEditForm({
      name: userData?.name || "",
      phone: userData?.phone || "",
      practiceName: userData?.practiceName || "",
      hcpcTitle: userData?.hcpcTitle || "",
      regNo: userData?.regNo || "",
      certification: userData?.certification || "",
      street: userData?.street || "",
      postCode: userData?.postCode || "",
      state: userData?.state || "",
      country: userData?.country || "",
    });
    setUpdateError("");
    setUpdateSuccess(false);
    setShowEditProfile(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      const response = await updateUserProfile(userData.id, editForm);
      if (response?.success || response?.payload) {
        setUpdateSuccess(true);
        // Update context so UI reflects changes immediately
        if (setUserData) {
          setUserData((prev) => ({ ...prev, ...editForm }));
        }
        setTimeout(() => {
          setShowEditProfile(false);
          setUpdateSuccess(false);
        }, 1200);
      } else {
        setUpdateError(response?.message || "Update failed. Please try again.");
      }
    } catch (error) {
      setUpdateError("Something went wrong. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <p className="text-slate-600">No profile data found</p>
        </div>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-600 font-medium">{label}</p>
        <p className="text-slate-900 mt-1">{value || "Not provided"}</p>
      </div>
    </div>
  );



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-8">
      <div className="mx-auto pb-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={userData.image || p1} alt="" className="h-14 w-auto" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {userData.name}
                </h2>
                <p className="text-slate-600 text-xs">{userData.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
              >
                <FaEdit size={14} />
                Edit Profile
              </button>

              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-all"
              >
                <FaKey size={14} />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Personal Details
            </h3>
            <div className="space-y-3">
              <InfoRow icon={FaUser} label="Full Name" value={userData.name} />
              <InfoRow
                icon={FaEnvelope}
                label="Email Address"
                value={userData.email}
              />
              <InfoRow
                icon={FaPhone}
                label="Phone Number"
                value={userData.phone}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaCertificate className="text-blue-600" />
              Professional Details
            </h3>
            <div className="space-y-3">
              <InfoRow
                icon={FaIdCard}
                label="Practice Name"
                value={userData.practiceName}
              />
              <InfoRow
                icon={FaCertificate}
                label="HCPC Title"
                value={userData.hcpcTitle}
              />
              <InfoRow
                icon={FaIdCard}
                label="Registration Number"
                value={userData.regNo}
              />
              <InfoRow
                icon={FaCertificate}
                label="Certification"
                value={userData.certification}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={FaMapMarkerAlt}
                label="Street"
                value={userData.street}
              />
              <InfoRow
                icon={FaMapMarkerAlt}
                label="Post Code"
                value={userData.postCode}
              />
              <InfoRow
                icon={FaMapMarkerAlt}
                label="State"
                value={userData.state}
              />
              <InfoRow
                icon={FaMapMarkerAlt}
                label="Country"
                value={userData.country}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Modal ─── */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-center pt-6 pb-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl z-10  ">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Profile
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal and professional information
                </p>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 absolute top-6 right-4"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {/* Personal Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> Personal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                  />
                  {/* <InputField label="Full Name" name="name" /> */}

                  <InputField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Professional Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FaCertificate className="text-blue-500" /> Professional
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Practice Name"
                    name="practiceName"
                    value={editForm.practiceName}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="HCPC Title"
                    name="hcpcTitle"
                    value={editForm.hcpcTitle}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Registration Number"
                    name="regNo"
                    value={editForm.regNo}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Certification"
                    name="certification"
                    value={editForm.certification}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Address Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" /> Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Street" name="street" />
                  <InputField label="Post Code" name="postCode" />
                  <InputField label="State" name="state" />
                  <InputField label="Country" name="country" />
                </div>
              </div>

              {/* Feedback messages */}
              {updateError && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  {updateError}
                </p>
              )}
              {updateSuccess && (
                <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <IoCheckmark size={14} /> Profile updated successfully!
                </p>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Change Password Modal (existing) ─── */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <ChangePassword onClose={() => setShowChangePassword(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
