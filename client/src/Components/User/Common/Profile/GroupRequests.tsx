import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import GroupsSection from '../../Groups/Groups.Section';
import StripeCheckout from "react-stripe-checkout";
import {  getRelativeTime } from "../../../../lib/helperforprofile";
import { processStripePayment } from '../../../../Service/collaboration.Service';
import { getGroupRequestsByUser, groupDetailsWithAdminId, updateGroupRequest } from '../../../../Service/Group.Service';

const GroupRequests = () => {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [groupRequests, setGroupRequests] = useState([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [adminRequests, setAdminRequests] = useState([]);
  
    useEffect(() => {
      fetchGroupRequests();
      fetchgroups();
    }, [currentUser._id]);

    //Fetches group which is created by the current user
    const fetchgroups = async () => {
    try {
      const response = await groupDetailsWithAdminId(currentUser._id);
      console.log(response.data);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

  //fetches group request send by the current user
    const fetchGroupRequests = async () => {
      try {
        const response = await getGroupRequestsByUser(currentUser._id);
        if (response?.data) {
          // Filter requests where the adminId inside groupId is NOT the current user
          const filteredRequests = response.data.filter(
            (request) => request.groupId?.adminId !== currentUser._id
          );
    
          console.log("Filtered Group Requests:", filteredRequests);
          setGroupRequests(filteredRequests);
        }
      } catch (error) {
        console.error("Error fetching group requests:", error.message);
        toast.error(error.message);
      }
    };
  
    //Update the status of the requset(Accepted/ Rejected) to the group which is created by the current user
    const handleGroupRequestAction = async (requestId, status) => {
      try {
        await updateGroupRequest(requestId, status);
        toast.success(`Request ${status.toLowerCase()} successfully`);
        fetchGroupRequests();
      } catch (error) {
        console.error("Error updating request:", error.message);
        toast.error(error.message);
      }
    };

    //TODO get the requset get to this group

    
    //Handle the payemnt to the group which is requseted bythe current User
    const handlePayment = async (token: any) => {
            try {
              
            } catch (error: any) {
              console.error("Error processing payment:", error.message);
            }
          };
  
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Your Requsets(Groups)</h2>
      <div className="space-y-4">
        {groupRequests.map((request) => (
              <div
                key={request._id}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold dark:text-white">
                      {request.groupId.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested {getRelativeTime(request.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : request.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                    {request.status === "Accepted" && request.price > 0 && (
                      <StripeCheckout
                        stripeKey="pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
                        token={(token) =>
                          handlePayment({
                            token,
                            amount: request.price * 100,
                            requestId: request._id,
                          })
                        }
                        amount={request.price * 100}
                        name="Group Membership"
                        description={`Join ${request.groupName}`}
                        email={currentUser.email}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {groupRequests.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No requests sent
              </p>
            )}

             {/* Received Requests (Admin) */}
             {adminRequests.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">
                  Received Requests
                </h3>
                <div className="space-y-4">
                  {adminRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold dark:text-white">
                            {request.userId.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            For group: {request.groupId.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Requested {getRelativeTime(request.createdAt)}
                          </p>
                        </div>
                        {request.status === "Pending" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleGroupRequestAction(
                                  request._id,
                                  "Accepted"
                                )
                              }
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleGroupRequestAction(
                                  request._id,
                                  "Rejected"
                                )
                              }
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              request.status === "Accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
            {/*Active groups craeted by the user*/}
            <GroupsSection groups={groups} />
      </div>
    );
}

export default GroupRequests