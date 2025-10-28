import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaCreditCard } from "react-icons/fa";
import { RequestData } from "../../../../redux/types";
import { usePayment } from "../../../../Hooks/User/usePayment";
import { Stripe } from "@stripe/stripe-js";
import { formatCurrency } from "../../../../pages/User/Profile/helper";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestData | null;
  stripePromise: Promise<Stripe | null>;
}

// Child component to use useStripe and useElements within Elements provider
const PaymentForm: React.FC<{ request: RequestData | null; onClose: () => void }> = ({ request, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { isProcessing, handlePayment } = usePayment(request, onClose);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePayment(stripe, elements);
      }}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
                invalid: { color: "#9e2146" },
              },
            }}
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">
          <span className="font-medium">Total:</span>{formatCurrency(request?.price || 0)}
        </div>
        <Button
          type="submit"
          color="primary"
          isLoading={isProcessing}
          isDisabled={isProcessing || !stripe}
          startContent={!isProcessing && <FaCreditCard />}
        >
          Pay Now
        </Button>
      </div>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, request, stripePromise }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Complete Payment</ModalHeader>
            <ModalBody>
              {request ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">Session Details</h3>
                    <p className="text-sm text-default-500">Mentor: {request.mentor?.user?.name || "Unknown"}</p>
                    <p className="text-sm text-default-500">
                      Date: {request.selectedSlot.day} at {request.selectedSlot.timeSlots}
                    </p>
                    <p className="text-sm text-default-500">Fee: ${request.price}</p>
                  </div>
                  <Elements stripe={stripePromise}>
                    <PaymentForm request={request} onClose={onClose} />
                  </Elements>
                </div>
              ) : (
                <p className="text-sm text-default-500">No request selected.</p>
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
  );
};