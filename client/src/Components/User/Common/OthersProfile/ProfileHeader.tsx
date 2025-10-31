import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  sendUser_UserRequset,
  respondToUser_UserRequest,
} from "../../../../Service/User-User.Service";
import { fetchUserConnections } from "../../../../redux/Slice/profileSlice";
import { Mentor, RequestData, User, UserConnections } from "../../../../redux/types";
import { AppDispatch } from "../../../../redux/store";

interface Props {
  isMentor: boolean;
  mentor?: Mentor;
  user?: User;
  currentUserId: string;
  profileId: string;
  hasExistingCollaboration: boolean;
  existingRequest?: RequestData;
  userConnections?: UserConnections;
  openBookingModal: () => void;
  dispatch: AppDispatch;
}

export const ProfileHeader: React.FC<Props> = ({
  isMentor,
  mentor,
  user,
  currentUserId,
  profileId,
  hasExistingCollaboration,
  existingRequest,
  userConnections,
  openBookingModal,
  dispatch,
}) => {
  const handleConnect = async () => {
    try {
      await sendUser_UserRequset(currentUserId, profileId);
      toast.success("Connection Request sent");
      dispatch(fetchUserConnections(currentUserId));
    } catch (error) {
        console.log(error)
      toast.error("Failed to send request");
    }
  };

  const handleResponse = async (reqId: string, action: "Accepted" | "Rejected") => {
    try {
      await respondToUser_UserRequest(reqId, action);
      toast.success(`Request ${action}`);
      dispatch(fetchUserConnections(currentUserId));
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const receivedPending = userConnections?.received?.find(
    (r) => r.requester.id === profileId && r.requestStatus === "Pending"
  );

  const sentPending = userConnections?.sent?.find(
    (r) => r.recipient?.id === profileId && r.requestStatus === "Pending"
  );

  const isConnected = !!(
    userConnections?.sent?.find(
      (r) =>
        r.recipient?.id === profileId &&
        (r.connectionStatus === "Connected" || r.requestStatus === "Accepted")
    ) ||
    userConnections?.received?.find(
      (r) =>
        r.requester.id === profileId &&
        (r.connectionStatus === "Connected" || r.requestStatus === "Accepted")
    )
  );

  const rejected = userConnections?.sent?.find(
    (r) => r.recipient?.id === profileId && r.requestStatus === "Rejected"
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex sm:space-x-5">
          <div className="flex-shrink-0">
            <img
              src={
                isMentor
                  ? mentor?.user?.profilePic || "/api/placeholder/150/150"
                  : user?.profilePic || "/api/placeholder/150/150"
              }
              alt={isMentor ? mentor?.user?.name : user?.name}
              className="mx-auto h-32 w-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <div className="mt-4 sm:mt-0 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {isMentor ? mentor?.user?.name : user?.name}
            </h1>
            <p className="text-xl text-gray-600">
              {isMentor ? mentor?.specialization : user?.jobTitle}
            </p>
          </div>
        </div>

        <div className="mt-5 sm:mt-0">
          {currentUserId === profileId ? (
            <p className="text-gray-500 font-semibold">This is your profile</p>
          ) : !isMentor ? (
            /* USER PROFILE CTA */
            <div>
              {receivedPending ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(receivedPending.id, "Accepted")}
                    className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center gap-1"
                  >
                    <FaCheckCircle /> Accept
                  </button>
                  <button
                    onClick={() => handleResponse(receivedPending.id, "Rejected")}
                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center gap-1"
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              ) : sentPending ? (
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-md" disabled>
                  Request Sent
                </button>
              ) : isConnected ? (
                <button className="bg-green-600 text-white px-4 py-2 rounded-md" disabled>
                  Connected
                </button>
              ) : rejected ? (
                <button
                  onClick={handleConnect}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Request Again
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
          ) : hasExistingCollaboration ? (
            <p className="text-green-600 font-semibold">
              Already in Collaboration
            </p>
          ) : existingRequest ? (
            <p
              className={`font-semibold ${
                existingRequest.isAccepted === "Pending"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {existingRequest.isAccepted === "Pending"
                ? "Request Pending"
                : "Request Approved"}
            </p>
          ) : (
            <button
              onClick={openBookingModal}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Book Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};