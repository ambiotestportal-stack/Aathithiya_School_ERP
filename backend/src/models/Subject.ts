import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;      // e.g., "Mathematics"
  code: string;      // e.g., "MATH101"
  type: 'Theory' | 'Practical';
  assignedClass?: mongoose.Types.ObjectId; // Ref to Class (optional)
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Theory', 'Practical'], default: 'Theory' },
  assignedClass: { type: Schema.Types.ObjectId, ref: 'Class', required: false }
}, {
  timestamps: true
});

export default mongoose.model<ISubject>('Subject', SubjectSchema);
