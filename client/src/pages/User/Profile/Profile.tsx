import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useDisclosure,
} from "@nextui-org/react";
import { RootState } from "../../../redux/store";
import ProfileHeader from "../../../Components/User/Profile/ProfileHeader";
import ProfileInfoCard from "../../../Components/User/Profile/ProfileInfoCard";
import ProfileActivity from "../../../Components/User/Profile/ProfileActivity";
import ProfileModal from "../../../Components/User/Profile/ProfileModal";
import { useProfileForms } from "../../../Hooks/User/useProfileForms";

const Profile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    mentorDetails,
    collabDetails,
    loading: profileLoading,
  } = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const {
    professionalInfo,
    setProfessionalInfo,
    contactInfo,
    setContactInfo,
    passwordInfo,
    setPasswordInfo,
    mentorshipInfo,
    setMentorshipInfo,
    selectedDay,
    setSelectedDay,
    startHour,
    setStartHour,
    startMin,
    setStartMin,
    endHour,
    setEndHour,
    endMin,
    setEndMin,
    ampm,
    setAmpm,
    mentorNames,
    isPaymentLoading,
    selectedCollab,
    setSelectedCollab,
    formatCurrency,
    formatDate,
    handleProfessionalSubmit,
    handleContactSubmit,
    handlePasswordSubmit,
    handleMentorshipSubmit,
    handleAddSlot,
    handleRemoveSlot,
    handleDownloadReceipt,
  } = useProfileForms();

  // Modal states
  const {
    isOpen: isProfessionalModalOpen,
    onOpen: onProfessionalModalOpen,
    onClose: onProfessionalModalClose,
  } = useDisclosure();
  const {
    isOpen: isContactModalOpen,
    onOpen: onContactModalOpen,
    onClose: onContactModalClose,
  } = useDisclosure();
  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModalOpen,
    onClose: onPasswordModalClose,
  } = useDisclosure();
  const {
    isOpen: isMentorModalOpen,
    onOpen: onMentorModalOpen,
    onClose: onMentorModalClose,
  } = useDisclosure();
  const {
    isOpen: isReceiptModalOpen,
    onOpen: onReceiptModalOpen,
    onClose: onReceiptModalClose,
  } = useDisclosure();

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header Section - Clean and minimal */}
        <ProfileHeader currentUser={currentUser} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <ProfileInfoCard
              currentUser={currentUser}
              mentorDetails={mentorDetails}
              collabDetails={collabDetails}
              profileLoading={profileLoading}
              isPaymentLoading={isPaymentLoading}
              mentorNames={mentorNames}
              selectedCollab={selectedCollab}
              setSelectedCollab={setSelectedCollab}
              onProfessionalModalOpen={onProfessionalModalOpen}
              onContactModalOpen={onContactModalOpen}
              onPasswordModalOpen={onPasswordModalOpen}
              onMentorModalOpen={onMentorModalOpen}
              onReceiptModalOpen={onReceiptModalOpen}
            />
          </div>

          <ProfileActivity
            currentUser={currentUser}
            mentorDetails={mentorDetails}
            navigate={navigate}
          />
        </div>

       {/* Professional Info Modal */}
        <ProfileModal
          isOpen={isProfessionalModalOpen}
          onClose={onProfessionalModalClose}
          modalType="professional"
          professionalInfo={professionalInfo}
          setProfessionalInfo={setProfessionalInfo}
          onSubmit={() => handleProfessionalSubmit(onProfessionalModalClose)}
        />

        {/* Contact Info Modal */}
        <ProfileModal
          isOpen={isContactModalOpen}
          onClose={onContactModalClose}
          modalType="contact"
          contactInfo={contactInfo}
          setContactInfo={setContactInfo}
          onSubmit={() => handleContactSubmit(onContactModalClose)}
        />

        {/* Password Modal */}
        <ProfileModal
          isOpen={isPasswordModalOpen}
          onClose={onPasswordModalClose}
          modalType="password"
          passwordInfo={passwordInfo}
          setPasswordInfo={setPasswordInfo}
          onSubmit={() => handlePasswordSubmit(onPasswordModalClose)}
        />

        {/* Mentorship Modal */}
        <ProfileModal
          isOpen={isMentorModalOpen}
          onClose={onMentorModalClose}
          modalType="mentorship"
          mentorshipInfo={mentorshipInfo}
          setMentorshipInfo={setMentorshipInfo}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          startHour={startHour}
          setStartHour={setStartHour}
          startMin={startMin}
          setStartMin={setStartMin}
          endHour={endHour}
          setEndHour={setEndHour}
          endMin={endMin}
          setEndMin={setEndMin}
          ampm={ampm}
          setAmpm={setAmpm}
          onSubmit={() => handleMentorshipSubmit(onMentorModalClose)}
          handleAddSlot={handleAddSlot}
          handleRemoveSlot={handleRemoveSlot}
        />

        {/* Receipt Modal */}
        <ProfileModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setSelectedCollab(null);
            onReceiptModalClose();
          }}
          modalType="receipt"
          selectedCollab={selectedCollab}
          mentorNames={mentorNames}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onSubmit={() => selectedCollab && handleDownloadReceipt(selectedCollab.id)}
        />
      </div>
    </div>
  );
};

export default Profile;