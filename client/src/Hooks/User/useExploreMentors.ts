import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchAllMentors } from "../../Service/Mentor.Service";
import { getAllSkills, getCategoriesService } from "../../Service/Category.Service";
import { groupDetails, sendRequsettoGroup } from "../../Service/Group.Service";
import { fetchAllUsers } from "../../Service/User.Service";
import { getLockedMentorSlot, SendRequsetToMentor } from "../../Service/collaboration.Service";
import {
  fetchCollabDetails,
  fetchGroupDetailsForMembers,
  fetchGroupRequests,
  fetchRequests,
  fetchUserConnections,
  setGroupRequests,
} from "../../redux/Slice/profileSlice";
import toast from "react-hot-toast";
import {
  CollabDetails,
  CompleteMentorDetails,
  Group,
  GroupMemberships,
  GroupRequest,
  Mentor,
  Request,
  User,
  UserConnection,
  Category,
  Skill,
  LockedSlot,
} from "../../redux/types";
import { sendUser_UserRequset } from "../../Service/User-User.Service";

interface FilterOption {
  key: string;
  value: string;
  label: string;
}

export interface FilterType {
  name: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface UseExploreMentorsReturn {
  currentUser: User;
  mentorDetails: Mentor | null;
  collabDetails: CollabDetails | null;
  req: Request;
  groupRequests: GroupRequest[];
  groupMemberships: GroupMemberships;
  userConnections: { sent: UserConnection[]; received: UserConnection[] };
  mentors: CompleteMentorDetails[];
  categories: Category[];
  skills: Skill[];
  groups: Group[];
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  mentorPagination: PaginationState;
  setMentorPagination: (pagination: PaginationState) => void;
  userPagination: PaginationState;
  setUserPagination: (pagination: PaginationState) => void;
  groupPagination: PaginationState;
  setGroupPagination: (pagination: PaginationState) => void;
  selectedMentor: CompleteMentorDetails | null;
  setSelectedMentor: (mentor: CompleteMentorDetails | null) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;
  lockedSlots: LockedSlot[];
  setLockedSlots: (slots: LockedSlot[]) => void;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filterTypes: FilterType[];
  handleSearchChange: () => void;
  handleSelectionChange: (key: string) => void;
  handleRequestMentor: () => Promise<void>;
  handleRequestUser: () => Promise<void>;
  handleRequestGroup: () => Promise<void>;
  isSlotLocked: (day: string, timeSlot: string) => boolean;
  getCurrentTotal: () => string | number;
}

export const useExploreMentors = (): UseExploreMentorsReturn => {
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
  const [mentors, setMentors] = useState<CompleteMentorDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [sortBy, setSortBy] = useState("feedbackCount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [mentorPagination, setMentorPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [userPagination, setUserPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [groupPagination, setGroupPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedMentor, setSelectedMentor] = useState<CompleteMentorDetails | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [lockedSlots, setLockedSlots] = useState<LockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mentors");
  const limit = 4;

  const filterTypes: FilterType[] = [
    {
      name: "category",
      label: "Category",
      placeholder: "All Categories",
      options: [
        { key: "", value: "", label: "All Categories" },
        ...categories
          .filter((category) => category.id && category.name)
          .map((category) => ({
            key: category.id,
            value: category.id,
            label: category.name,
          })),
      ],
      value: selectedCategory,
      onChange: (value: string) => {
        setSelectedCategory(value);
        setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
      },
    },
    {
      name: "skill",
      label: "Skill",
      placeholder: "All Skills",
      options: [
        { key: "", value: "", label: "All Skills" },
        ...skills
          .filter((skill) => skill._id && skill.name)
          .map((skill) => ({
            key: skill._id,
            value: skill._id,
            label: skill.name,
          })),
      ],
      value: selectedSkill,
      onChange: (value: string) => {
        setSelectedSkill(value);
        setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
      },
    },
    {
      name: "sortBy",
      label: "Sort By",
      placeholder: "Name",
      options: [
        { key: "name", value: "name", label: "Name" },
        { key: "rating", value: "rating", label: "Rating" },
        { key: "price", value: "price", label: "Price" },
        { key: "feedbackCount", value: "feedbackCount", label: "Reviews" },
      ],
      value: sortBy,
      onChange: (value: string) => {
        setSortBy(value);
        setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
      },
    },
    {
      name: "sortOrder",
      label: "Order",
      placeholder: "Ascending",
      options: [
        { key: "asc", value: "asc", label: "Low to High" },
        { key: "desc", value: "desc", label: "High to Low" },
      ],
      value: sortOrder,
      onChange: (value: string) => {
        setSortOrder(value);
        setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
      },
    },
  ];

  // Fetch categories and skills
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, skillsData] = await Promise.all([
          getCategoriesService(),
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
        const [mentorsData, groupData, userData] = await Promise.all([
          fetchAllMentors({
            search: searchQuery,
            page: mentorPagination.currentPage,
            limit,
            skill: activeTab === "mentors" ? selectedSkill : "",
            category: activeTab === "mentors" ? selectedCategory : "",
            sortBy,
            sortOrder,
            excludeMentorId: mentorDetails?.id,
          }),
          groupDetails({
            search: searchQuery,
            page: groupPagination.currentPage,
            limit,
            excludeAdminId: currentUser.id,
          }),
          fetchAllUsers({
            search: searchQuery,
            page: userPagination.currentPage,
            limit,
            excludeId: currentUser.id,
          }),
        ]);

        const filteredMentors =
          mentorDetails?.id && Array.isArray(mentorsData.mentors)
            ? mentorsData.mentors.filter(
                (mentor) => mentor.id !== mentorDetails.id
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
    currentUser.id,
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
                userId: currentUser.id,
                role: currentUser.role,
                mentorId: mentorDetails?.id,
              })
            ),
            dispatch(
              fetchCollabDetails({
                userId: currentUser.id,
                role: currentUser.role,
                mentorId: currentUser.role === "mentor" ? mentorDetails?.id : undefined,
              })
            ),
            dispatch(fetchGroupRequests(currentUser.id)),
            dispatch(fetchGroupDetailsForMembers(currentUser.id)),
            dispatch(fetchUserConnections(currentUser.id)),
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
      if (!selectedMentor?.id) return;
      try {
        const response = await getLockedMentorSlot(selectedMentor.id);
        setLockedSlots(response.lockedSlots || []);
      } catch (error) {
        console.error("Error fetching locked slots:", error);
        toast.error("Failed to load locked slots");
      }
    };
    fetchLockedSlots();
  }, [selectedMentor]);

  const handleSearchChange = useCallback(() => {
    if (activeTab === "mentors") {
      setMentorPagination((prev) => ({ ...prev, currentPage: 1 }));
    } else if (activeTab === "users") {
      setUserPagination((prev) => ({ ...prev, currentPage: 1 }));
    } else {
      setGroupPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [activeTab]);

  const handleSelectionChange = useCallback((key: string) => {
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
  }, []);

  const handleRequestMentor = useCallback(async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    const [day, timeSlot] = selectedSlot.split(" - ");
    const requestData = {
      mentorId: selectedMentor.id,
      userId: currentUser.id,
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
            userId: currentUser.id,
            role: currentUser.role,
            mentorId: selectedMentor?.id || undefined,
          })
        );
        setSelectedMentor(null);
      }
    } catch (error) {
      console.error("Error booking mentor:", error);
      toast.error("Failed to send the request. Please try again.");
    }
  }, [currentUser.id, currentUser.role, selectedMentor, selectedSlot, dispatch]);

  const handleRequestUser = useCallback(async () => {
    try {
      const newConnection = await sendUser_UserRequset(
        currentUser.id,
        selectedUser.id
      );
      if (newConnection) {
        toast.success("Connection Request sent successfully");
        setSelectedUser(null);
        dispatch(fetchUserConnections(currentUser.id));
      }
    } catch (error) {
      console.error("Error sending user request:", error);
    }
  }, [currentUser.id, selectedUser, dispatch]);

  const handleRequestGroup = useCallback(async () => {
    const data = {
      groupId: selectedGroup.id,
      userId: currentUser.id,
    };
    try {
      const response = await sendRequsettoGroup(data);
      if (response) {
        toast.success("Request sent successfully");
        const newRequest = {
          id: response.id,
          groupId: { id: selectedGroup.id },
          userId: { id: currentUser.id },
          status: "Pending" as const,
          paymentStatus: "Pending",
        };
        dispatch(setGroupRequests([...(groupRequests || []), newRequest]));
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error("Error requesting group:", error);
    }
  }, [currentUser.id, selectedGroup, groupRequests, dispatch]);

  const isSlotLocked = useCallback((day: string, timeSlot: string) => {
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
  }, [lockedSlots]);

  const getCurrentTotal = useCallback(() => {
    switch (activeTab) {
      case "mentors":
        return mentorPagination.totalItems > 5
          ? `5+`
          : mentorPagination.totalItems;
      case "users":
        return userPagination.totalItems > 5 ? `5+` : userPagination.totalItems;
      case "groups":
        return groupPagination.totalItems > 5
          ? `5+`
          : groupPagination.totalItems;
      default:
        return 0;
    }
  }, [activeTab, mentorPagination.totalItems, userPagination.totalItems, groupPagination.totalItems]);

  return {
    currentUser,
    mentorDetails,
    collabDetails,
    req,
    groupRequests,
    groupMemberships,
    userConnections,
    mentors,
    categories,
    skills,
    groups,
    users,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSkill,
    setSelectedSkill,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showFilters,
    setShowFilters,
    mentorPagination,
    setMentorPagination,
    userPagination,
    setUserPagination,
    groupPagination,
    setGroupPagination,
    selectedMentor,
    setSelectedMentor,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    selectedSlot,
    setSelectedSlot,
    lockedSlots,
    setLockedSlots,
    isLoading,
    activeTab,
    setActiveTab,
    filterTypes,
    handleSearchChange,
    handleSelectionChange,
    handleRequestMentor,
    handleRequestUser,
    handleRequestGroup,
    isSlotLocked,
    getCurrentTotal,
  };
};