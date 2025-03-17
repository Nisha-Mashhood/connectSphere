import { Card, CardBody, Button } from "@nextui-org/react";
import { FaCalendarAlt, FaClock, FaBan } from "react-icons/fa";

const DetailsTab = ({
  collaboration,
  isMentor,
  setShowTimeSlotsModal,
  setShowUnavailableDatesModal,
  setShowCancelDialog,
}) => {
  const today = new Date();
  const startDate = new Date(collaboration.startDate);
  const endDate = new Date(collaboration.endDate);
  const isCollaborationCompleted = today > endDate;
  const startDateDisplay = startDate.toLocaleDateString();
  const endDateDisplay = endDate.toLocaleDateString();

  // Check for pending requests made by the current user (existing logic)
  const pendingTimeSlotRequestsByUser = collaboration.temporarySlotChanges.filter(
    (change) =>
      !change.isApproved && change.requestedBy === (isMentor ? "mentor" : "user")
  ).length;

  const pendingUnavailableRequestsByUser = collaboration.unavailableDays.filter(
    (day) => !day.isApproved && day.requestedBy === (isMentor ? "mentor" : "user")
  ).length;

  // Check for any pending requests (from either party)
  const hasAnyPendingTimeSlotRequest = collaboration.temporarySlotChanges.some(
    (change) => !change.isApproved
  );

  const hasAnyPendingUnavailableRequest = collaboration.unavailableDays.some(
    (day) => !day.isApproved
  );

  // Check for approved entries (only one change allowed)
  const hasApprovedTimeSlotChange = collaboration.temporarySlotChanges.some(
    (change) => change.isApproved
  );

  const hasApprovedUnavailableDays = collaboration.unavailableDays.some(
    (day) => day.isApproved
  );

  // Disable conditions
  const isEditTimeSlotsDisabled =
    pendingTimeSlotRequestsByUser >= 3 || // Max 3 pending requests by user
    hasAnyPendingTimeSlotRequest || // Any pending time slot request
    hasApprovedTimeSlotChange || // Already approved once
    isCollaborationCompleted; // Collaboration is completed

  const isMarkUnavailableDisabled =
    pendingUnavailableRequestsByUser >= 3 || // Max 3 pending requests by user
    hasAnyPendingUnavailableRequest || // Any pending unavailable request
    hasApprovedUnavailableDays || // Already approved once
    isCollaborationCompleted; // Collaboration is completed

  return (
    <Card className="shadow-md">
      <CardBody className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="text-xl text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="font-medium text-lg">{startDateDisplay}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="text-xl text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
              <p className="font-medium text-lg">{endDateDisplay}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              Selected Time Slots
            </h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<FaClock />}
                onPress={() => setShowTimeSlotsModal(true)}
                isDisabled={isEditTimeSlotsDisabled}
                title={
                  isEditTimeSlotsDisabled
                    ? hasApprovedTimeSlotChange
                      ? "Time slots can only be changed once after approval."
                      : hasAnyPendingTimeSlotRequest
                      ? "Cannot edit while there are pending time slot requests."
                      : "Cannot edit due to pending requests or completed collaboration."
                    : "Edit time slots"
                }
              >
                Edit Time Slots
              </Button>
              <Button
                size="sm"
                color="warning"
                variant="flat"
                startContent={<FaBan />}
                onPress={() => setShowUnavailableDatesModal(true)}
                isDisabled={isMarkUnavailableDisabled}
                title={
                  isMarkUnavailableDisabled
                    ? hasApprovedUnavailableDays
                      ? "Days can only be marked unavailable once after approval."
                      : hasAnyPendingUnavailableRequest
                      ? "Cannot mark unavailable while there are pending requests."
                      : "Cannot mark unavailable due to pending requests or completed collaboration."
                    : "Mark days unavailable"
                }
              >
                Mark Days Unavailable
              </Button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              {collaboration.selectedSlot[0].day}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {collaboration.selectedSlot[0].timeSlots.map((time, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          {!collaboration.isCancelled && !isCollaborationCompleted && (
            <Button
              color="danger"
              variant="flat"
              onPress={() => setShowCancelDialog(true)}
            >
              Cancel Mentorship
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default DetailsTab;