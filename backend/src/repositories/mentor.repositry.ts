import Mentor, { IMentor } from "../models/mentor.model.js";

// Submit mentor request
export const submitMentorRequest = async (data: Partial<IMentor>): Promise<IMentor> => {
  return await Mentor.create(data);
};

//get all mentor request
export const getAllMentorRequests = async (): Promise<IMentor[]> => {
  return await Mentor.find()
    .populate("userId") // Populate user details
    .populate("skills", "name"); // Populate skills with only the 'name' field
};

//get All Mentors
export const getAllMentors = async (): Promise<IMentor[]> => { 
  const mentor = await Mentor.find({ isApproved: "Completed" })
  .populate("userId")
  .populate("skills");
  return mentor
}

//Get mentor Details
export const getMentorDetails = async(id : string): Promise<IMentor | null> => {
  const mentor =  await Mentor.findById(id)
    .populate("userId") 
    .populate("skills"); 
    return mentor;
 }

// Approve mentor request
export const approveMentorRequest = async (id: string): Promise<void> => {
  await Mentor.findByIdAndUpdate(
    id,
    { isApproved: "Completed" },
    { new: true }
  );
  return 
};

// Reject mentor request
export const rejectMentorRequest = async (id: string): Promise<void> => {
  await Mentor.findByIdAndUpdate(
    id,
    { isApproved: "Rejected" },
    { new: true }
  );
  return 
};

// Cancel mentorship
export const cancelMentorship = async (id: string) => {
  return await Mentor.findByIdAndUpdate(
    id,
    { isApproved: "Processing" },
    { new: true }  
  );
};

// Get mentor by userId
export const getMentorById = async (id: string): Promise<IMentor | null> => {
  const mentor =  await Mentor.findById(id)
    .populate("userId", "name email") 
    .populate("skills", "name"); 
    return mentor;
};

export const getMentorByUserId = async(id: string) :Promise<IMentor | null> => {
  const mentor = await Mentor.findOne({ userId: id })
  .populate("userId")
  .populate("skills");
  return mentor
}

// Update  for mentor with mentorId
export const updateMentorById = async (
  mentorId: string,
  updateData: Partial<IMentor>
): Promise<IMentor | null> => {
  return await Mentor.findByIdAndUpdate(mentorId, updateData, { new: true });
};



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