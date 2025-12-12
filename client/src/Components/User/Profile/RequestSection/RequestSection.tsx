import { useState } from "react";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useDisclosure } from "@nextui-org/react";
import { RootState } from "../../../../redux/store";
import { useRequests } from "../../../../Hooks/User/useRequests";
import { RequestTabs } from "./RequestTabs";
import { PaymentModal } from "./PaymentModal";
import { RequestData } from "../../../../redux/types";
import BaseModal from "../../../ReusableComponents/BaseModal";

//Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface RequestsSectionProps {
  handleProfileClick: (id: string) => void;
}

const RequestsSection: React.FC<RequestsSectionProps> = ({
  handleProfileClick,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    sentRequests,
    receivedRequests,
    isLoading,
    handleAccept,
    handleReject,
    fetchRequests,
    acceptConflictModalOpen,
    setAcceptConflictModalOpen,
    acceptConflictingRequests,
    confirmAcceptWithConflict,
  } = useRequests();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );

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
      <BaseModal
        isOpen={acceptConflictModalOpen}
        onClose={() => setAcceptConflictModalOpen(false)}
        title="You already have a request at this time"
        onSubmit={confirmAcceptWithConflict}
        actionText="Continue and accept"
        cancelText="Cancel"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            You already have {acceptConflictingRequests.length} request
            {acceptConflictingRequests.length > 1 ? "s" : ""} at this same time
            slot that you have sent to other mentors.
          </p>

          <p className="text-sm text-gray-700">
            If you continue, those outgoing requests will be cancelled and this
            collaboration will be accepted.
          </p>

          <div className="mt-3 border rounded-md p-2 max-h-40 overflow-y-auto">
            {acceptConflictingRequests.map((req) => (
              <div
                key={req.id}
                className="text-xs text-gray-600 border-b last:border-b-0 py-1"
              >
                <div className="font-semibold">
                  {(req.mentorId as { userId?: { name?: string } } | undefined)
                    ?.userId?.name ?? "Other mentor"}
                </div>
                <div>
                  Slot:{" "}
                  {req.selectedSlot?.day && req.selectedSlot?.timeSlots
                    ? `${req.selectedSlot.day} - ${req.selectedSlot.timeSlots}`
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default RequestsSection;
