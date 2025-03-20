import Counter from "../models/counters.model.js";

export const generateCustomId = async (collectionName: string, prefix: string): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true }
  );
  return `${prefix}${counter.sequence}`;
};