import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  collaborationId: mongoose.Types.ObjectId;
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  collaborationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaboration',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  expertise: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  punctuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
},{ timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);