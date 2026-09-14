import mongoose, { Document, Schema } from 'mongoose';

export interface IExamScheduleItem {
  date: Date;
  subject: mongoose.Types.ObjectId; // Ref to Subject
}

export interface IExam extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  enrolledClasses: mongoose.Types.ObjectId[]; // Which classes are taking this exam
  schedule: IExamScheduleItem[]; // Exam timetable entries: date + subject
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  enrolledClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  schedule: [{
    date: { type: Date, required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }
  }],
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' }
}, {
  timestamps: true
});

export default mongoose.model<IExam>('Exam', ExamSchema);
