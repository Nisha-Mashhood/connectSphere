import { Card, CardBody } from "@nextui-org/react";
import { FaUsers, FaUserTie, FaMoneyBillWave, FaHandshake } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  statsData: {
    totalUsers: number;
    totalMentors: number;
    totalRevenue: number;
    pendingRequests: number;
    activeCollaborations: number;
  };
}

export const DashboardStats = ({ statsData }: Props) => {
  const navigate = useNavigate();

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card className="w-full bg-white shadow-md hover:shadow-lg cursor-pointer" onClick={onClick}>
      <CardBody className="flex flex-row items-center p-4">
        <div className="p-3 rounded-full mr-4 text-white" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Total Users"
        value={statsData.totalUsers}
        icon={<FaUsers size={20} />}
        color="#8884d8"
        onClick={() => navigate("/admin/user")}
      />

      <StatCard
        title="Total Mentors"
        value={statsData.totalMentors}
        icon={<FaUserTie size={20} />}
        color="#82ca9d"
        onClick={() => navigate("/admin/mentormange")}
      />

      <StatCard
        title="Total Revenue"
        value={`₹${statsData.totalRevenue.toLocaleString()}`}
        icon={<FaMoneyBillWave size={20} />}
        color="#ffc658"
        onClick={() => navigate("/admin/sales-report")}
      />

      <StatCard
        title="Pending Requests"
        value={statsData.pendingRequests}
        icon={<FaUserTie size={20} />}
        color="#ff8042"
        onClick={() => navigate("/admin/mentormange")}
      />

      <StatCard
        title="Active Collaborations"
        value={statsData.activeCollaborations}
        icon={<FaHandshake size={20} />}
        color="#0088FE"
        onClick={() => navigate("/admin/userMentorManagemnt")}
      />
    </div>
  );
};