import * as UserRepository from "../repositories/usermanagemnt.repositry.js";
export const getAllUsers = UserRepository.getAllUsers;
export const getUserById = UserRepository.getUserById;
export const updateUserProfile = UserRepository.updateUserProfile;
export const blockUser = UserRepository.blockUser;
export const unblockUser = UserRepository.unblockUser;
export const changeRole = async (Id, role) => {
    await UserRepository.updateUserRole(Id, role);
};
//# sourceMappingURL=user.service.js.map