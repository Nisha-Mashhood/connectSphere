import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { processStripePayment } from "../../Service/collaboration.Service";
import { AppDispatch, RootState } from "../../redux/store";
import { RequestData } from "../../redux/types";
import { getReturnUrl } from "../../pages/User/Profile/helper";
import { Stripe,StripeElements } from "@stripe/stripe-js";
import { fetchCollabDetails } from "../../redux/Slice/profileSlice";

interface UsePaymentReturn {
  isProcessing: boolean;
  handlePayment: (stripe: Stripe | null, elements: StripeElements | null) => Promise<void>;
}

export const usePayment = (request: RequestData | null, onSuccess: () => void): UsePaymentReturn => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

 const refreshCollaborations = useCallback(async () => {
  if (!currentUser?.id || !request) return;

  // USER side
  await dispatch(
    fetchCollabDetails({ userId: currentUser.id, role: "user" })
  );

  // MENTOR side
  if (request.mentorId) {
    await dispatch(
      fetchCollabDetails({
        userId: currentUser.id,
        role: "mentor",
        mentorId: request.mentorId,
      })
    );
  }
}, [currentUser?.id, request, dispatch]);

  const handlePayment = async (stripe: Stripe | null, elements: StripeElements | null): Promise<void> => {
    if (!stripe || !elements || !request) return;
    setIsProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Card details not found.");
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        toast.error(error.message || "Failed to create payment method.");
        return;
      }

      const returnUrl = getReturnUrl();
      const response = await processStripePayment({
        paymentMethodId: paymentMethod.id,
        amount: request.price * 100,
        requestId: request.id,
        email: currentUser.email,
        returnUrl,
      });

      if (response.status === "success") {
        toast.success("Payment successful! Your session is now booked.");
        await refreshCollaborations();
        onSuccess();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Error processing payment:", err);
      toast.error("Payment processing error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your session is now booked.");
      refreshCollaborations();
      onSuccess();
      urlParams.delete("payment_status");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${urlParams.toString() ? `?${urlParams}` : ""}`
      );
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
    }
  }, [onSuccess, refreshCollaborations]);

  return { isProcessing, handlePayment };
};
