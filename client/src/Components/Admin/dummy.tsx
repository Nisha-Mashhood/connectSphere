// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Avatar,
//   Button,
//   Divider,
//   Chip,
//   Tooltip,
//   Image,
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Input,
//   Textarea,
//   useDisclosure,
//   Select,
//   SelectItem,
//   Tabs,
//   Tab,
//   RadioGroup,
//   Radio,
//   Checkbox,
// } from "@nextui-org/react";
// import {
//   FaCalendarAlt,
//   FaUsers,
//   FaEnvelope,
//   FaPhone,
//   FaBriefcase,
//   FaInfoCircle,
//   FaBirthdayCake,
//   FaPencilAlt,
//   FaPlus,
//   FaCamera,
//   FaUserFriends,
//   FaUserCog,
//   FaUserGraduate,
//   FaLayerGroup,
//   FaRegCalendarAlt,
//   FaTimes,
//   FaRegClock,
// } from "react-icons/fa";
// import RequestsSection from "./RequestSection";
// import GroupRequests from "./GroupRequests";
// import ActiveCollaborations from "./ActiveCollaborations";
// import GroupCollaborations from "./GroupCollaborations";
// import { RootState } from "../../../../redux/store";
// import TaskManagement from "../../TaskManagement/TaskManagemnt";
// import {
//   updateContactInfo,
//   updateUserImages,
//   updateUserProfessionalInfo,
// } from "../../../../Service/User.Service";
// import toast from "react-hot-toast";
// import {
//   checkMentorProfile,
//   updateMentorProfile,
// } from "../../../../Service/Mentor.Service";
// import { updateMentorInfo } from "../../../../redux/Slice/profileSlice";
// import { updateUserProfile } from "../../../../redux/Slice/userSlice";
// import { checkProfile } from "../../../../Service/Auth.service";
// import UserConnections from "./UserConnections";

// const Profile = () => {
//   const { currentUser } = useSelector((state: RootState) => state.user);
//   const { mentorDetails } = useSelector((state: RootState) => state.profile);
//   const [selectedDay, setSelectedDay] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [availabilityMode, setAvailabilityMode] = useState<string>("recurring");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // States for edit modals
//   const {
//     isOpen: isProfessionalModalOpen,
//     onOpen: onProfessionalModalOpen,
//     onClose: onProfessionalModalClose,
//   } = useDisclosure();

//   const {
//     isOpen: isContactModalOpen,
//     onOpen: onContactModalOpen,
//     onClose: onContactModalClose,
//   } = useDisclosure();

//   const {
//     isOpen: isMentorModalOpen,
//     onOpen: onMentorModalOpen,
//     onClose: onMentorModalClose,
//   } = useDisclosure();

//   // Form states
//   const [professionalInfo, setProfessionalInfo] = useState({
//     industry: currentUser.industry || "",
//     reasonForJoining: currentUser.reasonForJoining || "",
//   });

//   const [contactInfo, setContactInfo] = useState({
//     email: currentUser.email || "",
//     phone: currentUser.phone || "",
//     dateOfBirth: currentUser.dateOfBirth || "",
//   });

//   const [mentorshipInfo, setMentorshipInfo] = useState({
//     bio: mentorDetails?.bio || "",
//     availableSlots: mentorDetails?.availableSlots || [],
//     exceptionalDates: mentorDetails?.exceptionalDates || [],
//   });

//   // Handle form submissions
//   const handleProfessionalSubmit = async () => {
//     try {
//       const { user } = await updateUserProfessionalInfo(currentUser._id, {
//         industry: professionalInfo.industry,
//         reasonForJoining: professionalInfo.reasonForJoining,
//         jobTitle: currentUser.jobTitle,
//       });

//       onProfessionalModalClose();
//       if (user) {
//         // Dispatch action to update Redux state
//         dispatch(updateUserProfile(user));
//         toast.success("Profile Updated Successfully");
//       }
//     } catch (error) {
//       console.error("Error updating professional info:", error);
//       toast.error(error);
//     }
//   };

//   const handleContactSubmit = async () => {
//     try {
//       const { user } = await updateContactInfo(currentUser._id, {
//         email: contactInfo.email,
//         phone: contactInfo.phone,
//         dateOfBirth: contactInfo.dateOfBirth,
//       });
//       onContactModalClose();
//       if (user) {
//         // Dispatch action to update Redux state
//         dispatch(updateUserProfile(user));
//         toast.success("Profile Updated Successfully");
//       }
//     } catch (error) {
//       console.error("Error updating contact info:", error);
//       toast.error(error);
//     }
//   };

