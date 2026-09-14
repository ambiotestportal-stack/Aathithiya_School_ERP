import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId; // Ref to StudentProfile
  status: 'Present' | 'Absent' | 'OD' | 'Half-Day';
  remarks?: string;
}

export interface IAttendance extends Document {
  enrolledClass: mongoose.Types.ObjectId; // Ref to Class
  date: Date;
  records: IAttendanceRecord[];
  markedBy: mongoose.Types.ObjectId; // Ref to User (Teacher or Admin)
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  enrolledClass: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  records: [{
    student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'OD', 'Half-Day'], default: 'Present' },
    remarks: { type: String }
  }],
  markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// A class can only have one attendance record per day
AttendanceSchema.index({ enrolledClass: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ 'records.student': 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
