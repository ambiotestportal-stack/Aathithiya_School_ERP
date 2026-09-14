import mongoose, { Document, Schema } from 'mongoose';

export interface IPeriodStructure {
  periodNumber: number;
  startTime: string;
  endTime: string;
  type?: 'academic' | 'break' | 'lunch' | 'breakfast';
  label?: string;
}

export interface IClass extends Document {
  name: string;      // e.g., "Grade 10"
  section: string;   // e.g., "A"
  capacity: number;
  classTeacher?: mongoose.Types.ObjectId; // Ref to User (Teacher)
  batch?: mongoose.Types.ObjectId; // Ref to Batch
  periodStructures?: IPeriodStructure[]; // Per-class timetable structure
  createdAt: Date;
  updatedAt: Date;
}

const PeriodStructureSchema: Schema = new Schema({
  periodNumber: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { type: String, enum: ['academic', 'break', 'lunch', 'breakfast'], default: 'academic' },
  label: { type: String, default: '' }
}, { _id: false });

const ClassSchema: Schema = new Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  capacity: { type: Number, default: 30 },
  classTeacher: { type: Schema.Types.ObjectId, ref: 'User' },
  batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
  periodStructures: { type: [PeriodStructureSchema], default: [] }
}, {
  timestamps: true
});

// Ensure a class with the same name and section doesn't exist twice
ClassSchema.index({ name: 1, section: 1, batch: 1 }, { unique: true });

export default mongoose.model<IClass>('Class', ClassSchema);