//   // Update mentor submission handler
//   const handleMentorshipSubmit = async () => {
//     try {
//       const { MentorData } = await updateMentorProfile(
//         mentorDetails._id,
//         mentorshipInfo
//       );
//       onMentorModalClose();
//       if (MentorData) {
//         // Update Redux state with the returned data
//         dispatch(updateMentorInfo(MentorData));
//         toast.success("Profile Updated Successfully");
//       }
//     } catch (error) {
//       console.error("Error updating mentor info:", error);
//       toast.error(error);
//     }
//   };

//   const handleUserProfileClick = (Id) => {
//     navigate(`/profileDispaly/${Id}`);
//   };

//   // Image uploads
//   const handleImageUpload = async (
//     file: File,
//     type: "profilePic" | "coverPic"
//   ) => {
//     try {
//       const formData = new FormData();
//       formData.append(type, file);

//       const { user } = await updateUserImages(currentUser._id, formData);
//       if (user) {
//         // Dispatch action to update Redux state
//         dispatch(updateUserProfile(user));
//         toast.success("Profile Updated Successfully");
//       }
//     } catch (error) {
//       console.error(`Error updating ${type}:`, error);
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const DAYS_OF_WEEK = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];
//   // States for specific date slots
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedSpecificTime, setSelectedSpecificTime] = useState([]);
//   const [selectedDateStatus, setSelectedDateStatus] = useState("available"); // "available" or "unavailable"

//   // TIME_SLOTS array remains the same
//   const TIME_SLOTS = [
//     "09:00 AM - 10:00 AM",
//     "10:00 AM - 11:00 AM",
//     "11:00 AM - 12:00 PM",
//     "02:00 PM - 03:00 PM",
//     "03:00 PM - 04:00 PM",
//     "04:00 PM - 05:00 PM",
//   ];

//   // Get the next 30 days for specific date selection
//   const getNextThirtyDays = () => {
//     const dates = [];
//     const today = new Date();
    
//     for (let i = 0; i < 30; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       dates.push({
//         value: date.toISOString().split('T')[0],
//         label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
//       });
//     }
    
//     return dates;
//   };

//   // Handle adding recurring slots
//   const handleAddRecurringSlot = () => {
//     if (!selectedDay || !selectedTime) {
//       toast.error("Please select both day and time");
//       return;
//     }

//     setMentorshipInfo((prev) => {
//       const existingDaySlot = prev.availableSlots.find(
//         (slot) => slot.day === selectedDay
//       );

//       if (existingDaySlot) {
//         if (existingDaySlot.timeSlots.includes(selectedTime)) {
//           toast.error("This time slot already exists for the selected day");
//           return prev;
//         }

//         return {
//           ...prev,
//           availableSlots: prev.availableSlots.map((slot) =>
//             slot.day === selectedDay
//               ? { ...slot, timeSlots: [...slot.timeSlots, selectedTime].sort() }
//               : slot
//           ),
//         };
//       }

//       return {
//         ...prev,
//         availableSlots: [
//           ...prev.availableSlots,
//           { day: selectedDay, timeSlots: [selectedTime] },
//         ].sort(
//           (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
//         ),
//       };
//     });

//     setSelectedTime("");
//   };

//   // Handle adding specific date exceptions
//   const handleAddSpecificDate = () => {
//     if (!selectedDate) {
//       toast.error("Please select a date");
//       return;
//     }
    
//     // For unavailable dates, we don't need time slots
//     if (selectedDateStatus === "unavailable") {
//       setMentorshipInfo((prev) => {
//         // Check if date already exists
//         const dateExists = prev.exceptionalDates.some(
//           (date) => date.date === selectedDate && date.status === "unavailable"
//         );
        
//         if (dateExists) {
//           toast.error("This date exception already exists");
//           return prev;
//         }
        
//         return {
//           ...prev,
//           exceptionalDates: [
//             ...prev.exceptionalDates,
//             { 
//               date: selectedDate, 
//               status: "unavailable",
//               timeSlots: [] 
//             }
//           ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
//         };
//       });
//     } 
//     // For available specific dates, we need time slots
//     else {
//       if (!selectedSpecificTime || selectedSpecificTime.length === 0) {
//         toast.error("Please select at least one time slot");
//         return;
//       }
      
//       setMentorshipInfo((prev) => {
//         // Check if date already exists
//         const existingDateIndex = prev.exceptionalDates.findIndex(
//           (date) => date.date === selectedDate && date.status === "available"
//         );
        
//         if (existingDateIndex >= 0) {
//           // Update existing date
//           const updatedExceptions = [...prev.exceptionalDates];
//           updatedExceptions[existingDateIndex] = {
//             ...updatedExceptions[existingDateIndex],
//             timeSlots: [...new Set([...updatedExceptions[existingDateIndex].timeSlots, ...selectedSpecificTime])]
//           };
          
