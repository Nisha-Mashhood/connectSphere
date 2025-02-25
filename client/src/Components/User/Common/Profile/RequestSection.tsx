import { useState, useEffect } from "react";
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
import StripeCheckout from "react-stripe-checkout";
import { RootState } from "../../../../redux/store";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPaperPlane, 
  FaInbox,
  FaClock,
  FaCalendarAlt,
  FaMoneyBillWave
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
} from "@nextui-org/react";

const RequestsSection = ({ handleProfileClick }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails } = useSelector((state: RootState) => state.profile);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Get requests sent by the user/mentor
      const sentData = await getTheRequestByUser(currentUser._id);
      setSentRequests(sentData.requests || []);

      // Get requests received by the mentor (if applicable)
      if (currentUser.role === "mentor" && mentorDetails) {
        const receivedData = await getAllRequest(mentorDetails._id);
        setReceivedRequests(receivedData.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error.message);
      toast.error("Failed to load requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handlePayment = async (token) => {
    try {
      const response = await processStripePayment({
        token,
        amount: selectedRequest.price * 100,
        requestId: selectedRequest._id,
      });

      if (response.status === "success") {
        toast.success("Payment successful! Your session is now booked.");
        fetchRequests();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
      toast.error("Payment processing error. Please try again.");
    }
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
  }, [currentUser._id]);

  // Render a single request card
  const renderRequestCard = (request, isSent) => {
    const otherPerson = isSent 
      ? (request.mentorId?.userId || {}) 
      : (request.userId || {});
    
    const profilePic = otherPerson.profilePic || "/default-avatar.png";
    const name = otherPerson.name || "Unknown User";
    
    return (
      <Card key={request._id} className="mb-4 shadow-sm hover:shadow-md transition-shadow">
        <CardBody>
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
                onClick={() => handleProfileClick(otherPerson._id)}
                isFocusable
              />
            </Badge>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 
                    className="text-lg font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleProfileClick(otherPerson._id)}
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
                
                {isSent && request.isAccepted === "Accepted" && !request.isPaid && (
                  <StripeCheckout
                  stripeKey="pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
                  token={handlePayment}
                  amount={request.price * 100}
                  name="ConnectSphere Mentorship"
                  description={`Book a slot with ${request.mentorId?.userId?.name}`}
                  email={currentUser.email}
                ></StripeCheckout>
                )}
                
                {request.isPaid && (
                  <Chip color="success" variant="flat">
                    Paid Session
                  </Chip>
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
    </div>
  );
};

export default RequestsSection;