import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveRequest extends Document {
  student: mongoose.Types.ObjectId; // Ref to StudentProfile
  reason: string;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: mongoose.Types.ObjectId; // Ref to User (Admin or Teacher)
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

LeaveRequestSchema.pre('save', function(this: any) {
  if (this.endDate < this.startDate) {
    throw new Error('End date must be greater than or equal to start date');
  }
});

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
