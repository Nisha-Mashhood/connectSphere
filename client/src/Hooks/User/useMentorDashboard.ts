import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchCollabDetails } from "../../redux/Slice/profileSlice";
import { updateUserProfile } from "../../redux/Slice/userSlice";
import { updateUserImages } from "../../Service/User.Service";
import { format, parseISO } from "date-fns";

export const useMentorDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails, collabDetails, loading: profileLoading } = useSelector((state: RootState) => state.profile);

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalMentees, setTotalMentees] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [chartData, setChartData] = useState<{ date: string; earnings: number }[]>([]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  useEffect(() => {
    if (currentUser?.id && currentUser.role === "mentor") {
      dispatch(fetchCollabDetails({ userId: currentUser.id, role: "mentor" }));
    } else {
      toast.error("Access denied. You must be a mentor.");
      navigate("/profile");
    }
  }, [dispatch, currentUser?.id, currentUser?.role, navigate]);

  useEffect(() => {
    if (collabDetails?.data?.length) {
      const earnings = collabDetails.data.reduce((s, c) => s + (c.price || 0), 0);
      const uniqueMentees = new Set(collabDetails.data.map(c => c.user?.id)).size;
      const active = collabDetails.data.filter(c => !c.isCompleted && !c.isCancelled).length;

      setTotalEarnings(earnings);
      setTotalMentees(uniqueMentees);
      setActiveCount(active);

      const byMonth: Record<string, number> = {};
      collabDetails.data.forEach(c => {
        if (c.startDate && c.price) {
          const month = format(parseISO(c.startDate), "MMM yyyy");
          byMonth[month] = (byMonth[month] || 0) + c.price;
        }
      });

      const sorted = Object.entries(byMonth)
        .map(([date, earnings]) => ({ date, earnings }))
        .sort((a, b) => parseISO(`01 ${a.date}`).getTime() - parseISO(`01 ${b.date}`).getTime());

      setChartData(sorted);
    }
  }, [collabDetails]);

  const handleImageUpload = async (file: File, type: "profilePic" | "coverPic") => {
    const formData = new FormData();
    formData.append(type, file);
    try {
      const { user } = await updateUserImages(currentUser.id, formData);
      dispatch(updateUserProfile(user));
      toast.success("Image updated");
    } catch {
      toast.error("Failed to update image");
    }
  };

  const handleEditMentorship = () => {
    navigate("/profile");
    toast.success("Edit in profile");
  };

  return {
    currentUser,
    mentorDetails,
    collabDetails,
    profileLoading,
    totalEarnings,
    totalMentees,
    activeCount,
    chartData,
    formatCurrency,
    handleImageUpload,
    handleEditMentorship,
  };
};