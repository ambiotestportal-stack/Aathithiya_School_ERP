import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;      // Ref to User (Role: STUDENT)
  admissionNumber: string;
  rollNumber: string;
  enrolledClass: mongoose.Types.ObjectId; // Ref to Class
  dob: Date;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  parent?: mongoose.Types.ObjectId;   // Ref to User (Role: PARENT)
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  contactNumber?: string;
  annualIncome?: number;
  address: string;
  transportMode?: string;
  busNumber?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  admissionNumber: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true },
  enrolledClass: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  bloodGroup: { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'User' },
  fatherName: { type: String },
  motherName: { type: String },
  fatherOccupation: { type: String },
  motherOccupation: { type: String },
  contactNumber: { type: String },
  annualIncome: { type: Number },
  address: { type: String },
  transportMode: { type: String, default: 'Walk' },
  busNumber: { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

StudentProfileSchema.index({ enrolledClass: 1 });
StudentProfileSchema.index({ enrolledClass: 1, rollNumber: 1 }, { unique: true, sparse: true });

export default mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
