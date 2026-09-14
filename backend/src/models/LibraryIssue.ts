import mongoose, { Document, Schema } from 'mongoose';

export interface ILibraryIssue extends Document {
  book: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'Issued' | 'Returned' | 'Overdue';
  createdAt: Date;
  updatedAt: Date;
}

const LibraryIssueSchema: Schema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'LibraryBook', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' }
}, {
  timestamps: true
});

LibraryIssueSchema.index({ student: 1, status: 1 });
LibraryIssueSchema.index({ book: 1 });

export default mongoose.model<ILibraryIssue>('LibraryIssue', LibraryIssueSchema);
