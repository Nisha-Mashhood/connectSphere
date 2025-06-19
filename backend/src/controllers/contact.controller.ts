import { Request, Response } from "express";
import { getUserContactsService } from "../services/contact.service.js";

export const getUserContactsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.currentUser?._id;
    const userRole = req.currentUser?.role;
    if (!userId || !userRole) {
      res.status(400).json({ message: "User ID or role not provided" });
      return;
    }

    const contacts = await getUserContactsService(userId.toString());

    res
      .status(200)
      .json({ data: contacts, message: "Contacts retrieved successfully" });
    return;
  } catch (error) {
    console.error("Error in getUserContactsController:", error);
    res.status(500).json({ message: "Failed to retrieve contacts" });
    return;
  }
};
