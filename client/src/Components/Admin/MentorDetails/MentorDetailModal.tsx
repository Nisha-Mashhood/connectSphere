import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Tabs, Tab } from "@nextui-org/react";
import { FaTimes, FaCheck, FaBan } from "react-icons/fa";
import { Mentor } from "../../../redux/types";
import { useMentorDetails } from "../../../Hooks/Admin/useMentorDetails";
import MentorInfoTab from "./MentorInfoTab";
import MentorFeedbackTab from "./MentorFeedbackTab";
import RejectionModal from "./RejectionModal";
import CertificateViewer from "./CertificateViewer";
import MentorExperienceTab from "../../ReusableComponents/MentorExperienceTab";

interface Props {
  mentor: Mentor;
  onClose: () => void;
  onMentorUpdate: (updated: Mentor) => void;
}

const MentorDetailModal: React.FC<Props> = ({ mentor, onClose, onMentorUpdate }) => {
  const {
    feedbacks,
    loadingFeedback,
    experiences,
    loadingExperiences,
    approveMentor,
    cancelMentorship,
    rejectionModal,
    setRejectionModal,
    rejectionReason,
    setRejectionReason,
    submitRejection,
    selectedCertificate,
    setSelectedCertificate,
    handleToggleVisibility,
  } = useMentorDetails(mentor, onClose, onMentorUpdate);

  return (
    <>
      <Modal isOpen onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex justify-between items-center bg-primary-50">
            <h2 className="text-2xl font-bold text-primary">Mentor Details</h2>
            <Button isIconOnly variant="light" onPress={onClose}>
              <FaTimes />
            </Button>
          </ModalHeader>
          <ModalBody>
            <Tabs aria-label="Mentor Tabs">
              <Tab key="details" title="Details">
                <MentorInfoTab mentor={mentor} onCertificateClick={setSelectedCertificate} />
              </Tab>
              <Tab key="experience" title="Experience">
                <MentorExperienceTab
                  experiences={experiences}
                  loading={loadingExperiences}
                />
              </Tab>
              <Tab key="feedback" title="Feedback">
                <MentorFeedbackTab
                  feedbacks={feedbacks}
                  loading={loadingFeedback}
                  onToggleVisibility={handleToggleVisibility}
                />
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            {mentor.isApproved === "Completed" ? (
              <>
                <Button color="success" isDisabled startContent={<FaCheck />}>
                  Approved
                </Button>
                <Button color="danger" onPress={cancelMentorship} startContent={<FaBan />}>
                  Cancel Mentorship
                </Button>
              </>
            ) : mentor.isApproved === "Rejected" ? (
              <Button color="danger" isDisabled startContent={<FaTimes />}>
                Rejected
              </Button>
            ) : (
              <>
                <Button color="success" onPress={approveMentor} startContent={<FaCheck />}>
                  Approve
                </Button>
                <Button color="danger" onPress={() => setRejectionModal(true)} startContent={<FaTimes />}>
                  Reject
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <RejectionModal
        isOpen={rejectionModal}
        onClose={() => setRejectionModal(false)}
        reason={rejectionReason}
        setReason={setRejectionReason}
        onSubmit={submitRejection}
      />

      <CertificateViewer certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
    </>
  );
};

export default MentorDetailModal;