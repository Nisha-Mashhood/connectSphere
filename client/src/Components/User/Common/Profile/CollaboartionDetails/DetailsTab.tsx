import { Button } from "@nextui-org/react";
import { FaCalendarAlt, FaClock, FaBan } from "react-icons/fa";

const DetailsTab = ({
  collaboration,
  setShowTimeSlotsModal,
  setShowUnavailableDatesModal,
  setShowCancelDialog,
}) => {
  const today = new Date();
  const startDate = new Date(collaboration.startDate);
  const endDate = new Date(collaboration.endDate || collaboration.startDate); // Fallback to startDate if endDate is null
  const isCollaborationCompleted = today > endDate;
  const startDateDisplay = startDate.toLocaleDateString();
  const endDateDisplay = endDate.toLocaleDateString();

  // Count approved entries
  const maxUpdates = 3;
  const approvedTimeSlotChangeCount = collaboration.temporarySlotChanges.filter(
    (change) => change.isApproved === "approved"
  ).length;

  const approvedUnavailableDaysCount = collaboration.unavailableDays.filter(
    (day) => day.isApproved === "approved"
  ).length;

  // Approved entries with requester info
  const approvedUnavailableDays = collaboration.unavailableDays
    .filter((day) => day.isApproved === "approved")
    .map((day) => ({
      requestedBy: day.requestedBy,
      datesAndReasons: day.datesAndReasons,
    }))
    .flatMap((entry) =>
      entry.datesAndReasons.map((dr) => ({
        date: dr.date,
        reason: dr.reason,
        requestedBy: entry.requestedBy,
      }))
    );

  const approvedTimeSlotChanges = collaboration.temporarySlotChanges
    .filter((change) => change.isApproved === "approved")
    .map((change) => ({
      requestedBy: change.requestedBy,
      datesAndNewSlots: change.datesAndNewSlots,
    }))
    .flatMap((entry) =>
      entry.datesAndNewSlots.map((dns) => ({
        date: dns.date,
        newTimeSlots: dns.newTimeSlots,
        requestedBy: entry.requestedBy,
      }))
    );

  // Disable conditions: 3 approved entries, completed, or canceled
  const isEditTimeSlotsDisabled =
    approvedTimeSlotChangeCount >= maxUpdates ||
    isCollaborationCompleted ||
    collaboration.isCancelled;

  const isMarkUnavailableDisabled =
    approvedUnavailableDaysCount >= maxUpdates ||
    isCollaborationCompleted ||
    collaboration.isCancelled;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Dates Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <FaCalendarAlt className="text-xl text-indigo-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {startDateDisplay}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <FaCalendarAlt className="text-xl text-indigo-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {endDateDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FaClock className="text-indigo-500" />
            Selected Time Slots
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="light"
              startContent={<FaClock />}
              onPress={() => setShowTimeSlotsModal(true)}
              isDisabled={isEditTimeSlotsDisabled}
              className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900"
              title={
                isEditTimeSlotsDisabled
                  ? approvedTimeSlotChangeCount >= maxUpdates
                    ? `${maxUpdates} time slot updates already applied, no more updates possible`
                    : "Cannot edit after completion or cancellation"
                  : "Edit time slots"
              }
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="warning"
              variant="light"
              startContent={<FaBan />}
              onPress={() => setShowUnavailableDatesModal(true)}
              isDisabled={isMarkUnavailableDisabled}
              className="text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
              title={
                isMarkUnavailableDisabled
                  ? approvedUnavailableDaysCount >= maxUpdates
                    ? `${maxUpdates} unavailable slots already applied, no more updates possible`
                    : "Cannot mark unavailable after completion or cancellation"
                  : "Mark days unavailable"
              }
            >
              Mark Unavailable
            </Button>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-md font-medium text-indigo-700 dark:text-indigo-300">
            {collaboration.selectedSlot[0].day}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {collaboration.selectedSlot[0].timeSlots.map((time, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-md text-sm"
              >
                {time}
              </span>
            ))}
          </div>
          {approvedTimeSlotChanges.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Temporary Time Slot Changes
              </p>
              {approvedTimeSlotChanges.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-md mb-2"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(change.date).toLocaleDateString()}:{" "}
                    <span className="font-medium">{change.newTimeSlots.join(", ")}</span>
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Requested by {change.requestedBy === "mentor" ? "Mentor" : "User"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* No-Session Days Section */}
      {approvedUnavailableDays.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <FaBan className="text-yellow-500" />
            No-Session Days
          </h3>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            {approvedUnavailableDays.map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-md mb-2"
              >
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(day.date).toLocaleDateString()} -{" "}
                  <span className="font-medium">{day.reason}</span>
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Requested by {day.requestedBy === "mentor" ? "Mentor" : "User"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {!collaboration.isCancelled && !isCollaborationCompleted && (
        <div className="flex justify-end">
          <Button
            color="danger"
            variant="light"
            onPress={() => setShowCancelDialog(true)}
            className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
          >
            Cancel Mentorship
          </Button>
        </div>
      )}
    </div>
  );
};

export default DetailsTab;