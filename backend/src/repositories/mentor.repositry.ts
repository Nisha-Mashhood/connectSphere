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