//           return {
//             ...prev,
//             exceptionalDates: updatedExceptions
//           };
//         }
        
//         // Add new date
//         return {
//           ...prev,
//           exceptionalDates: [
//             ...prev.exceptionalDates,
//             { 
//               date: selectedDate, 
//               status: "available",
//               timeSlots: selectedSpecificTime 
//             }
//           ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
//         };
//       });
//     }
    
//     // Reset selection
//     setSelectedSpecificTime([]);
//     setSelectedDate("");
//   };

//   // Handle removing a recurring slot
//   const handleRemoveSlot = (day, time) => {
//     setMentorshipInfo((prev) => ({
//       ...prev,
//       availableSlots: prev.availableSlots
//         .map((slot) => {
//           if (slot.day === day) {
//             const newTimeSlots = slot.timeSlots.filter((t) => t !== time);
//             return newTimeSlots.length
//               ? { ...slot, timeSlots: newTimeSlots }
//               : null;
//           }
//           return slot;
//         })
//         .filter((slot) => slot !== null),
//     }));
//   };
  
//   // Handle removing an exception date
//   const handleRemoveException = (date) => {
//     setMentorshipInfo((prev) => ({
//       ...prev,
//       exceptionalDates: prev.exceptionalDates.filter((d) => d.date !== date.date)
//     }));
//   };
  
//   // Handle removing a specific time slot from an available exception date
//   const handleRemoveExceptionTimeSlot = (date, timeSlot) => {
//     setMentorshipInfo((prev) => ({
//       ...prev,
//       exceptionalDates: prev.exceptionalDates.map((d) => {
//         if (d.date === date.date) {
//           return {
//             ...d,
//             timeSlots: d.timeSlots.filter((t) => t !== timeSlot)
//           };
//         }
//         return d;
//       }).filter((d) => d.status === "unavailable" || d.timeSlots.length > 0)
//     }));
//   };

//   // Updated mentor submission handler including exception dates
//   // const handleMentorshipSubmit = async () => {
//   //   try {
//   //     // Ensure there are no empty time slots in available exceptions
//   //     const validExceptionalDates = mentorshipInfo.exceptionalDates.filter(
//   //       (date) => date.status === "unavailable" || date.timeSlots.length > 0
//   //     );
      
//   //     const updatedMentorshipInfo = {
//   //       ...mentorshipInfo,
//   //       exceptionalDates: validExceptionalDates
//   //     };
      
//   //     const { MentorData } = await updateMentorProfile(
//   //       mentorDetails._id,
//   //       updatedMentorshipInfo
//   //     );
      
//   //     onMentorModalClose();
//   //     if (MentorData) {
//   //       dispatch(updateMentorInfo(MentorData));
//   //       toast.success("Profile Updated Successfully");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error updating mentor info:", error);
//   //     toast.error(error.message || "Error updating profile");
//   //   }
//   // };

//   // // Format date for display
//   // const formatDate = (dateString) => {
//   //   if (!dateString) return "Not specified";
//   //   const date = new Date(dateString);
//   //   return date.toLocaleDateString("en-US", {
//   //     year: "numeric",
//   //     month: "long",
//   //     day: "numeric",
//   //   });
//   // };
  
//   // Format exception date for display
//   const formatExceptionDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: 'long',
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };
  
//   // Function to handle multiple time slot selection
//   const handleMultipleTimeSelection = (timeSlot) => {
//     setSelectedSpecificTime((prev) => {
//       if (prev.includes(timeSlot)) {
//         return prev.filter(t => t !== timeSlot);
//       } else {
//         return [...prev, timeSlot];
//       }
//     });
//   };

//   //Handle Become Mentor
//   const handleBecomeMentor = async () => {
//     if (!currentUser) {
//       toast.error("Please log in to apply as a mentor.");
//       navigate("/login");
//       return;
//     }
//     try {
//       // Step 1: Check if the profile is complete
//       const profileResponse = await checkProfile(currentUser._id);
//       const isProfileComplete = profileResponse.isProfileComplete;

//       if (!isProfileComplete) {
//         toast.error(
//           "For becoming a mentor, you should complete your profile first."
//         );
//         navigate("/complete-profile", { replace: true });
//         return;
//       }

//       // Step 2: Check if the user is already a mentor and the approval status
//       const mentorResponse = await checkMentorProfile(currentUser._id);
//       const mentor = mentorResponse.mentor;

