import { Request, Response } from "express";
import * as MentorService from "../services/mentor.service.js";
import { uploadMedia } from "../utils/cloudinary.utils.js";
import * as UserService from '../services/user.service.js';

export const checkMentorStatus = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const mentor = await MentorService.getMentorByUserId(userId);
    if (!mentor) {
      res.status(200).json({ mentor: null });
      return 
    }
    res.status(200).json({ mentor });
    return 
  } catch (error:any) {
    res.status(400).json({ message: "Error fetching mentor status", error: error.message });
    return 
  }
};

//Get mentor details using mentorId
export const getMentorDetails = async (req: Request, res: Response) =>{
  const { mentorId } = req.params;
  try {
    const mentor = await MentorService.getMentorBymentorId(mentorId);
    res.status(200).json({ mentor})
    return;
  } catch (error:any) {
    res.status(400).json({ message: "Error fetching mentor Details", error: error.message });
    return 
  }
}

//create mentor record
export const createMentor = async (req: Request, res: Response) => {
  const { userId, specialization, bio, price, skills, availableSlots, timePeriod } = req.body;

  try {

    const user = await UserService.getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Change the user's role to "mentor" if it's not already set to "mentor"
    if (user.role !== "mentor") {
      await UserService.changeRole(userId, "mentor"); 
    }

    // Check if mentor already exists
    const existingMentor = await MentorService.getMentorByUserId(userId);
    if (existingMentor) {
      res.status(400).json({ message: "Mentor profile already exists." });
      return 
    }

    // Check if certificates are provided and upload them to Cloudinary
    let uploadedCertificates: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map((file) =>
        uploadMedia(file.path, "mentor_certificates", file.size).then(result => result.url) // Extract url
      );
      uploadedCertificates = await Promise.all(uploadPromises); // Get URLs of uploaded certificates
    } else {
      res.status(400).json({ message: "Certificates are required for mentor registration." });
      return;
    }

    // Create mentor record (submit for admin review)
    const newMentor = await MentorService.submitMentorRequest({
      userId,
      skills:JSON.parse(skills),
      specialization,
      bio,
      price,
      availableSlots: JSON.parse(availableSlots),
      timePeriod,
      certifications: uploadedCertificates,
    });

    res.status(201).json({
      message: "Mentor registration submitted successfully for admin review.",
      data: newMentor,
    });
    return 
  } catch (error: any) {
    console.error("Error registering mentor:", error);
   res.status(500).json({ message: "Server error. Please try again later." });
   return 
  }
}

export const getAllMentorRequests = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "", status = "", sort = "desc" } = req.query;
    const mentorRequests = await MentorService.getAllMentorRequests(
      parseInt(page as string),
      parseInt(limit as string),
      search as string,
      status as string,
      sort as string
    );
    res.json({
      mentors: mentorRequests.mentors,
      total: mentorRequests.total,
      currentPage: parseInt(page as string),
      totalPages: Math.ceil(mentorRequests.total / parseInt(limit as string)),
    });
  } catch (error: any) {
    console.error("Error fetching mentor requests:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAllMentors = async (_req:Request, res:Response) =>{
  try {
    const mentors = await MentorService.getAllMentors()
    res.json(mentors)
  } catch (error) {
    console.log("Error in fetching Mentors",error);
    res.status(500).json({message: "Server error. Please Try again later. "})
  }
}


// Get mentor by userId
export const getMentorByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const mentor = await MentorService.getMentorByUserId(userId);
    if (!mentor) {
      res.status(404).json({ message: "Mentor not found" });
      return 
    }
    res.json(mentor);
  } catch (error: any) {
    console.error("Error fetching mentor:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


export const approveMentorRequest = async (req: Request, res: Response) => {
  try {
    await MentorService.approveMentorRequest(req.params.id);
    res.json({ message: "Mentor request approved successfully. \n Mail has been send to the user" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectMentorRequest = async (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) {
    res.status(400).json({ message: "Rejection reason is required. \n Mail has been send to the user" });
    return;
  }

  try {
    await MentorService.rejectMentorRequest(req.params.id, reason);
    res.json({ message: "Mentor request rejected successfully." });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel mentorship
export const cancelMentorship = async (req:Request, res:Response) => {
  try {
    const { mentorId } = req.params;
    await MentorService.cancelMentorship(mentorId);
    res.status(200).json({ message: 'Mentorship canceled successfully.' });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

//update mentor Profile
export const updateMentorProfile = async(req:Request, res:Response) =>{
  try {
    const { mentorId } = req.params;
    const updateData = req.body;
    const MentorData = await MentorService.updateMentorById(mentorId, updateData);
    res.status(200).json({ message: 'Mentor Profile Updated successfully.', MentorData });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}