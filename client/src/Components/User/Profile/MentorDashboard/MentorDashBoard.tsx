
import { useNavigate } from "react-router-dom";
import { useMentorDashboard } from "../../../../Hooks/User/useMentorDashboard";
import { MentorHeader } from "./MentorHeader";
import { StatsCard } from "./StatsCard";
import { BioCard } from "./BioCard";
import { AvailabilityCard } from "./AvailabilityCard";
import { ActiveCollaborationsSection } from "./ActiveCollaborationsSection";
import { RequestsSec } from "./RequestsSection";
import { EarningsChart } from "./EarningsChart";
import { EarningsHistory } from "./EarningsHistory";

export const MentorDashboard = () => {
  const {
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
  } = useMentorDashboard();

  const navigate = useNavigate();
  const handleProfileClick = (id: string) => navigate(`/profileDispaly/${id}`);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <MentorHeader
          currentUser={currentUser}
          onProfileUpload={(f) => handleImageUpload(f, "profilePic")}
          onCoverUpload={(f) => handleImageUpload(f, "coverPic")}
          onEdit={handleEditMentorship}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <div className="lg:col-span-4 space-y-6">
            <StatsCard totalEarnings={totalEarnings} totalMentees={totalMentees} activeCount={activeCount} formatCurrency={formatCurrency} />
            <BioCard bio={mentorDetails?.bio} />
            <AvailabilityCard slots={mentorDetails?.availableSlots || []} />
          </div>

          {/* Right */}
          <div className="lg:col-span-8 space-y-6">
            <ActiveCollaborationsSection onProfileClick={handleProfileClick} />
            <RequestsSec onProfileClick={handleProfileClick} />
            <EarningsChart data={chartData} formatCurrency={formatCurrency} />
            <EarningsHistory data={collabDetails?.data || []} total={totalEarnings} formatCurrency={formatCurrency} loading={profileLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;