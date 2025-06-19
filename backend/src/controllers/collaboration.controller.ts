import { Request, Response } from "express";
import {
  acceptRequest,
  fetchCollabById,
  fetchRequsetById,
  getCollabDataForMentorService,
  getCollabDataForUserService,
  getCollabsService,
  getMentorLockedSlots,
  getMentorRequests,
  getMentorRequestsService,
  getRequsetForUser,
  markUnavailableDaysService,
  processPaymentService,
  processTimeSlotRequest,
  rejectRequest,
  removecollab,
  TemporaryRequestService,
  updateTemporarySlotChangesService,
} from "../services/collaboration.service.js";
import mentorRequset from "../models/mentorRequset.js";

export const TemporaryRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const { mentorId, userId, selectedSlot, price, timePeriod } = req.body;

    if (!mentorId || !userId || !selectedSlot || !price || !timePeriod) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const requestData = {
      mentorId,
      userId,
      selectedSlot,
      price,
      timePeriod,
    };
    const newRequest = await TemporaryRequestService(requestData);

    console.log(newRequest);

    res.status(201).json({
      message: "Request created successfully",
      request: newRequest,
    });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Get all mentor requests for the logged-in mentor
export const getMentorRequestsController = async (
  req: Request,
  res: Response
) => {
  const mentorId = req.query.mentorId as string;
  if (!mentorId) {
    res.status(400).json({ message: "Mentor ID is required." });
    return;
  }
  try {
    const mentorRequests = await getMentorRequests(mentorId);
    res.status(200).json({ requests: mentorRequests });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a mentor request
export const acceptRequestController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await acceptRequest(id);
    res.status(200).json({ message: "Request accepted", request });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a mentor request
export const rejectRequestController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await rejectRequest(id);
    res.status(200).json({ message: "Request rejected", request });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get requset for user
export const getRequsetForUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userRequest = await getRequsetForUser(id);
    res.status(200).json({
      message: "Request retrieved successfully",
      requests: userRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

//Make payemnt requset
export const makeStripePaymentController = async (
  req: Request,
  res: Response
) => {
  const { paymentMethodId, amount, requestId, email, returnUrl } = req.body;

  try {
    // Validate returnUrl
    if (!returnUrl) {
      res.status(400).json({
        status: "failure",
        error: "A return URL is required for processing the payment",
      });
      return;
    }

    // Retrieve the mentor request document
    const mentorRequestData = await mentorRequset.findById(requestId);

    if (!mentorRequestData) {
      res
        .status(404)
        .json({ status: "failure", message: "Mentor request not found" });
      return;
    }

    // Process payment and handle collaboration creation
    const paymentResult = await processPaymentService(
      paymentMethodId,
      amount,
      requestId,
      mentorRequestData,
      email,
      returnUrl
    );

    // Handle different payment intent statuses
    const paymentIntent =
      "paymentIntent" in paymentResult
        ? paymentResult.paymentIntent
        : paymentResult;

    if (
      paymentIntent.status === "requires_action" &&
      paymentIntent.next_action
    ) {
      console.log(paymentIntent.status);
      // Payment requires additional action (like 3D Secure)
      res.status(200).json({
        status: "requires_action",
        charge: paymentIntent,
      });
      return;
    } else if (paymentIntent.status === "succeeded") {
      // Payment succeeded
      res.status(200).json({
        status: "success",
        charge: paymentIntent,
        contacts:
          "contacts" in paymentResult ? paymentResult.contacts : undefined, // Include contacts if present
      });
      return;
    } else {
      // Payment failed or is pending
      res.status(200).json({
        status: "pending",
        charge: paymentIntent,
        message: `Payment status: ${paymentIntent.status}`,
      });
      return;
    }
  } catch (error: any) {
    console.error("Payment error:", error.message);
    res.status(500).json({ status: "failure", error: error.message });
    return;
  }
};

//get collab data for user
export const getCollabDataForUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.id;
    const collabData = await getCollabDataForUserService(userId);
    res.status(200).json({ collabData });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

//Get collab data for mentor
export const getCollabDataForMentorController = async (
  req: Request,
  res: Response
) => {
  try {
    const mentorId = req.params.id;
    const collabData = await getCollabDataForMentorService(mentorId);
    res.status(200).json({ collabData });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

//delete collab
export const deleteCollab = async (req: Request, res: Response) => {
  const { collabId } = req.params;
  const { reason } = req.body;

  try {
    const response = await removecollab(collabId, reason);
    res.status(200).json({
      status: "success",
      message: "Collab deleted successfully",
      response,
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ status: "failure", error: error.message });
  }
};

//FOR ADMIN

// Get all mentor requests
export const getAllMentorRequests = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const mentorRequests = await getMentorRequestsService({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
    });
    res.status(200).json(mentorRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCollabs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const collaborations = await getCollabsService({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
    });
    res.status(200).json(collaborations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

//get collab details by collabId
export const getCollabDeatilsbyCollabId = async (
  req: Request,
  res: Response
) => {
  const { collabId } = req.params;
  try {
    const collabDetails = await fetchCollabById(collabId);
    res
      .status(200)
      .json({
        message: "Collab details accessed successfully",
        data: collabDetails,
      });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

//get Requset deatils using requsetId
export const getRequestDeatilsbyRequestId = async (
  req: Request,
  res: Response
) => {
  const { requestId } = req.params;
  try {
    const requestDetails = await fetchRequsetById(requestId);
    res
      .status(200)
      .json({
        message: "Requset details accessed successfully",
        data: requestDetails,
      });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Mark Dates as Unavailable
export const markUnavailableDays = async (req: Request, res: Response) => {
  const { collabId } = req.params;
  const {
    datesAndReasons,
    requestedBy,
    requesterId,
    approvedById,
    isApproved,
  } = req.body;

  try {
    const updatedCollaboration = await markUnavailableDaysService(collabId, {
      datesAndReasons,
      requestedBy,
      requesterId,
      approvedById,
      isApproved,
    });

    console.log("collaboration collection updated");
    res
      .status(200)
      .json({
        message: "Unavailable days updated",
        data: updatedCollaboration,
      });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Update Time Slots
export const updateTemporarySlotChanges = async (
  req: Request,
  res: Response
) => {
  const { collabId } = req.params;
  const {
    datesAndNewSlots,
    requestedBy,
    requesterId,
    approvedById,
    isApproved,
  } = req.body;

  try {
    const updatedCollaboration = await updateTemporarySlotChangesService(
      collabId,
      {
        datesAndNewSlots,
        requestedBy,
        requesterId,
        approvedById,
        isApproved,
      }
    );

    res
      .status(200)
      .json({
        message: "Temporary slot changes updated",
        data: updatedCollaboration,
      });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const approveTimeSlotRequest = async (req: Request, res: Response) => {
  const { collabId } = req.params;
  const { requestId, isApproved, requestType } = req.body;

  try {
    console.log("Processing time slot request for collabId:", collabId);
    console.log("Request Body:", req.body);
    console.log("requestId:", requestId);
    console.log("isApproved:", isApproved);
    console.log("requestType:", requestType);

    const updatedCollaboration = await processTimeSlotRequest(
      collabId,
      requestId,
      isApproved,
      requestType as "unavailable" | "timeSlot"
    );

    res.status(200).json({
      message: "Time slot request processed successfully",
      data: updatedCollaboration,
    });
  } catch (error: any) {
    console.error("Error processing time slot request:", error);
    res.status(500).json({ message: error.message });
  }
};

//Get the locked slot for mentor
export const getMentorLockedSlotsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { mentorId } = req.params;

    if (!mentorId) {
      console.log("Mentor ID not provided in request");
      res.status(400).json({ message: "Mentor ID is required" });
      return;
    }

    const lockedSlots = await getMentorLockedSlots(mentorId);
    console.log("LOcked slot from backend :", lockedSlots);
    res.status(200).json({
      message: "Locked slots retrieved successfully",
      lockedSlots,
    });
  } catch (error: any) {
    console.log(
      `Error in controller for mentorId ${req.params.mentorId}: ${error.message}`
    );
    res.status(500).json({ message: error.message });
  }
};
