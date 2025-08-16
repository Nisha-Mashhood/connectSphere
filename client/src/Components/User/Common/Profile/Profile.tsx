import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Chip,
  Tooltip,
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
  FaPhone,
  FaBriefcase,
  FaBirthdayCake,
  FaPencilAlt,
  FaPlus,
  FaCamera,
  FaUserFriends,
  FaLayerGroup,
  FaUserGraduate,
  FaLock,
  FaCreditCard,
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

// Lazy load components
const RequestsSection = lazy(() => import("./RequestSection"));
const GroupRequests = lazy(() => import("./GroupRequests"));
const ActiveCollaborations = lazy(() => import("./ActiveCollaborations"));
const GroupCollaborations = lazy(() => import("./GroupCollaborations"));
const TaskManagement = lazy(() => import("../../TaskManagement/TaskManagemnt"));
const UserConnections = lazy(() => import("./UserConnections"));

const Profile = () => {
  const { currentUser } = useSelector(
    (state: RootState) => state.user
  );
  const {
    mentorDetails,
    collabDetails,
    userConnections,
    loading: profileLoading,
    error: profileError,
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

  // Currency formatter
  const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

  // Fetch collaboration details
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(
        fetchCollabDetails({ userId: currentUser._id, role: currentUser.role })
      );
    }
  }, [dispatch, currentUser?._id, currentUser?.role]);

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
          if (typeof c.mentorId === "object" && c.mentorId.userId?.name) {
            console.log(
              `Mapping mentor ID ${c.mentorId._id} to name: ${c.mentorId.userId.name}`
            );
            acc[c.mentorId._id] = c.mentorId.userId.name;
          } else if (typeof c.mentorId === "string") {
            console.log(
              `No name available for mentor ID ${c.mentorId}, using fallback`
            );
            acc[c.mentorId] = "Unknown Mentor";
          } else {
            console.warn(
              "Invalid mentorId data for collaboration",
              c._id,
              ":",
              c.mentorId
            );
            acc[c.mentorId?._id || c._id] = "Unknown Mentor";
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
  console.log(
    "USER CONNECTION DETAILS OF THIS CURRENT USER : ",
    userConnections
  );

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
      const { user } = await updateUserImages(currentUser._id, formData);
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
      const { user } = await updateUserProfessionalInfo(currentUser._id, {
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
      const { user } = await updateContactInfo(currentUser._id, contactInfo);
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
        mentorDetails._id,
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
      await updateUserPassword(currentUser._id, {
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
      const profileResponse = await checkProfile(currentUser._id);
      if (!profileResponse.isProfileComplete) {
        toast.error("Please complete your profile first");
        navigate("/complete-profile");
        return;
      }
      const mentorResponse = await checkMentorProfile(currentUser._id);
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
  };

  const totalPayments =
    collabDetails?.data?.reduce(
      (sum: number, collab) => sum + collab.price,
      0
    ) || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <Card className="relative overflow-hidden rounded-xl shadow-lg">
        <div className="relative h-48">
          <Image
            src={currentUser?.coverPic || "/default-cover.jpg"}
            alt="Cover"
            className="w-full h-full object-cover opacity-90"
            removeWrapper
          />
          <Tooltip content="Change Cover Photo">
            <Button
              isIconOnly
              color="primary"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white z-10 shadow-md"
              radius="full"
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
                <FaCamera />
              </label>
            </Button>
          </Tooltip>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <Avatar
              src={currentUser?.profilePic}
              className="w-28 h-28 border-4 border-white shadow-md"
              fallback={<FaUsers className="w-14 h-14 text-gray-400" />}
            />
            <Tooltip content="Change Profile Photo">
              <Button
                isIconOnly
                color="primary"
                size="sm"
                className="absolute bottom-0 right-0 bg-white/90 hover:bg-white z-10 shadow-md"
                radius="full"
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
                  <FaCamera size={14} />
                </label>
              </Button>
            </Tooltip>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-3xl font-bold">{currentUser?.name}</h1>
              <Chip
                color={currentUser?.role === "mentor" ? "success" : "primary"}
                variant="flat"
                size="sm"
              >
                {currentUser?.role === "mentor" ? "Mentor" : "User"}
              </Chip>
            </div>
            <p className="text-lg text-gray-600">
              {currentUser?.jobTitle || "No job title"}
            </p>
            <div className="flex items-center justify-around sm:justify-around">
              <Button
                color="primary"
                size="sm"
                className="mt-4"
                startContent={<FaPlus />}
                onPress={() => navigate("/create-group")}
              >
                Create Group
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-md">
            <CardHeader className="bg-gray-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-semibold">Profile Details</h2>
            </CardHeader>
            <CardBody className="p-6">
              {profileError && (
                <p className="text-red-500 mb-4">Error: {profileError}</p>
              )}
              <Accordion variant="light">
                <AccordionItem
                  key="professional"
                  title={
                    <span className="flex items-center gap-2">
                      <FaBriefcase /> Professional Info
                    </span>
                  }
                  className="text-base"
                >
                  <div className="space-y-4">
                    <p>
                      <strong>Industry:</strong>{" "}
                      {currentUser?.industry || "Not specified"}
                    </p>
                    <p>
                      <strong>Reason for Joining:</strong>{" "}
                      {currentUser?.reasonForJoining || "Not specified"}
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={onProfessionalModalOpen}
                      startContent={<FaPencilAlt />}
                    >
                      Edit
                    </Button>
                  </div>
                </AccordionItem>
                <AccordionItem
                  key="contact"
                  title={
                    <span className="flex items-center gap-2">
                      <FaEnvelope /> Contact Info
                    </span>
                  }
                  className="text-base"
                >
                  <div className="space-y-4">
                    <p className="flex items-center gap-2">
                      <FaEnvelope /> {currentUser?.email || "No email"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhone /> {currentUser?.phone || "No phone"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaBirthdayCake /> {formatDate(currentUser?.dateOfBirth)}
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={onContactModalOpen}
                      startContent={<FaPencilAlt />}
                    >
                      Edit
                    </Button>
                  </div>
                </AccordionItem>
                <AccordionItem
                  key="password"
                  title={
                    <span className="flex items-center gap-2">
                      <FaLock /> Change Password
                    </span>
                  }
                  className="text-base"
                >
                  <div className="space-y-4">
                    <p>Update your account password</p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={onPasswordModalOpen}
                      startContent={<FaPencilAlt />}
                    >
                      Change Password
                    </Button>
                  </div>
                </AccordionItem>
                {currentUser?.role === "user" && (
                  <AccordionItem
                    key="payments"
                    title={
                      <span className="flex items-center gap-2">
                        <FaCreditCard /> Payment History
                      </span>
                    }
                    className="text-base"
                  >
                    <div className="space-y-4">
                      {profileLoading || isPaymentLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <Spinner
                            size="lg"
                            label="Loading Payment History..."
                          />
                        </div>
                      ) : collabDetails?.data?.length > 0 ? (
                        <>
                          {collabDetails.data
                            .filter((c) => c.payment)
                            .map((collab, i: number) => (
                              <Card key={i}>
                                <CardBody>
                                  <p>
                                    <strong>Collaboration ID:</strong>{" "}
                                    {collab.collaborationId}
                                  </p>
                                  <p>
                                    <strong>Mentor:</strong>{" "}
                                    {typeof collab.mentorId === "string"
                                      ? mentorNames[collab.mentorId] ||
                                        "Unknown Mentor"
                                      : mentorNames[collab.mentorId._id] ||
                                        collab.mentorId.userId?.name ||
                                        "Unknown Mentor"}
                                  </p>
                                  <p>
                                    <strong> Price:</strong>{" "}
                                    {formatCurrency(collab.price)}
                                  </p>
                                  {/* <p>
                                    <strong>Payment Intent ID:</strong>{" "}
                                    {collab.paymentIntentId}
                                  </p> */}
                                  <p>
                                    <strong>Start Date:</strong>{" "}
                                    {formatDate(collab.startDate)}
                                  </p>
                                  <p>
                                    <strong>End Date:</strong>{" "}
                                    {formatDate(collab.endDate)}
                                  </p>
                                  <p>
                                    <strong>Status:</strong>{" "}
                                    {collab.isCancelled
                                      ? "Cancelled"
                                      : collab.isCompleted
                                      ? "Completed"
                                      : "Ongoing"}
                                  </p>
                                  {collab.selectedSlot &&
                                    collab.selectedSlot.length > 0 && (
                                      <div>
                                        <strong>Selected Slot:</strong>{" "}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {collab.selectedSlot.map(
                                            (slot, j) => (
                                              <Chip
                                                key={j}
                                                variant="flat"
                                                color="primary"
                                              >
                                                {slot.day}:{" "}
                                                {slot.timeSlots.join(", ")}
                                              </Chip>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </CardBody>
                                {collab.paymentIntentId && (
                                  <CardFooter>
                                    <Button
                                      variant="light"
                                      color="primary"
                                      onPress={() => {
                                        toast.error(
                                          "Receipt viewing is not yet implemented"
                                        );
                                      }}
                                    >
                                      View Receipt
                                    </Button>
                                  </CardFooter>
                                )}
                              </Card>
                            ))}
                          <p>
                            <strong>Total Payments:</strong>{" "}
                            {formatCurrency(totalPayments)}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">
                          You haven't made any payments yet.
                        </p>
                      )}
                    </div>
                  </AccordionItem>
                )}
                {currentUser?.role === "mentor" && mentorDetails ? (
                  <AccordionItem
                    key="mentorship"
                    title={
                      <span className="flex items-center gap-2">
                        <FaUserGraduate /> Mentorship Details
                      </span>
                    }
                    className="text-base"
                  >
                    <div className="space-y-4">
                      <p>
                        <strong>Bio:</strong> {mentorDetails.bio || "No bio"}
                      </p>
                      <div>
                        <strong>Available Slots:</strong>
                        {mentorDetails.availableSlots?.length ? (
                          <div className="mt-2 space-y-2">
                            {mentorDetails.availableSlots.map(
                              (slot: any, i: number) => (
                                <Chip key={i} variant="flat" color="primary">
                                  {slot.day}: {slot.timeSlots.join(", ")}
                                </Chip>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No slots set</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={onMentorModalOpen}
                        startContent={<FaPencilAlt />}
                      >
                        Edit
                      </Button>
                    </div>
                  </AccordionItem>
                ) : (
                  <AccordionItem
                    key="become-mentor"
                    title={
                      <span className="flex items-center gap-2">
                        <FaUserGraduate /> Become a Mentor
                      </span>
                    }
                    className="text-base"
                  >
                    <div className="text-center">
                      <p className="mb-4">Share your expertise with others!</p>
                      <Button
                        color="success"
                        size="sm"
                        onPress={handleBecomeMentor}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </AccordionItem>
                )}
              </Accordion>
            </CardBody>
          </Card>
        </div>

        {/* Tasks & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl shadow-md">
            <CardHeader className="bg-gray-100 p-4 rounded-t-xl flex items-center gap-2">
              <FaCalendarAlt className="text-primary" />
              <h2 className="text-xl font-semibold">My Tasks</h2>
            </CardHeader>
            <CardBody className="p-6">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-32">
                    <Spinner size="lg" label="Loading Tasks..." />
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

          <Card className="rounded-xl shadow-md">
            <CardHeader className="bg-gray-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-semibold">Activity & Connections</h2>
            </CardHeader>
            <CardBody className="p-6">
              <Tabs variant="solid" color="primary" className="mb-4">
                <Tab
                  key="connections"
                  title={
                    <span className="flex items-center gap-2">
                      <FaUserFriends /> Connections
                    </span>
                  }
                >
                  <Accordion variant="light">
                    <AccordionItem key="requests" title="Pending Requests">
                      <Suspense
                        fallback={
                          <div className="flex justify-center items-center h-32">
                            <Spinner size="lg" label="Loading Requests..." />
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
                          <div className="flex justify-center items-center h-32">
                            <Spinner
                              size="lg"
                              label="Loading Collaborations..."
                            />
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
                          <div className="flex justify-center items-center h-32">
                            <Spinner size="lg" label="Loading Network..." />
                          </div>
                        }
                      >
                        <UserConnections
                          currentUser={currentUser}
                          handleProfileClick={(id: string) =>
                            navigate(`/profileDispaly/${id}`)
                          }
                        />
                      </Suspense>
                    </AccordionItem>
                  </Accordion>
                </Tab>
                <Tab
                  key="groups"
                  title={
                    <span className="flex items-center gap-2">
                      <FaLayerGroup /> Groups
                    </span>
                  }
                >
                  <Accordion variant="light">
                    <AccordionItem key="invitations" title="Group Invitations">
                      <Suspense
                        fallback={
                          <div className="flex justify-center items-center h-32">
                            <Spinner
                              size="lg"
                              label="Loading Group Invitations..."
                            />
                          </div>
                        }
                      >
                        <GroupRequests />
                      </Suspense>
                    </AccordionItem>
                    <AccordionItem key="my-groups" title="My Groups">
                      <Suspense
                        fallback={
                          <div className="flex justify-center items-center h-32">
                            <Spinner size="lg" label="Loading Groups..." />
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
                </Tab>
                {mentorDetails && (
                  <Tab
                    key="mentoring"
                    title={
                      <span className="flex items-center gap-2">
                        <FaUserGraduate /> Mentoring
                      </span>
                    }
                  >
                    <p className="text-center text-gray-500">
                      Manage your mentoring activities here.
                    </p>
                  </Tab>
                )}
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isProfessionalModalOpen}
        onClose={onProfessionalModalClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Edit Professional Info</ModalHeader>
          <ModalBody>
            <Input
              label="Industry"
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
              value={professionalInfo.reasonForJoining}
              onChange={(e) =>
                setProfessionalInfo({
                  ...professionalInfo,
                  reasonForJoining: e.target.value,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onProfessionalModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleProfessionalSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isContactModalOpen}
        onClose={onContactModalClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Edit Contact Info</ModalHeader>
          <ModalBody>
            <Input
              label="Email"
              value={contactInfo.email}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, email: e.target.value })
              }
            />
            <Input
              label="Phone"
              value={contactInfo.phone}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, phone: e.target.value })
              }
            />
            <Input
              type="date"
              label="Date of Birth"
              value={contactInfo.dateOfBirth.split("T")[0] || ""}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, dateOfBirth: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onContactModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleContactSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={onPasswordModalClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody>
            <Input
              type="password"
              label="Current Password"
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
              value={passwordInfo.confirmPassword}
              onChange={(e) =>
                setPasswordInfo({
                  ...passwordInfo,
                  confirmPassword: e.target.value,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onPasswordModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handlePasswordSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isMentorModalOpen}
        onClose={onMentorModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Edit Mentorship Info</ModalHeader>
          <ModalBody>
            <Textarea
              label="Bio"
              value={mentorshipInfo.bio}
              onChange={(e) =>
                setMentorshipInfo({ ...mentorshipInfo, bio: e.target.value })
              }
            />
            <div className="space-y-4 mt-4">
              <Select
                label="Day"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </Select>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Start Time</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      label="Hour"
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
                      label="Minute"
                      value={startMin}
                      onChange={(e) => setStartMin(e.target.value)}
                    >
                      {MINUTES.map((min) => (
                        <SelectItem key={min} value={min}>
                          {min}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">End Time</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      label="Hour"
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
                      label="Minute"
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
                </div>
                <div>
                  <p className="font-medium mb-2">AM/PM</p>
                  <Select
                    label="AM/PM"
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
              </div>
              <Button
                color="primary"
                onPress={handleAddSlot}
                startContent={<FaPlus />}
              >
                Add Slot
              </Button>
              <div className="space-y-2">
                {mentorshipInfo.availableSlots.map((slot: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2">
                    <p className="font-medium">{slot.day}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.timeSlots.map((time: string) => (
                        <Chip
                          key={time}
                          variant="flat"
                          color="primary"
                          onClose={() => handleRemoveSlot(slot.day, time)}
                        >
                          {time}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onMentorModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleMentorshipSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Profile;
