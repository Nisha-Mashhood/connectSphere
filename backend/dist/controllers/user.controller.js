import * as UserService from "../services/user.service.js";
import { uploadMedia } from "../core/Utils/Cloudinary.js";
export const getAllUsers = async (_req, res) => {
    const users = await UserService.getAllUsers();
    res.json(users);
};
export const getUserById = async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    res.json(user);
};
export const updateUserProfile = async (req, res) => {
    const { profilePic, coverPic, ...data } = req.body;
    const files = req.files;
    // Check if profile photo is uploaded
    if (files?.profilePhoto?.[0]) {
        const profilePhoto = files.profilePhoto[0];
        const uploadedProfilePic = await uploadMedia(profilePhoto.path, "profile_photos", profilePhoto.size);
        data.profilePic = uploadedProfilePic;
    }
    // Check if cover photo is uploaded
    if (files?.coverPhoto?.[0]) {
        const coverPhoto = files.coverPhoto[0];
        const uploadedCoverPic = await uploadMedia(coverPhoto.path, "cover_photos", coverPhoto.size);
        data.coverPic = uploadedCoverPic;
    }
    const updatedUser = await UserService.updateUserProfile(req.params.id, data);
    res.json(updatedUser);
};
//block the user
export const blockUser = async (req, res) => {
    console.log(req.params.id);
    await UserService.blockUser(req.params.id);
    res.json({ message: "User blocked successfully" });
};
export const unblockUser = async (req, res) => {
    await UserService.unblockUser(req.params.id);
    res.json({ message: "User unblocked successfully" });
};
export const changeRole = async (req, res) => {
    const { role } = req.body;
    try {
        await UserService.changeRole(req.params.id, role);
        res.json({ message: "Changed the role Successfully" });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//# sourceMappingURL=user.controller.js.map