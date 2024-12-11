var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from '../models/user.js';
// Create a new user
export const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User.create(userData);
});
// Find a user by email
export const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User.findOne({ email });
});
// Find a user by ID
export const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User.findById(id);
});
// Update a user
export const updateUser = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User.findByIdAndUpdate(id, updateData, { new: true });
});
//# sourceMappingURL=useRepositry.js.map