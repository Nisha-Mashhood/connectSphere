import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  Chip,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  Spinner,
} from "@nextui-org/react";
import {
  FaCalendarAlt,
  FaUsers,
  FaEnvelope,
  FaBriefcase,
  FaPencilAlt,
  FaPlus,
  FaCamera,
  FaUserFriends,
  FaLayerGroup,
  FaUserGraduate,
  FaLock,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCalendar,
  FaFileDownload,
  FaChartBar,
} from "react-icons/fa";
import { RootState, AppDispatch } from "../../../../redux/store";
import {
  updateContactInfo,
  updateUserImages,
  updateUserProfessionalInfo,
  updateUserPassword,
  // fetchUserDetails,
} from "../../../../Service/User.Service";
import toast from "react-hot-toast";
import {
  checkMentorProfile,
  updateMentorProfile,
} from "../../../../Service/Mentor.Service";
import {
  fetchCollabDetails,
  updateMentorInfo,
} from "../../../../redux/Slice/profileSlice";
import { updateUserProfile } from "../../../../redux/Slice/userSlice";
import { checkProfile } from "../../../../Service/Auth.service";
import { downloadReceipt } from "../../../../Service/collaboration.Service";
import { CollabData } from "../../../../redux/types";

// Lazy load components
const RequestsSection = lazy(() => import("./RequestSection"));
const GroupRequests = lazy(() => import("./GroupRequests"));
const ActiveCollaborations = lazy(() => import("./ActiveCollaborations"));
const GroupCollaborations = lazy(() => import("./GroupCollaborations"));
const TaskManagement = lazy(() => import("../../TaskManagement/TaskManagemnt"));
const UserConnections = lazy(() => import("./UserConnections"));

