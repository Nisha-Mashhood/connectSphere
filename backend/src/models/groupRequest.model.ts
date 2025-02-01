import mongoose, { Schema, Document } from 'mongoose';

export interface GroupRequestDocument extends Document {
  groupId: mongoose.Types.ObjectId; //  the group
  userId: mongoose.Types.ObjectId; //  the user who sent the request
  status: 'Pending' | 'Approved' | 'Rejected'; // Request status
  paymentStatus: 'Pending' | 'Completed' | 'Failed'; // Payment status
  paymentId?: string; // Optional 
  amountPaid?: number; // Amount paid by the user
  createdAt: Date;
}

const GroupRequestSchema: Schema = new Schema<GroupRequestDocument>(
  {
    groupId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group', 
        required: true 
    },
    userId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: 
    { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    paymentStatus: 
    { 
        type: String, 
        enum: ['Pending', 'Completed', 'Failed'], 
        default: 'Pending' 
    },
    paymentId: 
    { 
        type: String, 
        default: null   // Optional: can be filled after successful payment
    }, 
    amountPaid: 
    { 
        type: Number, 
        default: 0  // Default 0 for groups without payment
    }, 
    createdAt: 
    { 
        type: Date, 
        default: Date.now 
    },
  },
  { timestamps: true }
);

const GroupRequest = mongoose.model<GroupRequestDocument>('GroupRequest', GroupRequestSchema);

export default GroupRequest;


