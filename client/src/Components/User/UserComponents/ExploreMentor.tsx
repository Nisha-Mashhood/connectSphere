import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Avatar,
  Chip,
  Pagination,
  Spinner,
  Tabs,
  Tab,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { fetchAllMentors } from "../../../Service/Mentor.Service";
import {
  fetchCategoriesService,
  getAllSkills,
} from "../../../Service/Category.Service";
import {
  groupDetails,
  sendRequsettoGroup,
} from "../../../Service/Group.Service";
import { fetchAllUsers } from "../../../Service/User.Service";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  getLockedMentorSlot,
  SendRequsetToMentor,
} from "../../../Service/collaboration.Service";
import toast from "react-hot-toast";
import { FaSearch, FaUsers, FaUserTie } from "react-icons/fa";
import {
  fetchCollabDetails,
  fetchGroupDetailsForMembers,
  fetchGroupRequests,
  fetchRequests,
  fetchUserConnections,
  setGroupRequests,
} from "../../../redux/Slice/profileSlice";
import RequestStatusHandler from "./HelperComponents/RequestStatusHandler";
import { sendUser_UserRequset } from "../../../Service/User-User.Service";

const ExploreMentors = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    mentorDetails,
    collabDetails,
    req,
    groupRequests,
    groupMemberships,
    userConnections,
  } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch<AppDispatch>();
  const [mentors, setMentors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [lockedSlots, setLockedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages] = useState(10);
  const [activeTab, setActiveTab] = useState("mentors");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [mentorsData, categoriesData, skillsData, groupData, userData] =
          await Promise.all([
            fetchAllMentors(),
            fetchCategoriesService(),
            getAllSkills(),
            groupDetails(),
            fetchAllUsers(),
          ]);

        console.log("Mentors Data:", mentorsData);
        console.log("Categories Data:", categoriesData);
        console.log("Skills Data:", skillsData);
        console.log("Group Data:", groupData);
        console.log("User Data:", userData);

        if (currentUser) {
          await Promise.all([
            dispatch(
              fetchRequests({
                userId: currentUser._id,
                role: currentUser.role,
                mentorId: mentorDetails?._id,
              })
            ),
            dispatch(
              fetchCollabDetails({
                userId: currentUser._id,
                role: currentUser.role,
              })
            ),
            dispatch(fetchGroupRequests(currentUser._id)),
            dispatch(fetchGroupDetailsForMembers(currentUser._id)),
            dispatch(fetchUserConnections(currentUser._id)),
          ]);
        }

        const filteredUsers = Array.isArray(userData)
          ? userData.filter((user) => user._id !== currentUser._id)
          : [];
        const filteredMentors =
          mentorDetails?._id && Array.isArray(mentorsData)
            ? mentorsData.filter((mentor) => mentor._id !== mentorDetails._id)
            : mentorsData || [];
        const filteredGroups = Array.isArray(groupData)
          ? groupData.filter((group) => group.adminId?._id !== currentUser._id)
          : [];

        setMentors(filteredMentors);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setSkills(skillsData?.skills || []);
        setGroups(filteredGroups);
        setUsers(filteredUsers.filter((user) => user.role === "user"));
      } catch (error) {
        console.error("Error fetching data:", error);
        setMentors([]);
        setCategories([]);
        setSkills([]);
        setGroups([]);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser, mentorDetails, dispatch]);

  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.userId?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || mentor.category === selectedCategory;
    const matchesSkill =
      !selectedSkill ||
      mentor.skills?.some((skill) => skill._id === selectedSkill);
    return matchesSearch && matchesCategory && matchesSkill;
  });

  // Fetch locked slots when a mentor is selected
  useEffect(() => {
    const fetchLockedSlots = async () => {
      if (!selectedMentor?._id) return;
      try {
        const response = await getLockedMentorSlot(selectedMentor._id);
        console.log("Locked slots response:", response);
        setLockedSlots(response.lockedSlots || []);
      } catch (error) {
        console.error("Error fetching locked slots:", error);
        toast.error("Failed to load locked slots");
      }
    };
    fetchLockedSlots();
  }, [selectedMentor]);

  // Check if a slot is locked
  const isSlotLocked = (day: string, timeSlot: string) => {
    // console.log("Checking slot for:", day, timeSlot);
    // Extract start time (e.g., "09:00 AM" from "09:00 AM - 10:30 AM")
    const startTimeMatch = timeSlot.match(/^(\d{1,2}:\d{2}\s[AP]M)/);
    const startTime = startTimeMatch ? startTimeMatch[1] : timeSlot;
    // console.log("Extracted startTime:", startTime);

    const normalizedDay = day.trim().toLowerCase();
    const normalizedStartTime = startTime.trim().toLowerCase();

    const isLocked = lockedSlots.some((locked) => {
      const lockedDay = locked.day.trim().toLowerCase();
      const hasTimeSlot = locked.timeSlots.some(
        (t: string) => t.trim().toLowerCase() === normalizedStartTime
      );
      return lockedDay === normalizedDay && hasTimeSlot;
    });

    // console.log(
    //   `Result for ${day} ${timeSlot} (startTime: ${startTime}): isLocked=${isLocked}`
    // );
    // if (!isLocked) {
    //   console.log(
    //     "No match. Locked slots:",
    //     lockedSlots.map((ls) => ({
    //       day: ls.day,
    //       timeSlots: ls.timeSlots,
    //     }))
    //   );
    // }
    return isLocked;
  };

  // Filter users and groups based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Request handlers
  const handleRequestMentor = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    const [day, timeSlot] = selectedSlot.split(" - ");
    const requestData = {
      mentorId: selectedMentor._id,
      userId: currentUser._id,
      selectedSlot: {
        day: day.trim(),
        timeSlots: timeSlot.trim(),
      },
      price: selectedMentor.price,
      timePeriod: selectedMentor.timePeriod,
    };

    try {
      const response = await SendRequsetToMentor(requestData);
      if (response) {
        toast.success("Request sent successfully!");
        dispatch(
          fetchRequests({
            userId: currentUser._id,
            role: currentUser.role,
            mentorId: selectedMentor?._id || undefined,
          })
        );
        setSelectedMentor(null);
      }
    } catch (error) {
      console.error("Error booking mentor:", error);
      toast.error("Failed to send the request. Please try again.");
    }
  };

  //Button configuration of user - user connection
  const getUserButtonConfig = (targetUser, userConnections) => {
    // Check if there's a connection request sent by current user
    const sentRequest = userConnections.sent?.find(
      (conn) => conn.recipient._id === targetUser._id
    );

    // Check if there's a connection request received from this user
    const receivedRequest = userConnections.received?.find(
      (conn) => conn.requester._id === targetUser._id
    );

    // If there's an existing connection
    if (
      sentRequest?.connectionStatus === "Connected" ||
      receivedRequest?.connectionStatus === "Connected"
    ) {
      return {
        disabled: true,
        text: "Connected",
      };
    }

    // If there's a pending sent request
    if (sentRequest?.requestStatus === "Pending") {
      return {
        disabled: true,
        text: "Request Pending",
      };
    }

    // If there's a pending received request
    if (receivedRequest?.requestStatus === "Pending") {
      return {
        disabled: true,
        text: "Accept Request",
      };
    }

    // If request was rejected
    if (
      sentRequest?.requestStatus === "Rejected" ||
      sentRequest?.connectionStatus === "Disconnected"
    ) {
      return {
        disabled: false,
        text: "Connect Again",
      };
    }

    // Default state - can send connection request
    return {
      disabled: false,
      text: "Connect",
    };
  };

  //user-user connection
  const handleRequestUser = async () => {
    try {
      console.log(`Sending request to user ${selectedUser._id}`);
      const newConnection = await sendUser_UserRequset(
        currentUser._id,
        selectedUser._id
      );
      if (newConnection) {
        toast.success("Connection Requset send successfully");
        setSelectedUser(null);
        dispatch(fetchUserConnections(currentUser._id));
      }
    } catch (error) {
      console.error("Error sending user request:", error);
    }
  };

  const handleRequestGroup = async () => {
    const data = {
      groupId: selectedGroup._id,
      userId: currentUser._id,
    };
    try {
      console.log(`Requesting to join group ${selectedGroup._id}`);
      const response = await sendRequsettoGroup(data);
      if (response) {
        toast.success("Requset send successfully");
        const newRequest = {
          _id: response._id,
          groupId: { _id: selectedGroup._id },
          userId: { _id: currentUser._id },
          status: "Pending",
          paymentStatus: "Pending",
        };
        dispatch(setGroupRequests([...(groupRequests || []), newRequest]));
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error("Error requesting group:", error);
    }
  };

  const handleSelectionChange = (key: string) => {
    setActiveTab(key);
  };

  const getMentorButtonConfig = (mentor) => {
    // If this is the current user's mentor card
    if (mentorDetails?._id === mentor._id) {
      return {
        disabled: true,
        hidden: true,
        text: "",
      };
    }

    // Check if there's an ongoing collaboration
    const ongoingCollab = collabDetails?.data?.find(
      (collab) => collab.mentorId._id === mentor._id && !collab.isCancelled && !collab.isCompleted
    );
    if (ongoingCollab) {
      return {
        disabled: true,
        hidden: false,
        text: "Ongoing Collaboration",
      };
    }

    // Check if there's a pending request
    const pendingRequest = req?.sentRequests?.find(
      (request) => request.mentorId._id === mentor._id
    );

    if (pendingRequest && pendingRequest.isAccepted !== "Rejected") {
      const requestStatus = {
        Pending: "Request Pending",
        Accepted: "Request Accepted",
        Rejected: "Request Rejected",
      };
      return {
        disabled: true,
        hidden: false,
        text: requestStatus[pendingRequest.isAccepted] || "Request Pending",
      };
    }

    // Default state - can book session
    return {
      disabled: false,
      hidden: false,
      text: "Book Session",
    };
  };

  //Get the count of members
  const getMemberCounts = (group) => {
    const totalMembers = group.maxMembers;
    const currentMembers = group.members?.length || 0;
    const remainingSlots = totalMembers - currentMembers;

    return {
      total: totalMembers,
      current: currentMembers,
      remaining: remainingSlots,
    };
  };

  // Helper function to determine group button state
  const getGroupButtonConfig = (group) => {
    // Check if user is already a member
    const isMember = groupMemberships?.some(
      (membership) => membership._id === group._id
    );
    if (isMember) {
      return {
        disabled: true,
        text: "Member",
      };
    }

    // Check if group is full
    const memberCounts = getMemberCounts(group);
    if (memberCounts.current >= memberCounts.total) {
      return {
        disabled: true,
        text: "Group Full",
      };
    }

    // Check if user has sent a request
    const existingRequest = groupRequests?.find(
      (request) => request.groupId._id === group._id
    );
    if (existingRequest) {
      const requestStatus = {
        Pending: "Request Pending",
        Accepted: "Request Accepted",
        Rejected: "Join Group", // Allow resending if rejected
      };
      return {
        disabled: existingRequest.status !== "Rejected",
        text: requestStatus[existingRequest.status] || "Join Group",
      };
    }

    // Default: can send a request
    return {
      disabled: false,
      text: "Join Group",
    };
  };

  // JSX for mentor cards
  const renderMentorCard = (mentor) => {
    const buttonConfig = getMentorButtonConfig(mentor);

    if (buttonConfig.hidden) {
      return null;
    }

    return (
      <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <img
            src={mentor.userId?.profilePic || "/api/placeholder/400/400"}
            alt={mentor.userId?.name}
            className="w-full aspect-square object-cover"
          />
        </CardHeader>
        <CardBody className="space-y-4">
          <Link to={`/profileDispaly/${mentor._id}`}>
            <h3 className="text-xl font-semibold hover:underline">
              {mentor.userId?.name}
            </h3>
          </Link>
          <p className="text-gray-600">{mentor.specialization}</p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Skills:</p>
            <div className="flex flex-wrap gap-2">
              {mentor.skills?.slice(0, 3).map((skill) => (
                <Chip key={skill._id} size="sm" variant="flat">
                  {skill.name}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            className="w-full"
            onPress={() => !buttonConfig.disabled && setSelectedMentor(mentor)}
            isDisabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderUserCard = (user) => {
    const buttonConfig = getUserButtonConfig(user, userConnections);

    return (
      <Card key={user._id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <img
            src={user.profilePic || "/api/placeholder/400/400"}
            alt={user.name}
            className="w-full aspect-square object-cover"
          />
        </CardHeader>
        <CardBody className="space-y-4">
          <Link to={`/profileDispaly/${user._id}`}>
            <h3 className="text-xl font-semibold hover:underline">
              {user.name}
            </h3>
          </Link>
          <p className="text-gray-600">{user.jobTitle || "Community Member"}</p>
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            className="w-full"
            onPress={() => !buttonConfig.disabled && setSelectedUser(user)}
            isDisabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // JSX for group cards
  const renderGroupCard = (group) => {
    const buttonConfig = getGroupButtonConfig(group);
    const memberCounts = getMemberCounts(group);

    return (
      <Card key={group._id} className="hover:shadow-lg transition-shadow">
        <CardBody className="space-y-4">
          <h3 className="text-xl font-semibold">{group.name}</h3>
          <p className="text-gray-600">{group.bio}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Price: ₹{group.price}</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Members:</span>
                <span className="font-medium">
                  {memberCounts.current} / {memberCounts.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (memberCounts.current / memberCounts.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {memberCounts.remaining}{" "}
                {memberCounts.remaining === 1 ? "spot" : "spots"} remaining
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Start Date:{" "}
              {group.startDate
                ? new Date(group.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"}
            </p>
          </div>
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            className="w-full"
            onPress={() => !buttonConfig.disabled && setSelectedGroup(group)}
            isDisabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // mentors tab content
  const renderMentorsTab = () => (
    <div className="py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMentors.map(renderMentorCard)}
      </div>
    </div>
  );

  // users tab content
  const renderUsersTab = () => (
    <div className="py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map(renderUserCard)}
      </div>
    </div>
  );

  // groups tab content
  const renderGroupsTab = () => (
    <div className="py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGroups.map(renderGroupCard)}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <RequestStatusHandler currentUser={currentUser} />
      {/* Header and Search Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-gray-600">
            Find mentors, connect with users, and join groups
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            size="lg"
            startContent={<FaSearch className="text-gray-400" />}
          />
          <div className="flex gap-4">
            <Select
              label="Category"
              placeholder="Select a category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Skill"
              placeholder="Select a skill"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-40"
            >
              {skills.map((skill) => (
                <SelectItem key={skill._id} value={skill._id}>
                  {skill.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={handleSelectionChange}
          aria-label="Explore sections"
          color="primary"
          variant="underlined"
        >
          <Tab
            key="mentors"
            title={
              <div className="flex items-center gap-2">
                <FaUserTie />
                <span>Mentors</span>
              </div>
            }
          >
            {renderMentorsTab()}
          </Tab>

          <Tab
            key="users"
            title={
              <div className="flex items-center gap-2">
                <FaUserTie />
                <span>Users</span>
              </div>
            }
          >
            {renderUsersTab()}
          </Tab>

          <Tab
            key="groups"
            title={
              <div className="flex items-center gap-2">
                <FaUsers />
                <span>Groups</span>
              </div>
            }
          >
            {renderGroupsTab()}
          </Tab>
        </Tabs>
      </div>

      {/* Mentor Modal */}
      {/* Mentor Modal */}
      <Modal
        isOpen={!!selectedMentor}
        onClose={() => {
          setSelectedMentor(null);
          setSelectedSlot("");
          setLockedSlots([]);
        }}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Book Mentorship Session</ModalHeader>
              <ModalBody>
                {selectedMentor && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={
                          selectedMentor.userId?.profilePic ||
                          "/api/placeholder/400/400"
                        }
                        size="lg"
                        alt={selectedMentor.userId?.name}
                      />
                      <div>
                        <h3 className="text-xl font-bold">
                          {selectedMentor.userId?.name}
                        </h3>
                        <p className="text-gray-600">
                          {selectedMentor.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">
                        Available Slots:
                      </h4>
                      <RadioGroup
                        value={selectedSlot}
                        onValueChange={setSelectedSlot}
                      >
                        {selectedMentor.availableSlots?.map(
                          (slot, dayIndex: number) =>
                            slot.timeSlots.map(
                              (timeSlot: string, slotIndex: number) => {
                                const isLocked = isSlotLocked(
                                  slot.day,
                                  timeSlot
                                );
                                return (
                                  <label
                                    key={`${dayIndex}-${slotIndex}`}
                                    className={`flex items-center space-x-3 p-3 border rounded-lg ${
                                      isLocked
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "hover:bg-gray-50 cursor-pointer"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="slot"
                                      value={`${slot.day} - ${timeSlot}`}
                                      onChange={(e) =>
                                        setSelectedSlot(e.target.value)
                                      }
                                      checked={
                                        selectedSlot ===
                                        `${slot.day} - ${timeSlot}`
                                      }
                                      disabled={isLocked}
                                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${
                                        isLocked ? "opacity-50" : ""
                                      }`}
                                    />
                                    <span
                                      className={`flex-1 ${
                                        isLocked
                                          ? "text-gray-500"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {slot.day} - {timeSlot}
                                      {isLocked && (
                                        <span className="ml-2 text-xs text-red-600 lowercase">
                                          already locked by another user
                                        </span>
                                      )}
                                    </span>
                                  </label>
                                );
                              }
                            )
                        )}
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleRequestMentor}
                  isDisabled={!selectedSlot}
                >
                  Book Session
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Send Connection Request</ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={
                        selectedUser.profilePic || "/api/placeholder/400/400"
                      }
                      size="lg"
                      alt={selectedUser.name}
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                      <p className="text-gray-600">
                        {selectedUser.jobTitle || "Community Member"}
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleRequestUser}>
                  Send Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Group Modal */}
      <Modal
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Join Group</ModalHeader>
              <ModalBody>
                {selectedGroup && (
                  <div>
                    <h3 className="text-xl font-bold">{selectedGroup.name}</h3>
                    <p className="text-gray-600">{selectedGroup.bio}</p>
                    <p className="text-sm text-gray-600">
                      Price: ₹{selectedGroup.price}
                    </p>
                    <div className="space-y-2">
                      {/* Use the getMemberCounts function here to get the member count */}
                      {(() => {
                        const memberCounts = getMemberCounts(selectedGroup);
                        return (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>Current Members:</span>
                              <span className="font-medium">
                                {memberCounts.current}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Maximum Capacity:</span>
                              <span className="font-medium">
                                {memberCounts.total}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Available Spots:</span>
                              <span className="font-medium text-green-600">
                                {memberCounts.remaining}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (memberCounts.current /
                                      memberCounts.total) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleRequestGroup}>
                  Request to Join
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination
          total={totalPages}
          initialPage={currentPage}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex justify-center items-center mt-16">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default ExploreMentors;
