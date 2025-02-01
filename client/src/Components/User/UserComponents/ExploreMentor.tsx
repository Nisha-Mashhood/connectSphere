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
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { SendRequsetToMentor } from "../../../Service/collaboration.Service";
import toast from "react-hot-toast";
import { FaSearch, FaUserFriends, FaUsers, FaUserTie } from "react-icons/fa";

const ExploreMentors = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mentorDetails } = useSelector((state: RootState) => state.profile);
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

        // Filter out the current user from the users list
        const filteredUsers =
          userData?.filter((user) => user._id !== currentUser._id) || [];

        // Filter out the current mentor from the mentors list (if the user is a mentor)
        const filteredMentors = mentorDetails?._id
          ? mentorsData?.filter((mentor) => mentor._id !== mentorDetails._id)
          : mentorsData || [];

        // Filter out groups where the current user is the admin
        const filteredGroups =
        groupData?.data?.filter((group) => group.adminId !== currentUser._id) ||
        [];

          console.log(currentUser._id);
        console.log("filteredMentors", filteredMentors);
        console.log("filteredGroups:", filteredGroups);
        console.log("filteredUsers:", filteredUsers);

        setMentors(filteredMentors || []);
        setCategories(categoriesData || []);
        setSkills(skillsData.skills || []);
        setGroups(filteredGroups || []);
        setUsers(filteredUsers?.filter((user) => user.role === "user") || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
    };

    try {
      await SendRequsetToMentor(requestData);
      toast.success("Request sent successfully!");
      setSelectedMentor(null);
    } catch (error) {
      console.error("Error booking mentor:", error);
      toast.error("Failed to send the request. Please try again.");
    }
  };

  //ToDo user-user connection
  const handleRequestUser = async () => {
    try {
      console.log(`Sending request to user ${selectedUser._id}`);
      setSelectedUser(null);
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
      console.log(response);
      setSelectedGroup(null);
    } catch (error) {
      console.error("Error requesting group:", error);
    }
  };

  const handleSelectionChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMentors.map((mentor) => (
                  <Card
                    key={mentor._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="p-0">
                      <img
                        src={
                          mentor.userId?.profilePic ||
                          "/api/placeholder/400/400"
                        }
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
                        onPress={() => setSelectedMentor(mentor)}
                      >
                        Book Session
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </Tab>

          <Tab
            key="users"
            title={
              <div className="flex items-center gap-2">
                <FaUserFriends />
                <span>Users</span>
              </div>
            }
          >
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                  <Card
                    key={user._id}
                    className="hover:shadow-lg transition-shadow"
                  >
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
                      <p className="text-gray-600">
                        {user.jobTitle || "Community Member"}
                      </p>
                    </CardBody>
                    <CardFooter>
                      <Button
                        color="primary"
                        className="w-full"
                        onPress={() => setSelectedUser(user)}
                      >
                        Connect
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
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
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGroups.map((group) => (
                  <Card
                    key={group._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardBody className="space-y-4">
                      <h3 className="text-xl font-semibold">{group.name}</h3>
                      <p className="text-gray-600">{group.bio}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Price: ₹{group.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          Members: {group.currentMembers}/{group.maxMembers}
                        </p>
                      </div>
                    </CardBody>
                    <CardFooter>
                      <Button
                        color="primary"
                        className="w-full"
                        onPress={() => setSelectedGroup(group)}
                      >
                        Join Group
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Mentor Modal */}
      <Modal
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
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
                        {selectedMentor.availableSlots.map(
                          (slot: any, dayIndex: number) =>
                            slot.timeSlots.map(
                              (timeSlot: string, slotIndex: number) => (
                                <label
                                  key={`${dayIndex}-${slotIndex}`}
                                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
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
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="flex-1 text-gray-800">
                                    {slot.day} - {timeSlot}
                                  </span>
                                </label>
                              )
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
                    <p className="text-sm text-gray-600">
                      Members: {selectedGroup.currentMembers}/
                      {selectedGroup.maxMembers}
                    </p>
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
