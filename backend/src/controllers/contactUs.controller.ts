import { Request, Response } from "express";
import * as ContactService from "../services/contactUs.sevice.js";

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    const contactMessage = await ContactService.createContactMessage({
      name,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Contact message sent and saved successfully",
      data: contactMessage,
    });
  } catch (error: any) {
    console.error("Error in createContactMessage:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process contact message: " + error.message,
    });
  }
};

export const getAllContactMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await ContactService.getAllContactMessages();
    res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully",
      data: messages,
    });
  } catch (error: any) {
    console.error("Error in getAllContactMessages:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages: " + error.message,
    });
  }
};

export const sendReply = async (req: Request, res: Response) => {
  try {
    const { contactMessageId } = req.params;
    const { email, replyMessage } = req.body;
    const updatedMessage = await ContactService.sendReply(contactMessageId, { email, replyMessage });
    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: updatedMessage,
    });
  } catch (error: any) {
    console.error("Error in sendReply:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send reply: " + error.message,
    });
  }
};