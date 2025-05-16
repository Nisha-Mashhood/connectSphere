import mongoose, { Document } from "mongoose";
export interface IReview extends Document {
    reviewId: string;
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    isApproved: boolean;
    isSelect: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview> & IReview & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Review.modal.d.ts.map