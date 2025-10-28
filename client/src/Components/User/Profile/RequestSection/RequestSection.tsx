import { useState } from "react";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useDisclosure } from "@nextui-org/react";
import { RootState } from "../../../../redux/store";
import { useRequests } from "../../../../Hooks/User/useRequests";
import { RequestTabs } from "./RequestTabs";
import { PaymentModal } from "./PaymentModal";
import { RequestData } from "../../../../redux/types";

//Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface RequestsSectionProps {
  handleProfileClick: (id: string) => void;
}

const RequestsSection: React.FC<RequestsSectionProps> = ({ handleProfileClick }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { sentRequests, receivedRequests, isLoading, handleAccept, handleReject, fetchRequests } =
    useRequests();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);

  const openPaymentModal = (request: RequestData) => {
    setSelectedRequest(request);
    onOpen();
  };

  return (
    <div className="w-full">
      <RequestTabs
        sentRequests={sentRequests}
        receivedRequests={receivedRequests}
        isLoading={isLoading}
        isMentor={currentUser.role === "mentor"}
        handleProfileClick={handleProfileClick}
        handleAccept={handleAccept}
        handleReject={handleReject}
        openPaymentModal={openPaymentModal}
      />
      <PaymentModal
        isOpen={isOpen}
        onClose={() => {
          setSelectedRequest(null);
          onClose();
          fetchRequests();
        }}
        request={selectedRequest}
        stripePromise={stripePromise}
      />
    </div>
  );
};

export default RequestsSection;