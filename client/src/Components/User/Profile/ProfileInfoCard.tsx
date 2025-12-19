import { FC } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
  Spinner,
  Button,
} from "@nextui-org/react";
import {
  FaBriefcase,
  FaEnvelope,
  FaEdit,
  FaUserGraduate,
  FaCreditCard,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { checkProfile } from "../../../Service/Auth.service";
import {
  checkMentorProfile,
} from "../../../Service/Mentor.Service";
import { CollabData, CollabDetails, Mentor, User } from "../../../redux/types";
import ProfileSection from "../../ReusableComponents/ProfileSection";
import EmptyStateCard from "../../ReusableComponents/EmptyStateCard";
import { formatCurrency, formatDate } from "../../../pages/User/Profile/helper";
import ExperienceSection from "./OthersProfile/ExperienceSection";
import BaseModal from "../../ReusableComponents/BaseModal";
import ExperienceModal from "../../ReusableComponents/ExperienceModal";
import { useExperienceSection } from "../../../Hooks/User/useExperienceSection";

interface ProfileInfoCardProps {
  currentUser: User;
  mentorDetails: Mentor;
  collabDetails: CollabDetails;
  profileLoading: boolean;
  isPaymentLoading: boolean;
  mentorNames: { [key: string]: string };
  selectedCollab: CollabData | null;
  setSelectedCollab: (collab: CollabData | null) => void;
  onProfessionalModalOpen: () => void;
  onContactModalOpen: () => void;
  onPasswordModalOpen: () => void;
  onMentorModalOpen: () => void;
  onReceiptModalOpen: () => void;
}

const ProfileInfoCard: FC<ProfileInfoCardProps> = ({
  currentUser,
  mentorDetails,
  collabDetails,
  profileLoading,
  isPaymentLoading,
  mentorNames,
  setSelectedCollab,
  onProfessionalModalOpen,
  onContactModalOpen,
  onPasswordModalOpen,
  onMentorModalOpen,
  onReceiptModalOpen,
}) => {
  const navigate = useNavigate();
  const isOwnProfile = currentUser?.role === "mentor" && mentorDetails;

  const {
    experiences,
    loadingExperiences,
    expandedKeys,
    handleExpansionChange,
    isExperienceModalOpen,
    onExperienceModalClose,
    isDeleteModalOpen,
    onDeleteModalClose,
    selectedExperience,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveExperience,
    handleDeleteClick,
    confirmDelete,
  } = useExperienceSection({ mentorId: mentorDetails?.id , userId: currentUser.id});


  const handleBecomeMentor = async () => {
    try {
      const profileResponse = await checkProfile(currentUser.id);
      if (!profileResponse.isProfileComplete) {
        toast.error("Please complete your profile first");
        navigate("/complete-profile");
        return;
      }
      const mentorResponse = await checkMentorProfile(currentUser.id);
      if (!mentorResponse.mentor) navigate("/mentorProfile");
      else {
        switch (mentorResponse.mentor.isApproved) {
          case "Processing":
            toast.success("Mentor request under review");
            break;
          case "Completed":
            toast.success("You are an approved mentor!");
            navigate("/profile");
            break;
          case "Rejected":
            toast.error("Mentor application rejected");
            break;
          default:
            toast.error("Unknown status");
        }
      }
    } catch (error) {
      toast.error("Error checking mentor status");
      console.error(error);
    }
  };

  const totalPayments =
    collabDetails?.data?.reduce(
      (sum: number, collab: CollabData) => sum + collab.price,
      0
    ) || 0;

  return (
    <>
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-medium text-gray-900">Profile</h2>
        </CardHeader>

        <CardBody className="pt-0 space-y-3">
          <ProfileSection
            icon={<FaBriefcase size={14} className="text-blue-600" />}
            title="Professional"
            subtitle={currentUser?.industry || "Not specified"}
            onClick={onProfessionalModalOpen}
          />
          <ProfileSection
            icon={<FaEnvelope size={14} className="text-green-600" />}
            title="Contact"
            subtitle={currentUser?.email || "No email"}
            onClick={onContactModalOpen}
          />
          <ProfileSection
            icon={<FaEdit size={14} className="text-red-600" />}
            title="Security"
            subtitle="Change password"
            onClick={onPasswordModalOpen}
          />

          {currentUser?.role === "mentor" && mentorDetails ? (
            <ProfileSection
              icon={<FaUserGraduate size={14} className="text-purple-600" />}
              title="Mentorship"
              subtitle={mentorDetails.bio || "No bio"}
              onClick={onMentorModalOpen}
            />
          ) : currentUser?.role === "user" ? (
            <EmptyStateCard
              icon={<FaUserGraduate size={16} />}
              title="Become a Mentor"
              description="Share your expertise with others"
              buttonLabel="Apply Now"
              buttonColor="success"
              onButtonClick={handleBecomeMentor}
            />
          ) : null}

          {isOwnProfile && (
            <Accordion
              variant="light"
              className="px-0"
              selectedKeys={expandedKeys}
              onSelectionChange={handleExpansionChange}
            >
              <AccordionItem
                key="experience"
                textValue="Work Experience"
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <FaBriefcase size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Work Experience
                    </span>
                  </div>
                }
              >
                <div className="pt-2">
                  <ExperienceSection
                    experiences={experiences}
                    loading={loadingExperiences}
                    isEditable={true}
                    onAdd={handleOpenAddModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteClick}
                  />
                </div>
              </AccordionItem>
            </Accordion>
          )}

          {currentUser?.role === "user" ? (
            <Accordion variant="light" className="px-0">
              <AccordionItem
                textValue="Payment History"
                key="payments"
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                      <FaCreditCard size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Payment History
                    </span>
                  </div>
                }
              >
                <div className="space-y-3 pt-2">
                  {profileLoading || isPaymentLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="sm" />
                    </div>
                  ) : collabDetails?.data?.length > 0 ? (
                    <>
                      {collabDetails.data
                        .filter((c: CollabData) => c.payment)
                        .map((collab, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {typeof collab.mentorId === "string"
                                  ? mentorNames[collab.mentorId] ||
                                    "Unknown Mentor"
                                  : mentorNames[collab.mentorId] ||
                                    collab.mentor.user?.name ||
                                    "Unknown Mentor"}
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(collab.price)}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>ID: {collab.collaborationId}</p>
                              <p>
                                {formatDate(collab.startDate)} -{" "}
                                {formatDate(collab.endDate)}
                              </p>
                              <p>
                                Status:{" "}
                                {collab.isCancelled
                                  ? "Cancelled"
                                  : collab.isCompleted
                                  ? "Completed"
                                  : "Ongoing"}
                              </p>
                              <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                onPress={() => {
                                  setSelectedCollab(collab);
                                  onReceiptModalOpen();
                                }}
                              >
                                View Receipt
                              </Button>
                            </div>
                          </div>
                        ))}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          Total: {formatCurrency(totalPayments)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No payments yet
                    </p>
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          ) : currentUser?.role === "mentor" ? (
            <EmptyStateCard
              icon={<FaChartBar size={16} />}
              title="Mentor Dashboard"
              description="View your collaborations, requests, graphs, and more"
              buttonLabel="Go to Dashboard"
              onButtonClick={() => navigate("/mentor-dashboard")}
            />
          ) : null}
        </CardBody>
      </Card>
      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={onExperienceModalClose}
        onSave={handleSaveExperience}
        initialData={selectedExperience || undefined}
      />
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        title="Delete Experience"
        actionText="Delete"
        onSubmit={confirmDelete}
        size="md"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this experience? This action cannot be
          undone.
        </p>
      </BaseModal>
    </>
  );
};

export default ProfileInfoCard;
