import { Card, CardBody, Avatar, Badge, Button, Tooltip } from "@nextui-org/react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave, FaCreditCard, FaCalendarAlt } from "react-icons/fa";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, getRelativeTime, getRequestProfile } from "../../../../pages/User/Profile/helper";
import { RequestData } from "../../../../redux/types";

interface RequestCardProps {
  request: RequestData;
  isSent: boolean;
  handleProfileClick: (id: string) => void;
  handleAccept?: (id: string) => void;
  handleReject?: (id: string) => void;
  openPaymentModal?: (request: RequestData) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isSent,
  handleProfileClick,
  handleAccept,
  handleReject,
  openPaymentModal,
}) => {
  const { profileId, profilePic, name } = getRequestProfile(request, isSent);

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="cursor-pointer transition-transform duration-300 hover:scale-105">
        <div className="flex items-start gap-4">
          <Badge
            content={<StatusBadge status={request.isAccepted} />}
            placement="top-right"
            classNames={{ badge: "border-none cursor-pointer" }}
          >
            <Avatar
              src={profilePic}
              className="w-16 h-16"
              isBordered={request.isAccepted === "Accepted"}
              color={request.isAccepted === "Accepted" ? "success" : request.isAccepted === "Rejected" ? "danger" : "warning"}
              onClick={() => handleProfileClick(profileId)}
              isFocusable
            />
          </Badge>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className="text-lg font-medium cursor-pointer hover:text-primary transition colors"
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
                      <span>{formatCurrency(request.price)}</span>
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
                : `${name} requested a mentoring session with you`}
            </p>
            <div className="mt-4 flex justify-between items-center">
              {!isSent && request.isAccepted === "Pending" && handleAccept && handleReject && (
                <div className="flex gap-2">
                  <Button
                    color="success"
                    variant="flat"
                    size="sm"
                    startContent={<FaCheckCircle />}
                    onClick={() => handleAccept(request.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    startContent={<FaTimesCircle />}
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </Button>
                </div>
              )}
              {isSent && request.isAccepted === "Accepted" && openPaymentModal && (
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