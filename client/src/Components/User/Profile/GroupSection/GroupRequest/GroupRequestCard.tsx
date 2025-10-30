import { useState } from "react";
import { getRelativeTime } from "../../../../../pages/User/Profile/helper";
import { PaymentForm } from "./PaymentForm";
import { GroupRequests as GroupReq } from "../../../../../redux/types";

type Props = {
  request: GroupReq;
  currentUser: { id: string; email: string };
  onPaymentSuccess: () => void;
};

export const GroupRequestCard = ({
  request,
  currentUser,
  onPaymentSuccess,
}: Props) => {
  const [showPayment, setShowPayment] = useState(false);

  const isPendingPayment =
    request.status === "Accepted" &&
    request.paymentStatus === "Pending" &&
    request.group?.price;

  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <p className="font-semibold dark:text-white">
            {request.group?.name ?? "Unknown Group"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Requested {getRelativeTime(request.createdAt)}
          </p>
        </div>

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

      {isPendingPayment && (
        <div className="mt-3">
          {request.group.isFull ? (
            <span className="text-red-500 font-medium">
              Group is full (max 4 members). Payment unavailable.
            </span>
          ) : showPayment ? (
            <PaymentForm
              request={request}
              currentUser={currentUser}
              onSuccess={() => {
                setShowPayment(false);
                onPaymentSuccess();
              }}
            />
          ) : (
            <button
              onClick={() => setShowPayment(true)}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
            >
              Pay ₹{request.group.price}
            </button>
          )}
        </div>
      )}
    </div>
  );
};