import React, { useState } from "react";
import { FaTimes, FaCheck, FaBan } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  approveMentor as approveMentorService,
  cancelMentorship as cancelMentorshipService,
  rejectMentor,
} from "../../Service/Mentor.Service";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Textarea,
} from "@nextui-org/react";

interface MentorDetailModalProps {
  mentor: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      jobTitle?: string;
    };
    isApproved: string;
    specialization: string;
    skills: Array<{ name: string }>;
    certifications: string[];
    price: number;
    bio: string;
    availableSlots: any[];
  };
  onClose: () => void;
}

const MentorDetailModal: React.FC<MentorDetailModalProps> = ({ mentor, onClose }) => {
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  const approveMentor = async () => {
    try {
      await approveMentorService(mentor._id);
      toast.success("Mentor approved successfully.");
      onClose();
    } catch (error) {
      toast.error("Failed to approve mentor.");
      console.error("Error:", error);
    }
  };

  const cancelMentorship = async () => {
    try {
      await cancelMentorshipService(mentor._id);
      toast.success("Mentorship canceled successfully.");
      onClose();
    } catch (error) {
      toast.error("Failed to cancel mentorship.");
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      await rejectMentor(mentor._id, rejectionReason);
      toast.success("Mentor rejected successfully.");
      setRejectionModal(false);
      onClose();
    } catch (error) {
      toast.error("Failed to reject mentor.");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex justify-between items-center bg-primary-50">
            <h2 className="text-2xl font-bold text-primary">Mentor Details</h2>
            <Button isIconOnly variant="light" onPress={onClose}>
              <FaTimes className="w-6 h-6" />
            </Button>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <p><strong>Name:</strong> {mentor.userId.name}</p>
                  <p><strong>Email:</strong> {mentor.userId.email}</p>
                  <p><strong>Job Title:</strong> {mentor.userId.jobTitle || "Not specified"}</p>
                  <p><strong>Specialization:</strong> {mentor.specialization}</p>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
                <div className="space-y-3">
                  <p><strong>Bio:</strong> {mentor.bio}</p>
                  <p><strong>Price per Session:</strong> ${mentor.price}</p>
                  <div>
                    <strong>Skills:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mentor.skills.map((skill, index) => (
                        <Chip key={index} color="primary" variant="flat">{skill.name}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4">Certificates</h3>
                <div className="flex flex-wrap gap-4">
                  {mentor.certifications.map((cert, index) => (
                    <img
                      key={index}
                      src={cert}
                      alt={`Certificate ${index + 1}`}
                      className="w-32 h-32 object-cover rounded cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedCertificate(cert)}
                    />
                  ))}
                </div>
              </div>

              {/* Available Slots */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4">Available Slots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mentor.availableSlots.map((slot, index) => (
                    <div key={index} className="border p-3 rounded-lg bg-gray-50 text-center">
                      <p className="font-semibold">{slot.day || "Unspecified Day"}</p>
                      {slot.timeSlots.length > 0 ? (
                        slot.timeSlots.map((time, timeIndex) => (
                          <p key={timeIndex} className="text-gray-600">{time}</p>
                        ))
                      ) : (
                        <p className="text-gray-600">No time specified</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-4">
            {mentor.isApproved === "Completed" ? (
              <>
                <Button color="success" isDisabled startContent={<FaCheck />}>Approved</Button>
                <Button color="danger" onPress={cancelMentorship} startContent={<FaBan />}>Cancel Mentorship</Button>
              </>
            ) : mentor.isApproved === "Rejected" ? (
              <Button color="danger" isDisabled startContent={<FaTimes />}>Rejected</Button>
            ) : (
              <>
                <Button color="success" onPress={approveMentor} startContent={<FaCheck />}>Approve</Button>
                <Button color="danger" onPress={() => setRejectionModal(true)} startContent={<FaTimes />}>Reject</Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rejection Modal */}
      {rejectionModal && (
        <Modal isOpen={rejectionModal} onClose={() => setRejectionModal(false)} size="md">
          <ModalContent>
            <ModalHeader>Reject Mentor Request</ModalHeader>
            <ModalBody>
              <Textarea
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setRejectionModal(false)}>Cancel</Button>
              <Button color="danger" onPress={submitRejection}>Reject</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <Modal isOpen={!!selectedCertificate} onClose={() => setSelectedCertificate(null)} size="lg">
          <ModalContent>
            <ModalBody className="p-0">
              <img src={selectedCertificate} alt="Certificate" className="w-full h-auto max-h-[80vh]" />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setSelectedCertificate(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default MentorDetailModal;