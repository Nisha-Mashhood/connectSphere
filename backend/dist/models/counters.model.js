import mongoose, { Schema } from "mongoose";
const counterSchema = new Schema({
    _id: { type: String, required: true },
    sequence: { type: Number, default: 100 }, // Start at 100 for USR101, MTR101, etc.
});
export default mongoose.model("Counter", counterSchema);
//# sourceMappingURL=counters.model.js.map