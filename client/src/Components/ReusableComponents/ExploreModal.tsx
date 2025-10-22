import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  Avatar,
  Divider,
  Chip,
  RadioGroup,
} from "@nextui-org/react";
import { FaStar, FaClock } from "react-icons/fa";
import { CompleteMentorDetails, User, Group } from "../../redux/types";

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "mentor" | "user" | "group";
  selectedItem: CompleteMentorDetails | User | Group | null;
  selectedSlot?: string;
  setSelectedSlot?: (slot: string) => void;
  isSlotLocked?: (day: string, time: string) => boolean;
  onAction: () => void;
  actionText: string;
  isActionDisabled?: boolean;
}

const ExploreModal = ({
  isOpen,
  onClose,
  type,
  selectedItem,
  selectedSlot = "",
  setSelectedSlot,
  isSlotLocked,
  onAction,
  actionText,
  isActionDisabled,
}: ExploreModalProps) => {
  if (!selectedItem) return null;

  const isMentor = type === "mentor";
  const isUser = type === "user";
  const isGroup = type === "group";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isMentor ? "2xl" : "lg"}
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h2 className="text-xl font-bold">
            {isMentor
              ? "Book Mentorship Session"
              : isUser
              ? "Send Connection Request"
              : "Join Group"}
          </h2>
          <p className="text-sm text-default-500">
            {isMentor
              ? "Select your preferred time slot"
              : isUser
              ? "Connect and grow your professional network"
              : "Connect with like-minded professionals"}
          </p>
        </ModalHeader>

        <ModalBody className="py-4">
          {isMentor && (
            <div className="space-y-6">
              {/* Mentor Info */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={
                      (selectedItem as CompleteMentorDetails).userId?.profilePic ||
                      "/api/placeholder/400/400"
                    }
                    size="lg"
                    alt={(selectedItem as CompleteMentorDetails).userId?.name}
                    className="ring-2 ring-primary/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      {(selectedItem as CompleteMentorDetails).userId?.name}
                    </h3>
                    <p className="text-default-600 text-sm">
                      {(selectedItem as CompleteMentorDetails).specialization}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium text-primary">
                          ₹{(selectedItem as CompleteMentorDetails).price}
                        </span>
                        <span className="text-default-500">/ session</span>
                      </div>
                      {(selectedItem as CompleteMentorDetails).avgRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <FaStar className="text-yellow-400 text-xs" />
                          <span className="font-medium">
                            {(selectedItem as CompleteMentorDetails).avgRating!.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              <Divider />

              {/* Time Slots */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <FaClock className="text-primary" /> Available Time Slots
                </h4>
                <RadioGroup
                  value={selectedSlot}
                  onValueChange={(val) => setSelectedSlot && setSelectedSlot(val)}
                >
                  <div className="grid gap-3">
                    {(selectedItem as CompleteMentorDetails).availableSlots?.flatMap(
                      (slot, dayIndex) =>
                        slot.timeSlots.map((timeSlot, slotIndex) => {
                          const isLockedSlot =
                            isSlotLocked && isSlotLocked(slot.day, timeSlot);
                          const slotValue = `${slot.day} - ${timeSlot}`;
                          const key = `${slot.day}-${timeSlot}-${dayIndex}-${slotIndex}`;
                          return (
                            <Card
                              key={key}
                              className={`p-4 cursor-pointer transition-all duration-200 ${
                                isLockedSlot
                                  ? "bg-default-100 cursor-not-allowed opacity-60"
                                  : selectedSlot === slotValue
                                  ? "bg-primary/10 border-primary border-2"
                                  : "hover:bg-default-50 border-2 border-transparent"
                              }`}
                              isPressable={!isLockedSlot}
                              onPress={() =>
                                !isLockedSlot && setSelectedSlot && setSelectedSlot(slotValue)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="slot"
                                    value={slotValue}
                                    checked={selectedSlot === slotValue}
                                    readOnly
                                    disabled={isLockedSlot}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                  />
                                  <div>
                                    <p
                                      className={`font-medium ${
                                        isLockedSlot
                                          ? "text-default-400"
                                          : "text-default-800"
                                      }`}
                                    >
                                      {slot.day}
                                    </p>
                                    <p
                                      className={`text-sm ${
                                        isLockedSlot
                                          ? "text-default-400"
                                          : "text-default-600"
                                      }`}
                                    >
                                      {timeSlot}
                                    </p>
                                  </div>
                                </div>
                                {isLockedSlot && (
                                  <Chip color="danger" size="sm" variant="flat">
                                    Unavailable
                                  </Chip>
                                )}
                              </div>
                            </Card>
                          );
                        })
                    )}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {isUser && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={(selectedItem as User).profilePic || "/api/placeholder/400/400"}
                  size="lg"
                  alt={(selectedItem as User).name}
                  className="ring-2 ring-primary/20"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{(selectedItem as User).name}</h3>
                  <p className="text-default-600 text-sm">
                    {(selectedItem as User).jobTitle || "Community Member"}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {isGroup && (
  <Card className="p-4 space-y-4">
    <div>
      <h3 className="text-lg font-bold mb-2">
        {(selectedItem as Group).name}
      </h3>
      <p className="text-default-600 text-sm leading-relaxed">
        {(selectedItem as Group).bio}
      </p>
    </div>
    <Divider />
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-primary/10 rounded-lg">
        <p className="text-2xl font-bold text-primary">
          ₹{(selectedItem as Group).price}
        </p>
        <p className="text-xs text-default-600">Group Fee</p>
      </div>
      <div className="text-center p-3 bg-success/10 rounded-lg">
        <p className="text-2xl font-bold text-success">
          {((selectedItem as Group).maxMembers || 0) -
            ((selectedItem as Group).members?.length || 0)}
        </p>
        <p className="text-xs text-default-600">Spots Left</p>
      </div>
    </div>
    <div className="space-y-2">
      {(() => {
        const totalMembers = (selectedItem as Group).maxMembers || 0;
        const currentMembers = (selectedItem as Group).members?.length || 0;
        const progressPercentage = (currentMembers / totalMembers) * 100;
        return (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Group Capacity</span>
              <span className="text-primary font-bold">
                {currentMembers}/{totalMembers}
              </span>
            </div>
            <div className="w-full bg-default-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </>
        );
      })()}
    </div>
    <div className="flex items-center gap-2 text-sm text-default-600 bg-default-100 p-3 rounded-lg">
      <FaClock className="text-primary" />
      <span>
        <strong>Start Date:</strong>{" "}
        {(selectedItem as Group).startDate
          ? new Date((selectedItem as Group).startDate).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )
          : "To be announced"}
      </span>
    </div>
  </Card>
)}
        </ModalBody>

        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={onAction}
            isDisabled={isActionDisabled}
            className="font-medium"
          >
            {actionText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExploreModal;
