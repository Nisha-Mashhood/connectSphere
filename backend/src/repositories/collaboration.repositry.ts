import MentorRequest from "../models/mentorRequset.js";
import Collaboration, { ICollaboration } from "../models/collaboration.js";

//create a temporary requset document
export const createTemporaryRequest = async (data: any) => {
    try {
      const request = new MentorRequest(data);
      return await request.save();
    } catch (error:any) {
      throw new Error(`Error saving temporary request: ${error.message}`);
    }
  };

  // Get mentor requests from the database
export const getMentorRequestsByMentorId = async (mentorId: string) => {
  try {
    return await MentorRequest.find({ mentorId })
      .populate("userId", "name profilePic") 
  } catch (error: any) {
    throw new Error(`Error fetching mentor requests: ${error.message}`);
  }
};

// Find mentor request by ID
export const findMentorRequestById = async (id: string) => {
  try {
    return await MentorRequest.findById(id);
  } catch (error: any) {
    throw new Error(`Error fetching mentor request by ID: ${error.message}`);
  }
};

// Update mentor request acceptance status
export const updateMentorRequestStatus = async (id: string, status: string) => {
  try {
    const request = await MentorRequest.findById(id);
    if (request) {
      request.isAccepted = status;
      await request.save();
      return request;
    }
    throw new Error("Request not found");
  } catch (error: any) {
    throw new Error(`Error updating mentor request status: ${error.message}`);
  }
};

export const getRequestByUserId = async (userId: string) => {
  return await MentorRequest.find({ userId })
    .populate({
      path: 'mentorId',  
      populate: {
        path: 'userId',
        select: 'name email profilePic'
      }
    })
};

export const createCollaboration = async (collaborationData: Partial<ICollaboration>): Promise<ICollaboration> => {
  const collaborationResult = new Collaboration(collaborationData);
  return await collaborationResult.save();
};


export const deleteMentorRequest = async (requestId: string): Promise<void> => {
  await MentorRequest.findByIdAndDelete(requestId);
};

export const findCollabById = async(collabId:string): Promise<ICollaboration | null> =>{
  try {
  return await Collaboration.findById(collabId)
  .populate({
    path: "mentorId",
    populate: {
      path: "userId", 
      model: "User",
    },
  })
  .populate("userId")as ICollaboration | null;; 
  } catch (error:any) {
    throw new Error("Error fetching group requests: " + error.message);
  }
}

export const deleteCollabById = async(collabId:string) =>{
  try {
    return await Collaboration.findByIdAndDelete(collabId)
  } catch (error:any) {
    throw new Error("Error fetching group requests: " + error.message);
  }
}

//mark collaboration as cancelled
export const markCollabAsCancelled = async (collabId: string) => {
  try {
    return await Collaboration.findByIdAndUpdate(
      collabId,
      { isCancelled: true },
      { new: true } 
    );
  } catch (error: any) {
    throw new Error("Error updating collaboration: " + error.message);
  }
};

//update feedback given filed of the collaboartion
export const updateCollabFeedback = async (collabId: string) => {
  try {
    return await Collaboration.findByIdAndUpdate(
      collabId,
      { feedbackGiven: true }, 
      { new: true }
    );
  } catch (error: any) {
    throw new Error(`Error updating collaboration feedback status: ${error.message}`);
  }
};

//Get collab data For user
export const getCollabDataForUser = async (userId: string) => {
  try {
    const collabData = await Collaboration.find({ userId, isCancelled:false })
    .populate({
      path: 'mentorId',  
      populate: {
        path: 'userId',
        select: 'name email profilePic'
      }
    })
    .populate('userId');
    return collabData;
  } catch (error:any) {
    throw new Error(`Error getting collaboration data for user: ${error.message}`);
  }
};

//get collab data for mentor
export const getCollabDataForMentor = async (mentorId: string) => {
  try {
    const collabData = await Collaboration.find({ mentorId, isCancelled:false })
    .populate('mentorId')
    .populate("userId", "name email profilePic") 
    return collabData;
  } catch (error:any) {
    throw new Error(`Error getting collaboration data for mentor: ${error.message}`);
  }
};

//FOR ADMIN

//Get All Requsets
export const findMentorRequest = async () => {
  try {
    return await MentorRequest.find()
    .populate({
      path: "mentorId",
      model: "Mentor",
      populate: {
        path: "userId",
        model: "User",
      },
    })
    .populate({
      path: "userId",
      model: "User",
    }) ;
  } catch (error: any) {
    throw new Error(`Error fetching mentor request : ${error.message}`);
  }
};

//Get All Collab
export const findCollab = async (): Promise<ICollaboration[] | null> => {
  try {
    return await Collaboration.find()
      .populate({
        path: "mentorId",
        model: "Mentor",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .populate({
        path: "userId",
        model: "User",
      }) as ICollaboration[] | null;
  } catch (error: any) {
    throw new Error("Error fetching collaborations: " + error.message);
  }
};

//get requset details
export const fetchMentorRequsetDetails = async(requsetId: string) =>{
    try {
      return await MentorRequest.findById(requsetId)
      .populate({
        path: "mentorId",
        model: "Mentor",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .populate({
        path: "userId",
        model: "User",
      }) ;
  } catch (error:any) {
    throw new Error(`Error fetching mentor request : ${error.message}`);
  }
}

//get collab details
export const findCollabDetails = async (collabId: string): Promise<ICollaboration[] | null> => {
  try {
    return await Collaboration.findById(collabId)
      .populate({
        path: "mentorId",
        model: "Mentor",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .populate({
        path: "userId",
        model: "User",
      }) as ICollaboration[] | null;
  } catch (error: any) {
    throw new Error("Error fetching collaboration Details: " + error.message);
  }
};