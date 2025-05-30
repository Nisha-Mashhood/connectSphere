import mongoose, { Schema, Document } from 'mongoose';
import { generateCustomId } from '../utils/idGenerator.utils.js';

export interface TimeSlot {
  day: string;
  timeSlots: string[];
}

export interface GroupDocument extends Document {
  groupId: string;
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  isFull:boolean;
  availableSlots: TimeSlot[];
  profilePic: string;
  coverPic: string;
  startDate: Date;
  adminId: mongoose.Types.ObjectId; // the user who created the group
  members:{ userId: mongoose.Types.ObjectId; joinedAt: Date }[]; // Array of member IDs
  createdAt: Date;
}

const GroupSchema: Schema = new Schema<GroupDocument>(
  {
    groupId:{
        type: String,
        unique: true,
    },
    name: 
    { 
        type: String, 
        required: true 
    },
    bio: 
    { 
        type: String, 
        required: true 
    },
    price: 
    { 
        type: Number,
        default: 0 
    },
    maxMembers: 
    { 
        type: Number, 
        required: true 
    },
    isFull: { 
      type: Boolean, 
      default: false 
    },
    availableSlots: 
    [
      {
        day: 
        { 
            type: String, 
            required: true 
        },
        timeSlots: 
        [
            { 
                type: String, 
                required: true 
            }
        ],
      },
    ],
    profilePic: 
    { 
        type: String, 
        default: ''     // Optional
    }, 
    coverPic: 
    { 
        type: String, 
        default: ''     // Optional
    }, 
    startDate: 
    { 
        type: Date, 
        required: true 
    },
    adminId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    members: 
    [
        {
            userId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            },
            joinedAt: { 
                type: Date, 
                default: Date.now 
            },
          },
    ],
    createdAt: 
    { 
        type: Date, 
        default: Date.now 
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate groupId
GroupSchema.pre("save", async function(next) {
    if (!this.groupId) {
      this.groupId = await generateCustomId("group", "GRP");
    }
    next();
  });

const Group = mongoose.model<GroupDocument>('Group', GroupSchema);

export default Group;