//       if (!mentor) {
//         // If there's no mentor record, show the mentor profile form
//         navigate("/mentorProfile");
//       } else {
//         switch (mentor.isApproved) {
//           case "Processing":
//             toast.success("Your mentor request is still under review.");
//             break;
//           case "Completed":
//             toast.success("You are an approved mentor!");
//             navigate("/profile");
//             break;
//           case "Rejected":
//             toast.error("Your mentor application has been rejected.");
//             break;
//           default:
//             toast.error("Unknown status. Please contact support.");
//         }
//       }
//     } catch (error) {
//       toast.error("An error occurred while checking your mentor status.");
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-4 space-y-6">
//       {/* Profile Header */}
//       <Card className="w-full overflow-hidden shadow-lg">
//         <div className="relative">
//           {/* Cover Photo */}
//           <div className="relative h-64 w-full">
//             <Image
//               src={currentUser.coverPic || "/default-cover.jpg"}
//               alt="Cover photo"
//               className="w-full h-full object-cover"
//               removeWrapper
//             />
//             <Tooltip content="Change Cover Photo">
//               <Button
//                 isIconOnly
//                 color="primary"
//                 variant="flat"
//                 className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm shadow-md z-10 hover:bg-white transition-all"
//               >
//                 <label className="cursor-pointer">
//                   <input
//                     type="file"
//                     className="hidden"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) handleImageUpload(file, "coverPic");
//                     }}
//                   />
//                   <FaCamera />
//                 </label>
//               </Button>
//             </Tooltip>
//           </div>

//           {/* Profile Photo */}
//           <div className="absolute left-6 top-40 z-10">
//             <div className="relative">
//               <Avatar
//                 src={currentUser.profilePic}
//                 className="w-32 h-32 border-4 border-white shadow-lg"
//                 fallback={<FaUsers className="w-16 h-16 text-default-500" />}
//               />
//               <Tooltip content="Change Profile Photo">
//                 <Button
//                   isIconOnly
//                   color="primary"
//                   size="sm"
//                   variant="flat"
//                   className="absolute bottom-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all"
//                 >
//                   <label className="cursor-pointer">
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) handleImageUpload(file, "profilePic");
//                       }}
//                     />
//                     <FaCamera size={14} />
//                   </label>
//                 </Button>
//               </Tooltip>
//             </div>
//           </div>
//         </div>

//         <CardBody className="p-6 pt-20 md:pt-6 md:pl-44">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//             <div className="flex-1 space-y-2 mt-10 md:mt-0">
//               <div className="flex items-center gap-2">
//                 <h1 className="text-2xl font-bold">{currentUser.name}</h1>
//                 {currentUser.role === 'mentor' ? (
//                   <Chip color="success" variant="flat">
//                     Mentor
//                   </Chip>
//                 ) : (
//                   <Chip color="primary" variant="flat">
//                     User
//                   </Chip>
//                 )}
//               </div>
//               <p className="text-lg text-default-600">{currentUser.jobTitle}</p>
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 color="primary"
//                 onPress={() => navigate("/create-group")}
//                 startContent={<FaPlus />}
//               >
//                 Create Group
//               </Button>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       {/* Profile Info and Tasks Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Profile Details */}
//         <div className="space-y-6">
//           {/* Professional Info - With Edit Button */}
//           <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="flex justify-between items-center bg-primary-50">
//               <div className="flex items-center gap-2">
//                 <FaBriefcase className="text-xl text-primary" />
//                 <p className="text-lg font-semibold">Professional Info</p>
//               </div>
//               <Tooltip content="Edit Professional Info">
//                 <Button
//                   isIconOnly
//                   variant="light"
//                   size="sm"
//                   onPress={onProfessionalModalOpen}
//                 >
//                   <FaPencilAlt size={14} />
//                 </Button>
//               </Tooltip>
//             </CardHeader>
//             <Divider />
//             <CardBody className="py-4">
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm text-default-500 font-medium">Industry</p>
//                   <p className="font-medium">
//                     {currentUser.industry || "Not specified"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-default-500 font-medium">
//                     Reason for Joining
//                   </p>
//                   <p className="font-medium">
//                     {currentUser.reasonForJoining || "Not specified"}
//                   </p>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>

//           {/* Contact Info - With Edit Button */}
//           <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="flex justify-between items-center bg-primary-50">
//               <div className="flex items-center gap-2">
//                 <FaInfoCircle className="text-xl text-primary" />
//                 <p className="text-lg font-semibold">Contact Information</p>
//               </div>
//               <Tooltip content="Edit Contact Info">
//                 <Button
//                   isIconOnly
//                   variant="light"
//                   size="sm"
//                   onPress={onContactModalOpen}
//                 >
//                   <FaPencilAlt size={14} />
//                 </Button>
//               </Tooltip>
//             </CardHeader>
//             <Divider />
//             <CardBody className="py-4">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2">
//                   <FaEnvelope className="text-primary" />
//                   <p>{currentUser.email || "No email provided"}</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <FaPhone className="text-primary" />
//                   <p>{currentUser.phone || "No phone provided"}</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <FaBirthdayCake className="text-primary" />
//                   <p>{formatDate(currentUser.dateOfBirth)}</p>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>

