import { getChatMessagesService, getUnreadMessageCountsService, } from "../services/chat.service.js";
import { saveChatMessage } from "../repositories/chat.repository.js";
import { uploadMedia } from "../core/Utils/Cloudinary.js";
export const getChatMessages = async (req, res) => {
    try {
        const { contactId, groupId, page = "1", limit = "10" } = req.query;
        const messages = await getChatMessagesService(contactId, groupId, parseInt(page), parseInt(limit));
        res.status(200).json({ status: "success", data: messages });
    }
    catch (error) {
        console.error("Error fetching chat messages:", error.message);
        res.status(500).json({ status: "failure", message: error.message });
    }
};
export const uploadAndSaveMessage = async (req, res) => {
    try {
        const { senderId, targetId, type, collaborationId, userConnectionId, groupId, } = req.body;
        if (!req.file || !senderId || !targetId || !type) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const filePath = req.file.path;
        const folder = type === "group" ? "group_chat_media" : "chat_media";
        const contentType = req.file.mimetype.startsWith("image/")
            ? "image"
            : req.file.mimetype.startsWith("video/")
                ? "video"
                : "file";
        const { url, thumbnailUrl } = await uploadMedia(filePath, folder, req.file.size, contentType);
        const message = await saveChatMessage({
            senderId,
            content: url,
            thumbnailUrl,
            contentType,
            ...(type === "user-mentor" && { collaborationId }),
            ...(type === "user-user" && { userConnectionId }),
            ...(type === "group" && { groupId }),
            fileMetadata: {
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
            },
            timestamp: new Date(),
        });
        console.log("Saved message:", message);
        res
            .status(200)
            .json({
            status: "success",
            data: { url, thumbnailUrl, messageId: message._id },
        });
    }
    catch (error) {
        console.error("Error uploading file and saving message:", error.message);
        if (error.http_code === 400 &&
            error.message.includes("Video is too large")) {
            res
                .status(400)
                .json({ message: "Video is too large; processing may take time." });
        }
        else {
            res.status(400).json({ message: error.message });
        }
    }
};
export const getUnreadMessageCounts = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log("userId from front end :", userId);
        if (!userId) {
            res
                .status(400)
                .json({ status: "failure", message: "User ID is required" });
            return;
        }
        const unreadCounts = await getUnreadMessageCountsService(userId);
        console.log("Unread message count from controller :", unreadCounts);
        res.status(200).json({ status: "success", data: unreadCounts });
    }
    catch (error) {
        console.error("Error fetching unread message counts:", error.message);
        res.status(500).json({ status: "failure", message: error.message });
    }
};
//# sourceMappingURL=chat.controller.js.map