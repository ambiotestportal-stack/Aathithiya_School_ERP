import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyMaterial extends Document {
  title: string;
  description?: string;
  enrolledClass: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  fileUrl: string;
  fileType: 'pdf' | 'word' | 'video' | 'other';
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudyMaterialSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  enrolledClass: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'word', 'video', 'other'], default: 'pdf' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export default mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);