//           {/* Mentor Details or Become Mentor */}
//           {currentUser.role === "mentor" && mentorDetails ? (
//             <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
//               <CardHeader className="flex justify-between items-center bg-primary-50">
//                 <div className="flex items-center gap-2">
//                   <FaUserGraduate className="text-xl text-primary" />
//                   <p className="text-lg font-semibold">Mentorship Details</p>
//                 </div>
//                 <Tooltip content="Edit Mentorship Details">
//                   <Button
//                     isIconOnly
//                     variant="light"
//                     size="sm"
//                     onPress={onMentorModalOpen}
//                   >
//                     <FaPencilAlt size={14} />
//                   </Button>
//                 </Tooltip>
//               </CardHeader>
//               <Divider />
//               <CardBody className="py-4">
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm text-default-500 font-medium">Bio</p>
//                     <p className="font-medium">
//                       {mentorDetails.bio || "No bio available"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-default-500 font-medium">
//                       Available Slots
//                     </p>
//                     {mentorDetails.availableSlots &&
//                     mentorDetails.availableSlots.length > 0 ? (
//                       <div className="grid grid-cols-1 gap-2">
//                         {mentorDetails.availableSlots.map((slot, index) => (
//                           <Chip
//                             key={index}
//                             variant="flat"
//                             className="w-full"
//                             color="primary"
//                           >
//                             {slot.day}: {slot.timeSlots.join(", ")}
//                           </Chip>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm">No available slots set</p>
//                     )}
//                   </div>
//                 </div>
//               </CardBody>
//             </Card>
//           ) : (
//             currentUser.role !== "mentor" && (
//               <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
//                 <CardHeader className="flex gap-3 bg-primary-50">
//                   <FaUserGraduate className="text-xl text-primary" />
//                   <div className="flex flex-col">
//                     <p className="text-lg font-semibold">Become a Mentor</p>
//                   </div>
//                 </CardHeader>
//                 <Divider />
//                 <CardBody className="py-4 flex flex-col items-center justify-center">
//                   <p className="text-center mb-4">
//                     Share your expertise and help others grow!
//                   </p>
//                   <Button color="success" onPress={() => handleBecomeMentor()}>
//                     Apply to be a Mentor
//                   </Button>
//                 </CardBody>
//               </Card>
//             )
//           )}
//         </div>

//         {/* Middle and Right Columns - Task Management and Activity Sections */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Task Management Section */}
//           <Card className="shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="flex gap-3 justify-between bg-primary-50">
//               <div className="flex items-center gap-2">
//                 <FaCalendarAlt className="text-xl text-primary" />
//                 <p className="text-lg font-semibold">My Tasks</p>
//               </div>
//             </CardHeader>
//             <Divider />
//             <CardBody>
//               <TaskManagement
//                 context="profile"
//                 currentUser={currentUser}
//                 contextData={currentUser}
//               />
//             </CardBody>
//           </Card>

//           {/* Activity Sections - Tabbed Interface */}
//           <Card className="shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="bg-primary-50">
//               <h2 className="text-xl font-bold">Activity & Connections</h2>
//             </CardHeader>
//             <Divider />
//             <CardBody>
//               <Tabs 
//                 aria-label="Profile Activity Sections" 
//                 color="primary" 
//                 variant="underlined"
//                 classNames={{
//                   tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
//                   cursor: "w-full bg-primary",
//                   tab: "max-w-fit px-0 h-12",
//                   tabContent: "group-data-[selected=true]:text-primary"
//                 }}
//               >
//                 {/* User Connections Tab */}
//                 <Tab
//                   key="connections"
//                   title={
//                     <div className="flex items-center gap-2">
//                       <FaUserFriends className="text-lg" />
//                       <span>Connections</span>
//                     </div>
//                   }
//                 >
//                   <div className="mt-4 space-y-4">
//                     <Card shadow="sm">
//                       <CardHeader className="bg-blue-50">
//                         <h3 className="text-md font-semibold">Pending Requests</h3>
//                       </CardHeader>
//                       <CardBody>
//                         <RequestsSection handleProfileClick={handleUserProfileClick} />
//                       </CardBody>
//                     </Card>
                    
//                     <Card shadow="sm">
//                       <CardHeader className="bg-blue-50">
//                         <h3 className="text-md font-semibold">Active Collaborations</h3>
//                       </CardHeader>
//                       <CardBody>
//                         <ActiveCollaborations handleProfileClick={handleUserProfileClick} />
//                       </CardBody>
//                     </Card>
                    
