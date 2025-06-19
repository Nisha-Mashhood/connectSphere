import mongoose from "mongoose";
import { GroupDocument } from "../Interfaces/models/GroupDocument.js";
declare const Group: mongoose.Model<GroupDocument, {}, {}, {}, mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Group;
//# sourceMappingURL=group.model.d.ts.map