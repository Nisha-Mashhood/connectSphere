import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaChartLine, FaUsers, FaMoneyBillWave, FaUserTie, FaHandshake, FaCalendarAlt, FaChevronDown, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { 
  getTotalUsersCount, 
  getTotalMentorsCount, 
  getTotalRevenue, 
  getPendingMentorRequestsCount, 
  getActiveCollaborationsCount, 
  getRevenueTrends, 
  getUserGrowth, 
  getPendingMentorRequests,
  getTopMentors,
  getRecentCollaborations
} from '../../Service/Admin.Service';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useSelector((state: RootState) => state.user);
  
  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalRevenue: 0,
    pendingRequests: 0,
    activeCollaborations: 0
  });
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [recentCollaborations, setRecentCollaborations] = useState([]);

  // Filter states
  const [timeRange, setTimeRange] = useState('30');
  const [timeFormat, setTimeFormat] = useState('daily');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [
        users,
        mentors,
        revenue,
        pendingReqs,
        activeCollab,
        revData,
        growthData,
        pendingMentorsList,
        topMentorsList,
        recentCollabsList
      ] = await Promise.all([
        getTotalUsersCount(),
        getTotalMentorsCount(),
        getTotalRevenue(),
        getPendingMentorRequestsCount(),
        getActiveCollaborationsCount(),
        getRevenueTrends(timeFormat, timeRange),
        getUserGrowth(timeFormat, timeRange),
        getPendingMentorRequests(5), // Limit to 5
        getTopMentors(5), // Limit to 5
        getRecentCollaborations(5) // Limit to 5
      ]);

      console.log("users : ",users);
      console.log("mentors : ",mentors);
      console.log("revenue : ",revenue);
      console.log("pendingReqs : ",pendingReqs);
      console.log("activeCollab : ",activeCollab);
      console.log("revData : ",revData);
      console.log("growthData : ",growthData);
      console.log("pendingMentorsList : ",pendingMentorsList);
      console.log("topMentorsList : ",topMentorsList);
      console.log("recentCollabsList : ",recentCollabsList);
     
      setStatsData({
        totalUsers: users?.totalUsers || 0,
        totalMentors: mentors?.totalMentors || 0,
        totalRevenue: revenue?.totalRevenue || 0,
        pendingRequests: pendingReqs?.pendingMentorRequests || 0,
        activeCollaborations: activeCollab?.activeCollaborations || 0
      });

      //for graph
      const formattedRevenueTrends = revData && revData.length > 0 
        ? revData.map(item => ({
            date: item.name,
            amount: item.totalRevenue
          }))
        : [];
      setRevenueTrends(formattedRevenueTrends);
      
      //for graph
      setUserGrowth(growthData || []);
      
          //pending mentor list
      const formattedPendingMentors = pendingMentorsList && pendingMentorsList.length > 0
        ? pendingMentorsList.map(mentor => ({
            name: mentor.userId.name || 'Unknown',
            email: mentor.userId.email || 'No email',
            requestId: mentor._id
          }))
        : [];
      setPendingMentors(formattedPendingMentors);
      
      //top mentors
      const formattedTopMentors = topMentorsList && topMentorsList.length > 0
        ? topMentorsList.map(mentor => ({
            name: mentor.name || 'Unknown',
            sessionCount: mentor.collaborationCount || 0,
            rating: mentor.rating || 4.5,
            userId: mentor._id
          }))
        : [];
      setTopMentors(formattedTopMentors);
      
      // Format recent collaborations
      const formattedCollabs = recentCollabsList && recentCollabsList.length > 0
        ? recentCollabsList.map(collab => ({
            mentorName: collab.mentorId?.userId?.name || 'Unknown Mentor',
            userName: collab.userId?.name || 'Unknown User',
            skill: collab.skill || 'General Mentoring',
            startDate: collab.createdAt || new Date().toISOString(),
            collabId: collab._id
          }))
        : [];
      setRecentCollaborations(formattedCollabs);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  },[timeFormat, timeRange])

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  

  // Stats Card Component
  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardBody className="flex flex-row items-center p-4">
        <div className={`p-3 rounded-full mr-4 text-white`} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardBody>
    </Card>
  );

  // Generate stats cards
  const renderStatsCards = () => (
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
        value={statsData.totalMentors.toLocaleString()} 
        icon={<FaUserTie size={20} />} 
        color="#82ca9d" 
        onClick={() => navigate("/admin/mentormange")}
      />
      <StatCard 
        title="Total Revenue" 
        value={`$${statsData.totalRevenue.toLocaleString()}`} 
        icon={<FaMoneyBillWave size={20} />} 
        color="#ffc658" 
        onClick={() => {}}
      />
      <StatCard 
        title="Pending Requests" 
        value={statsData.pendingRequests.toLocaleString()} 
        icon={<FaUserTie size={20} />} 
        color="#ff8042" 
        onClick={() => navigate("/admin/mentormange")}
      />
      <StatCard 
        title="Active Collaborations" 
        value={statsData.activeCollaborations.toLocaleString()} 
        icon={<FaHandshake size={20} />} 
        color="#0088FE" 
        onClick={() => navigate("/admin/userMentorManagemnt")}
      />
    </div>
  );

  // Time filter controls
  const renderTimeControls = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            endContent={<FaChevronDown />}
            startContent={<FaCalendarAlt />}
          >
            {timeRange === '7' ? 'Last 7 days' : 
             timeRange === '30' ? 'Last 30 days' : 
             timeRange === '90' ? 'Last 90 days' : 'Last 12 months'}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Time range selection"
          onAction={(key) => setTimeRange(key.toString())}
        >
          <DropdownItem key="7">Last 7 days</DropdownItem>
          <DropdownItem key="30">Last 30 days</DropdownItem>
          <DropdownItem key="90">Last 90 days</DropdownItem>
          <DropdownItem key="365">Last 12 months</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            endContent={<FaChevronDown />}
            startContent={<FaChartLine />}
          >
            {timeFormat === 'daily' ? 'Daily' : 
             timeFormat === 'weekly' ? 'Weekly' : 'Monthly'}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Time format selection"
          onAction={(key) => setTimeFormat(key.toString())}
        >
          <DropdownItem key="daily">Daily</DropdownItem>
          <DropdownItem key="weekly">Weekly</DropdownItem>
          <DropdownItem key="monthly">Monthly</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Charts section
  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Revenue Trends Chart */}
      <Card className="w-full bg-white shadow-md">
        <CardHeader className="pb-0 flex justify-between items-center">
          <h4 className="text-lg font-semibold">Revenue Trends</h4>
        </CardHeader>
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Revenue" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* User Growth Chart */}
      <Card className="w-full bg-white shadow-md">
        <CardHeader className="pb-0 flex justify-between items-center">
          <h4 className="text-lg font-semibold">User Growth</h4>
        </CardHeader>
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#82ca9d" name="New Users" />
                <Bar dataKey="mentors" fill="#8884d8" name="New Mentors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Lists section
  const renderLists = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Mentor Requests */}
      <Card className="w-full bg-white shadow-md">
        <CardHeader className="pb-0 flex justify-between items-center">
          <h4 className="text-lg font-semibold">Pending Mentor Requests</h4>
          <Button
            size="sm"
            color="primary"
            variant="light"
            endContent={<FaArrowRight />}
            onPress={() => navigate("/admin/mentormange")}
          >
            View All
          </Button>
        </CardHeader>
        <CardBody>
          {pendingMentors.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {pendingMentors.map((mentor, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mentor.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {mentor.email}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      color="primary"
                      onPress={() => navigate(`/admin/request/${mentor.requestId}`)}
                    >
                      Review
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No pending requests</p>
          )}
        </CardBody>
      </Card>

      {/* Top Mentors */}
      <Card className="w-full bg-white shadow-md">
        <CardHeader className="pb-0 flex justify-between items-center">
          <h4 className="text-lg font-semibold">Top Mentors</h4>
          <Button
            size="sm"
            color="primary"
            variant="light"
            endContent={<FaArrowRight />}
            onPress={() => navigate("/admin/mentormange")}
          >
            View All
          </Button>
        </CardHeader>
        <CardBody>
          {topMentors.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {topMentors.map((mentor, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mentor.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Sessions: {mentor.sessionCount} | Rating: {mentor.rating}/5
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      color="primary"
                      variant="light"
                      onPress={() => navigate(`/admin/users/${mentor.userId}`)}
                    >
                      View
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No mentors found</p>
          )}
        </CardBody>
      </Card>

      {/* Recent Collaborations */}
      <Card className="w-full bg-white shadow-md">
        <CardHeader className="pb-0 flex justify-between items-center">
          <h4 className="text-lg font-semibold">Recent Collaborations</h4>
          <Button
            size="sm"
            color="primary"
            variant="light"
            endContent={<FaArrowRight />}
            onPress={() => navigate("/admin/userMentorManagemnt")}
          >
            View All
          </Button>
        </CardHeader>
        <CardBody>
          {recentCollaborations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentCollaborations.map((collab, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {collab.mentorName} & {collab.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {collab.skill || 'General Mentoring'}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Started: {new Date(collab.startDate).toLocaleDateString()}
                      </p>
                      <Button 
                        size="sm" 
                        color="primary"
                        variant="light"
                        onPress={() => navigate(`/admin/collaboration/${collab.collabId}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No recent collaborations</p>
          )}
        </CardBody>
      </Card>
    </div>
  );

  // Welcome section
  const renderWelcomeSection = () => (
    <div className="mb-6">
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardBody className="py-5">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {currentAdmin?.name || 'Admin'}!</h1>
          <p>Here's what's happening with your ConnectSphere platform today.</p>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="bg-gray-50">
      {renderWelcomeSection()}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="secondary" />
        </div>
      ) : (
        <>
          {renderStatsCards()}
          {renderTimeControls()}
          {renderCharts()}
          {renderLists()}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;