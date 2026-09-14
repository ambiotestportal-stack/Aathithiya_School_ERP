import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'TERM';
  applicableRoles: string[];
}

const CalendarEventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['HOLIDAY', 'EXAM', 'EVENT', 'TERM'],
    required: true,
    default: 'EVENT'
  },
  applicableRoles: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
