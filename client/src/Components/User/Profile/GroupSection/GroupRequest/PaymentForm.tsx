import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@nextui-org/react";
import { FaCreditCard } from "react-icons/fa";
import { processStripePaymentForGroups } from "../../../../../Service/Group.Service";
import { formatCurrency } from "../../../../../pages/User/Profile/helper";
import { GroupRequests as GroupReq } from "../../../../../redux/types";

const stripePromise = loadStripe(
  "pk_test_51QjEUpLJKggnYdjdkq6nC53RrJ8U0Uti4Qwvw1CYK7VDzo7hqF8CVldtejMOhiJblOeipP7uwgxU8JGFMo1bD6aZ00XOGuBYhU"
);

type Props = {
  request: GroupReq;
  currentUser: { id: string; email: string };
  onSuccess: () => void;
};

const CheckoutFormInner = ({ request, currentUser, onSuccess }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const getReturnUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/profile`
      : "https://yourwebsite.com/payment-result";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const card = elements.getElement(CardElement)!;
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
      });

      if (error) {
        toast.error(error.message ?? "Card error");
        return;
      }

      const resp = await processStripePaymentForGroups({
        paymentMethodId: paymentMethod,
        amount: request.group.price * 100,
        requestId: request.id,
        email: currentUser.email,
        groupRequestData: {
          groupId: request.groupId,
          userId: currentUser.id,
        },
        returnUrl: getReturnUrl(),
      });

      if (resp?.status === "success") {
        toast.success("Payment successful!");
        onSuccess();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (err) {
      toast.error("Payment processing error.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // handle Stripe redirect result (if any)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("payment_status");
    if (status === "success") {
      toast.success("Payment successful! Your session is now booked.");
      onSuccess();
    } else if (status === "failed") {
      toast.error("Payment failed.");
    }
  }, [onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
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

      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium">Total:</span> {formatCurrency(request.group.price)}
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

export const PaymentForm = (props: Props) => (
  <Elements stripe={stripePromise}>
    <CheckoutFormInner {...props} />
  </Elements>
);