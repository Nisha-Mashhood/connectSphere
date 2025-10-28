import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  Chip,
  Image,
  Divider,
  Accordion,
  AccordionItem,
  Spinner,
} from "@nextui-org/react";
import {
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaUserGraduate,
  FaPencilAlt,
  FaCamera,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { RootState, AppDispatch } from "../../../../redux/store";
import { fetchCollabDetails } from "../../../../redux/Slice/profileSlice";
import { updateUserProfile } from "../../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { updateUserImages } from "../../../../Service/User.Service";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

// Lazy load 
const ActiveCollaborations = lazy(() => import("../../Profile/ActiveCollaborations/ActiveCollaborations"));
const RequestsSection = lazy(() => import("../../Profile/RequestSection/RequestSection"));

const MentorDashboard = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails, collabDetails, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // State for stats and chart data
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalMentees, setTotalMentees] = useState(0);
  const [activeCollaborationsCount, setActiveCollaborationsCount] = useState(0);
  const [chartData, setChartData] = useState<{ date: string; earnings: number }[]>([]);

  // Currency formatter
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  // Fetch data on mount
  useEffect(() => {
    if (currentUser?.id && currentUser.role === "mentor") {
      dispatch(fetchCollabDetails({ userId: currentUser.id, role: "mentor" }));
    } else {
      toast.error("Access denied. You must be a mentor to view this page.");
      navigate("/profile");
    }
  }, [dispatch, currentUser?.id, currentUser?.role, navigate]);

  //stats and chart data
  useEffect(() => {
    if (collabDetails?.data && collabDetails.data.length > 0) {
      // Stats
      const earnings = collabDetails.data.reduce((sum: number, collab) => sum + (collab.price || 0), 0);
      const uniqueMentees = new Set(collabDetails.data.map((collab) => collab.user?.id)).size;
      const activeCount = collabDetails.data.filter((collab) => !collab.isCompleted && !collab.isCancelled).length;

      setTotalEarnings(earnings);
      setTotalMentees(uniqueMentees);
      setActiveCollaborationsCount(activeCount);

      // chart data (aggregate earnings by month)
      const earningsByMonth: { [key: string]: number } = {};
      collabDetails.data.forEach((collab) => {
        if (collab.startDate && collab.price) {
          const date = parseISO(collab.startDate);
          const monthYear = format(date, "MMM yyyy");
          earningsByMonth[monthYear] = (earningsByMonth[monthYear] || 0) + collab.price;
        }
      });

      // Convert to array for Recharts
      const chartDataArray = Object.entries(earningsByMonth).map(([date, earnings]) => ({
        date,
        earnings,
      }));

      // Sort by date
      chartDataArray.sort((a, b) => {
        const dateA = parseISO(`01 ${a.date}`);
        const dateB = parseISO(`01 ${b.date}`);
        return dateA.getTime() - dateB.getTime();
      });

      setChartData(chartDataArray);
    }
  }, [collabDetails]);

  // Image upload handler
  const handleImageUpload = async (file: File, type: "profilePic" | "coverPic") => {
    const formData = new FormData();
    formData.append(type, file);
    try {
      const { user } = await updateUserImages(currentUser.id, formData);
      dispatch(updateUserProfile(user));
      toast.success("Image updated successfully");
    } catch (error) {
      toast.error("Failed to update image");
      console.error("Failed to update image", error);
    }
  };

  // Placeholder for editing mentorship details
  const handleEditMentorship = () => {
    navigate("/profile");
    toast.success("Edit mentorship details in your profile.");
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header Section */}
        <Card className="border-none shadow-lg overflow-hidden mb-0">
          <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
            {currentUser?.coverPic && (
              <Image
                src={currentUser.coverPic}
                alt="Cover"
                className="w-full h-full object-cover"
                removeWrapper
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 z-10">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-black/20 backdrop-blur-md text-white border-white/20 hover:bg-black/30"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleImageUpload(e.target.files[0], "coverPic")
                    }
                  />
                  <FaCamera size={14} />
                </label>
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile Info Card */}
        <Card className="border-none shadow-lg -mt-16 relative z-10 mx-4">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 flex-1">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={currentUser?.profilePic}
                    className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-gray-100"
                    fallback={<FaUserGraduate className="w-16 h-16 text-gray-400" />}
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="absolute -bottom-2 -right-2 w-8 h-8 min-w-0 bg-white border-2 border-gray-200 shadow-md hover:shadow-lg"
                  >
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], "profilePic")
                        }
                      />
                      <FaCamera size={12} />
                    </label>
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 truncate">
                      {currentUser?.name}
                    </h1>
                    <Chip color="success" variant="flat" size="md" className="w-fit">
                      Mentor
                    </Chip>
                  </div>
                  <p className="text-lg text-gray-600 mb-3 font-medium">
                    {currentUser?.jobTitle || "No job title"}
                  </p>
                </div>
              </div>
              <Button
                color="primary"
                size="lg"
                variant="solid"
                startContent={<FaPencilAlt size={16} />}
                onPress={handleEditMentorship}
                className="font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Edit Mentorship Details
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Stats and Quick Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stats Cards */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium text-gray-900">Overview</h2>
              </CardHeader>
              <CardBody className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Earnings */}
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <FaFileInvoiceDollar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                    </div>
                  </div>
                </Card>
                {/* Total Mentees */}
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <FaUsers size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                      <p className="text-lg font-bold text-gray-900">{totalMentees}</p>
                    </div>
                  </div>
                </Card>
                {/* Active Sessions */}
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <FaCalendarAlt size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                      <p className="text-lg font-bold text-gray-900">{activeCollaborationsCount}</p>
                    </div>
                  </div>
                </Card>
              </CardBody>
            </Card>

            {/* Mentorship Bio */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium text-gray-900">Bio</h2>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-sm text-gray-600">{mentorDetails?.bio || "No bio provided."}</p>
              </CardBody>
            </Card>

            {/* Availability Slots */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium text-gray-900">Availability</h2>
              </CardHeader>
              <CardBody className="pt-0">
                {mentorDetails?.availableSlots?.length > 0 ? (
                  <Accordion variant="light">
                    {mentorDetails.availableSlots.map((slot, i: number) => (
                      <AccordionItem key={i} title={slot.day}>
                        <div className="flex flex-wrap gap-2">
                          {slot.timeSlots.map((time: string, j: number) => (
                            <Chip key={j} variant="flat" color="primary" size="sm">
                              {time}
                            </Chip>
                          ))}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-gray-500">No slots added yet.</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Content - Activity and Graphs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Collaborations */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <FaCalendarAlt size={16} />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Active Collaborations</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="md" /></div>}>
                  <ActiveCollaborations
                    handleProfileClick={(id: string) => navigate(`/profileDispaly/${id}`)}
                  />
                </Suspense>
              </CardBody>
            </Card>

            {/* Pending Requests */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 text-green-600">
                    <FaUsers size={16} />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Pending Requests</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="md" /></div>}>
                  <RequestsSection
                    handleProfileClick={(id: string) => navigate(`/profileDispaly/${id}`)}
                  />
                </Suspense>
              </CardBody>
            </Card>

            {/* Performance Graphs */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <FaChartBar size={16} />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Performance Graphs</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No earnings data available for the chart.</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Earnings History */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    <FaFileInvoiceDollar size={16} />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Earnings History</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                {profileLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : collabDetails?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {collabDetails.data.map((collab, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-gray-900">
                            {collab.user?.name || "Unknown Mentee"}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(collab.price)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>ID: {collab.collaborationId}</p>
                          <p>Status: {collab.isCancelled ? "Cancelled" : collab.isCompleted ? "Completed" : "Ongoing"}</p>
                        </div>
                      </div>
                    ))}
                    <Divider />
                    <p className="text-sm font-semibold text-gray-900 pt-2">
                      Total: {formatCurrency(totalEarnings)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No earnings history yet.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;