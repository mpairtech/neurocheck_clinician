import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import StatsSection from "../../components/Dashboard/StatsSection";
import AppointmentSection from "../../components/Dashboard/AppointmentSection";
import Insights from "../../components/Dashboard/Insights";

const Dashboard = () => {
  const { userData, handleLogout } = useContext(AuthContext) || {};
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const navigate = useNavigate();
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const [stats, setStats] = useState({
    pendingReviews: 0,
    upcomingAppointments: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    monthlyAssessments: 0,
    totalAssessments: 0,
    completedToday: 0,
    avgResponseTime: "0h",
  });

  
  useEffect(() => {
    // Mock data - Replace with actual API calls
    setStats({
      pendingReviews: 4,
      upcomingAppointments: 3,
      monthlyEarnings: 1,
      totalEarnings: 15420,
      monthlyAssessments: 12,
      totalAssessments: 65,
      completedToday: 2,
      avgResponseTime: "2.5h",
    });

  
   
  }, []);

  

  // Close tooltip on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  // const handleLogoutClick = () => {
  //   //console.log("Logging out...");
  //   setShowTooltip(false);
  //   localStorage.removeItem("accessToken");
  //   navigation.replace("/signin");
  // };
const handleLogoutClick = () => {
  handleLogout();
  setShowTooltip(false);
  localStorage.removeItem("accessToken");
  navigate("/signin", { replace: true });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <DashboardHeader
        userData={userData}
        stats={stats}
        onLogout={handleLogoutClick}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <StatsSection stats={stats} />
        <AppointmentSection
          recentSubmissions={recentSubmissions}
          upcomingAppointments={upcomingAppointments}
          onReviewClick={(item) => navigate(`/assessment/${item.id}`)}
          onJoinCall={(apt) => window.open(apt.link, "_blank")}
        />

        <Insights stats={stats} />
      </div>
    </div>
  );
};;

export default Dashboard;

