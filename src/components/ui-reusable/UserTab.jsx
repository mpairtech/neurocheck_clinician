import { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { getUserById } from "../../api/user";
import { AuthContext } from "../../Provider/AuthProvider";

const UserTab = ({ tabs, selected, setSelected, title, description }) => {
  const { userData } = useContext(AuthContext) || {};
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userData?.id) {
        setLoading(true);
        try {
          const response = await getUserById(userData.id);
          setUserDetails(response?.payload || response);
          console.log("User Details:", response);
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, [userData?.id]);

  return (
    <div className="relative ">
      <div className="fixed top-0 w-[84vw] z-0 bg-white shadow-sm">
        <Header title={title} description={description} />
      </div>
      {/* Optional: Display user info */}
      {/* {userDetails && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700">
            Logged in as:{" "}
            <span className="font-semibold">
              {userDetails.name || userDetails.email}
            </span>
          </p>
        </div>
      )} */}
      <div className="pt-6 pb-2 mt-[12vh]">
        <div className="flex flex-row items-center gap-12 border-b border-[#E0E0E0] px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelected(tab)}
              className={`pb-2 text-xs cursor-pointer font-medium transition-colors duration-200 ${
                selected === tab
                  ? "text-[#0A6876] cursor-pointer border-b-2 border-[#0A6876]"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTab;
