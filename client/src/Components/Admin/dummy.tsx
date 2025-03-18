 <table className="min-w-full divide-y divide-gray-200">

                </table>















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

  // Approved unavailable days
  const approvedUnavailableDays = collaboration.unavailableDays
    .filter((day) => day.isApproved === "approved")
    .flatMap((day) => day.datesAndReasons);

  // Approved temporary time slot changes
  const approvedTimeSlotChanges = collaboration.temporarySlotChanges
    .filter((change) => change.isApproved === "approved")
    .flatMap((change) => change.datesAndNewSlots);

  // Validation for disabling buttons
  const maxUpdates = 3;
  const unavailableCount = collaboration.unavailableDays.filter((day) => day.isApproved === "approved").length;
  const timeSlotChangeCount = collaboration.temporarySlotChanges.filter((change) => change.isApproved === "approved").length;
  const isEditTimeSlotsDisabled = timeSlotChangeCount >= maxUpdates || isCollaborationCompleted || collaboration.isCancelled;
  const isMarkUnavailableDisabled = unavailableCount >= maxUpdates || isCollaborationCompleted || collaboration.isCancelled;

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
              <FaClock className="text-blue-500" />
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
                title={isEditTimeSlotsDisabled ? (timeSlotChangeCount >= maxUpdates ? "3 time slot updates already applied, no more updates possible" : "Cannot edit after completion or cancellation") : ""}
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
                title={isMarkUnavailableDisabled ? (unavailableCount >= maxUpdates ? "3 unavailable slots already applied, no more updates possible" : "Cannot mark after completion or cancellation") : ""}
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
            {approvedTimeSlotChanges.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Temporary Time Slot Changes:</p>
                {approvedTimeSlotChanges.map((change, idx) => (
                  <div key={idx} className="mt-2">
                    <p className="text-sm">
                      {new Date(change.date).toLocaleDateString()}:{" "}
                      {change.newTimeSlots.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {approvedUnavailableDays.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <FaBan className="text-yellow-500" />
              No-Session Days
            </h4>
            <div className="space-y-2">
              {approvedUnavailableDays.map((day, idx) => (
                <p key={idx} className="text-sm">
                  {new Date(day.date).toLocaleDateString()} - Reason: {day.reason}
                </p>
              ))}
            </div>
          </div>
        )}

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