import { useState } from "react";
import { Spinner, Card, CardBody } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useAdminDashboardData } from "../../Hooks/Admin/useAdminDashboard";
import { DashboardStats } from "./AdminDasboard/DashboardStats";
import { DashboardTimeControls } from "./AdminDasboard/DashboardTimeControls";
import { DashboardCharts } from "./AdminDasboard/DashboardCharts";
import { DashboardLists } from "./AdminDasboard/DashboardLists";


const AdminDashboard = () => {
  const { currentAdmin } = useSelector((state: RootState) => state.user);

  const [timeRange, setTimeRange] = useState("30");
  const [timeFormat, setTimeFormat] = useState("daily");

  const {
    isLoading,
    statsData,
    revenueTrends,
    userGrowth,
    pendingMentors,
    topMentors,
    recentCollaborations
  } = useAdminDashboardData(timeFormat, timeRange);

  return (
    <div className="bg-gray-50">
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white mb-6">
        <CardBody className="py-5">
          <h1 className="text-2xl font-bold">Welcome back, {currentAdmin?.name || "Admin"}!</h1>
          <p>Your dashboard insights are ready.</p>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="secondary" />
        </div>
      ) : (
        <>
          <DashboardStats statsData={statsData} />

          <DashboardTimeControls
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            timeFormat={timeFormat}
            setTimeFormat={setTimeFormat}
          />

          <DashboardCharts revenueTrends={revenueTrends} userGrowth={userGrowth} />

          <DashboardLists
            pendingMentors={pendingMentors}
            topMentors={topMentors}
            recentCollaborations={recentCollaborations}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;