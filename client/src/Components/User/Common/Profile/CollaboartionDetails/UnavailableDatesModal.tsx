import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";
import { markDatesUnavailable } from "../../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../../redux/Slice/profileSlice";

const UnavailableDatesModal = ({
  isOpen,
  onClose,
  collaboration,
  currentUser,
  selectedUnavailableDates,
  setSelectedUnavailableDates,
  loading,
  setLoading,
  dispatch,
  collabId,
}) => {
  const getSelectedDayOfWeek = () => {
    const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
    return dayMap[collaboration.selectedSlot[0].day] !== undefined ? dayMap[collaboration.selectedSlot[0].day] : -1;
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

  const handleUnavailableDateSelect = (date) => {
    const dateString = date.toDateString();
    const existingIndex = selectedUnavailableDates.findIndex((item) => new Date(item.date).toDateString() === dateString);
    if (existingIndex >= 0) {
      setSelectedUnavailableDates(selectedUnavailableDates.filter((_, index) => index !== existingIndex));
    } else if (selectedUnavailableDates.length < 3) {
      setSelectedUnavailableDates([...selectedUnavailableDates, { date, reason: "" }]);
    } else {
      alert("You can only select up to 3 unavailable dates");
    }
  };

  const handleReasonChange = (index, reason) => {
    const updatedDates = [...selectedUnavailableDates];
    updatedDates[index].reason = reason;
    setSelectedUnavailableDates(updatedDates);
  };

  const calculateNewEndDate = (unavailableDates) => {
    if (unavailableDates.length === 0) return new Date(collaboration.endDate);
    const sortedDates = [...unavailableDates].sort((a, b) => a.getTime() - b.getTime());
    const newEndDate = new Date(collaboration.endDate);
    let daysToAdd = sortedDates.length;
    const currentDate = new Date(newEndDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const selectedDayOfWeek = getSelectedDayOfWeek();

    while (daysToAdd > 0) {
      if (currentDate.getDay() === selectedDayOfWeek) daysToAdd--;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    currentDate.setDate(currentDate.getDate() - 1);
    return currentDate;
  };

  const submitUnavailableDates = async () => {
    if (selectedUnavailableDates.length === 0) return alert("Please select at least one date");
    if (selectedUnavailableDates.some((item) => !item.reason)) return alert("Please provide a reason for all selected dates");

    setLoading(true);
    try {
      const requestedBy = currentUser.role === "mentor" ? "mentor" : "user";
      const approvedById = currentUser.role === "mentor" ? collaboration.userId : collaboration.mentorId;
      const projectedEndDate = calculateNewEndDate(selectedUnavailableDates.map((item) => new Date(item.date)));
      await markDatesUnavailable(collabId, {
        datesAndReasons: selectedUnavailableDates,
        requestedBy,
        requesterId: currentUser._id,
        approvedById,
        isApproved: "pending",
        projectedEndDate,
      });
      await dispatch(fetchCollabDetails({ userId: currentUser._id, role: currentUser.role }));
      onClose();
    } catch (error) {
      console.error("Error marking dates as unavailable:", error);
      alert("Failed to update unavailable dates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Mark Days as Unavailable</ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select dates when you are unavailable for sessions. The end date will be extended accordingly.
          </p>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Select Dates:</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {dateList.map((date, index) => {
                const dateString = date.toDateString();
                const isSelected = selectedUnavailableDates.some((item) => new Date(item.date).toDateString() === dateString);
                const isUnavailable = isDateUnavailable(date);
                const canSelect = isDateSelectable(date) && !isUnavailable;

                return (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-center cursor-pointer border ${
                      isSelected
                        ? "bg-yellow-100 dark:bg-yellow-800 border-yellow-500"
                        : isUnavailable
                        ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 cursor-not-allowed"
                        : !canSelect
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    onClick={() => canSelect && handleUnavailableDateSelect(date)}
                  >
                    <div className="text-xs text-gray-600 dark:text-gray-400">{date.toLocaleDateString(undefined, { month: "short" })}</div>
                    <div className="text-lg font-semibold">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {selectedUnavailableDates.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Provide Reasons:</h4>
              <div className="space-y-4">
                {selectedUnavailableDates.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">{new Date(item.date).toLocaleDateString()}</h5>
                      <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleUnavailableDateSelect(item.date)}>
                        <FaTimes />
                      </Button>
                    </div>
                    <Textarea
                      label="Reason"
                      placeholder="Please provide a reason for your unavailability"
                      value={item.reason}
                      onChange={(e) => handleReasonChange(index, e.target.value)}
                      minRows={2}
                    />
                  </div>
                ))}
              </div>
              {selectedUnavailableDates.length > 0 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-1" />
                    <span>
                      If these dates are approved as unavailable, your end date will be extended to:{" "}
                      <strong>{calculateNewEndDate(selectedUnavailableDates.map((item) => new Date(item.date))).toLocaleDateString()}</strong>
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>Cancel</Button>
          <Button color="primary" onPress={submitUnavailableDates} isLoading={loading} isDisabled={selectedUnavailableDates.length === 0}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnavailableDatesModal;