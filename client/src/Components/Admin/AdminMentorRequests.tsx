import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  fetchMentorRequests as fetchMentorRequestsService,
  approveMentor as approveMentorService,
  cancelMentorship as cancelMentorshipService,
  rejectMentor,
} from "../../Service/Mentor.Service";

const AdminMentorRequests = () => {
  const [mentorRequests, setMentorRequests] = useState([]);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Fetch mentor requests
  const fetchMentorRequests = async () => {
    try {
      const data = await fetchMentorRequestsService();
      setMentorRequests(data);
    } catch (error) {
      toast.error("Failed to fetch mentor requests.");
      console.error("Error:", error);
    }
  };

  // Approve mentor request
  const approveMentor = async (mentorId) => {
    try {
      await approveMentorService(mentorId);
      toast.success("Mentor approved successfully.");
      fetchMentorRequests(); // Refresh data
    } catch (error) {
      toast.error("Failed to approve mentor.");
      console.error("Error:", error);
    }
  };

  // Cancel mentorship
  const cancelMentorship = async (mentorId) => {
    try {
      await cancelMentorshipService(mentorId);
      toast.success("Mentorship canceled successfully.");
      fetchMentorRequests(); // Refresh data
    } catch (error) {
      toast.error("Failed to cancel mentorship.");
    }
  };

  // Open rejection modal
  const handleReject = (mentorId) => {
    setSelectedMentorId(mentorId);
    setRejectionModal(true);
  };

  // Submit rejection with reason
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    try {
      await rejectMentor(selectedMentorId as string, rejectionReason);
      toast.success("Mentor rejected successfully.");
      setRejectionModal(false);
      setRejectionReason("");
      fetchMentorRequests();
    } catch (error) {
      toast.error("Failed to reject mentor.");
      console.error("Error:", error);
    }
  };

  const handleCertificateClick = (certificateUrl) => {
    setSelectedCertificate(certificateUrl);
  };

  useEffect(() => {
    fetchMentorRequests();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mentor Requests</h1>

      {/* Table for mentor requests */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Full Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Specialization</th>
              <th className="py-2 px-4 border-b">Skills</th>
              <th className="py-2 px-4 border-b">Certificates</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentorRequests.map((mentor) => (
              <tr key={mentor._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{mentor.userId.name}</td>
                <td className="py-2 px-4 border-b">{mentor.userId.email}</td>
                <td className="py-2 px-4 border-b">{mentor.specialization}</td>
                <td className="py-2 px-4 border-b">
                  {mentor.skills.map((skill) => skill.name).join(", ")}
                </td>
                <td className="py-2 px-4 border-b">
                  {mentor.certifications.map((cert, index) => (
                    <img
                      key={index}
                      src={cert}
                      alt="Certificate"
                      className="w-16 h-16 object-cover cursor-pointer"
                      onClick={() => handleCertificateClick(cert)}
                    />
                  ))}
                </td>
                <td className="py-2 px-4 border-b">
                  {mentor.isApproved === "Completed" ? (
                    <>
                      <button
                        className="bg-gray-300 text-gray-700 py-1 px-3 rounded cursor-not-allowed"
                        disabled
                      >
                        Approved
                      </button>
                      <button
                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                        onClick={() => cancelMentorship(mentor._id)}
                      >
                        Cancel Mentorship
                      </button>
                    </>
                  ) : mentor.isApproved === "Rejected" ? (
                    <button
                      className="bg-gray-300 text-gray-700 py-1 px-3 rounded cursor-not-allowed"
                      disabled
                    >
                      Rejected
                    </button>
                  ) : (
                    <>
                      <button
                        className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 mr-2"
                        onClick={() => approveMentor(mentor._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                        onClick={() => handleReject(mentor._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Reject Mentor Request</h2>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 py-1 px-3 rounded hover:bg-gray-400 mr-2"
                onClick={() => setRejectionModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                onClick={submitRejection}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4">
            <img
              src={selectedCertificate}
              alt="Certificate"
              className="max-w-full max-h-full"
            />
            <button
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedCertificate(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentorRequests;
