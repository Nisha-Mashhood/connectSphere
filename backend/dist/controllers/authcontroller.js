var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { savePersonalDetails, saveAccountDetails, saveProfessionalDetails, saveReasonAndRole, loginUser, } from '../services/authService.js';
export const registerPersonalDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const personalDetails = yield savePersonalDetails(req.body);
        res.status(201).json({ message: 'Personal details saved.', userId: personalDetails._id });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
export const registerAccountDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield saveAccountDetails(req.body);
        res.status(200).json({ message: 'Account details saved.', user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
export const registerProfessionalDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield saveProfessionalDetails(req.body);
        res.status(200).json({ message: 'Professional details saved.', user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
export const registerReasonAndRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield saveReasonAndRole(req.body);
        res.status(200).json({ message: 'Reason and role saved.', user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Handle user login
export const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { user, token } = yield loginUser(email, password);
        res.json({ message: 'Login successful', user, token });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//# sourceMappingURL=authcontroller.js.map