import React, { useState } from "react";
import { FaTimes, FaCheck, FaBan } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  approveMentor as approveMentorService,
  cancelMentorship as cancelMentorshipService,
  rejectMentor,
} from "../../Service/Mentor.Service";

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

const MentorDetailModal: React.FC<MentorDetailModalProps> = ({
  mentor,
  onClose,
}) => {
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null
  );

  // Approve mentor request
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

  // Cancel mentorship
  const cancelMentorship = async () => {
    try {
      await cancelMentorshipService(mentor._id);
      toast.success("Mentorship canceled successfully.");
      onClose();
    } catch (error) {
      toast.error("Failed to cancel mentorship.");
    }
  };

  // Submit rejection with reason
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Mentor Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {mentor.userId.name}
              </p>
              <p>
                <strong>Email:</strong> {mentor.userId.email}
              </p>
              <p>
                <strong>Job Title:</strong>{" "}
                {mentor.userId.jobTitle || "Not specified"}
              </p>
              <p>
                <strong>Specialization:</strong> {mentor.specialization}
              </p>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
            <div className="space-y-2">
              <p>
                <strong>Bio:</strong> {mentor.bio}
              </p>
              <p>
                <strong>Price per Session:</strong> ${mentor.price}
              </p>

              {/* Skills */}
              <div>
                <strong>Skills:</strong>
                <ul className="list-disc list-inside">
                  {mentor.skills.map((skill, index) => (
                    <li key={index}>{skill.name}</li>
                  ))}
                </ul>
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
                  className="w-32 h-32 object-cover rounded cursor-pointer"
                  onClick={() => setSelectedCertificate(cert)}
                />
              ))}
            </div>
          </div>

          {/* Available Slots */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Available Slots</h3>
            <div className="grid grid-cols-3 gap-4">
              {mentor.availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className="border p-2 rounded text-center bg-gray-100"
                >
                  <p className="font-semibold">
                    {slot.day || "Unspecified Day"}
                  </p>
                  {slot.timeSlots.length > 0 ? (
                    slot.timeSlots.map((time, timeIndex) => (
                      <p key={timeIndex} className="text-gray-600">
                        {time}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-600">No time specified</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t flex justify-end space-x-4">
          {mentor.isApproved === "Completed" ? (
            <>
              <button
                className="bg-gray-300 text-gray-700 p-2 rounded cursor-not-allowed flex items-center"
                disabled
              >
                <FaCheck className="mr-2" /> Approved
              </button>
              <button
                onClick={cancelMentorship}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center"
              >
                <FaBan className="mr-2" /> Cancel Mentorship
              </button>
            </>
          ) : mentor.isApproved === "Rejected" ? (
            <button
              className="bg-gray-300 text-gray-700 p-2 rounded cursor-not-allowed flex items-center"
              disabled
            >
              <FaTimes className="mr-2" /> Rejected
            </button>
          ) : (
            <>
              <button
                onClick={approveMentor}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
              >
                <FaCheck className="mr-2" /> Approve
              </button>
              <button
                onClick={() => setRejectionModal(true)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center"
              >
                <FaTimes className="mr-2" /> Reject
              </button>
            </>
          )}
        </div>

        {/* Rejection Modal */}
        {rejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Reject Mentor Request</h2>
              <textarea
                className="w-full border rounded p-2 mb-4"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setRejectionModal(false)}
                  className="bg-gray-300 text-gray-700 p-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="relative">
              <img
                src={selectedCertificate}
                alt="Certificate"
                className="max-w-full max-h-[90vh]"
              />
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDetailModal;


