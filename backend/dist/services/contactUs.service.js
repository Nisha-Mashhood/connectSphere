import { sendEmail } from "../utils/email.utils.js";
import * as ContactRepository from '../repositories/contactUs.repositry.js';
import config from "../config/env.config.js";
export const createContactMessage = async (data) => {
    const ReceiverEmail = config.adminEmail;
    if (!ReceiverEmail) {
        throw new Error("Receiver Email required");
    }
    try {
        const contactMessage = await ContactRepository.createContactMessage(data);
        // Send email to admin
        const emailText = `New Contact Message\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}\n\nSent at: ${new Date().toLocaleString()}`;
        await sendEmail(ReceiverEmail, "New Contact Message from ConnectSphere", emailText);
        return contactMessage;
    }
    catch (error) {
        throw new Error("Error processing contact message: " + error.message);
    }
};
export const getAllContactMessages = async () => {
    try {
        return await ContactRepository.getAllContactMessages();
    }
    catch (error) {
        throw new Error("Error fetching contact messages: " + error.message);
    }
};
export const sendReply = async (contactMessageId, replyData) => {
    try {
        const updatedMessage = await ContactRepository.updateReplyStatus(contactMessageId);
        // Send reply email
        await sendEmail(replyData.email, "Reply from ConnectSphere", `Hello ${updatedMessage.name},\n\n${replyData.replyMessage}\n\nBest regards,\nConnectSphere Team`);
        return updatedMessage;
    }
    catch (error) {
        throw new Error("Error sending reply: " + error.message);
    }
};
//# sourceMappingURL=contactUs.service.js.map