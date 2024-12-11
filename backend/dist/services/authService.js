var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser, findUserByEmail, findUserById, } from '../repositories/useRepositry.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
// Handle personal details registration
export const savePersonalDetails = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, phone, dateOfBirth } = data;
    // Check if the email already exists
    const userExists = yield findUserByEmail(email);
    if (userExists)
        throw new Error('User already exists.');
    //create new user with the passed details
    const newUser = yield createUser({ fullName, email, phone, dateOfBirth });
    return newUser;
});
// Handle account details registration
export const saveAccountDetails = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, username, password, confirmPassword } = data;
    if (password !== confirmPassword)
        throw new Error('Passwords do not match.');
    const user = yield findUserById(userId);
    if (!user)
        throw new Error('User not found.');
    const hashedPassword = yield bcrypt.hash(password, 10);
    user.username = username;
    user.password = hashedPassword;
    yield user.save();
    return user;
});
// Handle professional details registration
export const saveProfessionalDetails = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, jobTitle, industry } = data;
    const user = yield findUserById(userId);
    if (!user)
        throw new Error('User not found.');
    user.jobTitle = jobTitle;
    user.industry = industry;
    yield user.save();
    return user;
});
// Handle reason and role registration
export const saveReasonAndRole = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, reasonForJoining, role } = data;
    const user = yield findUserById(userId);
    if (!user)
        throw new Error('User not found.');
    user.reasonForJoining = reasonForJoining;
    user.role = role;
    if (role === 'mentor') {
        user.isMentorApproved = false;
    }
    yield user.save();
    return user;
});
// Handle login logic
export const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield findUserByEmail(email);
    if (!user)
        throw new Error('User not found');
    // Ensure user.password is defined
    if (!user.password) {
        throw new Error('Password not set for user');
    }
    // Check if password matches
    const isMatch = yield bcrypt.compare(password, user.password);
    if (!isMatch)
        throw new Error('Invalid credentials');
    // Generate JWT token
    const token = generateToken(user._id.toString());
    return { user, token };
});
//# sourceMappingURL=authService.js.map