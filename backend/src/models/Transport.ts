import mongoose, { Document, Schema } from 'mongoose';

export interface ITransport extends Document {
  busNumber?: string; // Bus No (e.g. 33, 44)
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  route: string;
  capacity: number;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TransportSchema: Schema = new Schema({
  busNumber: { type: String },
  vehicleNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  driverContact: { type: String, required: true },
  route: { type: String, required: true },
  capacity: { type: Number, required: true, default: 40 },
  students: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }]
}, {
  timestamps: true
});

export default mongoose.model<ITransport>('Transport', TransportSchema);