const Profile = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    mentorDetails,
    collabDetails,
    // userConnections,
    loading: profileLoading,
  } = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Modal states
  const {
    isOpen: isProfessionalModalOpen,
    onOpen: onProfessionalModalOpen,
    onClose: onProfessionalModalClose,
  } = useDisclosure();
  const {
    isOpen: isContactModalOpen,
    onOpen: onContactModalOpen,
    onClose: onContactModalClose,
  } = useDisclosure();
  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModalOpen,
    onClose: onPasswordModalClose,
  } = useDisclosure();
  const {
    isOpen: isMentorModalOpen,
    onOpen: onMentorModalOpen,
    onClose: onMentorModalClose,
  } = useDisclosure();

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
  const {
    isOpen: isReceiptModalOpen,
    onOpen: onReceiptModalOpen,
    onClose: onReceiptModalClose,
  } = useDisclosure();

  // Currency formatter
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

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

      console.log("Raw collabDetails.data:", collabDetails.data);

      const names = collabDetails.data.reduce(
        (acc: { [key: string]: string }, c) => {
          if (typeof c.mentor === "object" && c.mentor.user?.name) {
            console.log(
              `Mapping mentor ID ${c.mentorId} to name: ${c.mentor.user.name}`
            );
            acc[c.mentorId] = c.mentor.user.name;
          } else if (typeof c.mentorId === "string") {
            console.log(
              `No name available for mentor ID ${c.mentorId}, using fallback`
            );
            acc[c.mentorId] = "Unknown Mentor";
          } else {
            console.warn(
              "Invalid mentorId data for collaboration",
              c.id,
              ":",
              c.mentorId
            );
            acc[c.mentorId || c.id] = "Unknown Mentor";
          }
          return acc;
        },
        {}
      );

      console.log("Final Mentor Names:", names);
      setMentorNames(names);
      setIsPaymentLoading(false);
    } else {
      console.log("Skipping mentor names mapping - conditions not met:", {
        hasCollabDetails: !!collabDetails?.data,
        collabDetailsLength: collabDetails?.data?.length,
        userRole: currentUser?.role,
      });
    }
  }, [collabDetails, currentUser?.role]);

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

  const formatDate = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

  console.log("COLLAB DETAILS OF THIS CURRENT USER : ", collabDetails);
  // console.log(
  //   "USER CONNECTION DETAILS OF THIS CURRENT USER : ",
  //   userConnections
  // );

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
  const handleImageUpload = async (
    file: File,
    type: "profilePic" | "coverPic"
  ) => {
    const formData = new FormData();
    formData.append(type, file);
    try {
      const { user } = await updateUserImages(currentUser.id, formData);
      dispatch(updateUserProfile(user));
      toast.success("Image updated successfully");
    } catch (error) {
      toast.error("Failed to update image");
      console.error("Failed to update image", error);
    }
  };

  const handleProfessionalSubmit = async () => {
    if (!professionalInfo.industry || !professionalInfo.reasonForJoining) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const { user } = await updateUserProfessionalInfo(currentUser.id, {
        ...professionalInfo,
        jobTitle: currentUser.jobTitle,
      });
      dispatch(updateUserProfile(user));
      toast.success("Professional info updated");
      onProfessionalModalClose();
    } catch (error) {
      toast.error("Failed to update professional info");
      console.error("Failed to update professional info", error);
    }
  };

  const handleContactSubmit = async () => {
    if (!contactInfo.email || !contactInfo.phone || !contactInfo.dateOfBirth) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const { user } = await updateContactInfo(currentUser.id, contactInfo);
      dispatch(updateUserProfile(user));
      toast.success("Contact info updated");
      onContactModalClose();
    } catch (error) {
      toast.error("Failed to update contact info");
      console.error("Failed to update contact info", error);
    }
  };

  const handleMentorshipSubmit = async () => {
    if (!mentorshipInfo.bio || mentorshipInfo.availableSlots.length === 0) {
      toast.error("Please provide bio and at least one time slot");
      return;
    }
    try {
      const { MentorData } = await updateMentorProfile(
        mentorDetails.id,
        mentorshipInfo
      );
      dispatch(updateMentorInfo(MentorData));
      toast.success("Mentorship info updated");
      onMentorModalClose();
    } catch (error) {
      toast.error("Failed to update mentorship info");
      console.error("Failed to update mentorship info", error);
    }
  };

  const handleAddSlot = () => {
    console.log("Selected Day : ", selectedDay);
    console.log("Selected Start Hour : ", startHour);
    console.log("Selected Start Minute : ", startMin);
    console.log("Selected End Hour : ", endHour);
    console.log("Selected End Minute : ", endMin);
    console.log("Selected AM/PM : ", ampm);

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

  const handlePasswordSubmit = async () => {
    if (
      !passwordInfo.currentPassword ||
      !passwordInfo.newPassword ||
      !passwordInfo.confirmPassword
    ) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (passwordInfo.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
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
      onPasswordModalClose();
    } catch (error) {
      toast.error("Failed to update password");
      console.error("Failed to update password", error);
    }
  };

  const handleBecomeMentor = async () => {
    try {
      const profileResponse = await checkProfile(currentUser.id);
      if (!profileResponse.isProfileComplete) {
        toast.error("Please complete your profile first");
        navigate("/complete-profile");
        return;
      }
      const mentorResponse = await checkMentorProfile(currentUser.id);
      if (!mentorResponse.mentor) navigate("/mentorProfile");
      else {
        switch (mentorResponse.mentor.isApproved) {
          case "Processing":
            toast.success("Mentor request under review");
            break;
          case "Completed":
            toast.success("You are an approved mentor!");
            navigate("/profile");
            break;
          case "Rejected":
            toast.error("Mentor application rejected");
            break;
          default:
            toast.error("Unknown status");
        }
      }
    } catch (error) {
      toast.error("Error checking mentor status");
      console.error("Error checking mentor status", error);
    }
  }

  const handleDownloadReceipt = async (collabId: string) => {
    try {
      await downloadReceipt(collabId);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download receipt. Please try again.");
      console.error("Error downloading receipt:", error);
    }
  };


  const totalPayments =
    collabDetails?.data?.reduce(
      (sum: number, collab) => sum + collab.price,
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header Section - Clean and minimal */}
        <Card className="border-none shadow-lg overflow-hidden mb-0">
          <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
            {currentUser?.coverPic && (
              <Image
                src={currentUser.coverPic}
                alt="Cover"
                className="w-full h-full object-cover"
                removeWrapper
              />
            )}
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Cover photo edit button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-black/20 backdrop-blur-md text-white border-white/20 hover:bg-black/30"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload(e.target.files[0], "coverPic")
                    }
                  />
                  <FaCamera size={14} />
                </label>
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile Information Section */}
        <Card className="border-none shadow-lg -mt-16 relative z-10 mx-4">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              {/* Left side - Avatar and basic info */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 flex-1">
                {/* Profile Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={currentUser?.profilePic}
                    className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-gray-100"
                    fallback={<FaUsers className="w-16 h-16 text-gray-400" />}
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="absolute -bottom-2 -right-2 w-8 h-8 min-w-0 bg-white border-2 border-gray-200 shadow-md hover:shadow-lg"
                  >
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageUpload(e.target.files[0], "profilePic")
                        }
                      />
                      <FaCamera size={12} />
                    </label>
                  </Button>
                </div>

                {/* Name and Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 truncate">
                      {currentUser?.name}
                    </h1>
                    <Chip
                      color={
                        currentUser?.role === "mentor" ? "success" : "primary"
                      }
                      variant="flat"
                      size="md"
                      className="w-fit"
                    >
                      {currentUser?.role === "mentor" ? "Mentor" : "User"}
                    </Chip>
                  </div>

                  <p className="text-lg text-gray-600 mb-3 font-medium">
                    {currentUser?.jobTitle || "No job title"}
                  </p>

                  {/* Additional info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {currentUser?.location && (
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt size={12} />
                        <span>{currentUser.location}</span>
                      </div>
                    )}
                    {currentUser?.joinDate && (
                      <div className="flex items-center gap-1">
                        <FaCalendar size={12} />
                        <span>Joined {currentUser.joinDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <Button
                color="primary"
                size="lg"
                variant="solid"
                startContent={<FaPlus size={16} />}
                onPress={() => navigate("/create-group")}
                className="font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Create Group
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Details */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium text-gray-900">Profile</h2>
              </CardHeader>
              <CardBody className="pt-0 space-y-3">
                {/* Professional Info */}
                <div
                  className="group cursor-pointer"
                  onClick={onProfessionalModalOpen}
                >
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <FaBriefcase size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Professional
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser?.industry || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <FaPencilAlt
                      size={12}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div
                  className="group cursor-pointer"
                  onClick={onContactModalOpen}
                >
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
                        <FaEnvelope size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Contact
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <FaPencilAlt
                      size={12}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Security */}
                <div
                  className="group cursor-pointer"
                  onClick={onPasswordModalOpen}
                >
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                        <FaLock size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Security
                        </p>
                        <p className="text-xs text-gray-500">Change password</p>
                      </div>
                    </div>
                    <FaPencilAlt
                      size={12}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Mentorship or Become Mentor */}
                {currentUser?.role === "mentor" && mentorDetails ? (
                  <div
                    className="group cursor-pointer"
                    onClick={onMentorModalOpen}
                  >
                    <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                          <FaUserGraduate size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Mentorship
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {mentorDetails.bio || "No bio"}
                          </p>
                        </div>
                      </div>
                      <FaPencilAlt
                        size={12}
                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 w-fit mx-auto mb-2">
                      <FaUserGraduate size={16} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Become a Mentor
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Share your expertise with others
                    </p>
                    <Button
                      color="success"
                      size="sm"
                      variant="flat"
                      onPress={handleBecomeMentor}
                    >
                      Apply Now
                    </Button>
                  </div>
                )}

                {/* Payments for users */}
                {currentUser?.role === "user" ? (
                  <Accordion variant="light" className="px-0">
                    <AccordionItem
                      key="payments"
                      title={
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                            <FaCreditCard size={14} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            Payment History
                          </span>
                        </div>
                      }
                      className="text-base"
                    >
                      <div className="space-y-3 pt-2">
                        {profileLoading || isPaymentLoading ? (
                          <div className="flex justify-center py-8">
                            <Spinner size="sm" />
                          </div>
                        ) : collabDetails?.data?.length > 0 ? (
                          <>
                            {collabDetails.data
                              .filter((c) => c.payment)
                              .map((collab, i: number) => (
                                <div
                                  key={i}
                                  className="p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {typeof collab.mentorId === "string"
                                        ? mentorNames[collab.mentorId] ||
                                          "Unknown Mentor"
                                        : mentorNames[collab.mentorId] ||
                                          collab.mentor.user?.name ||
                                          "Unknown Mentor"}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(collab.price)}
                                    </p>
                                  </div>
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <p>ID: {collab.collaborationId}</p>
                                    <p>
                                      {formatDate(collab.startDate)} -{" "}
                                      {formatDate(collab.endDate)}
                                    </p>
                                    <p>
                                      Status:{" "}
                                      {collab.isCancelled
                                        ? "Cancelled"
                                        : collab.isCompleted
                                        ? "Completed"
                                        : "Ongoing"}
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      color="primary"
                                      className="p-0 h-auto min-w-0 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                      onPress={() => {
                                        setSelectedCollab(collab);
                                        onReceiptModalOpen();
                                      }}
                                    >
                                      View Receipt
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-900">
                                Total: {formatCurrency(totalPayments)}
                              </p>
                            </div>

                            {/* Receipt Modal */}
                            <Modal
                              isOpen={isReceiptModalOpen}
                              onClose={() => {
                                setSelectedCollab(null);
                                onReceiptModalClose();
                              }}
                              size="md"
                              classNames={{
                                base: "bg-white",
                                header: "border-b border-gray-100",
                                footer: "border-t border-gray-100",
                              }}
                            >
                              <ModalContent>
                                <ModalHeader className="text-lg font-medium">
                                  Payment Receipt
                                </ModalHeader>
                                <ModalBody className="py-6">
                                  {selectedCollab ? (
                                    <div className="space-y-4">
                                      <div className="flex justify-between">
                                        <p className="text-sm font-medium text-gray-900">
                                          Mentor
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {typeof selectedCollab.mentorId ===
                                          "string"
                                            ? mentorNames[
                                                selectedCollab.mentorId
                                              ] || "Unknown Mentor"
                                            : mentorNames[
                                                selectedCollab.mentorId
                                              ] ||
                                              selectedCollab.mentor.user
                                                ?.name ||
                                              "Unknown Mentor"}
                                        </p>
                                      </div>
                                      <div className="flex justify-between">
                                        <p className="text-sm font-medium text-gray-900">
                                          Amount
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {formatCurrency(selectedCollab.price)}
                                        </p>
                                      </div>
                                      <div className="flex justify-between">
                                        <p className="text-sm font-medium text-gray-900">
                                          Collaboration ID
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {selectedCollab.collaborationId}
                                        </p>
                                      </div>
                                      <div className="flex justify-between">
                                        <p className="text-sm font-medium text-gray-900">
                                          Date
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {formatDate(selectedCollab.startDate)}
                                        </p>
                                      </div>
                                      <div className="pt-4">
                                        <Button
                                          color="primary"
                                          variant="flat"
                                          startContent={
                                            <FaFileDownload size={14} />
                                          }
                                          className="w-full"
                                          onPress={() =>
                                            handleDownloadReceipt(
                                              selectedCollab.id
                                            )
                                          }
                                        >
                                          Download Receipt
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600 text-center">
                                      No payment selected
                                    </p>
                                  )}
                                </ModalBody>
                                <ModalFooter>
                                  <Button
                                    variant="light"
                                    onPress={() => {
                                      setSelectedCollab(null);
                                      onReceiptModalClose();
                                    }}
                                  >
                                    Close
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No payments yet
                          </p>
                        )}
                      </div>
                    </AccordionItem>
                  </Accordion>
                ) : currentUser?.role === "mentor" ? (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mx-auto mb-2">
                      <FaChartBar size={16} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Mentor Dashboard
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      View your collaborations, requests, graphs, and more
                    </p>
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => navigate("/mentor-dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          </div>

          {/* Right Content - Tasks & Activity */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tasks Card */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <FaCalendarAlt size={16} />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <Suspense
                  fallback={
                    <div className="flex justify-center py-8">
                      <Spinner size="md" />
                    </div>
                  }
                >
                  <TaskManagement
                    context="profile"
                    currentUser={currentUser}
                    contextData={currentUser}
                  />
                </Suspense>
              </CardBody>
            </Card>

            {/* Activity & Connections */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Activity</h2>
              </CardHeader>
              <CardBody className="pt-4">
                <Tabs variant="underlined" color="primary" className="w-full">
                  <Tab
                    key="connections"
                    title={
                      <div className="flex items-center gap-2">
                        <FaUserFriends size={14} />
                        <span>Connections</span>
                      </div>
                    }
                  >
                    <div className="space-y-4 pt-4">
                      <Accordion variant="light" className="px-0">
                        <AccordionItem key="requests" title="Pending Requests">
                          <Suspense
                            fallback={
                              <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                              </div>
                            }
                          >
                            <RequestsSection
                              handleProfileClick={(id: string) =>
                                navigate(`/profileDispaly/${id}`)
                              }
                            />
                          </Suspense>
                        </AccordionItem>
                        <AccordionItem
                          key="collaborations"
                          title="Active Collaborations"
                        >
                          <Suspense
                            fallback={
                              <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                              </div>
                            }
                          >
                            <ActiveCollaborations
                              handleProfileClick={(id: string) =>
                                navigate(`/profileDispaly/${id}`)
                              }
                            />
                          </Suspense>
                        </AccordionItem>
                        <AccordionItem key="network" title="My Network">
                          <Suspense
                            fallback={
                              <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                              </div>
                            }
                          >
                            <UserConnections
                              handleProfileClick={(id: string) =>
                                navigate(`/profileDispaly/${id}`)
                              }
                            />
                          </Suspense>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </Tab>
                  <Tab
                    key="groups"
                    title={
                      <div className="flex items-center gap-2">
                        <FaLayerGroup size={14} />
                        <span>Groups</span>
                      </div>
                    }
                  >
                    <div className="space-y-4 pt-4">
                      <Accordion variant="light" className="px-0">
                        <AccordionItem
                          key="invitations"
                          title="Group Invitations"
                        >
                          <Suspense
                            fallback={
                              <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                              </div>
                            }
                          >
                            <GroupRequests />
                          </Suspense>
                        </AccordionItem>
                        <AccordionItem key="my-groups" title="My Groups">
                          <Suspense
                            fallback={
                              <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                              </div>
                            }
                          >
                            <GroupCollaborations
                              handleProfileClick={(id: string) =>
                                navigate(`/profileDispaly/${id}`)
                              }
                            />
                          </Suspense>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </Tab>
                  {mentorDetails && (
                    <Tab
                      key="mentoring"
                      title={
                        <div className="flex items-center gap-2">
                          <FaUserGraduate size={14} />
                          <span>Mentoring</span>
                        </div>
                      }
                    >
                      <div className="text-center py-8">
                        <div className="p-4 rounded-lg bg-gray-50 max-w-sm mx-auto">
                          <FaUserGraduate
                            size={24}
                            className="mx-auto text-gray-400 mb-3"
                          />
                          <p className="text-sm text-gray-600">
                            Manage your mentoring activities here.
                          </p>
                        </div>
                      </div>
                    </Tab>
                  )}
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Professional Info Modal */}
        <Modal
          isOpen={isProfessionalModalOpen}
          onClose={onProfessionalModalClose}
          size="md"
          classNames={{
            base: "bg-white",
            header: "border-b border-gray-100",
            footer: "border-t border-gray-100",
          }}
        >
          <ModalContent>
            <ModalHeader className="text-lg font-medium">
              Professional Information
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Input
                  label="Industry"
                  variant="bordered"
                  value={professionalInfo.industry}
                  onChange={(e) =>
                    setProfessionalInfo({
                      ...professionalInfo,
                      industry: e.target.value,
                    })
                  }
                />
                <Textarea
                  label="Reason for Joining"
                  variant="bordered"
                  value={professionalInfo.reasonForJoining}
                  onChange={(e) =>
                    setProfessionalInfo({
                      ...professionalInfo,
                      reasonForJoining: e.target.value,
                    })
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onProfessionalModalClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleProfessionalSubmit}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Contact Info Modal */}
        <Modal
          isOpen={isContactModalOpen}
          onClose={onContactModalClose}
          size="md"
          classNames={{
            base: "bg-white",
            header: "border-b border-gray-100",
            footer: "border-t border-gray-100",
          }}
        >
          <ModalContent>
            <ModalHeader className="text-lg font-medium">
              Contact Information
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  variant="bordered"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                />
                <Input
                  label="Phone"
                  variant="bordered"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, phone: e.target.value })
                  }
                />
                <Input
                  type="date"
                  label="Date of Birth"
                  variant="bordered"
                  value={contactInfo.dateOfBirth.split("T")[0] || ""}
                  onChange={(e) =>
                    setContactInfo({
                      ...contactInfo,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onContactModalClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleContactSubmit}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={onPasswordModalClose}
          size="md"
          classNames={{
            base: "bg-white",
            header: "border-b border-gray-100",
            footer: "border-t border-gray-100",
          }}
        >
          <ModalContent>
            <ModalHeader className="text-lg font-medium">
              Change Password
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Input
                  type="password"
                  label="Current Password"
                  variant="bordered"
                  value={passwordInfo.currentPassword}
                  onChange={(e) =>
                    setPasswordInfo({
                      ...passwordInfo,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <Input
                  type="password"
                  label="New Password"
                  variant="bordered"
                  value={passwordInfo.newPassword}
                  onChange={(e) =>
                    setPasswordInfo({
                      ...passwordInfo,
                      newPassword: e.target.value,
                    })
                  }
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  variant="bordered"
                  value={passwordInfo.confirmPassword}
                  onChange={(e) =>
                    setPasswordInfo({
                      ...passwordInfo,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onPasswordModalClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handlePasswordSubmit}>
                Update Password
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Mentorship Modal */}
        <Modal
          isOpen={isMentorModalOpen}
          onClose={onMentorModalClose}
          size="lg"
          scrollBehavior="inside"
          classNames={{
            base: "bg-white",
            header: "border-b border-gray-100",
            footer: "border-t border-gray-100",
          }}
        >
          <ModalContent>
            <ModalHeader className="text-lg font-medium">
              Mentorship Details
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <Textarea
                  label="Bio"
                  placeholder="Tell others about your expertise and mentoring approach..."
                  variant="bordered"
                  value={mentorshipInfo.bio}
                  onChange={(e) =>
                    setMentorshipInfo({
                      ...mentorshipInfo,
                      bio: e.target.value,
                    })
                  }
                />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Available Time Slots
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Day"
                      variant="bordered"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
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
                      value={ampm}
                      onChange={(e) => setAmpm(e.target.value)}
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
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
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
                      value={startMin}
                      onChange={(e) => setStartMin(e.target.value)}
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
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
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
                      value={endMin}
                      onChange={(e) => setEndMin(e.target.value)}
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

                  {mentorshipInfo.availableSlots.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Current Slots:
                      </p>
                      {mentorshipInfo.availableSlots.map(
                        (slot, i: number) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              {slot.day}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {slot.timeSlots.map((time: string) => (
                                <Chip
                                  key={time}
                                  variant="flat"
                                  color="primary"
                                  size="sm"
                                  onClose={() =>
                                    handleRemoveSlot(slot.day, time)
                                  }
                                >
                                  {time}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onMentorModalClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleMentorshipSubmit}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
