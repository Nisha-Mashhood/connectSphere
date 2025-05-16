import ContactMessage from "../models/ContactMessage.modal.js";
export const createContactMessage = async (data) => {
    try {
        const contactMessage = new ContactMessage(data);
        await contactMessage.save();
        return contactMessage;
    }
    catch (error) {
        throw new Error("Failed to save contact message: " + error.message);
    }
};
export const getAllContactMessages = async () => {
    try {
        return await ContactMessage.find().sort({ createdAt: -1 });
    }
    catch (error) {
        throw new Error("Failed to fetch contact messages: " + error.message);
    }
};
export const updateReplyStatus = async (contactMessageId) => {
    try {
        const message = await ContactMessage.findOneAndUpdate({ contactMessageId }, { givenReply: true }, { new: true });
        if (!message) {
            throw new Error("Contact message not found");
        }
        return message;
    }
    catch (error) {
        throw new Error("Failed to update reply status: " + error.message);
    }
};
//# sourceMappingURL=contactUs.repositry.js.map