//                     <Card shadow="sm">
//                       <CardHeader className="bg-blue-50">
//                         <h3 className="text-md font-semibold">My Network</h3>
//                       </CardHeader>
//                       <CardBody>
//                         <UserConnections
//                           currentUser={currentUser}
//                           handleProfileClick={handleUserProfileClick}
//                         />
//                       </CardBody>
//                     </Card>
//                   </div>
//                 </Tab>
                
//                 {/* Groups Tab */}
//                 <Tab
//                   key="groups"
//                   title={
//                     <div className="flex items-center gap-2">
//                       <FaLayerGroup className="text-lg" />
//                       <span>Groups</span>
//                     </div>
//                   }
//                 >
//                   <div className="mt-4 space-y-4">
//                     <Card shadow="sm">
//                       <CardHeader className="bg-green-50">
//                         <h3 className="text-md font-semibold">Group Invitations</h3>
//                       </CardHeader>
//                       <CardBody>
//                         <GroupRequests />
//                       </CardBody>
//                     </Card>
                    
//                     <Card shadow="sm">
//                       <CardHeader className="bg-green-50">
//                         <h3 className="text-md font-semibold">My Groups</h3>
//                       </CardHeader>
//                       <CardBody>
//                         <GroupCollaborations handleProfileClick={handleUserProfileClick} />
//                       </CardBody>
//                     </Card>
//                   </div>
//                 </Tab>
                
//                 {/* Mentor Section Tab - Only if the user is a mentor */}
//                 {mentorDetails && (
//                   <Tab
//                     key="mentoring"
//                     title={
//                       <div className="flex items-center gap-2">
//                         <FaUserCog className="text-lg" />
//                         <span>Mentoring</span>
//                       </div>
//                     }
//                   >
//                     <div className="mt-4">
//                       <p className="text-center text-default-500 mb-4">
//                         View and manage your mentoring activities here.
//                       </p>
//                       {/* Add mentoring-specific components here when needed */}
//                     </div>
//                   </Tab>
//                 )}
//               </Tabs>
//             </CardBody>
//           </Card>
//         </div>
//       </div>

//       {/* Modals */}
//       {/* Modal for editing Professional Info */}
//       <Modal
//         isOpen={isProfessionalModalOpen}
//         onClose={onProfessionalModalClose}
//         placement="center"
//       >
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader className="flex flex-col gap-1">
//                 Edit Professional Information
//               </ModalHeader>
//               <ModalBody>
//                 <Input
//                   label="Industry"
//                   placeholder="Your industry"
//                   value={professionalInfo.industry}
//                   onChange={(e) =>
//                     setProfessionalInfo({
//                       ...professionalInfo,
//                       industry: e.target.value,
//                     })
//                   }
//                 />
//                 <Textarea
//                   label="Reason for Joining"
//                   placeholder="Why did you join our platform?"
//                   value={professionalInfo.reasonForJoining}
//                   onChange={(e) =>
//                     setProfessionalInfo({
//                       ...professionalInfo,
//                       reasonForJoining: e.target.value,
//                     })
//                   }
//                 />
//               </ModalBody>
//               <ModalFooter>
//                 <Button variant="light" onPress={onClose}>
//                   Cancel
//                 </Button>
//                 <Button color="primary" onPress={handleProfessionalSubmit}>
//                   Save Changes
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>

//       {/* Modal for editing Contact Info */}
//       <Modal
//         isOpen={isContactModalOpen}
//         onClose={onContactModalClose}
//         placement="center"
//       >
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader className="flex flex-col gap-1">
//                 Edit Contact Information
//               </ModalHeader>
//               <ModalBody>
//                 <Input
//                   label="Email"
//                   placeholder="Your email address"
//                   value={contactInfo.email}
//                   onChange={(e) =>
//                     setContactInfo({ ...contactInfo, email: e.target.value })
//                   }
//                 />
//                 <Input
//                   label="Phone"
//                   placeholder="Your phone number"
//                   value={contactInfo.phone}
//                   onChange={(e) =>
//                     setContactInfo({ ...contactInfo, phone: e.target.value })
//                   }
//                 />
//                 <Input
//                   type="date"
//                   label="Date of Birth"
//                   placeholder="MM/DD/YYYY"
//                   value={
//                     contactInfo.dateOfBirth
//                       ? new Date(contactInfo.dateOfBirth)
//                           .toISOString()
//                           .split("T")[0]
//                       : ""
//                   }
//                   onChange={(e) =>
//                     setContactInfo({
//                       ...contactInfo,
//                       dateOfBirth: e.target.value,
//                     })
//                   }
//                 />
//               </ModalBody>
//               <ModalFooter>
//                 <Button variant="light" onPress={onClose}>
//                   Cancel
//                 </Button>
//                 <Button color="primary" onPress={handleContactSubmit}>
//                   Save Changes
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>

