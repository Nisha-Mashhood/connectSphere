import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import GroupsSection from "../../Groups/Groups.Section";
import {
  getGroupRequestsByUser,
  groupDetailsWithAdminId,
  processStripePaymentForGroups,
} from "../../../../Service/Group.Service";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@nextui-org/react";
import { FaCreditCard } from "react-icons/fa";
import { Group } from "../../../../types";
import { getRelativeTime } from "../../../../pages/User/Profile/helper";

// Initialize Stripe outside the component
const stripePromise = loadStripe(
  "pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
);

// Payment Form Component
const CheckoutForm = ({ request, currentUser, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the current URL to use for return_url
  const getReturnUrl = () => {
    // Use window.location if available, or fallback to a hardcoded base URL
    return typeof window !== "undefined"
      ? `${window.location.origin}/profile`
      : "https://yourwebsite.com/payment-result";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      // Get the return URL for potential redirects
      const returnUrl = getReturnUrl();

      const response = await processStripePaymentForGroups({
        paymentMethodId: paymentMethod,
        amount: request.groupId.price * 100,
        requestId: request._id,
        email: currentUser.email,
        groupRequestData: {
          groupId: request.groupId._id,
          userId: currentUser._id,
        },
        returnUrl: returnUrl,
      });

      console.log("Payemnt response : ",response);
      if (response?.status === "success") {
        toast.success("Payment successful!");
        onSuccess();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (err) {
      toast.error("Payment processing error. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check URL parameters on component mount for payment result
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");

    if (paymentStatus === "success") {
      toast.success("Payment successful! Your session is now booked.");
      onSuccess();
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
    }
  }, [onSuccess]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">
          <span className="font-medium">Total:</span> ${request.price}
        </div>
        <Button
          type="submit"
          color="primary"
          isLoading={isProcessing}
          isDisabled={!stripe || isProcessing}
          startContent={!isProcessing && <FaCreditCard />}
        >
          Pay Now
        </Button>
      </div>
    </form>
  );
};

const GroupRequests = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [groupRequests, setGroupRequests] = useState([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentRequest, setPaymentRequest] = useState(null);

  
  // Fetches groups created by the current user
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await groupDetailsWithAdminId(currentUser._id);
      console.log(`fetched Groups for adminId ${currentUser._id} is ${response}`);
      // Check if response exists and has data property
      setGroups(response || []);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setGroups([]);
      // toast.error("Failed to fetch your groups");
    } finally {
      setLoading(false);
    }
  },[currentUser._id]);

  // Fetches group requests sent by the current user
  const fetchGroupRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getGroupRequestsByUser(currentUser._id);
      console.log("Group request sent :",response);

      if (response) {
        // Filter requests where the adminId inside groupId is NOT the current user
        const filteredRequests = response.filter(
          (request) => request.groupId?.adminId !== currentUser._id
        );

        console.log("Filtered Requset : ",filteredRequests)
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
  },[currentUser._id]);

  useEffect(() => {
    if (currentUser?._id) {
      fetchGroupRequests();
      fetchGroups();
    }
  }, [currentUser?._id, fetchGroupRequests, fetchGroups]);



  const handlePaymentSuccess = () => {
    fetchGroupRequests();
    setPaymentRequest(null);
  };

  const showPaymentForm = (request) => {
    setPaymentRequest(request);
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
              <div className="flex items-center justify-between flex-wrap">
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
                </div>
              </div>

              {request.status === "Accepted" &&
              request.paymentStatus === "Pending" &&
              request.groupId?.price ? (
                request.groupId.isFull ? (
                  <div className="mt-3">
                    <span className="text-red-500 font-medium">
                      Cannot process payment. Group is already full (maximum 4
                      members).
                    </span>
                  </div>
                ) : (
                  <div className="mt-3">
                    {paymentRequest && paymentRequest._id === request._id ? (
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          request={request}
                          currentUser={currentUser}
                          onSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    ) : (
                      <button
                        onClick={() => showPaymentForm(request)}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                      >
                        Pay ₹{request.groupId.price}
                      </button>
                    )}
                  </div>
                )
              ) : null}
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
