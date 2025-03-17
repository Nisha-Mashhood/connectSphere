import mongoose, { Document } from 'mongoose';
export interface IFeedback extends Document {
    userId: mongoose.Types.ObjectId;
    mentorId: mongoose.Types.ObjectId;
    collaborationId: mongoose.Types.ObjectId;
    givenBy: "user" | "mentor";
    rating: number;
    communication: number;
    expertise: number;
    punctuality: number;
    comments: string;
    wouldRecommend: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<IFeedback, {}, {}, {}, mongoose.Document<unknown, {}, IFeedback> & IFeedback & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=feedback.modal.d.ts.map