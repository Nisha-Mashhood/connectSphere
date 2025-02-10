import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GroupsSection from "../../Groups/Groups.Section";
import StripeCheckout from "react-stripe-checkout";
import { getRelativeTime } from "../../../../lib/helperforprofile";
import {
  getGroupRequestsByUser,
  groupDetailsWithAdminId,
  processStripePaymentForGroups,
} from "../../../../Service/Group.Service";

const GroupRequests = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupRequests, setGroupRequests] = useState([]);
  const [groups, setGroups] = useState<any[]>([]);

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

  const handleGroupPayment = async (token, request) => {
    try {
      const response = await  processStripePaymentForGroups({
        token,
        amount: request?.groupId?.price * 100,
        requestId: request._id,
        groupRequestData: {
          groupId: request.groupId._id,
          userId: currentUser._id,
        },
      });
  
      if (response.status === "success") {
        toast.success("Payment successful!");
        fetchGroupRequests();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Your Requsets(Groups)
      </h2>
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

                {/* Show Stripe Payment Button if Status is Accepted and Payment is Pending */}
                {request.status === "Accepted" &&
                  request.paymentStatus === "Pending" && (
                    <div className="mt-4">
                      <StripeCheckout
                        stripeKey="pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
                        token={(token) => handleGroupPayment(token, request)}
                        amount={request?.groupId?.price * 100}
                        name="Group Membership Payment"
                        description={`Join ${request.groupId.name}`}
                        email={currentUser.email}
                      />
                    </div>
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
      </div>
      {/*Active groups craeted by the user*/}
      <GroupsSection groups={groups} />
    </div>
  );
};

export default GroupRequests;
