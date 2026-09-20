import mongoose, { Document, Schema } from 'mongoose';

export interface ITransportLog extends Document {
  transport: mongoose.Types.ObjectId;
  busNumber?: string;
  vehicleNumber: string;
  route: string;
  eventType: 'REACHED_SCHOOL' | 'STARTED_FROM_SCHOOL';
  timestamp: Date;
  triggeredBy: mongoose.Types.ObjectId;
  studentsNotifiedCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransportLogSchema: Schema = new Schema({
  transport: { type: Schema.Types.ObjectId, ref: 'Transport', required: true },
  busNumber: { type: String },
  vehicleNumber: { type: String, required: true },
  route: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ['REACHED_SCHOOL', 'STARTED_FROM_SCHOOL'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentsNotifiedCount: { type: Number, default: 0 },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<ITransportLog>('TransportLog', TransportLogSchema);
