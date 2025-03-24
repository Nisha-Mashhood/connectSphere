import mongoose, { Document } from "mongoose";
export interface ICounter extends Document {
    _id: string;
    sequence: number;
}
declare const _default: mongoose.Model<ICounter, {}, {}, {}, mongoose.Document<unknown, {}, ICounter> & ICounter & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=counters.model.d.ts.map