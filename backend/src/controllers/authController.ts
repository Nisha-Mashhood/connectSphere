import { Request, Response } from 'express';
import {
  savePersonalDetails,
  saveAccountDetails,
  saveProfessionalDetails,
  saveReasonAndRole,
  loginUser,
} from '../services/authService.js';



export const registerPersonalDetails = async (req: Request, res: Response) => {
  try {
    const personalDetails = await savePersonalDetails(req.body);
    res.status(201).json({ message: 'Personal details saved.', userId: personalDetails._id });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerAccountDetails = async (req: Request, res: Response) => {
  try {
    const user = await saveAccountDetails(req.body);
    res.status(200).json({ message: 'Account details saved.', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerProfessionalDetails = async (req: Request, res: Response) => {
  try {
    const user = await saveProfessionalDetails(req.body);
    res.status(200).json({ message: 'Professional details saved.', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerReasonAndRole = async (req: Request, res: Response) => {
  try {
    const user = await saveReasonAndRole(req.body);
    res.status(200).json({ message: 'Reason and role saved.', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Handle user login
export const login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await loginUser(email, password);
      res.json({ message: 'Login successful', user, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };