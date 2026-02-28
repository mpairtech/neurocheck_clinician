import Header from "../../components/ui-reusable/Header";
import AssessmentCard from "../../components/ui-reusable/AssesmentCard";
import { useContext, useEffect, useState } from "react";
import RatingModal from "../../components/RatingModal";
import SubmissionDetails from "../../components/SubmissionDetails";
import { getAllsubmissions, updateStatus } from "../../api/assessment";
import { AuthContext } from "../../Provider/AuthProvider";
import { FaSearch } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { IoFilter } from "react-icons/io5";
import AssessmentDetails from "./AssessmentDetails";



const AssessmentList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [submission, setSubmission] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { userData } = useContext(AuthContext) || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleSubmitRating = () => {
    setIsRateModalOpen(false);
  };

  const handleView = (item) => {
    setSelectedSubmission(item);
    setIsModalOpen(true);
  };

  const handleViewRate = (id) => {
    setSelectedId(id);
    setIsRateModalOpen(true);
  };

  const handleAccept = async (id) => {
    const obj = {
      status: "accepted",
      clinicianId: Number(userData?.id),
    };

    const result = await updateStatus(id, obj);
    alert("Accepted");
    fetchSubmissions();
  };

  const handleDecline = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to decline this case?",
    );
    if (!confirmed) return;

    const obj = {
      status: "rejected",
      clinicianId: Number(userData?.id),
    };

    const result = await updateStatus(id, obj);
    alert("Case declined");
    fetchSubmissions();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const fetchSubmissions = async () => {
    const res = await getAllsubmissions();

    console.log("Total from API:", res?.payload?.length); 
    console.log("My clinicianId:", userData?.id);
    console.log("All clinicianIds:", res?.payload?.map((i) => i?.clinicianId),); 

    // const rawData = res?.payload?.filter(
    //   (i) =>
    //     i?.assessment?.type === "premium" &&
    //     i?.clinicianId === Number(userData?.id),
    // );

    const rawData = res?.payload?.filter(
      (i) =>
        i?.assessment?.type === "premium" &&
        // ["accepted", "completed"].includes(i?.status) &&
        i?.clinicianId === Number(userData?.id),
    );

    const grouped = Object?.values(
      rawData?.reduce((acc, item) => {
        const key = `${item.patientId}-${item.assessmentId}-${item.userId}`;

        if (!acc[key]) {
          acc[key] = {
            id: item?.id,
            status: item?.status,
            ratings: item?.ratings,
            patientId: item?.patientId,
            assessmentId: item?.assessmentId,
            userId: item?.userId,
            patient: item?.patient,
            assessment: item?.assessment,
            user: item?.user,
            summaries: [],
          };
        }

        acc[key].summaries.push({
          questionType: item.questionType,
          summary: item.summary,
        });

        return acc;
      }, {}),
    );
    console.log("submission", grouped);

    setSubmission(grouped);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter submissions
  const filteredSubmissions = submission?.filter((item) => {
    const matchesSearch = item.patient?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 ">
      <Header
        title="Assessment Queue"
        description="Review patient assessments, provide ratings, and accept cases for consultation"
      />

      <div className="p-4">
     

      {/* Filters and Search */}
      <div className=" flex justify-end px-5 ">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 ">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 w-auto">
            <div className="relative">
              <IoFilter
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none"
                size={16}
              />
            </div>
            <select
              value={filterStatus} // ✅ Add this
              onChange={(e) => setFilterStatus(e.target.value)} // ✅ Add this
              className="pl-10 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option> 
              <option value="completed">Completed</option> 
              <option value="pending">Pending</option> 
              <option value="rejected">Rejected</option> 
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Assessment Cards */}
        <div className="space-y-4">
          {filteredSubmissions?.length > 0 ? (
            filteredSubmissions?.map((item, index) => (
              <AssessmentCard
                key={index}
                patientId={item?.patientId}
                assessmentId={item?.assessmentId}
                name={item?.patient?.name}
                age={item?.patient?.dateOfBirth}
                image={item?.patient?.image}
                timeAgo={item?.assessment?.createdAt}
                status={item?.status}
                ratings={item?.ratings}
                childCondition={item?.assessment?.name}
                description={item?.assessment?.description}
                onViewFullAssessment={() => handleView(item)}
                onRateSummary={() => handleViewRate(item?.id)}
                onAcceptCase={() => handleAccept(item?.id)}
                onDeclineCase={() => handleDecline(item?.id)}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">No assessments found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedSubmission && (
        <AssessmentDetails
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          patientId={selectedSubmission?.patientId}
          time={selectedSubmission?.assessment?.createdAt}
          score={selectedSubmission?.score}
          assessmentId={selectedSubmission?.assessmentId}
        />
      )}

      <RatingModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onSubmit={handleSubmitRating}
        maxStars={5}
        selectedId={selectedId}
        initialRating={0}
        />
        </div>
    </div>
  );
};

export default AssessmentList;