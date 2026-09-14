import mongoose, { Document, Schema } from 'mongoose';

export interface IStaffProfile extends Document {
  user: mongoose.Types.ObjectId;      // Ref to User (Role: TEACHER)
  employeeId: string;
  department: string;                 // Subject name / department
  subject?: mongoose.Types.ObjectId;  // Direct Ref to Subject by ID
  assignedSubjects?: mongoose.Types.ObjectId[]; // Ref to multiple Subjects by ID
  designation: string;
  joiningDate: Date;
  qualification: string;
  experienceYears: number;
  salary: number;
  phone: string;
  address: string;
  assignedClasses?: mongoose.Types.ObjectId[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StaffProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  assignedSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  qualification: { type: String },
  experienceYears: { type: Number, default: 0 },
  salary: { type: Number, required: true },
  phone: { type: String },
  address: { type: String },
  assignedClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IStaffProfile>('StaffProfile', StaffProfileSchema);
