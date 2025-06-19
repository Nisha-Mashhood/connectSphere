import Counter from "../../models/counters.model.js";
export const generateCustomId = async (collectionName, prefix) => {
    const counter = await Counter.findOneAndUpdate({ _id: collectionName }, { $inc: { sequence: 1 } }, { upsert: true, new: true });
    return `${prefix}${counter.sequence}`;
};
//# sourceMappingURL=IdGenerator.js.map