import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { FaTimes } from "react-icons/fa";
import { updateTimeSlots } from "../../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../../redux/Slice/profileSlice";
import toast from "react-hot-toast";

const TimeSlotsModal = ({
  isOpen,
  onClose,
  collaboration,
  currentUser,
  selectedDatesForTimeSlot,
  setSelectedDatesForTimeSlot,
  newTimeSlotsMap,
  setNewTimeSlotsMap,
  loading,
  setLoading,
  dispatch,
  collabId,
}) => {
  const availableTimeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  ];

  const selectedDay = collaboration.selectedSlot[0].day; 

  const getSelectedDayOfWeek = () => {
    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    return dayMap[selectedDay] !== undefined ? dayMap[selectedDay] : -1;
  };

  const generateDateList = () => {
    const dateList = [];
    const startDate = new Date(collaboration.startDate);
    const endDate = new Date(collaboration.endDate);
    const currentDate = new Date(startDate);
    const selectedDayOfWeek = getSelectedDayOfWeek();

    while (currentDate <= endDate) {
      if (currentDate.getDay() === selectedDayOfWeek) {
        dateList.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateList;
  };

  const dateList = generateDateList();
  const isDateSelectable = (date) => new Date().setHours(0, 0, 0, 0) <= date;
  const isDateUnavailable = (date) =>
    collaboration.unavailableDays.some((dayGroup) =>
      dayGroup.datesAndReasons.some(
        (item) => new Date(item.date).toDateString() === date.toDateString() && dayGroup.isApproved
      )
    );

  const handleDateSelectForTimeSlot = (date) => {
    const dateString = date.toDateString();
    const isAlreadySelected = selectedDatesForTimeSlot.some((d) => d.toDateString() === dateString);

    if (isAlreadySelected) {
      // Deselect the date and remove its time slot
      setSelectedDatesForTimeSlot(selectedDatesForTimeSlot.filter((d) => d.toDateString() !== dateString));
      const updatedMap = { ...newTimeSlotsMap };
      delete updatedMap[dateString];
      setNewTimeSlotsMap(updatedMap);
    } else {
      // Check if the limit of 3 dates has been reached
      if (selectedDatesForTimeSlot.length >= 3) {
        alert("You can only select up to 3 dates.");
        return;
      }
      // Select the date and initialize with no time slot
      setSelectedDatesForTimeSlot([...selectedDatesForTimeSlot, date]);
      const existingTimeSlotChange = collaboration.temporarySlotChanges
        .filter((change) => change.isApproved)
        .flatMap((change) => change.datesAndNewSlots)
        .find((item) => new Date(item.date).toDateString() === dateString);
      setNewTimeSlotsMap({
        ...newTimeSlotsMap,
        [dateString]: existingTimeSlotChange ? [existingTimeSlotChange.newTimeSlots[0]] : [], // Take the first time slot if it exists
      });
    }
  };

  const handleTimeSlotSelectForDate = (date, timeSlot) => {
    const dateString = date.toDateString();
    // Only allow one time slot per date by replacing the existing one
    setNewTimeSlotsMap({
      ...newTimeSlotsMap,
      [dateString]: [timeSlot], // Replace with the newly selected time slot
    });
  };

  const submitTimeSlotChanges = async () => {
    if (selectedDatesForTimeSlot.length === 0) {
      alert("Please select at least one date.");
      return;
    }
    if (selectedDatesForTimeSlot.some((date) => !newTimeSlotsMap[date.toDateString()] || newTimeSlotsMap[date.toDateString()].length === 0)) {
      toast.error("Please select one time slot for each selected date.");
      return;
    }

    setLoading(true);
    try {
      const requestedBy = currentUser.role === "mentor" ? "mentor" : "user";
      const approvedById = currentUser.role === "mentor" ? collaboration.userId : collaboration.mentorId;
      const datesAndNewSlots = selectedDatesForTimeSlot.map((date) => ({
        date,
        newTimeSlots: newTimeSlotsMap[date.toDateString()],
      }));
      await updateTimeSlots(collabId, { datesAndNewSlots, requestedBy, requesterId: currentUser.id, approvedById, isApproved: "pending" });
      await dispatch(fetchCollabDetails({ userId: currentUser.id, role: currentUser.role }));
      onClose();
      toast.success("Requset Send Successfully");
    } catch (error) {
      console.error("Error updating time slots:", error);
      alert("Failed to update time slots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Edit Time Slots for {selectedDay}</ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select up to 3 dates and one time slot per date for {selectedDay}.
          </p>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Select Dates ({selectedDatesForTimeSlot.length}/3):</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {dateList.map((date, index) => {
                const dateString = date.toDateString();
                const isSelected = selectedDatesForTimeSlot.some((d) => d.toDateString() === dateString);
                const isUnavailable = isDateUnavailable(date);
                const canSelect = isDateSelectable(date) && !isUnavailable && (selectedDatesForTimeSlot.length < 3 || isSelected);

                return (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-center cursor-pointer border ${
                      isSelected
                        ? "bg-blue-100 dark:bg-blue-800 border-blue-500"
                        : isUnavailable
                        ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 cursor-not-allowed"
                        : !canSelect
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => canSelect && handleDateSelectForTimeSlot(date)}
                  >
                    <div className="text-xs text-gray-600 dark:text-gray-400">{date.toLocaleDateString(undefined, { month: "short" })}</div>
                    <div className="text-lg font-semibold">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {selectedDatesForTimeSlot.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Adjust Time Slots (One per Date):</h4>
              <div className="space-y-4">
                {selectedDatesForTimeSlot.map((date, index) => {
                  const dateString = date.toDateString();
                  const selectedSlot = newTimeSlotsMap[dateString]?.[0] || "None Selected";

                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{date.toLocaleDateString()} ({selectedDay})</h5>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isIconOnly
                          onPress={() => handleDateSelectForTimeSlot(date)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                        {availableTimeSlots.map((timeSlot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className={`px-2 py-1 text-center text-sm rounded cursor-pointer ${
                              timeSlot === selectedSlot
                                ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                                : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                            onClick={() => handleTimeSlotSelectForDate(date, timeSlot)}
                          >
                            {timeSlot}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={submitTimeSlotChanges}
            isLoading={loading}
            isDisabled={
              selectedDatesForTimeSlot.length === 0 ||
              selectedDatesForTimeSlot.some((date) => !newTimeSlotsMap[date.toDateString()] || newTimeSlotsMap[date.toDateString()].length === 0)
            }
          >
            Submit Changes for {selectedDay}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TimeSlotsModal;