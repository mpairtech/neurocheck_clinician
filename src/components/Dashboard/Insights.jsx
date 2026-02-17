
const Insights = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Monthly Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Monthly Performance</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Assessments</span>
              <span className="font-medium">{stats.monthlyAssessments}/15</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(stats.monthlyAssessments / 15) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Response Time</span>
              <span className="font-medium text-green-600">Excellent</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          {/* <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Patient Satisfaction</span>
              <span className="font-medium">4.8/5.0</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: "96%" }}></div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Assessment Category */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Assessments Category</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">ADHD Assessments</span>
            <span className="text-sm font-semibold">42%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Anxiety Reviews</span>
            <span className="text-sm font-semibold">28%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Depression Screens</span>
            <span className="text-sm font-semibold">18%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Other</span>
            <span className="text-sm font-semibold">12%</span>
          </div>
        </div>
      </div>

      {/* Total Earnings */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <h3 className="font-semibold mb-2">Total Earnings</h3>
       <p className="text-4xl text-white font-semibold ">Coming Soon</p>
        {/* <p className="text-3xl font-bold mb-4">£{stats.totalEarnings.toLocaleString()}</p>
        <div className="space-y-2 text-sm opacity-90">
          <div className="flex justify-between">
            <span>This Month</span>
            <span className="font-semibold">£{stats.monthlyEarnings}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Patients</span>
            <span className="font-semibold">{stats.totalAssessments}</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Insights;