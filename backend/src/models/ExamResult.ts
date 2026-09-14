import mongoose, { Document, Schema } from 'mongoose';

export interface IExamResult extends Document {
  exam: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId; // Ref to StudentProfile
  subject: mongoose.Types.ObjectId; // Ref to Subject
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema: Schema = new Schema({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  marksObtained: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v: number) { return v >= 0; },
      message: 'Marks obtained cannot be negative'
    }
  },
  totalMarks: { type: Number, required: true, default: 100 },
  grade: { type: String },
  remarks: { type: String }
}, {
  timestamps: true
});

ExamResultSchema.pre('save', function(this: any) {
  if (this.marksObtained > this.totalMarks) {
    throw new Error('Marks obtained cannot exceed total marks');
  }
});

// A student can only have one result per exam-subject combination
ExamResultSchema.index({ exam: 1, student: 1, subject: 1 }, { unique: true });

export default mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
