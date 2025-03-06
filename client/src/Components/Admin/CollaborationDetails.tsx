import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  acceptTheRequest,
  cancelCollab,
  fetchCollabDetails,
  fetchCollabRequsetDetails,
  rejectTheRequest,
} from "../../Service/collaboration.Service";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const CollaborationDetails = () => {
  const { collabId, requestId } = useParams<{
    collabId?: string;
    requestId?: string;
  }>();
  const { id, type } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchDetails();
  }, [id, type]);

  const handleCancelMentorship = async () => {
    setShowCancelDialog(false);
    try {
      const response = await cancelCollab(id, reason);
      console.log(response);
      toast.success("Mentor Collaboration Cancelled");
      navigate("/admin/userMentorManagemnt");
    } catch (error) {
      console.error("Error cancelling mentorship:", error);
    }
  };

  const handleAcceptRequset = async () => {
    try {
      await acceptTheRequest(id);
      toast.success("Request accepted successfully!");
      fetchDetails();
    } catch (error) {
      console.error("Error accepting request:", error.message);
      toast.error("Failed to accept request. Please try again.");
    }
  };

  const handleRejectRequset = async () => {
    try {
      await rejectTheRequest(id);
      toast.success("Request rejected successfully!");
      fetchDetails();
    } catch (error) {
      console.error("Error rejecting request:", error.message);
      toast.error("Failed to reject request. Please try again.");
    }
  };
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!details)
    return (
      <div className="p-6 bg-white shadow-lg rounded-xl text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Details not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          We couldn't find the requested information.
        </p>
      </div>
    );

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge with color
  const getStatusBadge = (status) => {
    if ( status === true) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Payment Done
        </span>
      );
    } else if (status === "Pending" || status === false) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Payment Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
    }
  };

  const isCollab = collabId || type === "collaboration";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div className="flex  items-center">
              <button
                onClick={() => navigate(-1)}
                className="text-blue-400 hover:text-blue-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex-col pl-5  items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isCollab
                    ? "Collaboration Details"
                    : "Mentorship Request Details"}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {isCollab
                    ? "Details about the ongoing mentorship collaboration."
                    : "Information about the mentorship request."}
                </p>
              </div>
            </div>
            {isCollab ? (
              <Button
                className="text-sm bg-red-100 text-red-600 hover:bg-red-300"
                onPress={() => setShowCancelDialog(true)}
              >
                <FaTimes size={10} />
              </Button>
            ) : (
              <div className="flex justify-between items-center gap-4">
                {details?.isAccepted === "Pending" ? (
                  <>
                    <Button
                      className="text-sm bg-green-100 text-green-600 hover:bg-green-300"
                      onPress={() => handleAcceptRequset()}
                    >
                      <FaCheck size={10} />
                    </Button>
                    <Button
                      className="text-sm bg-red-100 text-red-600 hover:bg-red-300"
                      onPress={() => handleRejectRequset()}
                    >
                      <FaTimes size={10} />
                    </Button>
                  </>
                ) : (
                  <span className={`text-sm font-medium ${
                    details?.isAccepted === "Accepted" ? "text-green-600" : "text-red-600"
                  }`}>
                    {details?.isAccepted}
                  </span>
                )}
              </div>
            )}
          </div>
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
                      src={
                        details.mentorId?.userId?.profilePic ||
                        "https://via.placeholder.com/40"
                      }
                      alt={details.mentorId?.userId?.name || "Mentor"}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">
                      {details.mentorId?.userId?.name || "Unknown Mentor"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {details.mentorId?.userId?.email || "No email provided"}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {details.mentorId?.specialization || "No specialization"}
                    </div>
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
                      src={
                        details.userId?.profilePic ||
                        "https://via.placeholder.com/40"
                      }
                      alt={details.userId?.name || "Mentee"}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">
                      {details.userId?.name || "Unknown User"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {details.userId?.email || "No email provided"}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {details.userId?.jobTitle || "No job title"}
                    </div>
                  </div>
                </div>
              </dd>
            </div>

            {/* Price */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="font-semibold text-green-600">
                  ${details.price}
                </span>
              </dd>
            </div>

            {/* Selected Slot */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Selected Time Slot
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {Array.isArray(details.selectedSlot) ? (
                  details.selectedSlot.length > 0 ? (
                    details.selectedSlot.map((slot, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 mr-2"
                      >
                        {slot.day || ""} at {slot.timeSlots.join(", ") || ""}
                      </div>
                    ))
                  ) : (
                    "No slot selected"
                  )
                ) : details.selectedSlot ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                    {details.selectedSlot.day || ""} at{" "}
                    {details.selectedSlot.timeSlots || ""}
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
                  <dt className="text-sm font-medium text-gray-500">
                    Start Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(details.startDate)}
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    End Date
                  </dt>
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
                  : getStatusBadge(details.paymentStatus)}
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
                <dt className="text-sm font-medium text-gray-500">
                  Mentor Bio
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {details.mentorId.bio}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <Modal
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
      >
        <ModalContent>
          <ModalHeader>Cancel Mentorship</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p>Are you sure you want to cancel this mentorship?</p>
              <Textarea
                placeholder="Enter reason for deletion"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setShowCancelDialog(false)}
            >
              No, keep mentorship
            </Button>
            <Button color="danger" onPress={handleCancelMentorship}>
              Yes, cancel mentorship
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CollaborationDetails;
