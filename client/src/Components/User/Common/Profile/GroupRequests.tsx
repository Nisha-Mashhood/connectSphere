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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id) {
      fetchGroupRequests();
      fetchGroups();
    }
  }, [currentUser?._id]);

  // Fetches groups created by the current user
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupDetailsWithAdminId(currentUser._id);
      // Check if response exists and has data property
      setGroups(response?.data || []);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setGroups([]); 
      // toast.error("Failed to fetch your groups");
    } finally {
      setLoading(false);
    }
  };

  // Fetches group requests sent by the current user
  const fetchGroupRequests = async () => {
    try {
      setLoading(true);
      const response = await getGroupRequestsByUser(currentUser._id);
      
      if (response?.data) {
        // Filter requests where the adminId inside groupId is NOT the current user
        const filteredRequests = response.data.filter(
          (request) => request.groupId?.adminId !== currentUser._id
        );
        setGroupRequests(filteredRequests);
      } else {
        setGroupRequests([]);
      }
    } catch (error) {
      console.error("Error fetching group requests:", error);
      setGroupRequests([]);
      toast.error("Failed to fetch group requests");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPayment = async (token, request) => {
    if (!request?.groupId?._id || !request?.groupId?.price) {
      toast.error("Invalid group information");
      return;
    }

    try {
      const response = await processStripePaymentForGroups({
        token,
        amount: request.groupId.price * 100,
        requestId: request._id,
        groupRequestData: {
          groupId: request.groupId._id,
          userId: currentUser._id,
        },
      });
  
      if (response?.status === "success") {
        toast.success("Payment successful!");
        fetchGroupRequests();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment processing failed");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Your Requests (Groups)
      </h2>
      
      {/* Group Requests Section */}
      <div className="space-y-4 mb-8">
        {groupRequests.length > 0 ? (
          groupRequests.map((request) => (
            <div
              key={request._id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold dark:text-white">
                    {request.groupId?.name || "Unknown Group"}
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

                  {request.status === "Accepted" &&
                    request.paymentStatus === "Pending" &&
                    request.groupId?.price && (
                      <div className="mt-4">
                        <StripeCheckout
                          stripeKey="pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
                          token={(token) => handleGroupPayment(token, request)}
                          amount={request.groupId.price * 100}
                          name="Group Membership Payment"
                          description={`Join ${request.groupId.name}`}
                          email={currentUser.email}
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No requests sent
          </p>
        )}
      </div>

      {/* Groups Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">
          Groups You've Created
        </h3>
        {groups.length > 0 ? (
          <GroupsSection groups={groups} />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            You haven't created any groups yet
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupRequests;