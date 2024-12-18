import Mentor, { IMentor } from "../models/mentor.model.js";

// Submit mentor request
export const submitMentorRequest = async (data: Partial<IMentor>): Promise<IMentor> => {
  return await Mentor.create(data);
};

// Get all mentor requests
export const getAllMentorRequests = async (): Promise<IMentor[]> => {
  return await Mentor.find().populate("userId", "fullName email");
};

// Approve mentor request
export const approveMentorRequest = async (id: string): Promise<void> => {
  await Mentor.findByIdAndUpdate(id, { isApproved: true });
};

// Reject mentor request
export const rejectMentorRequest = async (id: string): Promise<void> => {
  await Mentor.findByIdAndDelete(id);
};

// Get mentor by userId
export const getMentorByUserId = async (userId: string): Promise<IMentor | null> => {
  return await Mentor.findOne({ userId });
};

// Update  for mentor with mentorId
export const updateMentorById = async (
  mentorId: string,
  updateData: Partial<IMentor>
): Promise<IMentor | null> => {
  return await Mentor.findByIdAndUpdate(mentorId, updateData, { new: true });
};