import { Request, Response } from "express";
import * as UserService from "../services/user.service.js";
import { uploadImage } from "../utils/cloudinary.utils.js";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.params.id);
  res.json(user);
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { profilePic, coverPic, ...data } = req.body;

  // Check if profile photo is uploaded
  if (
    req.files &&
    (req.files as { profilePhoto?: Express.Multer.File[] }).profilePhoto
  ) {
    // Handle profile photo upload
    const uploadedProfilePic = await uploadImage(
      (req.files as { profilePhoto: Express.Multer.File[] }).profilePhoto[0]
        .path,
      "profile_photos"
    );
    data.profilePic = uploadedProfilePic;
  }

  // Check if cover photo is uploaded
  if (
    req.files &&
    (req.files as { coverPhoto?: Express.Multer.File[] }).coverPhoto
  ) {
    // Handle cover photo upload
    const uploadedCoverPic = await uploadImage(
      (req.files as { coverPhoto: Express.Multer.File[] }).coverPhoto[0].path,
      "cover_photos"
    );
    data.coverPic = uploadedCoverPic;
  }
  const updatedUser = await UserService.updateUserProfile(req.params.id, data);
  res.json(updatedUser);
};

export const blockUser = async (req: Request, res: Response) => {
  await UserService.blockUser(req.params.id);
  res.json({ message: "User blocked successfully" });
};

export const unblockUser = async (req: Request, res: Response) => {
  await UserService.unblockUser(req.params.id);
  res.json({ message: "User unblocked successfully" });
};
