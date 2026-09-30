import mongoose, { Document, Schema } from 'mongoose';

export interface IGatePass extends Document {
  passType: string; // 'student', 'staff', 'visitor'
  personName: string;
  relationship?: string; // Relationship to student/school (e.g., Father, Vendor)
  idProofType?: string; // e.g., Aadhar Card, Driving License
  contactNumber?: string;
  studentId?: string; // Admission Number / Student ID
  studentClass?: string;
  studentSection?: string;
  reason: string;
  idReference?: string; // ID Number
  timeOut: string;
  timeIn?: string;
  date: string;
  status: string; // 'issued', 'returned', 'cancelled'
  proofPhoto?: string;
  personPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GatePassSchema: Schema = new Schema({
  passType: { type: String, enum: ['student', 'staff', 'visitor'], required: true, default: 'visitor' },
  personName: { type: String, required: true },
  relationship: { type: String },
  idProofType: { type: String },
  contactNumber: { type: String },
  studentId: { type: String },
  studentClass: { type: String },
  studentSection: { type: String },
  reason: { type: String, required: true },
  idReference: { type: String },
  timeOut: { type: String, required: true },
  timeIn: { type: String },
  date: { type: String, required: true },
  status: { type: String, enum: ['issued', 'returned', 'cancelled'], default: 'issued' },
  proofPhoto: { type: String },
  personPhoto: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IGatePass>('GatePass', GatePassSchema);