//       {/* Modal for editing Mentorship Info */}
//       <Modal
//       isOpen={isMentorModalOpen}
//       onClose={onMentorModalClose}
//       placement="center"
//       size="3xl"
//       scrollBehavior="inside"
//     >
//       <ModalContent>
//         {(onClose) => (
//           <>
//             <ModalHeader className="flex flex-col gap-1">
//               Edit Mentorship Information
//             </ModalHeader>
//             <ModalBody className="max-h-[70vh] overflow-y-auto">
//               <div className="space-y-6">
//                 {/* Bio Section */}
//                 <div>
//                   <Textarea
//                     label="Bio"
//                     placeholder="Share your experience and expertise"
//                     value={mentorshipInfo.bio}
//                     onChange={(e) =>
//                       setMentorshipInfo({
//                         ...mentorshipInfo,
//                         bio: e.target.value,
//                       })
//                     }
//                     className="mb-4"
//                   />
//                 </div>

//                 {/* Availability Section with Tabs */}
//                 <Card>
//                   <CardHeader className="bg-primary-50">
//                     <h3 className="text-md font-semibold">Availability Settings</h3>
//                   </CardHeader>
//                   <CardBody>
//                     <Tabs 
//                       aria-label="Availability Options" 
//                       color="primary"
//                       selectedKey={availabilityMode}
//                       onSelectionChange={(key) => setAvailabilityMode(String(key))}
//                     >
//                       {/* Recurring Weekly Schedule Tab */}
//                       <Tab
//                         key="recurring"
//                         title={
//                           <div className="flex items-center gap-2">
//                             <FaCalendarAlt />
//                             <span>Weekly Schedule</span>
//                           </div>
//                         }
//                       >
//                         <div className="pt-4 space-y-4">
//                           <p className="text-sm text-default-600">
//                             Set your regular weekly availability pattern
//                           </p>
                          
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                             <Select
//                               label="Select Day"
//                               placeholder="Choose a day"
//                               value={selectedDay}
//                               onChange={(e) => setSelectedDay(e.target.value)}
//                             >
//                               {DAYS_OF_WEEK.map((day) => (
//                                 <SelectItem key={day} value={day}>
//                                   {day}
//                                 </SelectItem>
//                               ))}
//                             </Select>

//                             <Select
//                               label="Select Time"
//                               placeholder="Choose a time"
//                               value={selectedTime}
//                               onChange={(e) => setSelectedTime(e.target.value)}
//                             >
//                               {TIME_SLOTS.map((time) => (
//                                 <SelectItem key={time} value={time}>
//                                   {time}
//                                 </SelectItem>
//                               ))}
//                             </Select>
//                           </div>

//                           <Button
//                             color="primary"
//                             className="w-full mb-4"
//                             onPress={handleAddRecurringSlot}
//                             startContent={<FaPlus />}
//                           >
//                             Add Weekly Time Slot
//                           </Button>

//                           {/* Display weekly slots */}
//                           <div className="space-y-3">
//                             <p className="text-sm font-medium text-default-700">
//                               Your Weekly Schedule:
//                             </p>
//                             {mentorshipInfo.availableSlots && mentorshipInfo.availableSlots.length > 0 ? (
//                               <div className="divide-y">
//                                 {mentorshipInfo.availableSlots.map((slot, dayIndex) => (
//                                   <div key={dayIndex} className="py-3">
//                                     <div className="flex items-center">
//                                       <FaRegCalendarAlt className="mr-2 text-primary" />
//                                       <p className="font-medium text-primary">{slot.day}</p>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
//                                       {slot.timeSlots.map((time, timeIndex) => (
//                                         <Chip
//                                           key={`${dayIndex}-${timeIndex}`}
//                                           onClose={() => handleRemoveSlot(slot.day, time)}
//                                           variant="flat"
//                                           color="primary"
//                                           className="max-w-full"
//                                           startContent={<FaRegClock size={14} />}
//                                         >
//                                           {time}
//                                         </Chip>
//                                       ))}
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <p className="text-sm text-default-500 p-3 bg-gray-50 rounded-md">
//                                 No weekly slots added yet. Please add your regular weekly availability.
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </Tab>
                      
//                       {/* Specific Dates Tab */}
//                       <Tab
//                         key="specific"
//                         title={
//                           <div className="flex items-center gap-2">
//                             <FaRegCalendarAlt />
//                             <span>Date Exceptions</span>
//                           </div>
//                         }
//                       >
//                         <div className="pt-4 space-y-4">
//                           <p className="text-sm text-default-600">
//                             Set exceptions for specific dates (e.g., unavailable days or special availability)
//                           </p>
                          
