import { Skill } from "../models/skills.model.js";
import Mentor, { IMentor } from "../models/mentor.model.js";

// Submit mentor request
export const submitMentorRequest = async (data: Partial<IMentor>): Promise<IMentor> => {
  return await Mentor.create(data);
};

//get all mentor request
export const getAllMentorRequests = async (): Promise<IMentor[]> => {
  return await Mentor.find()
    .populate("userId", "name email") // Populate user details
    .populate("skills", "name"); // Populate skills with only the 'name' field
};

// Approve mentor request
export const approveMentorRequest = async (id: string): Promise<void> => {
  await Mentor.findByIdAndUpdate(
    id,
    { isApproved: "completed" },
    { new: true }
  );
  return 
};

// Reject mentor request
export const rejectMentorRequest = async (id: string): Promise<void> => {
  await Mentor.findByIdAndUpdate(
    id,
    { isApproved: "rejected" },
    { new: true }
  );
  return 
};

// Get mentor by userId
export const getMentorByUserId = async (userId: string): Promise<IMentor | null> => {
  return await Mentor.findOne({ userId })
    .populate("userId", "name email") 
    .populate("skills", "name"); 
};

// Update  for mentor with mentorId
export const updateMentorById = async (
  mentorId: string,
  updateData: Partial<IMentor>
): Promise<IMentor | null> => {
  return await Mentor.findByIdAndUpdate(mentorId, updateData, { new: true });
};

export const getSkills = async() =>{
  return await Skill.find({}, { name: 1, _id: 1 });
}


// Function to save a new mentor request (pending admin review)
export const saveMentorRequest = async (mentorData: any) => {
  try {
    const mentor = new Mentor(mentorData); 
    await mentor.save(); 
    return mentor; 
  } catch (error:any) {
    throw new Error("Error saving mentor request: " + error.message);
  }
}