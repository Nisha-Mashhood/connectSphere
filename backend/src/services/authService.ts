import {
    createUser,
    findUserByEmail,
    findUserById,
  } from '../repositories/useRepositry.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

// Handle personal details registration
export const savePersonalDetails = async (data: { fullName: string; email: string; phone: string; dateOfBirth: Date }) => {
    const { fullName, email, phone, dateOfBirth } = data;
  
    // Check if the email already exists
    const userExists = await findUserByEmail(email);
    if (userExists) throw new Error('User already exists.');
  
    //create new user with the passed details
    const newUser = await createUser({ fullName, email, phone, dateOfBirth });
    return newUser;
  };
  
  // Handle account details registration
  export const saveAccountDetails = async (data: { userId: string; username: string; password: string; confirmPassword: string }) => {
    const { userId, username, password, confirmPassword } = data;
  
    if (password !== confirmPassword) throw new Error('Passwords do not match.');
  
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found.');
  
    const hashedPassword = await bcrypt.hash(password, 10);
    user.username = username;
    user.password = hashedPassword;
  
    await user.save();
    return user;
  };
  
  // Handle professional details registration
  export const saveProfessionalDetails = async (data: { userId: string; jobTitle?: string; industry?: string }) => {
    const { userId, jobTitle, industry } = data;
  
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found.');
  
    user.jobTitle = jobTitle;
    user.industry = industry;
  
    await user.save();
    return user;
  };
  
  // Handle reason and role registration
  export const saveReasonAndRole = async (data: { userId: string; reasonForJoining?: string; role: 'user' | 'mentor' }) => {
    const { userId, reasonForJoining, role } = data;
  
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found.');
  
    user.reasonForJoining = reasonForJoining;
    user.role = role;
  
    if (role === 'mentor') {
      user.isMentorApproved = false;
    }
  
    await user.save();
    return user;
  };

  // Handle login logic
export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error('User not found');

    // Ensure user.password is defined
  if (!user.password) {
    throw new Error('Password not set for user');
  }
  
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
  
    // Generate JWT token
    const token = generateToken(user._id.toString());
    return { user, token };
  };