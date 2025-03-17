import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import { approveTimeSlotRequest } from "../../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../../redux/Slice/profileSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PendingRequests = ({
  pendingRequests,
  setPendingRequests,
  collabId,
  currentUser,
  loading,
  setLoading,
  dispatch,
}) => {

    const navigate = useNavigate();
  const handleRequestResponse = async (requestId, isApproved, requestType) => {
    setLoading(true);
    try {
      const response = await approveTimeSlotRequest(collabId, requestId, isApproved, requestType);
      //should change this to mentorID
      await dispatch(fetchCollabDetails({ userId: currentUser._id, role: currentUser.role }));
      setPendingRequests(pendingRequests.filter((req) => req._id !== requestId));
      console.log(response);
      if(response){
        toast.success("Time slot updated successfully");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  if (pendingRequests.length === 0) return null;

  return (
    <Card className="mb-6 shadow-md border-2 border-orange-200">
      <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
        <div className="flex flex-col">
          <p className="text-lg font-bold">Pending Requests</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? "s" : ""} to review
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const isUnavailableRequest = request.datesAndReasons !== undefined;
            const requestType = isUnavailableRequest ? "unavailable" : "timeSlot";
            const requestItems = isUnavailableRequest ? request.datesAndReasons : request.datesAndNewSlots;

            return (
              <div
                key={request._id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {request.requestedBy === "mentor" ? "Mentor" : "Mentee"} requested:
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm">
                      {isUnavailableRequest ? "Unavailable Dates" : "Time Slot Change"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      isLoading={loading}
                      onPress={() => handleRequestResponse(request._id, true, requestType)}
                      startContent={<FaCheck />}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      isLoading={loading}
                      onPress={() => handleRequestResponse(request._id, false, requestType)}
                      startContent={<FaTimes />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {requestItems.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-700 p-3 rounded">
                      <p className="font-medium">Date: {new Date(item.date).toLocaleDateString()}</p>
                      {isUnavailableRequest ? (
                        <p className="text-gray-600 dark:text-gray-400">Reason: {item.reason}</p>
                      ) : (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">New Time Slots:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.newTimeSlots.map((slot, slotIdx) => (
                              <span
                                key={slotIdx}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isUnavailableRequest && request.projectedEndDate && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-sm flex items-center gap-2">
                      <FaInfoCircle className="text-blue-600 dark:text-blue-400" />
                      If approved, end date will be extended to:{" "}
                      <strong>{new Date(request.projectedEndDate).toLocaleDateString()}</strong>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default PendingRequests;