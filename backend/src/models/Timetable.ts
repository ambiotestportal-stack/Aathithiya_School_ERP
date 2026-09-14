import mongoose, { Document, Schema } from 'mongoose';

export interface ITimetable extends Document {
  enrolledClass: mongoose.Types.ObjectId;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  periods: {
    periodNumber: number;
    subject: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
    startTime: string; // '09:00'
    endTime: string; // '09:45'
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema: Schema = new Schema({
  enrolledClass: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  dayOfWeek: { type: String, required: true },
  periods: [{
    periodNumber: { type: Number, required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// A class can only have one timetable entry per day
TimetableSchema.index({ enrolledClass: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model<ITimetable>('Timetable', TimetableSchema);
