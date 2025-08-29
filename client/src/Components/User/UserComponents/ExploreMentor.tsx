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
  Divider,
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
import {
  FaSearch,
  FaUsers,
  FaUserTie,
  FaFilter,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
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
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [mentorPagination, setMentorPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [userPagination, setUserPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [groupPagination, setGroupPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [lockedSlots, setLockedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mentors");
  const limit = 4;

  // Fetch categories and skills
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, skillsData] = await Promise.all([
          fetchCategoriesService(),
          getAllSkills(),
        ]);
        setCategories(
          Array.isArray(categoriesData.categories)
            ? categoriesData.categories
            : []
        );
        setSkills(skillsData || []);
      } catch (error) {
        console.error("Error fetching static data:", error);
        setCategories([]);
        setSkills([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  // Fetch mentors, groups, and users
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setIsLoading(true);
        console.log(
          selectedCategory ? `${selectedCategory}` : `No category Selected`
        );
        const [mentorsData, groupData, userData] = await Promise.all([
          fetchAllMentors({
            search: searchQuery,
            page: mentorPagination.currentPage,
            limit,
            skill: activeTab === "mentors" ? selectedSkill : "",
            category: activeTab === "mentors" ? selectedCategory : "",
            sortBy,
            sortOrder,
          }),
          groupDetails({
            search: searchQuery,
            page: groupPagination.currentPage,
            limit,
            excludeAdminId: currentUser._id,
          }),
          fetchAllUsers({
            search: searchQuery,
            page: userPagination.currentPage,
            limit,
            excludeId: currentUser._id,
          }),
        ]);

        const filteredMentors =
          mentorDetails?._id && Array.isArray(mentorsData.mentors)
            ? mentorsData.mentors.filter(
                (mentor) => mentor._id !== mentorDetails._id
              )
            : mentorsData.mentors || [];

        setMentors(filteredMentors);
        setGroups(groupData.groups || []);
        setUsers(userData.users || []);
        setMentorPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(mentorsData.total / limit),
          totalItems: mentorsData.total,
        }));
        setUserPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(userData.total / limit),
          totalItems: userData.total,
        }));
        setGroupPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(groupData.total / limit),
          totalItems: groupData.total,
        }));
        console.log("Mentor Data:", mentorsData);
        console.log("Users Data:", userData);
        console.log("Group Data:", groupData);
      } catch (error) {
        console.error("Error fetching dynamic data:", error);
        setMentors([]);
        setGroups([]);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDynamicData();
  }, [
    searchQuery,
    selectedSkill,
    selectedCategory,
    sortBy,
    sortOrder,
    mentorDetails,
    activeTab,
    currentUser._id,
    mentorPagination.currentPage,
    userPagination.currentPage,
    groupPagination.currentPage,
  ]);

  // Fetch user-specific data
  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
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
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [currentUser, mentorDetails, dispatch]);

  // Fetch locked slots
  useEffect(() => {
    const fetchLockedSlots = async () => {
      if (!selectedMentor?._id) return;
      try {
        const response = await getLockedMentorSlot(selectedMentor._id);
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
    const startTimeMatch = timeSlot.match(/^(\d{1,2}:\d{2}\s[AP]M)/);
    const startTime = startTimeMatch ? startTimeMatch[1] : timeSlot;
    const normalizedDay = day.trim().toLowerCase();
    const normalizedStartTime = startTime.trim().toLowerCase();

    return lockedSlots.some((locked) => {
      const lockedDay = locked.day.trim().toLowerCase();
      const hasTimeSlot = locked.timeSlots.some(
        (t: string) => t.trim().toLowerCase() === normalizedStartTime
      );
      return lockedDay === normalizedDay && hasTimeSlot;
    });
  };

  const handleSelectionChange = (key: string) => {
    setActiveTab(key);
    if (key === "mentors") {
      setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
    } else if (key === "users") {
      setUserPagination((prev) => ({ ...prev, currentPage: 1 }));
      setSelectedSkill("");
      setSelectedCategory("");
    } else {
      setGroupPagination((prev) => ({ ...prev, currentPage: 1 }));
      setSelectedSkill("");
      setSelectedCategory("");
    }
  };

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

  const getUserButtonConfig = (targetUser, userConnections) => {
    const sentRequest = userConnections.sent?.find(
      (conn) => conn.recipient._id === targetUser._id
    );
    const receivedRequest = userConnections.received?.find(
      (conn) => conn.requester._id === targetUser._id
    );

    if (
      sentRequest?.connectionStatus === "Connected" ||
      receivedRequest?.connectionStatus === "Connected"
    ) {
      return { disabled: true, text: "Connected" };
    }
    if (sentRequest?.requestStatus === "Pending") {
      return { disabled: true, text: "Request Pending" };
    }
    if (receivedRequest?.requestStatus === "Pending") {
      return { disabled: true, text: "Accept Request" };
    }
    if (
      sentRequest?.requestStatus === "Rejected" ||
      sentRequest?.connectionStatus === "Disconnected"
    ) {
      return { disabled: false, text: "Connect Again" };
    }
    return { disabled: false, text: "Connect" };
  };

  const handleRequestUser = async () => {
    try {
      const newConnection = await sendUser_UserRequset(
        currentUser._id,
        selectedUser._id
      );
      if (newConnection) {
        toast.success("Connection Request sent successfully");
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
      const response = await sendRequsettoGroup(data);
      if (response) {
        toast.success("Request sent successfully");
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

  const getMentorButtonConfig = (mentor) => {
    if (mentorDetails?._id === mentor._id) {
      return { disabled: true, hidden: true, text: "" };
    }
    const ongoingCollab = collabDetails?.data?.find(
      (collab) =>
        collab.mentorId._id === mentor._id &&
        !collab.isCancelled &&
        !collab.isCompleted
    );
    if (ongoingCollab) {
      return { disabled: true, hidden: false, text: "Ongoing Collaboration" };
    }
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
    return { disabled: false, hidden: false, text: "Book Session" };
  };

  const getMemberCounts = (group) => {
    const totalMembers = group.maxMembers;
    const currentMembers = group.members?.userId?.length || 0;
    const remainingSlots = totalMembers - currentMembers;
    return {
      total: totalMembers,
      current: currentMembers,
      remaining: remainingSlots,
    };
  };

  const getGroupButtonConfig = (group) => {
    const isMember = groupMemberships?.some(
      (membership) => membership._id === group._id
    );
    if (isMember) {
      return { disabled: true, text: "Member" };
    }
    const memberCounts = getMemberCounts(group);
    if (memberCounts.current >= memberCounts.total) {
      return { disabled: true, text: "Group Full" };
    }
    const existingRequest = groupRequests?.find(
      (request) => request.groupId._id === group._id
    );
    if (existingRequest) {
      const requestStatus = {
        Pending: "Request Pending",
        Accepted: "Request Accepted",
        Rejected: "Join Group",
      };
      return {
        disabled: existingRequest.status !== "Rejected",
        text: requestStatus[existingRequest.status] || "Join Group",
      };
    }
    return { disabled: false, text: "Join Group" };
  };

  const renderMentorCard = (mentor) => {
    const buttonConfig = getMentorButtonConfig(mentor);
    if (buttonConfig.hidden) return null;

    return (
      <Card
        key={mentor._id}
        className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <CardHeader className="p-0 relative overflow-hidden">
          <img
            src={mentor.userId?.profilePic || "/api/placeholder/400/400"}
            alt={mentor.userId?.name}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Chip
              color="primary"
              variant="solid"
              size="sm"
              className="bg-white/90 text-primary font-semibold"
            >
              ₹{mentor.price}
            </Chip>
          </div>
          {mentor.avgRating && (
            <div className="absolute top-3 left-3 bg-black/70 rounded-lg px-2 py-1">
              <div className="flex items-center gap-1 text-white text-xs">
                <FaStar className="text-yellow-400" />
                <span className="font-medium">
                  {mentor.avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardBody className="p-4 space-y-3">
          <div className="space-y-2">
            <Link to={`/profileDispaly/${mentor._id}`}>
              <h3 className="text-lg font-bold hover:text-primary transition-colors line-clamp-1">
                {mentor.userId?.name}
              </h3>
            </Link>
            <p className="text-sm text-default-600 font-medium">
              {mentor.specialization}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-default-500">
            <FaClock className="text-primary" />
            <span>{mentor.timePeriod || "5"} session</span>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-default-700">Top Skills</p>
            <div className="flex flex-wrap gap-1">
              {mentor.skills?.slice(0, 3).map((skill) => (
                <Chip
                  key={skill._id}
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="text-xs"
                >
                  {skill.name}
                </Chip>
              ))}
              {mentor.skills?.length > 3 && (
                <Chip size="sm" variant="flat" className="text-xs">
                  +{mentor.skills.length - 3}
                </Chip>
              )}
            </div>
          </div>
        </CardBody>
        <CardFooter className="p-4 pt-0">
          <Button
            color="primary"
            className="w-full font-medium"
            onPress={() => !buttonConfig.disabled && setSelectedMentor(mentor)}
            isDisabled={buttonConfig.disabled}
            size="md"
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
      <Card
        key={user._id}
        className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <CardHeader className="p-0 relative overflow-hidden">
          <img
            src={user.profilePic || "/api/placeholder/400/400"}
            alt={user.name}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </CardHeader>
        <CardBody className="p-4 space-y-3">
          <div className="space-y-2">
            <Link to={`/profileDispaly/${user._id}`}>
              <h3 className="text-lg font-bold hover:text-primary transition-colors line-clamp-1">
                {user.name}
              </h3>
            </Link>
            <p className="text-sm text-default-600 font-medium">
              {user.jobTitle || "Community Member"}
            </p>
          </div>
          {user.location && (
            <div className="flex items-center gap-2 text-xs text-default-500">
              <FaMapMarkerAlt className="text-primary" />
              <span>{user.location}</span>
            </div>
          )}
        </CardBody>
        <CardFooter className="p-4 pt-0">
          <Button
            color="primary"
            variant={buttonConfig.disabled ? "flat" : "solid"}
            className="w-full font-medium"
            onPress={() => !buttonConfig.disabled && setSelectedUser(user)}
            isDisabled={buttonConfig.disabled}
            size="md"
          >
            {buttonConfig.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderGroupCard = (group) => {
    const buttonConfig = getGroupButtonConfig(group);
    const memberCounts = getMemberCounts(group);
    const progressPercentage =
      (memberCounts.current / memberCounts.total) * 100;

    return (
      <Card
        key={group._id}
        className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <CardBody className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold line-clamp-2 flex-1">
                {group.name}
              </h3>
              <Chip color="primary" variant="solid" size="sm" className="ml-2">
                ₹{group.price}
              </Chip>
            </div>
            <p className="text-sm text-default-600 line-clamp-2">{group.bio}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-default-700">
                Group Progress
              </span>
              <span className="text-xs font-medium text-primary">
                {memberCounts.current}/{memberCounts.total} members
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-default-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-default-500">
                <span>{memberCounts.remaining} spots left</span>
                <span>{progressPercentage.toFixed(0)}% full</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-default-500">
              <FaClock className="text-primary" />
              <span>
                Starts:{" "}
                {group.startDate
                  ? new Date(group.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "TBD"}
              </span>
            </div>
          </div>
        </CardBody>
        <CardFooter className="p-5 pt-0">
          <Button
            color="primary"
            variant={buttonConfig.disabled ? "flat" : "solid"}
            className="w-full font-medium"
            onPress={() => !buttonConfig.disabled && setSelectedGroup(group)}
            isDisabled={buttonConfig.disabled}
            size="md"
          >
            {buttonConfig.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderFilterSection = () => (
    <div
      className={`transition-all duration-300 ${
        showFilters
          ? "max-h-96 opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeTab === "mentors" && (
            <>
              <Select
                label="Category"
                placeholder="All Categories"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                size="sm"
                variant="bordered"
              >
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Skill"
                placeholder="All Skills"
                value={selectedSkill}
                onChange={(e) => {
                  setSelectedSkill(e.target.value);
                  setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                size="sm"
                variant="bordered"
              >
                {skills.map((skill) => (
                  <SelectItem key={skill._id} value={skill._id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Sort By"
                placeholder="Name"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                size="sm"
                variant="bordered"
              >
                <SelectItem key="name" value="name">
                  Name
                </SelectItem>
                <SelectItem key="rating" value="rating">
                  Rating
                </SelectItem>
                <SelectItem key="price" value="price">
                  Price
                </SelectItem>
                <SelectItem key="feedbackCount" value="feedbackCount">
                  Reviews
                </SelectItem>
              </Select>
              <Select
                label="Order"
                placeholder="Ascending"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                size="sm"
                variant="bordered"
              >
                <SelectItem key="asc" value="asc">
                  Low to High
                </SelectItem>
                <SelectItem key="desc" value="desc">
                  High to Low
                </SelectItem>
              </Select>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    const currentData =
      activeTab === "mentors"
        ? mentors
        : activeTab === "users"
        ? users
        : groups;
    const renderCard =
      activeTab === "mentors"
        ? renderMentorCard
        : activeTab === "users"
        ? renderUserCard
        : renderGroupCard;

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" color="primary" />
        </div>
      );
    }

    if (currentData.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-default-700 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-default-500">
            Try adjusting your search or filters
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentData.map(renderCard)}
      </div>
    );
  };

  const getTabIcon = (tabKey: string) => {
    switch (tabKey) {
      case "mentors":
        return <FaUserTie className="text-lg" />;
      case "users":
        return <FaUserTie className="text-lg" />;
      case "groups":
        return <FaUsers className="text-lg" />;
      default:
        return <FaUserTie className="text-lg" />;
    }
  };

  const getCurrentTotal = () => {
    switch (activeTab) {
      case "mentors":
        return mentorPagination.totalItems > 5
          ? `5+`
          : mentorPagination.totalItems;
      case "users":
        return userPagination.totalItems > 5 ? `5+` : userPagination.totalItems;
      case "groups":
        return groupPagination.totalItems > 5
          ? `5+ `
          : groupPagination.totalItems;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <RequestStatusHandler currentUser={currentUser} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Explore & Connect
          </h1>
          <p className="text-lg text-default-600 max-w-2xl mx-auto">
            Discover amazing mentors, connect with like-minded professionals,
            and join thriving communities
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === "mentors") {
                    setMentorPagination((prev) => ({
                      ...prev,
                      currentPage: 1,
                    }));
                  } else if (activeTab === "users") {
                    setUserPagination((prev) => ({ ...prev, currentPage: 1 }));
                  } else {
                    setGroupPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }
                }}
                size="lg"
                variant="bordered"
                startContent={<FaSearch className="text-default-400" />}
                classNames={{
                  input: "text-base",
                  inputWrapper: "shadow-sm hover:shadow-md transition-shadow",
                }}
              />
            </div>
            {activeTab === "mentors" && (
              <Button
                color="primary"
                variant={showFilters ? "solid" : "bordered"}
                onPress={() => setShowFilters(!showFilters)}
                startContent={<FaFilter />}
                size="lg"
              >
                Filters
              </Button>
            )}
          </div>
          {renderFilterSection()}
        </div>

        {/* Tabs Section */}
        <div className="mb-6">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleSelectionChange}
            aria-label="Explore sections"
            color="primary"
            variant="underlined"
            size="lg"
            classNames={{
              base: "w-full",
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary",
            }}
          >
            <Tab
              key="mentors"
              title={
                <div className="flex items-center gap-3">
                  {getTabIcon("mentors")}
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Mentors</span>
                    <span className="text-xs text-default-400">
                      {mentorPagination.totalItems > 5
                        ? "5+ available"
                        : `${mentorPagination.totalItems} available`}
                    </span>
                  </div>
                </div>
              }
            />
            <Tab
              key="users"
              title={
                <div className="flex items-center gap-3">
                  {getTabIcon("users")}
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Users</span>
                    <span className="text-xs text-default-400">
                      {userPagination.totalItems > 5
                        ? "5+ members"
                        : `${userPagination.totalItems} members`}
                    </span>
                  </div>
                </div>
              }
            />
            <Tab
              key="groups"
              title={
                <div className="flex items-center gap-3">
                  {getTabIcon("groups")}
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Groups</span>
                    <span className="text-xs text-default-400">
                      {groupPagination.totalItems > 5
                        ? "5+ communities"
                        : `${groupPagination.totalItems} communities`}
                    </span>
                  </div>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-default-600">
            <span className="font-medium">
              {getCurrentTotal()} {activeTab} found
            </span>
            {searchQuery && <span>• Searching for "{searchQuery}"</span>}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">{renderContent()}</div>

        {/* Pagination */}
        <div className="flex justify-center">
          <Pagination
            total={
              activeTab === "mentors"
                ? mentorPagination.totalPages
                : activeTab === "users"
                ? userPagination.totalPages
                : groupPagination.totalPages
            }
            page={
              activeTab === "mentors"
                ? mentorPagination.currentPage
                : activeTab === "users"
                ? userPagination.currentPage
                : groupPagination.currentPage
            }
            onChange={(page) => {
              if (activeTab === "mentors") {
                setMentorPagination((prev) => ({ ...prev, currentPage: page }));
              } else if (activeTab === "users") {
                setUserPagination((prev) => ({ ...prev, currentPage: page }));
              } else {
                setGroupPagination((prev) => ({ ...prev, currentPage: page }));
              }
            }}
            showControls
            color="primary"
            size="lg"
          />
        </div>

        {/* Mentor Booking Modal */}
        <Modal
          isOpen={!!selectedMentor}
          onClose={() => {
            setSelectedMentor(null);
            setSelectedSlot("");
            setLockedSlots([]);
          }}
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            backdrop:
              "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 pb-2">
                  <h2 className="text-xl font-bold">Book Mentorship Session</h2>
                  <p className="text-sm text-default-500">
                    Select your preferred time slot
                  </p>
                </ModalHeader>
                <ModalBody className="py-4">
                  {selectedMentor && (
                    <div className="space-y-6">
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={
                              selectedMentor.userId?.profilePic ||
                              "/api/placeholder/400/400"
                            }
                            size="lg"
                            alt={selectedMentor.userId?.name}
                            className="ring-2 ring-primary/20"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">
                              {selectedMentor.userId?.name}
                            </h3>
                            <p className="text-default-600 text-sm">
                              {selectedMentor.specialization}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-sm">
                                <span className="font-medium text-primary">
                                  ₹{selectedMentor.price}
                                </span>
                                <span className="text-default-500">
                                  / session
                                </span>
                              </div>
                              {selectedMentor.avgRating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <FaStar className="text-yellow-400 text-xs" />
                                  <span className="font-medium">
                                    {selectedMentor.avgRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                      <Divider />
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <FaClock className="text-primary" />
                          Available Time Slots
                        </h4>
                        <RadioGroup
                          value={selectedSlot}
                          onValueChange={setSelectedSlot}
                        >
                          <div className="grid gap-3">
                            {selectedMentor.availableSlots?.flatMap(
                              (slot, dayIndex) =>
                                slot.timeSlots.map((timeSlot, slotIndex) => {
                                  const isLocked = isSlotLocked(
                                    slot.day,
                                    timeSlot
                                  );
                                  const slotValue = `${slot.day} - ${timeSlot}`;
                                  // Use a more specific key combining day and time
                                  const uniqueKey = `${slot.day}-${timeSlot}-${dayIndex}-${slotIndex}`;
                                  return (
                                    <Card
                                      key={uniqueKey}
                                      className={`p-4 cursor-pointer transition-all duration-200 ${
                                        isLocked
                                          ? "bg-default-100 cursor-not-allowed opacity-60"
                                          : selectedSlot === slotValue
                                          ? "bg-primary/10 border-primary border-2"
                                          : "hover:bg-default-50 border-2 border-transparent"
                                      }`}
                                      isPressable={!isLocked}
                                      onPress={() =>
                                        !isLocked && setSelectedSlot(slotValue)
                                      }
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="radio"
                                            name="slot"
                                            value={slotValue}
                                            checked={selectedSlot === slotValue}
                                            onChange={() => {}}
                                            disabled={isLocked}
                                            className="h-4 w-4 text-primary focus:ring-primary"
                                          />
                                          <div>
                                            <p
                                              className={`font-medium ${
                                                isLocked
                                                  ? "text-default-400"
                                                  : "text-default-800"
                                              }`}
                                            >
                                              {slot.day}
                                            </p>
                                            <p
                                              className={`text-sm ${
                                                isLocked
                                                  ? "text-default-400"
                                                  : "text-default-600"
                                              }`}
                                            >
                                              {timeSlot}
                                            </p>
                                          </div>
                                        </div>
                                        {isLocked && (
                                          <Chip
                                            color="danger"
                                            size="sm"
                                            variant="flat"
                                          >
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
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleRequestMentor}
                    isDisabled={!selectedSlot}
                    className="font-medium"
                  >
                    Book Session
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* User Connection Modal */}
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          size="lg"
          classNames={{
            backdrop:
              "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 pb-2">
                  <h2 className="text-xl font-bold">Send Connection Request</h2>
                  <p className="text-sm text-default-500">
                    Connect and grow your professional network
                  </p>
                </ModalHeader>
                <ModalBody className="py-4">
                  {selectedUser && (
                    <Card className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={
                            selectedUser.profilePic ||
                            "/api/placeholder/400/400"
                          }
                          size="lg"
                          alt={selectedUser.name}
                          className="ring-2 ring-primary/20"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">
                            {selectedUser.name}
                          </h3>
                          <p className="text-default-600 text-sm">
                            {selectedUser.jobTitle || "Community Member"}
                          </p>
                          {selectedUser.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-default-500">
                              <FaMapMarkerAlt />
                              <span>{selectedUser.location}</span>
                            </div>
                          )}
                        </div>
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
                    onPress={handleRequestUser}
                    className="font-medium"
                  >
                    Send Request
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Group Join Modal */}
        <Modal
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          size="lg"
          classNames={{
            backdrop:
              "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 pb-2">
                  <h2 className="text-xl font-bold">Join Group</h2>
                  <p className="text-sm text-default-500">
                    Connect with like-minded professionals
                  </p>
                </ModalHeader>
                <ModalBody className="py-4">
                  {selectedGroup && (
                    <Card className="p-4 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold mb-2">
                          {selectedGroup.name}
                        </h3>
                        <p className="text-default-600 text-sm leading-relaxed">
                          {selectedGroup.bio}
                        </p>
                      </div>
                      <Divider />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <p className="text-2xl font-bold text-primary">
                            ₹{selectedGroup.price}
                          </p>
                          <p className="text-xs text-default-600">Group Fee</p>
                        </div>
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <p className="text-2xl font-bold text-success">
                            {(() => {
                              const memberCounts =
                                getMemberCounts(selectedGroup);
                              return memberCounts.remaining;
                            })()}
                          </p>
                          <p className="text-xs text-default-600">Spots Left</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const memberCounts = getMemberCounts(selectedGroup);
                          const progressPercentage =
                            (memberCounts.current / memberCounts.total) * 100;
                          return (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  Group Capacity
                                </span>
                                <span className="text-primary font-bold">
                                  {memberCounts.current}/{memberCounts.total}
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
                          {selectedGroup.startDate
                            ? new Date(
                                selectedGroup.startDate
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
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
                    onPress={handleRequestGroup}
                    className="font-medium"
                  >
                    Request to Join
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default ExploreMentors;
