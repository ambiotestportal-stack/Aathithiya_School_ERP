import mongoose, { Document, Schema } from 'mongoose';

export interface IHostelRoom extends Document {
  roomNumber: string;
  blockName: string;
  roomType: 'Boys' | 'Girls';
  capacity: number;
  currentOccupancy: number;
  wardenName: string;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const HostelRoomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true },
  blockName: { type: String, required: true },
  roomType: { type: String, enum: ['Boys', 'Girls'], required: true },
  capacity: { type: Number, required: true, default: 2 },
  currentOccupancy: { type: Number, required: true, default: 0 }, // We can keep this for quick reference or deprecate it, let's keep it in sync
  wardenName: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }]
}, {
  timestamps: true
});

// A room number must be unique within a block
HostelRoomSchema.index({ roomNumber: 1, blockName: 1 }, { unique: true });

HostelRoomSchema.pre('save', function(this: any) {
  this.currentOccupancy = this.students.length;
});

export default mongoose.model<IHostelRoom>('HostelRoom', HostelRoomSchema);
