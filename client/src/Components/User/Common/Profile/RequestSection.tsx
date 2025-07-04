import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  getTheRequestByUser,
  getAllRequest,
  acceptTheRequest,
  rejectTheRequest,
  processStripePayment,
} from "../../../../Service/collaboration.Service";
import {
  getRelativeTime,
} from "../../../../lib/helperforprofile";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { RootState } from "../../../../redux/store";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPaperPlane, 
  FaInbox,
  FaClock,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard
} from "react-icons/fa";
import {
  Card,
  CardBody,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Button,
  Badge,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

// Load Stripe outside component to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

// Payment Form component using Stripe Elements
const PaymentForm = ({ request, onSuccessfulPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Get the current URL to use for return_url
  const getReturnUrl = () => {
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/profile` 
      : 'https://yourwebsite.com/payment-result';
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
        type: 'card',
        card: cardElement,
      });
      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }
      // Get the return URL for potential redirects
      const returnUrl = getReturnUrl();
      // Process payment with your backend
      const response = await processStripePayment({
        paymentMethodId: paymentMethod.id,
        amount: request.price * 100,
        requestId: request._id,
        email: currentUser.email,
        returnUrl: returnUrl
      });

      if (response.status === "success") {
        toast.success("Payment successful! Your session is now booked.");
        onSuccessfulPayment();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
      toast.error("Payment processing error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check URL parameters on component mount for payment result
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    
    if (paymentStatus === 'success') {
      toast.success("Payment successful! Your session is now booked.");
      onSuccessfulPayment();
    } else if (paymentStatus === 'failed') {
      toast.error("Payment failed. Please try again.");
    }
  }, [onSuccessfulPayment]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <div className="p-3 border rounded-md">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
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

const RequestsSection = ({ handleProfileClick }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails } = useSelector((state: RootState) => state.profile);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchRequests = useCallback(async () => {
  setIsLoading(true);
  try {
    // Get requests sent by the user/mentor
    const sentData = await getTheRequestByUser(currentUser._id);
    console.log("Sent Requests:", sentData);
    setSentRequests(sentData.requests || []);

    console.log("Current user Details : ",currentUser);
    console.log("Mentor Details : ",mentorDetails);//mentor deatils is coming as null check that!!!

    // Get requests received by the mentor
    if (currentUser.role === "mentor" && mentorDetails) {
      console.log("Mentor details : ",mentorDetails);
      const receivedData = await getAllRequest(mentorDetails._id);
      console.log("Received Requests:", receivedData);
      setReceivedRequests(receivedData.requests || []);
    }
  } catch (error) {
    console.error("Error fetching requests:", error.message);
    toast.error("Failed to load requests. Please try again.");
  } finally {
    setIsLoading(false);
  }
}, [currentUser, mentorDetails]);

  const handleAccept = async (requestId) => {
    try {
      await acceptTheRequest(requestId);
      toast.success("Request accepted successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error accepting request:", error.message);
      toast.error("Failed to accept request. Please try again.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectTheRequest(requestId);
      toast.success("Request rejected successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error.message);
      toast.error("Failed to reject request. Please try again.");
    }
  };

  const handlePaymentSuccess = () => {
    onClose();
    fetchRequests();
  };

  const openPaymentModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  // Status badges with consistent styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <Chip color="success" variant="flat">Accepted</Chip>;
      case "Rejected":
        return <Chip color="danger" variant="flat">Rejected</Chip>;
      case "Pending":
      default:
        return <Chip color="warning" variant="flat">Pending</Chip>;
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Check for payment redirect results
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      
      if (paymentStatus === 'success') {
        toast.success("Payment successful! Your session is now booked.");
        fetchRequests();
      }
    }
  }, [currentUser._id, fetchRequests]);

  // Render a single request card
  const renderRequestCard = (request, isSent) => {
    const otherPerson = isSent 
      ? (request.mentorId?.userId || {}) 
      : (request.userId || {});

    const profileId = isSent 
      ? (request.mentorId?._id) // Use mentorId for sent requests to mentors
      : (otherPerson._id);   

    const profilePic = otherPerson.profilePic || "/default-avatar.png";
    const name = otherPerson.name || "Unknown User";
    
    return (
      <Card key={request._id} className="mb-4 shadow-sm hover:shadow-md transition-shadow">
        <CardBody onMouseEnter={() => setSelectedRequest(request)} 
          className="cursor-pointer transition-transform duration-300 hover:scale-105">
          <div className="flex items-start gap-4">
            <Badge 
              content={getStatusBadge(request.isAccepted)} 
              placement="top-right"
              classNames={{
                badge: "border-none cursor-pointer"
              }}
            >
              <Avatar
                src={profilePic}
                className="w-16 h-16"
                isBordered={request.isAccepted === "Accepted"}
                color={request.isAccepted === "Accepted" ? "success" : 
                      request.isAccepted === "Rejected" ? "danger" : "warning"}
                onClick={() => handleProfileClick(profileId)}
                isFocusable
              />
            </Badge>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 
                    className="text-lg font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleProfileClick(profileId)}
                  >
                    {name}
                  </h3>
                  <div className="text-sm text-default-500 flex items-center gap-1 mt-1">
                    <FaCalendarAlt size={14} />
                    <span>{request.selectedSlot.day} at {request.selectedSlot.timeSlots}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {request.price && (
                    <Tooltip content="Session Fee">
                      <div className="text-sm text-default-700 flex items-center gap-1 mr-3">
                        <FaMoneyBillWave className="text-green-600" />
                        <span>${request.price}</span>
                      </div>
                    </Tooltip>
                  )}
                  
                  <div className="text-xs text-default-400 flex items-center">
                    <FaClock size={12} className="mr-1" />
                    {getRelativeTime(request.createdAt)}
                  </div>
                </div>
              </div>
              
              <p className="text-sm mt-2">
                {isSent 
                  ? `You requested a mentoring session with ${name}`
                  : `${name} requested a mentoring session with you`
                }
              </p>
              
              <div className="mt-4 flex justify-between items-center">
                {!isSent && request.isAccepted === "Pending" && (
                  <div className="flex gap-2">
                    <Button 
                      color="success" 
                      variant="flat" 
                      size="sm"
                      startContent={<FaCheckCircle />}
                      onClick={() => handleAccept(request._id)}
                    >
                      Accept
                    </Button>
                    <Button 
                      color="danger" 
                      variant="flat" 
                      size="sm"
                      startContent={<FaTimesCircle />}
                      onClick={() => handleReject(request._id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                
                {isSent && request.isAccepted === "Accepted" && (
                  <Button 
                    color="primary" 
                    variant="solid" 
                    size="sm"
                    startContent={<FaCreditCard />}
                    onClick={() => openPaymentModal(request)}
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="w-full">
      <Tabs 
        aria-label="Request tabs" 
        color="primary" 
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab
          key="sent"
          title={
            <div className="flex items-center gap-2">
              <FaPaperPlane />
              <span>Sent Requests</span>
              {sentRequests.length > 0 && (
                <Chip size="sm" variant="flat" color="primary">
                  {sentRequests.length}
                </Chip>
              )}
            </div>
          }
        >
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading sent requests...</p>
              </div>
            ) : sentRequests.length > 0 ? (
              sentRequests.map(request => renderRequestCard(request, true))
            ) : (
              <div className="text-center py-8">
                <p className="text-default-500">You haven't sent any requests yet.</p>
              </div>
            )}
          </div>
        </Tab>
        
        {currentUser.role === "mentor" && (
          <Tab
            key="received"
            title={
              <div className="flex items-center gap-2">
                <FaInbox />
                <span>Received Requests</span>
                {receivedRequests.length > 0 && (
                  <Chip size="sm" variant="flat" color="primary">
                    {receivedRequests.length}
                  </Chip>
                )}
              </div>
            }
          >
            <div className="mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading received requests...</p>
                </div>
              ) : receivedRequests.length > 0 ? (
                receivedRequests.map(request => renderRequestCard(request, false))
              ) : (
                <div className="text-center py-8">
                  <p className="text-default-500">You haven't received any requests yet.</p>
                </div>
              )}
            </div>
          </Tab>
        )}
      </Tabs>

      {/* Payment Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Complete Payment</ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">
                        Session Details
                      </h3>
                      <p className="text-sm text-default-500">
                        Mentor: {selectedRequest.mentorId?.userId?.name}
                      </p>
                      <p className="text-sm text-default-500">
                        Date: {selectedRequest.selectedSlot.day} at {selectedRequest.selectedSlot.timeSlots}
                      </p>
                      <p className="text-sm text-default-500">
                        Fee: ${selectedRequest.price}
                      </p>
                    </div>
                    
                    <Elements stripe={stripePromise}>
                      <PaymentForm 
                        request={selectedRequest} 
                        onSuccessfulPayment={handlePaymentSuccess} 
                      />
                    </Elements>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RequestsSection;