import mongoose from "mongoose";
import { GroupRequestDocument } from "../Interfaces/models/GroupRequestDocument.js";
declare const GroupRequest: mongoose.Model<GroupRequestDocument, {}, {}, {}, mongoose.Document<unknown, {}, GroupRequestDocument> & GroupRequestDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default GroupRequest;
//# sourceMappingURL=groupRequest.model.d.ts.map