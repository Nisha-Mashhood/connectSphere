export declare const savePersonalDetails: (data: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const saveAccountDetails: (data: {
    userId: string;
    username: string;
    password: string;
    confirmPassword: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const saveProfessionalDetails: (data: {
    userId: string;
    jobTitle?: string;
    industry?: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const saveReasonAndRole: (data: {
    userId: string;
    reasonForJoining?: string;
    role: "user" | "mentor";
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    user: import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare const refreshToken: (refreshToken: string) => Promise<{
    newAccessToken: string;
}>;
export declare const forgotPassword: (email: string) => Promise<string>;
export declare const verifyOTP: (email: string, otp: string) => Promise<string>;
export declare const resetPassword: (email: string, newPassword: string) => Promise<void>;
export declare const logout: (userId: string) => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map