import { FC } from "react";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Chip,
} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import BaseModal from "../../ReusableComponents/BaseModal";
import { CollabData } from "../../../redux/types";
import { getValidationSchema } from "../../../validation/profileModalValidation";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: "professional" | "contact" | "password" | "mentorship" | "receipt";
  professionalInfo?: { industry: string; reasonForJoining: string };
  setProfessionalInfo?: (info: { industry: string; reasonForJoining: string }) => void;
  contactInfo?: { email: string; phone: string; dateOfBirth: string };
  setContactInfo?: (info: { email: string; phone: string; dateOfBirth: string }) => void;
  passwordInfo?: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPasswordInfo?: (info: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  mentorshipInfo?: { bio: string; availableSlots: { day: string; timeSlots: string[] }[] };
  setMentorshipInfo?: (info: { bio: string; availableSlots: { day: string; timeSlots: string[] }[] }) => void;
  selectedDay?: string;
  setSelectedDay?: (day: string) => void;
  startHour?: string;
  setStartHour?: (hour: string) => void;
  startMin?: string;
  setStartMin?: (min: string) => void;
  endHour?: string;
  setEndHour?: (hour: string) => void;
  endMin?: string;
  setEndMin?: (min: string) => void;
  ampm?: string;
  setAmpm?: (ampm: string) => void;
  selectedCollab?: CollabData | null;
  mentorNames?: { [key: string]: string };
  onSubmit?: (onClose?: () => void) => Promise<void>;
  formatCurrency?: (amount: number) => string;
  formatDate?: (dateString: string) => string;
  handleAddSlot?: () => void;
  handleRemoveSlot?: (day: string, time: string) => void;
}

const ProfileModal: FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  modalType,
  professionalInfo,
  setProfessionalInfo,
  contactInfo,
  setContactInfo,
  passwordInfo,
  setPasswordInfo,
  mentorshipInfo,
  setMentorshipInfo,
  selectedDay,
  setSelectedDay,
  startHour,
  setStartHour,
  startMin,
  setStartMin,
  endHour,
  setEndHour,
  endMin,
  setEndMin,
  ampm,
  setAmpm,
  selectedCollab,
  mentorNames,
  onSubmit,
  formatCurrency,
  formatDate,
  handleAddSlot,
  handleRemoveSlot,
}) => {
  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const HOURS = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const MINUTES = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );
  const AMPM = ["AM", "PM"];


  const handleModalSubmit = async () => {
  const schema = getValidationSchema(modalType);

  try {
    if (schema) {
      const formData =
        modalType === "professional"
          ? professionalInfo
          : modalType === "contact"
          ? contactInfo
          : modalType === "password"
          ? passwordInfo
          : mentorshipInfo;

      await schema.validate(formData, { abortEarly: false });
    }

    if (onSubmit) await onSubmit(onClose);
  } catch (error) {
    if (error.inner) {
      error.inner.forEach((err) => toast.error(err.message));
    } else {
      toast.error(error.message);
    }
  }
};

  const renderContent = () => {
    switch (modalType) {
      case "professional":
        return (
          <div className="space-y-4">
            <Input
              label="Industry"
              variant="bordered"
              value={professionalInfo?.industry || ""}
              onChange={(e) =>
                setProfessionalInfo?.({ ...professionalInfo!, industry: e.target.value })
              }
              isRequired
            />
            <Textarea
              label="Reason for Joining"
              variant="bordered"
              value={professionalInfo?.reasonForJoining || ""}
              onChange={(e) =>
                setProfessionalInfo?.({ ...professionalInfo!, reasonForJoining: e.target.value })
              }
              isRequired
            />
          </div>
        );
      case "contact":
        return (
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              variant="bordered"
              value={contactInfo?.email || ""}
              onChange={(e) =>
                setContactInfo?.({ ...contactInfo!, email: e.target.value })
              }
              isRequired
            />
            <Input
              label="Phone"
              variant="bordered"
              value={contactInfo?.phone || ""}
              onChange={(e) =>
                setContactInfo?.({ ...contactInfo!, phone: e.target.value })
              }
              isRequired
            />
            <Input
              type="date"
              label="Date of Birth"
              variant="bordered"
              value={contactInfo?.dateOfBirth.split("T")[0] || ""}
              onChange={(e) =>
                setContactInfo?.({ ...contactInfo!, dateOfBirth: e.target.value })
              }
              isRequired
            />
          </div>
        );
      case "password":
        return (
          <div className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              variant="bordered"
              value={passwordInfo?.currentPassword || ""}
              onChange={(e) =>
                setPasswordInfo?.({ ...passwordInfo!, currentPassword: e.target.value })
              }
              isRequired
            />
            <Input
              type="password"
              label="New Password"
              variant="bordered"
              value={passwordInfo?.newPassword || ""}
              onChange={(e) =>
                setPasswordInfo?.({ ...passwordInfo!, newPassword: e.target.value })
              }
              isRequired
            />
            <Input
              type="password"
              label="Confirm New Password"
              variant="bordered"
              value={passwordInfo?.confirmPassword || ""}
              onChange={(e) =>
                setPasswordInfo?.({ ...passwordInfo!, confirmPassword: e.target.value })
              }
              isRequired
            />
          </div>
        );
      case "mentorship":
        return (
          <div className="space-y-6">
            <Textarea
              label="Bio"
              placeholder="Tell others about your expertise and mentoring approach..."
              variant="bordered"
              value={mentorshipInfo?.bio || ""}
              onChange={(e) =>
                setMentorshipInfo?.({ ...mentorshipInfo!, bio: e.target.value })
              }
              isRequired
            />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Available Time Slots</h3>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Day"
                  variant="bordered"
                  value={selectedDay || ""}
                  onChange={(e) => setSelectedDay?.(e.target.value)}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="AM/PM"
                  variant="bordered"
                  value={ampm || ""}
                  onChange={(e) => setAmpm?.(e.target.value)}
                >
                  {AMPM.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Select
                  label="Start Hour"
                  variant="bordered"
                  value={startHour || ""}
                  onChange={(e) => setStartHour?.(e.target.value)}
                >
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Start Min"
                  variant="bordered"
                  value={startMin || ""}
                  onChange={(e) => setStartMin?.(e.target.value)}
                >
                  {MINUTES.map((min) => (
                    <SelectItem key={min} value={min}>
                      {min}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="End Hour"
                  variant="bordered"
                  value={endHour || ""}
                  onChange={(e) => setEndHour?.(e.target.value)}
                >
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="End Min"
                  variant="bordered"
                  value={endMin || ""}
                  onChange={(e) => setEndMin?.(e.target.value)}
                >
                  {MINUTES.map((min) => (
                    <SelectItem key={min} value={min}>
                      {min}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                color="primary"
                variant="flat"
                onPress={handleAddSlot}
                startContent={<FaPlus size={14} />}
                className="w-full"
              >
                Add Time Slot
              </Button>
              {mentorshipInfo?.availableSlots.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Current Slots:</p>
                  {mentorshipInfo.availableSlots.map((slot, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">{slot.day}</p>
                      <div className="flex flex-wrap gap-1">
                        {slot.timeSlots.map((time) => (
                          <Chip
                            key={time}
                            variant="flat"
                            color="primary"
                            size="sm"
                            onClose={() => handleRemoveSlot?.(slot.day, time)}
                          >
                            {time}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "receipt":
        return selectedCollab ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900">Mentor</p>
              <p className="text-sm text-gray-600">
                {typeof selectedCollab.mentorId === "string"
                  ? mentorNames?.[selectedCollab.mentorId] || "Unknown Mentor"
                  : mentorNames?.[selectedCollab.mentorId] ||
                    selectedCollab.mentor.user?.name ||
                    "Unknown Mentor"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900">Amount</p>
              <p className="text-sm text-gray-600">
                {formatCurrency?.(selectedCollab.price)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900">Collaboration ID</p>
              <p className="text-sm text-gray-600">{selectedCollab.collaborationId}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900">Date</p>
              <p className="text-sm text-gray-600">
                {formatDate?.(selectedCollab.startDate)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center">No payment selected</p>
        );
      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        modalType === "professional" ? "Professional Information" :
        modalType === "contact" ? "Contact Information" :
        modalType === "password" ? "Change Password" :
        modalType === "mentorship" ? "Mentorship Details" :
        "Payment Receipt"
      }
      actionText={
        modalType === "password" ? "Update Password" :
        modalType === "receipt" ? "Download Receipt" :
        "Submit"
      }
      cancelText={modalType === "receipt" ? "Close" : "Cancel"}
      onSubmit={modalType !== "receipt" ? handleModalSubmit : onSubmit}
      size={modalType === "mentorship" ? "lg" : "md"}
      scrollBehavior={modalType === "mentorship" ? "inside" : "outside"}
    >
      {renderContent()}
    </BaseModal>
  );
};

export default ProfileModal;