//                           <div className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                               <Select
//                                 label="Select Date"
//                                 placeholder="Choose a specific date"
//                                 value={selectedDate}
//                                 onChange={(e) => setSelectedDate(e.target.value)}
//                               >
//                                 {getNextThirtyDays().map((date) => (
//                                   <SelectItem key={date.value} value={date.value}>
//                                     {date.label}
//                                   </SelectItem>
//                                 ))}
//                               </Select>
                              
//                               <RadioGroup
//                                 label="Date Status"
//                                 value={selectedDateStatus}
//                                 onChange={(e) => {
//                                   setSelectedDateStatus(e.target.value);
//                                   if (e.target.value === "unavailable") {
//                                     setSelectedSpecificTime([]);
//                                   }
//                                 }}
//                               >
//                                 <Radio value="available">Available (Custom Hours)</Radio>
//                                 <Radio value="unavailable">Unavailable</Radio>
//                               </RadioGroup>
//                             </div>
                            
//                             {selectedDateStatus === "available" && (
//                               <div className="space-y-2">
//                                 <p className="text-sm font-medium">Select Available Time Slots:</p>
//                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                                   {TIME_SLOTS.map((time) => (
//                                     <Checkbox
//                                       key={time}
//                                       isSelected={selectedSpecificTime.includes(time)}
//                                       onChange={() => handleMultipleTimeSelection(time)}
//                                     >
//                                       {time}
//                                     </Checkbox>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
                            
//                             <Button
//                               color={selectedDateStatus === "unavailable" ? "danger" : "success"}
//                               className="w-full"
//                               onPress={handleAddSpecificDate}
//                               startContent={<FaPlus />}
//                             >
//                               {selectedDateStatus === "unavailable" 
//                                 ? "Mark Date as Unavailable" 
//                                 : "Add Special Availability"}
//                             </Button>
//                           </div>
                          
//                           {/* Display exception dates */}
//                           <div className="space-y-3 mt-6">
//                             <p className="text-sm font-medium text-default-700">
//                               Your Date Exceptions:
//                             </p>
//                             {mentorshipInfo.exceptionalDates && mentorshipInfo.exceptionalDates.length > 0 ? (
//                               <div className="space-y-3">
//                                 {mentorshipInfo.exceptionalDates.map((dateException, index) => (
//                                   <Card key={index} className={dateException.status === "unavailable" ? "border-danger" : "border-success"}>
//                                     <CardHeader className={`flex justify-between items-center ${dateException.status === "unavailable" ? "bg-danger-50" : "bg-success-50"}`}>
//                                       <div className="flex items-center">
//                                         <FaRegCalendarAlt className="mr-2" />
//                                         <p className="font-medium">
//                                           {formatExceptionDate(dateException.date)}
//                                         </p>
//                                       </div>
//                                       <div className="flex items-center gap-2">
//                                         <Chip 
//                                           color={dateException.status === "unavailable" ? "danger" : "success"}
//                                           variant="flat"
//                                         >
//                                           {dateException.status === "unavailable" ? "Unavailable" : "Special Hours"}
//                                         </Chip>
//                                         <Button
//                                           isIconOnly
//                                           size="sm"
//                                           variant="light"
//                                           onPress={() => handleRemoveException(dateException)}
//                                         >
//                                           <FaTimes />
//                                         </Button>
//                                       </div>
//                                     </CardHeader>
                                    
//                                     {dateException.status === "available" && (
//                                       <CardBody className="py-2">
//                                         <div className="grid grid-cols-2 gap-2">
//                                           {dateException.timeSlots.map((time, timeIndex) => (
//                                             <Chip
//                                               key={timeIndex}
//                                               onClose={() => handleRemoveExceptionTimeSlot(dateException, time)}
//                                               variant="flat"
//                                               color="success"
//                                               className="max-w-full"
//                                               startContent={<FaRegClock size={14} />}
//                                             >
//                                               {time}
//                                             </Chip>
//                                           ))}
//                                         </div>
//                                       </CardBody>
//                                     )}
//                                   </Card>
//                                 ))}
//                               </div>
//                             ) : (
//                               <p className="text-sm text-default-500 p-3 bg-gray-50 rounded-md">
//                                 No date exceptions set. Add dates where your availability differs from your weekly schedule.
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </Tab>
//                     </Tabs>
//                   </CardBody>
//                 </Card>
//               </div>
//             </ModalBody>
//             <ModalFooter>
//               <Button variant="light" onPress={onClose}>
//                 Cancel
//               </Button>
//               <Button color="primary" onPress={handleMentorshipSubmit}>
//                 Save Changes
//               </Button>
//             </ModalFooter>
//           </>
//         )}
//       </ModalContent>
//     </Modal>
//     </div>
//   );
// };

// export default Profile;



