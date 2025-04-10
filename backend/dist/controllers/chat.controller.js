import { getChatMessagesService } from "../services/chat.service.js";
import { saveChatMessage } from "../repositories/chat.repository.js";
import { uploadMedia } from "../utils/cloudinary.utils.js";
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
        const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
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
<<<<<<< HEAD
        console.log("Saved message:", message);
        res.status(200).json({ status: "success", data: { url, thumbnailUrl, messageId: message._id } });
    }
    catch (error) {
        console.error("Error uploading file and saving message:", error.message);
        if (error.http_code === 400 && error.message.includes("Video is too large")) {
            res.status(400).json({ message: "Video is too large; processing may take time." });
        }
        else {
            res.status(400).json({ message: error.message });
        }
=======
        res.status(200).json({ status: "success", data: { url, messageId: message._id } });
    }
    catch (error) {
        console.error("Error uploading file and saving message:", error.message);
        res.status(500).json({ status: "failure", message: error.message });
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    }
};
//# sourceMappingURL=chat.controller.js.map