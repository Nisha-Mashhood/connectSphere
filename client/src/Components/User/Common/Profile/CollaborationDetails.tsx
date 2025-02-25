import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@nextui-org/react";
import { FaCalendarAlt } from "react-icons/fa";
import { AppDispatch, RootState } from "../../../../redux/store";
import { cancelCollab } from "../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../redux/Slice/profileSlice";
import FeedbackModal from "./FeedbackModal";
import TaskManagement from "../../TaskManagement/TaskManagemnt";

const CollaborationDetails = () => {
  const { collabId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);

  const collaboration = collabDetails?.data?.find(
    (collab) => collab._id === collabId
  );

  if (!collaboration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Collaboration not found</p>
      </div>
    );
  }

  const isMentor = currentUser.role === "mentor";
  const startDate = new Date(collaboration.startDate).toLocaleDateString();
  const endDate = new Date(collaboration.endDate).toLocaleDateString();

  // Determine which user's details to show based on role
  const otherPartyDetails = isMentor
    ? collaboration.userId
    : collaboration.mentorId?.userId;
  const displayName = otherPartyDetails?.name || "Unknown";
  const profilePic = otherPartyDetails?.profilePic;

  const handleCancelMentorship = async () => {
    setShowCancelDialog(false);
    setShowFeedbackModal(true);
  };

  const handleFeedbackComplete = async () => {
    try {
      const response = await cancelCollab(collabId);
      console.log(response);

      // After successful deletion, refresh the collaboration data in redux store
      await dispatch(
        fetchCollabDetails({
          userId: currentUser._id,
          role: currentUser.role,
        })
      );

      setShowFeedbackModal(false);
      navigate("/profile");
    } catch (error) {
      console.error("Error cancelling mentorship:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-2xl font-bold">Mentorship Details</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {/* User/Mentor Information */}
            <div className="flex items-start space-x-4">
              <img
                src={profilePic}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{displayName}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isMentor ? "Mentee" : "Mentor"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {otherPartyDetails?.email}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  collaboration.isCancelled
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}
              >
                {collaboration.isCancelled ? "Cancelled" : "Active"}
              </span>
            </div>

            {/* Timeline Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{startDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{endDate}</p>
                </div>
              </div>
            </div>

            {/* Selected Slots */}
            <div>
              <h4 className="text-lg font-semibold mb-2">
                Selected Time Slots
              </h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-medium">
                  {collaboration.selectedSlot[0].day}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {collaboration.selectedSlot[0].timeSlots.map(
                    (time, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {time}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Price Information */}
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-lg font-semibold">Price</span>
              <span className="text-2xl font-bold">₹{collaboration.price}</span>
            </div>

            {/* Cancel Button or Message */}
            <div className="flex justify-end">
              {isMentor ? (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  Since payment is accepted, cancellation can only be initiated
                  by the mentee
                </p>
              ) : (
                !collaboration.isCancelled && (
                  <Button
                    color="danger"
                    onPress={() => setShowCancelDialog(true)}
                  >
                    Cancel Mentorship
                  </Button>
                )
              )}
            </div>

                           {/* Task Management Section*/}
                           <Card>
                <CardHeader className="flex gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-xl text-primary" />
                    <p className="text-lg font-semibold">My Tasks</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <TaskManagement
                    context="collaboration"
                    currentUser={currentUser}
                    contextData={collaboration}
                  />
                </CardBody>
              </Card>


          </CardBody>
        </Card>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
        >
          <ModalContent>
            <ModalHeader>Cancel Mentorship</ModalHeader>
            <ModalBody>
              Are you sure you want to cancel this mentorship? Please note that
              your payment will not be retrieved once you initiate the
              cancellation.
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
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          collaborationData={collaboration}
          onComplete={handleFeedbackComplete}
        />
      </div>
    </div>
  );
};

export default CollaborationDetails;
