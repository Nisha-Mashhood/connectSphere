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
  Tabs,
  Tab,
  Input,
} from "@nextui-org/react";
import {
  FaCalendarAlt,
  FaUser,
  FaClipboardList,
  FaInfoCircle,
} from "react-icons/fa";
import { AppDispatch, RootState } from "../../../../redux/store";
import { cancelCollab } from "../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../redux/Slice/profileSlice";
import TaskManagement from "../../TaskManagement/TaskManagemnt";

const CollaborationDetails = () => {
  const { collabId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("details");

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
  const today = new Date();
const startDate = new Date(collaboration.startDate);
const endDate = new Date(collaboration.endDate);
const isCollaborationCompleted = today > endDate;

// For display purposes only
const startDateDisplay = startDate.toLocaleDateString();
const endDateDisplay = endDate.toLocaleDateString();

  // Determine which user's details to show based on role
  const otherPartyDetails = isMentor
    ? collaboration.userId
    : collaboration.mentorId?.userId;
  const displayName = otherPartyDetails?.name || "Unknown";
  const profilePic = otherPartyDetails?.profilePic;

  const handleCancelMentorship = async () => {
    setShowCancelDialog(false);
    try {
      const response = await cancelCollab(collabId, reason);
      console.log(response);

      // After successful deletion, refresh the collaboration data in redux store
      await dispatch(
        fetchCollabDetails({
          userId: currentUser._id,
          role: currentUser.role,
        })
      );

      navigate("/profile");
    } catch (error) {
      console.error("Error cancelling mentorship:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Top Card with Basic Information */}
        <Card className="mb-6 shadow-md">
          <CardBody>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={profilePic}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div>
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isMentor ? "Mentee" : "Mentor"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${
                    collaboration.isCancelled
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {collaboration.isCancelled ? "Cancelled" : "Active"}
                </span>
                <p className="text-xl font-bold">₹{collaboration.price}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs for Content Organization */}
        <Tabs
          aria-label="Collaboration Options"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key.toString())}
          className="mb-6"
          variant="bordered"
          color="primary"
        >
          <Tab
            key="details"
            title={
              <div className="flex items-center gap-2">
                <FaInfoCircle />
                <span>Details</span>
              </div>
            }
          >
            <Card className="shadow-md">
              <CardBody className="space-y-6">
                {/* Timeline Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-xl text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Start Date
                      </p>
                      <p className="font-medium text-lg">{startDateDisplay}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-xl text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        End Date
                      </p>
                      <p className="font-medium text-lg">{endDateDisplay}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Slots */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500" />
                    Selected Time Slots
                  </h4>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                      {collaboration.selectedSlot[0].day}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
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

                {/* Additional Mentee/Mentor Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaUser className="text-blue-500" />
                    Contact Information
                  </h4>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Email: </span>
                      {otherPartyDetails?.email}
                    </p>
                  </div>
                </div>

                {/* Cancel Button or Message */}
                <div className="flex justify-end mt-6">
                  {isCollaborationCompleted ? (
                    <Button
                      color="success"
                      size="lg"
                      className="font-medium"
                      isDisabled
                    >
                      Collaboration Completed
                    </Button>
                  ) : isMentor ? (
                    <p className="text-gray-600 dark:text-gray-400 italic bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      Since payment is accepted, cancellation can only be
                      initiated by the mentee
                    </p>
                  ) : !collaboration.isCancelled ? (
                    <Button
                      color="danger"
                      onPress={() => setShowCancelDialog(true)}
                      size="lg"
                      className="font-medium"
                    >
                      Cancel Mentorship
                    </Button>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="tasks"
            title={
              <div className="flex items-center gap-2">
                <FaClipboardList />
                <span>Tasks</span>
              </div>
            }
          >
            <Card className="shadow-md">
              <CardHeader className="flex gap-3 bg-blue-50 dark:bg-blue-900/20">
                <FaClipboardList className="text-xl text-blue-500" />
                <div className="flex flex-col">
                  <p className="text-xl font-bold">Task Management</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track and manage tasks for this mentorship
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <TaskManagement
                  context="collaboration"
                  currentUser={currentUser}
                  contextData={collaboration}
                />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
        >
          <ModalContent>
            <ModalHeader>Cancel Mentorship</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p>
                  Are you sure you want to cancel this mentorship? Please note
                  that your payment will not be retrieved once you initiate the
                  cancellation.
                </p>
                <Input
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
    </div>
  );
};

export default CollaborationDetails;
