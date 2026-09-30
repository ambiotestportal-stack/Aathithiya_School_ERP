import mongoose, { Document, Schema } from 'mongoose';

export interface ICircular extends Document {
  title: string;
  publishDate: string;
  description: string;
  targetAudience: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CircularSchema: Schema = new Schema({
  title: { type: String, required: true },
  publishDate: { type: String, required: true },
  description: { type: String, required: true },
  targetAudience: { type: String, enum: ['staff', 'student', 'parent', 'all'], default: 'all' },
  fileUrl: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<ICircular>('Circular', CircularSchema);
