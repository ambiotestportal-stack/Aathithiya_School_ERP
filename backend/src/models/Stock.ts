import mongoose, { Document, Schema } from 'mongoose';

export interface IStock extends Document {
  itemCode: string;
  name: string;
  category: string;
  quantity: number;
  issuedQuantity: number;
  unit: string;
  unitPrice: number;
  description?: string;
  vendor?: string;
  issueHistory: Array<{
    action?: string;
    personName: string;
    quantity: number;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema({
  itemCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  issuedQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'Pcs' },
  unitPrice: { type: Number, required: true, default: 0 },
  description: { type: String },
  vendor: { type: String },
  issueHistory: [{
    action: { type: String, enum: ['issue', 'return'], default: 'issue' },
    personName: { type: String, required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IStock>('Stock', StockSchema);
