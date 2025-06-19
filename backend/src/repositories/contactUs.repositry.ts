import { IContactMessage } from "../Interfaces/models/IContactMessage.js";
import ContactMessage from "../models/ContactMessage.modal.js";

export const createContactMessage = async (data: {
  name: string;
  email: string;
  message: string;
}): Promise<IContactMessage> => {
  try {
    const contactMessage = new ContactMessage(data);
    await contactMessage.save();
    return contactMessage;
  } catch (error: any) {
    throw new Error("Failed to save contact message: " + error.message);
  }
};

export const getAllContactMessages = async (): Promise<IContactMessage[]> => {
  try {
    return await ContactMessage.find().sort({ createdAt: -1 });
  } catch (error: any) {
    throw new Error("Failed to fetch contact messages: " + error.message);
  }
};

export const updateReplyStatus = async (contactMessageId: string): Promise<IContactMessage> => {
  try {
    const message = await ContactMessage.findOneAndUpdate(
      { contactMessageId },
      { givenReply: true },
      { new: true }
    );
    if (!message) {
      throw new Error("Contact message not found");
    }
    return message;
  } catch (error: any) {
    throw new Error("Failed to update reply status: " + error.message);
  }
};