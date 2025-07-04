import { lazy, Suspense } from "react"; 
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
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
} from "react-icons/fa";
import { RootState } from "../../../../redux/store";
import {
  updateContactInfo,
  updateUserImages,
  updateUserProfessionalInfo,
} from "../../../../Service/User.Service";
import toast from "react-hot-toast";
import {
  checkMentorProfile,
  updateMentorProfile,
} from "../../../../Service/Mentor.Service";
import { updateMentorInfo } from "../../../../redux/Slice/profileSlice";
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
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails, collabDetails, userConnections } = useSelector(
    (state: RootState) => state.profile
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    isOpen: isMentorModalOpen,
    onOpen: onMentorModalOpen,
    onClose: onMentorModalClose,
  } = useDisclosure();

  // Form states
  const [professionalInfo, setProfessionalInfo] = useState({
    industry: currentUser.industry || "",
    reasonForJoining: currentUser.reasonForJoining || "",
  });
  const [contactInfo, setContactInfo] = useState({
    email: currentUser.email || "",
    phone: currentUser.phone || "",
    dateOfBirth: currentUser.dateOfBirth || "",
  });
  const [mentorshipInfo, setMentorshipInfo] = useState({
    bio: mentorDetails?.bio || "",
    availableSlots: mentorDetails?.availableSlots || [],
  });
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const TIME_SLOTS = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

  console.log("COLLAB DETAILS OF THIS CURRENT USER : ", collabDetails);
  console.log("USER CONNECTION DETAILS OF THIS CURRENT USER : ", userConnections);

  // Handlers
  const handleImageUpload = async (file: File, type: "profilePic" | "coverPic") => {
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
    if (!selectedDay || !selectedTime) {
      toast.error("Please select both day and time");
      return;
    }
    setMentorshipInfo((prev) => {
      const existingDaySlot = prev.availableSlots.find(
        (slot) => slot.day === selectedDay
      );
      if (existingDaySlot) {
        if (existingDaySlot.timeSlots.includes(selectedTime)) return prev;
        return {
          ...prev,
          availableSlots: prev.availableSlots.map((slot) =>
            slot.day === selectedDay
              ? { ...slot, timeSlots: [...slot.timeSlots, selectedTime].sort() }
              : slot
          ),
        };
      }
      return {
        ...prev,
        availableSlots: [
          ...prev.availableSlots,
          { day: selectedDay, timeSlots: [selectedTime] },
        ].sort(
          (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
        ),
      };
    });
    setSelectedTime("");
  };

  const handleRemoveSlot = (day, time) => {
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <Card className="relative overflow-hidden rounded-xl shadow-lg">
        <div className="relative h-48">
          <Image
            src={currentUser.coverPic || "/default-cover.jpg"}
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
              src={currentUser.profilePic}
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
              <h1 className="text-3xl font-bold">{currentUser.name}</h1>
              <Chip
                color={currentUser.role === "mentor" ? "success" : "primary"}
                variant="flat"
                size="sm"
              >
                {currentUser.role === "mentor" ? "Mentor" : "User"}
              </Chip>
            </div>
            <p className="text-lg text-gray-600">
              {currentUser.jobTitle || "No job title"}
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
                      {currentUser.industry || "Not specified"}
                    </p>
                    <p>
                      <strong>Reason for Joining:</strong>{" "}
                      {currentUser.reasonForJoining || "Not specified"}
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
                      <FaEnvelope /> {currentUser.email || "No email"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhone /> {currentUser.phone || "No phone"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaBirthdayCake /> {formatDate(currentUser.dateOfBirth)}
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
                {currentUser.role === "mentor" && mentorDetails ? (
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
                            {mentorDetails.availableSlots.map((slot, i) => (
                              <Chip key={i} variant="flat" color="primary">
                                {slot.day}: {slot.timeSlots.join(", ")}
                              </Chip>
                            ))}
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
                          handleProfileClick={(id) =>
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
                          handleProfileClick={(id) =>
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
                          handleProfileClick={(id) =>
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
                          handleProfileClick={(id) =>
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
              <div className="grid grid-cols-2 gap-4">
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
                <Select
                  label="Time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                color="primary"
                onPress={handleAddSlot}
                startContent={<FaPlus />}
              >
                Add Slot
              </Button>
              <div className="space-y-2">
                {mentorshipInfo.availableSlots.map((slot, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <p className="font-medium">{slot.day}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.timeSlots.map((time) => (
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