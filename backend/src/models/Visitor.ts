import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  visitorName: string;
  mobileNo: string;
  whatsappNo?: string;
  email?: string;
  noOfVisitors: number;
  visitorType: string;
  meetingPerson: string;
  meetingDate: string;
  checkInTime: string;
  checkOutTime?: string;
  address?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema: Schema = new Schema({
  visitorName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  whatsappNo: { type: String },
  email: { type: String },
  noOfVisitors: { type: Number, required: true, default: 1 },
  visitorType: { type: String, required: true },
  meetingPerson: { type: String, required: true },
  meetingDate: { type: String, required: true },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String },
  address: { type: String },
  photoUrl: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
