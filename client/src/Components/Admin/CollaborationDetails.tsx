import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCollabDetails, fetchCollabRequsetDetails } from "../../Service/collaboration.Service";

const CollaborationDetails = () => {
  const { collabId, requestId } = useParams<{ collabId?: string; requestId?: string }>();
  const { id, type } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        let data;
        if (collabId) {
          data = await fetchCollabDetails(collabId);
          console.log("Collab details : ", data);
        } else if (requestId) {
          data = await fetchCollabRequsetDetails(requestId);
          console.log("Request details : ", data);
        }
        setDetails(data.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, type]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!details) return (
    <div className="p-6 bg-white shadow-lg rounded-xl text-center">
      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">Details not found</h3>
      <p className="mt-1 text-sm text-gray-500">We couldn't find the requested information.</p>
    </div>
  );

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Get status badge with color
  const getStatusBadge = (status) => {
    if (status === "Accepted" || status === true) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Active</span>;
    } else if (status === "Pending" || status === false) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    } else {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const isCollab = collabId || (type === "collaboration");
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isCollab ? "Collaboration Details" : "Mentorship Request Details"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isCollab 
              ? "Details about the ongoing mentorship collaboration." 
              : "Information about the mentorship request."}
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            {/* Mentor Section */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Mentor</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img 
                      className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      src={details.mentorId?.userId?.profilePic || "https://via.placeholder.com/40"} 
                      alt={details.mentorId?.userId?.name || "Mentor"}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">{details.mentorId?.userId?.name || "Unknown Mentor"}</div>
                    <div className="text-gray-500 text-xs">{details.mentorId?.userId?.email || "No email provided"}</div>
                    <div className="text-gray-500 text-xs mt-1">{details.mentorId?.specialization || "No specialization"}</div>
                  </div>
                </div>
              </dd>
            </div>
            
            {/* Mentee Section */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Mentee</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img 
                      className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      src={details.userId?.profilePic || "https://via.placeholder.com/40"} 
                      alt={details.userId?.name || "Mentee"}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">{details.userId?.name || "Unknown User"}</div>
                    <div className="text-gray-500 text-xs">{details.userId?.email || "No email provided"}</div>
                    <div className="text-gray-500 text-xs mt-1">{details.userId?.jobTitle || "No job title"}</div>
                  </div>
                </div>
              </dd>
            </div>
            
            {/* Price */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="font-semibold text-green-600">${details.price}</span>
              </dd>
            </div>
            
            {/* Selected Slot */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Selected Time Slot</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {details.selectedSlot ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                    {details.selectedSlot.day || ""} at {details.selectedSlot.timeSlots || ""}
                  </div>
                ) : (
                  "No slot selected"
                )}
              </dd>
            </div>
            
            {/* Dates - Only for collaborations */}
            {isCollab && (
              <>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(details.startDate)}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(details.endDate)}
                  </dd>
                </div>
              </>
            )}
            
            {/* Status */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isCollab 
                  ? getStatusBadge(details.payment) 
                  : getStatusBadge(details.isAccepted)}
              </dd>
            </div>
            
            {/* Created Date */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(details.createdAt)}
              </dd>
            </div>
            
            {/* Bio or Additional Info */}
            {details.mentorId?.bio && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Mentor Bio</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {details.mentorId.bio}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDetails;