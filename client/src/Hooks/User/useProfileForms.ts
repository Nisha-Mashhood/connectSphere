import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  updateContactInfo,
  updateUserProfessionalInfo,
  updateUserPassword,
} from "../../Service/User.Service";
import {
  updateMentorProfile,
} from "../../Service/Mentor.Service";
import {
  fetchCollabDetails,
  updateMentorInfo,
} from "../../redux/Slice/profileSlice";
import { updateUserProfile } from "../../redux/Slice/userSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { CollabData } from "../../redux/types";
import { downloadReceipt } from "../../Service/collaboration.Service";

interface UseProfileFormsReturn {
  professionalInfo: { industry: string; reasonForJoining: string };
  setProfessionalInfo: (info: { industry: string; reasonForJoining: string }) => void;
  contactInfo: { email: string; phone: string; dateOfBirth: string };
  setContactInfo: (info: { email: string; phone: string; dateOfBirth: string }) => void;
  passwordInfo: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPasswordInfo: (info: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  mentorshipInfo: { bio: string; availableSlots: { day: string; timeSlots: string[] }[] };
  setMentorshipInfo: (info: { bio: string; availableSlots: { day: string; timeSlots: string[] }[] }) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  startHour: string;
  setStartHour: (hour: string) => void;
  startMin: string;
  setStartMin: (min: string) => void;
  endHour: string;
  setEndHour: (hour: string) => void;
  endMin: string;
  setEndMin: (min: string) => void;
  ampm: string;
  setAmpm: (ampm: string) => void;
  mentorNames: { [key: string]: string };
  isPaymentLoading: boolean;
  selectedCollab: CollabData | null;
  setSelectedCollab: (collab: CollabData | null) => void;
  DAYS_OF_WEEK: string[];
  HOURS: string[];
  MINUTES: string[];
  AMPM: string[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  handleProfessionalSubmit: (onClose: () => void) => Promise<void>;
  handleContactSubmit: (onClose: () => void) => Promise<void>;
  handlePasswordSubmit: (onClose: () => void) => Promise<void>;
  handleMentorshipSubmit: (onClose: () => void) => Promise<void>;
  handleAddSlot: () => void;
  handleRemoveSlot: (day: string, time: string) => void;
  handleDownloadReceipt: (collabId: string) => Promise<void>;
}

export const useProfileForms = (): UseProfileFormsReturn => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    mentorDetails,
    collabDetails
  } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch<AppDispatch>();

  // Form states
  const [professionalInfo, setProfessionalInfo] = useState({
    industry: currentUser?.industry || "",
    reasonForJoining: currentUser?.reasonForJoining || "",
  });
  const [contactInfo, setContactInfo] = useState({
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    dateOfBirth: currentUser?.dateOfBirth || "",
  });
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [mentorshipInfo, setMentorshipInfo] = useState({
    bio: mentorDetails?.bio || "",
    availableSlots: mentorDetails?.availableSlots || [],
  });
  const [selectedDay, setSelectedDay] = useState("");
  const [startHour, setStartHour] = useState("");
  const [startMin, setStartMin] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMin, setEndMin] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [mentorNames, setMentorNames] = useState<{ [key: string]: string }>({});
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<CollabData | null>(null);

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

  // Currency formatter
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  // Date formatter
  const formatDate = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

  // Fetch collaboration details
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(
        fetchCollabDetails({ userId: currentUser.id, role: currentUser.role })
      );
    }
  }, [dispatch, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (
      collabDetails?.data &&
      collabDetails.data.length > 0 &&
      currentUser?.role === "user"
    ) {
      setIsPaymentLoading(true);
      const names = collabDetails.data.reduce(
        (acc: { [key: string]: string }, c) => {
          if (typeof c.mentor === "object" && c.mentor.user?.name) {
            acc[c.mentorId] = c.mentor.user.name;
          } else if (typeof c.mentorId === "string") {
            acc[c.mentorId] = "Unknown Mentor";
          } else {
            acc[c.mentorId || c.id] = "Unknown Mentor";
          }
          return acc;
        },
        {}
      );
      setMentorNames(names);
      setIsPaymentLoading(false);
    }
  }, [collabDetails, currentUser?.role]);

  // Time utility functions
  const toMinutes = (h: string, m: string, ampm: string) => {
    let hh = parseInt(h);
    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    return hh * 60 + parseInt(m);
  };

  const parseTime = (timeStr: string) => {
    const [hm, ampm] = timeStr.split(" ");
    const [h, m] = hm.split(":");
    return toMinutes(h, m, ampm);
  };

  // Handlers
  const handleProfessionalSubmit = async (onClose: () => void) => {
    try {
      const { user } = await updateUserProfessionalInfo(currentUser.id, {
        ...professionalInfo,
        jobTitle: currentUser.jobTitle,
      });
      dispatch(updateUserProfile(user));
      toast.success("Professional info updated");
      onClose();
    } catch (error) {
      toast.error("Failed to update professional info");
      console.error("Failed to update professional info", error);
    }
  };

  const handleContactSubmit = async (onClose: () => void) => {
    try {
      const { user } = await updateContactInfo(currentUser.id, contactInfo);
      dispatch(updateUserProfile(user));
      toast.success("Contact info updated");
      onClose();
    } catch (error) {
      toast.error("Failed to update contact info");
      console.error("Failed to update contact info", error);
    }
  };

  const handlePasswordSubmit = async (onClose: () => void) => {
    try {
      await updateUserPassword(currentUser.id, {
        currentPassword: passwordInfo.currentPassword,
        newPassword: passwordInfo.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onClose();
    } catch (error) {
      toast.error("Failed to update password");
      console.error("Failed to update password", error);
    }
  };

  const handleMentorshipSubmit = async (onClose: () => void) => {
    try {
      const { MentorData } = await updateMentorProfile(
        mentorDetails.id,
        mentorshipInfo
      );
      dispatch(updateMentorInfo(MentorData));
      toast.success("Mentorship info updated");
      onClose();
    } catch (error) {
      toast.error("Failed to update mentorship info");
      console.error("Failed to update mentorship info", error);
    }
  };

  const handleAddSlot = () => {
    if (!selectedDay || !startHour || !startMin || !endHour || !endMin) {
      toast.error("Please select day and all time fields");
      return;
    }

    const startTime = `${startHour}:${startMin} ${ampm}`;
    const endTime = `${endHour}:${endMin} ${ampm}`;
    const timeSlot = `${startTime} - ${endTime}`;

    const startM = toMinutes(startHour, startMin, ampm);
    const endM = toMinutes(endHour, endMin, ampm);

    if (startM >= endM) {
      toast.error("Start time must be before end time");
      return;
    }

    setMentorshipInfo((prev) => {
      const existingDaySlot = prev.availableSlots.find(
        (slot) => slot.day === selectedDay
      );

      let newTimeSlots;
      if (existingDaySlot) {
        const existingTimeSlots = existingDaySlot.timeSlots;

        // Check for overlaps
        for (const ex of existingTimeSlots) {
          const [exStart, exEnd] = ex.split(" - ");
          const exStartM = parseTime(exStart);
          const exEndM = parseTime(exEnd);
          if (startM < exEndM && endM > exStartM) {
            toast.error("Time slot overlaps with an existing slot");
            return prev;
          }
        }

        newTimeSlots = [...existingTimeSlots, timeSlot].sort((a, b) => {
          const aStart = parseTime(a.split(" - ")[0]);
          const bStart = parseTime(b.split(" - ")[0]);
          return aStart - bStart;
        });

        return {
          ...prev,
          availableSlots: prev.availableSlots.map((slot) =>
            slot.day === selectedDay
              ? { ...slot, timeSlots: newTimeSlots }
              : slot
          ),
        };
      } else {
        newTimeSlots = [timeSlot];
        const newAvailableSlots = [
          ...prev.availableSlots,
          { day: selectedDay, timeSlots: newTimeSlots },
        ].sort(
          (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
        );
        return {
          ...prev,
          availableSlots: newAvailableSlots,
        };
      }
    });

    // Reset time fields after adding
    setStartHour("");
    setStartMin("");
    setEndHour("");
    setEndMin("");
    setAmpm("AM");
  };

  const handleRemoveSlot = (day: string, time: string) => {
    setMentorshipInfo((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots
        .map((slot) =>
          slot.day === day
            ? { ...slot, timeSlots: slot.timeSlots.filter((t) => t !== time) }
            : slot
        )
        .filter((slot) => slot.timeSlots.length > 0),
    }));
  };

  const handleDownloadReceipt = async (collabId: string) => {
    try {
      await downloadReceipt(collabId);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download receipt. Please try again.");
      console.error("Error downloading receipt:", error);
    }
  };

  return {
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
    mentorNames,
    isPaymentLoading,
    selectedCollab,
    setSelectedCollab,
    DAYS_OF_WEEK,
    HOURS,
    MINUTES,
    AMPM,
    formatCurrency,
    formatDate,
    handleProfessionalSubmit,
    handleContactSubmit,
    handlePasswordSubmit,
    handleMentorshipSubmit,
    handleAddSlot,
    handleRemoveSlot,
    handleDownloadReceipt,
  };
};