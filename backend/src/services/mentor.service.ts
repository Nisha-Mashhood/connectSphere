import * as MentorRepository from "../repositories/mentor.repositry.js";
import { sendEmail } from "../utils/email.utils.js";
import { IMentor } from "../models/mentor.model.js";


// Function to submit a mentor request (for admin review)
export const submitMentorRequest = async (mentorData: {
  userId: string;
  skills: string[];
  specialization: string;
  bio:string,
  price:number,
  availableSlots: string[];
  timePeriod:number,
  certifications: string[];
}) => {
  try {
    // Save mentor data (pending admin approval)
    const newMentor = await MentorRepository.saveMentorRequest(mentorData);
    return newMentor; 
  } catch (error:any) {
    throw new Error("Error saving mentor request: " + error.message);
  }
};

// Get all mentor requests
export const getAllMentorRequests = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = "",
  sort: string = "desc"
) => {
  try {
    return await MentorRepository.getAllMentorRequests(page, limit, search, status, sort);
  } catch (error: any) {
    throw new Error("Error fetching mentor requests: " + error.message);
  }
};

//Get All Mentors
export const getAllMentors = async() =>{
  try {
    return await MentorRepository.getAllMentors();
  } catch (error:any) {
    throw new Error("Error fetching mentors: " + error.message);
  }
}

//get Mentor Details using mentorId
export const getMentorBymentorId = async(mentorId: string) =>{
  try {
    const mentor = await MentorRepository.getMentorDetails(mentorId);
    return mentor;
  } catch (error:any) {
    throw new Error("Error fetching mentor details: " + error.message);
  }
}
// Approve a mentor request
export const approveMentorRequest = async (id: string) => {
  try {
    await MentorRepository.approveMentorRequest(id);

    // Fetch mentor data to send email
    const mentor = await MentorRepository.getMentorById(id);

    if (!mentor) {
      throw new Error("Mentor not found.");
    }

    if (typeof mentor.userId === "string") {
      throw new Error("User details are not populated.");
    }

    if (mentor) {
      const userEmail = mentor.userId.email;
      const userName = mentor.userId.name;
      await sendEmail(
        userEmail,
        "Mentor Request Approved",
        `Hello ${userName},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\n Admin \n ConnectSphere`
      );
    }
  } catch (error: any) {
    throw new Error("Error approving mentor request: " + error.message);
  }
};

// Reject a mentor request
export const rejectMentorRequest = async (id: string, reason: string) => {
  try {
    await MentorRepository.rejectMentorRequest(id);

    // Fetch mentor data to send email
    const mentor = await MentorRepository.getMentorById(id);

    if (!mentor) {
      throw new Error("Mentor not found.");
    }
    if (typeof mentor.userId === "string") {
      throw new Error("User details are not populated.");
    }  
     if (mentor) {
      const userEmail = mentor.userId.email;
      const userName = mentor.userId.name;
      await sendEmail(
        userEmail,
        "Mentor Request Rejected",
        `Hello ${userName},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin \n ConnectSphere`
      );
     }
  } catch (error: any) {
    throw new Error("Error rejecting mentor request: " + error.message);
  }
};


// Cancel mentorship
export const cancelMentorship = async (id: string) => {
  try {
    // Update mentor status to "Cancelled"
    await MentorRepository.cancelMentorship(id);

    // Fetch mentor data to send email
    const mentor = await MentorRepository.getMentorById(id);

    if (!mentor) {
      throw new Error("Mentor not found.");
    }

    if (typeof mentor.userId === "string") {
      throw new Error("User details are not populated.");
    }

    if (mentor) {
      const userEmail = mentor.userId.email;
      const userName = mentor.userId.name;
      await sendEmail(
        userEmail,
        "Mentorship Cancelled",
        `Hello ${userName},\n\nWe regret to inform you that your mentorship has been cancelled by the admin. If you have any questions, please contact support.\n\nBest regards,\nAdmin \nConnectSphere`
      );
    }
  } catch (error: any) {
    throw new Error("Error cancelling mentorship: " + error.message);
  }
};


// Get mentor details by userId
export const getMentorByUserId = async (userId: string) => {
  try {
    return await MentorRepository.getMentorByUserId(userId);
  } catch (error: any) {
    throw new Error("Error fetching mentor details: " + error.message);
  }
};

// Update mentor details by mentorId
export const updateMentorById = async (mentorId: string, updateData: Partial<IMentor>) => {
  try {
    const mentor = await MentorRepository.getMentorById(mentorId);

    if (!mentor) {
      throw new Error("Mentor not found.");
    }
    const MentorData = await MentorRepository.updateMentorById(mentorId, updateData);
    return MentorData
  } catch (error: any) {
    throw new Error("Error updating mentor details: " + error.message);
  }
};

