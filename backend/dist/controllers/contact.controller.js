import { getUserContactsService } from "../services/contact.service.js";
export const getUserContactsController = async (req, res) => {
    try {
<<<<<<< HEAD
        const userId = req.currentUser?._id;
        const userRole = req.currentUser?.role;
=======
        const userId = req.currentUser?._id; // From verifyToken middleware
        const userRole = req.currentUser?.role; // From verifyToken middleware
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
        if (!userId || !userRole) {
            res.status(400).json({ message: "User ID or role not provided" });
            return;
        }
        const contacts = await getUserContactsService(userId.toString());
        res.status(200).json({ data: contacts, message: "Contacts retrieved successfully" });
        return;
    }
    catch (error) {
        console.error("Error in getUserContactsController:", error);
        res.status(500).json({ message: "Failed to retrieve contacts" });
        return;
    }
};
//# sourceMappingURL=contact.controller.js.map