import MentorRequest from "../models/mentorRequset.js";
import Collaboration, { ICollaboration } from "../models/collaboration.js";
import Mentor from "../models/mentor.model.js";

export interface LockedSlot {
  day: string;
  timeSlots: string[];
}

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
    const collaboration = await Collaboration.findById(collabId)
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
      });

    if (!collaboration) {
      throw new Error("Collaboration not found");
    }

    return collaboration;
  } catch (error: any) {
    console.log("Error in repository file:", error);
    throw new Error(`Error fetching collaboration: ${error.message}`);
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
    // Find the mentor document to get their userId
    const mentor = await Mentor.findById(mentorId).select('userId');
    if (!mentor) throw new Error('Mentor not found');

    const userId = mentor.userId;

    // Fetch collaborations where they are the mentor OR the requester
    const collabData = await Collaboration.find({
      $or: [
        { mentorId, isCancelled: false },
        { userId, isCancelled: false },
      ],
    })
      .populate({
      path: 'mentorId',  
      populate: {
        path: 'userId',
      }
    })
      .populate('userId');

    return collabData;
  } catch (error: any) {
    throw new Error(`Error getting collaboration data for mentor: ${error.message}`);
  }
};

//FOR ADMIN
//Find all requset data for ADMIN
export const findMentorRequest = async ({ page, limit, search }: { page: number, limit: number, search: string }) => {
  try {
    const query = search
      ? {
          $or: [
            { "userId.name": { $regex: search, $options: "i" } },
            { "userId.email": { $regex: search, $options: "i" } },
            { "mentorId.userId.name": { $regex: search, $options: "i" } },
            { "mentorId.userId.email": { $regex: search, $options: "i" } },
            { "mentorId.specialization": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await MentorRequest.countDocuments(query);
    const requests = await MentorRequest.find(query)
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
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return { requests, total, page, pages: Math.ceil(total / limit) };
  } catch (error: any) {
    throw new Error(`Error fetching mentor request: ${error.message}`);
  }
};

//Find All collab datas for ADMIN
export const findCollab = async ({ page, limit, search }: { page: number, limit: number, search: string }) => {
  try {
    const query = search
      ? {
          $or: [
            { "userId.name": { $regex: search, $options: "i" } },
            { "userId.email": { $regex: search, $options: "i" } },
            { "mentorId.userId.name": { $regex: search, $options: "i" } },
            { "mentorId.userId.email": { $regex: search, $options: "i" } },
            { "mentorId.specialization": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Collaboration.countDocuments(query);
    const collabs = await Collaboration.find(query)
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
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return { collabs, total, page, pages: Math.ceil(total / limit) };
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

// Update Unavailable Days
export const updateUnavailableDays = async (
  collabId: string,
  updateData: {
    datesAndReasons: any;  // Dates and reasons array
    requestedBy: string;
    requesterId: string;
    approvedById: string;
    isApproved: string;
  }
) => {
  try {
    const updatedCollaboration = await Collaboration.findByIdAndUpdate(
      collabId,
      {
        $push: {
          "unavailableDays": {
            datesAndReasons: updateData.datesAndReasons,
            requestedBy: updateData.requestedBy,
            requesterId: updateData.requesterId,
            approvedById: updateData.approvedById,
            isApproved: updateData.isApproved
          }
        }
      },
      { new: true }
    );
    console.log("Updated Collaboration :",updatedCollaboration)
    return updatedCollaboration;
  } catch (error) {
    console.log("error in collaboaration repositry :",error)
    throw new Error(`Error updating unavailable days: ${error}`);
  }
};

// Update Temporary Slot Changes
export const updateTemporarySlotChanges = async (
  collabId: string,
  updateData: {
    datesAndNewSlots: any;  // New time slots with dates
    requestedBy: string;
    requesterId: string;
    approvedById: string;
    isApproved: string;
  }
) => {
  try {
    const updatedCollaboration = await Collaboration.findByIdAndUpdate(
      collabId,
      {
        $push: {
          "temporarySlotChanges": {
            datesAndNewSlots: updateData.datesAndNewSlots,
            requestedBy: updateData.requestedBy,
            requesterId: updateData.requesterId,
            approvedById: updateData.approvedById,
            isApproved: updateData.isApproved
          }
        }
      },
      { new: true }
    );
    console.log("Updated Collaboration :",updatedCollaboration)
    return updatedCollaboration;
  } catch (error) {
    console.log("error in collaboaration repositry :",error)
    throw new Error(`Error updating temporary slot changes: ${error}`);
  }
};

//Update the is Approved of the collaboration
export const updateRequestStatus = async (
  collabId: string,
  requestId: string,
  requestType: "unavailable" | "timeSlot",
  status: "approved" | "rejected",
  newEndDate?: Date 
): Promise<ICollaboration | null> => {
  try {
    const updateField =
      requestType === "unavailable" ? "unavailableDays" : "temporarySlotChanges";

    let updateQuery: any = {
      $set: {
        [`${updateField}.$.isApproved`]: status,
      },
    };

    // Add endDate to the update query if provided
    if (newEndDate) {
      updateQuery.$set["endDate"] = newEndDate;
    }

    const updatedCollaboration = await Collaboration.findOneAndUpdate(
      {
        _id: collabId,
        [`${updateField}._id`]: requestId,
      },
      updateQuery,
      { new: true }
    )
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
      });

    if (!updatedCollaboration) {
      throw new Error("Collaboration or request not found");
    }

    console.log("Updated collaboration from repository:", updatedCollaboration);
    return updatedCollaboration;
  } catch (error: any) {
    console.log("Error in repository file:", error);
    throw new Error(`Error updating request status: ${error.message}`);
  }
};


export const getLockedSlotsByMentorId = async (mentorId: string): Promise<LockedSlot[]> => {
  try {
    const currentDate = new Date();

    // active collaborations 
    const collaborations = await Collaboration.find({
      mentorId,
      isCancelled: false,
      $or: [
        { endDate: { $gt: currentDate } },
        { endDate: null },
      ],
    }).select("selectedSlot");

    // console.log("collaboartion for given mentor Id :",collaborations);
    // accepted mentor requests
    const mentorRequests = await MentorRequest.find({
      mentorId,
      isAccepted: "Accepted",
    }).select("selectedSlot");

    // console.log("mentor requset for teh given mentor Id :",mentorRequests)

    // Combine slots from collaborations
    const collabSlots: LockedSlot[] = collaborations.flatMap(collab =>
      collab.selectedSlot.map(slot => ({
        day: slot.day,
        timeSlots: slot.timeSlots,
      }))
    );
    // console.log("Slot for collab : ",collabSlots);
    // Combine slots from mentor requests
    const requestSlots: LockedSlot[] = mentorRequests
      .map(request => {
        // Type assertion for selectedSlot
        const selectedSlot = request.selectedSlot as { day?: string; timeSlots?: string };
        
        // Runtime validation
        if (!selectedSlot.day || !selectedSlot.timeSlots) {
          console.log(`Invalid selectedSlot for mentorRequestId: ${request.mentorRequestId}`);
          return null;
        }

        return {
          day: selectedSlot.day,
          timeSlots: [selectedSlot.timeSlots], // Wrap string in array
        };
      })
      .filter((slot): slot is LockedSlot => slot !== null);
      // console.log("slot for request : ",requestSlots);

    // Combine and deduplicate slots
    const allSlots: LockedSlot[] = [...collabSlots, ...requestSlots];
    // console.log("All Slots :",allSlots)
    const uniqueSlots: LockedSlot[] = [];

    allSlots.forEach(slot => {
      const existing = uniqueSlots.find(s => s.day === slot.day);
      if (existing) {
        // Merge timeSlots for the same day
        existing.timeSlots = Array.from(new Set([...existing.timeSlots, ...slot.timeSlots]));
      } else {
        uniqueSlots.push({ day: slot.day, timeSlots: slot.timeSlots });
      }
    });

    // console.log("Locked/ Unique slot :",uniqueSlots)

    console.log(`Fetched ${uniqueSlots.length} locked slots for mentorId: ${mentorId}`);
    return uniqueSlots;
  } catch (error: any) {
    console.log(`Error fetching locked slots for mentorId ${mentorId}: ${error.message}`);
    throw new Error(`Error fetching locked slots: ${error.message}`);
  }
};