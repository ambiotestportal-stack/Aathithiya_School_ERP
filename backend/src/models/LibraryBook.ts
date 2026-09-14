import mongoose, { Document, Schema } from 'mongoose';

export interface ILibraryBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryBookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 }
}, {
  timestamps: true
});

export default mongoose.model<ILibraryBook>('LibraryBook', LibraryBookSchema);
