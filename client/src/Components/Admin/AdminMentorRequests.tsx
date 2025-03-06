import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { toast } from "react-hot-toast";
import MentorDetailModal from "./MentorDetailModal";
import {
  fetchMentorRequests as fetchMentorRequestsService,
} from "../../Service/Mentor.Service";

interface MentorRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  isApproved: string;
  specialization: string;
  skills: Array<{ name: string }>;
  certifications: string[];
  price: number;
  bio: string;
  availableSlots: any[];
}

const AdminMentorRequests: React.FC = () => {
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<MentorRequest | null>(null);

  // Fetch mentor requests
  const fetchMentorRequests = async () => {
    try {
      const data = await fetchMentorRequestsService();
      console.log(data);
      setMentorRequests(data);
    } catch (error) {
      toast.error("Failed to fetch mentor requests.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchMentorRequests();
  }, []);

  const handleViewDetails = (mentor: MentorRequest) => {
    setSelectedMentor(mentor);
  };

  const handleCloseModal = () => {
    setSelectedMentor(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mentor Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Full Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentorRequests.map((mentor) => (
              <tr key={mentor._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                {mentor.userId ? mentor.userId.name : 'Unknown User'}
                </td>
                <td className="py-2 px-4 border-b">
                {mentor.userId ? mentor.userId.email : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b text-right">
                  <button
                    onClick={() => handleViewDetails(mentor)}
                    className="text-blue-500 hover:text-blue-700"
                    title="View Mentor Details"
                  >
                    <FaEye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMentor && (
        <MentorDetailModal 
          mentor={selectedMentor} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default AdminMentorRequests;