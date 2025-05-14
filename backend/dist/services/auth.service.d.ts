export declare const sigupDetails: (data: {
    name: string;
    email: string;
    password: string;
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
    needsReviewPrompt: boolean;
}>;
export declare const refreshToken: (refreshToken: string) => Promise<{
    newAccessToken: string;
}>;
export declare const googleSignupService: (code: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const googleLoginService: (code: string) => Promise<{
    user: import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
}>;
export declare const githubSignupService: (code: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const githubLoginService: (code: string) => Promise<{
    user: import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
}>;
export declare const forgotPassword: (email: string) => Promise<string>;
export declare const verifyOTP: (email: string, otp: string) => Promise<string>;
export declare const resetPassword: (email: string, newPassword: string) => Promise<void>;
export declare const logout: (useremail: string) => Promise<void>;
export declare const verifyAdminPasskey: (passkey: string) => boolean;
export declare const checkProfileCompletion: (userId: string) => Promise<boolean>;
export declare const profileDetails: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updateUserProfile: (userId: string, data: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    jobTitle: string;
    industry: string;
    reasonForJoining: string;
    profilePicFile?: Express.Multer.File;
    coverPicFile?: Express.Multer.File;
}) => Promise<(import("mongoose").Document<unknown, {}, import("../models/user.model.js").UserInterface> & import("../models/user.model.js").UserInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=auth.service.d.ts.map