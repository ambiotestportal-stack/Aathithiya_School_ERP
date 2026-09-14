import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  name: string; // e.g., "Batch 2026", "2024-2025"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IBatch>('Batch', BatchSchema);
