export declare const sigupDetails: (data: {
    name: string;
    email: string;
    password: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../../models/admin.model.js").AdminInterface> & import("../../models/admin.model.js").AdminInterface & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const loginAdmin: (email: string, password: string) => Promise<{
    Admin: import("mongoose").Document<unknown, {}, import("../../models/admin.model.js").AdminInterface> & import("../../models/admin.model.js").AdminInterface & Required<{
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
export declare const findOrCreateAdminforPassport: (profile: any, provider: string) => Promise<import("../../models/admin.model.js").AdminInterface>;
export declare const forgotPassword: (email: string) => Promise<string>;
export declare const verifyOTP: (email: string, otp: string) => Promise<string>;
export declare const resetPassword: (email: string, newPassword: string) => Promise<void>;
export declare const logout: (Adminemail: string) => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map