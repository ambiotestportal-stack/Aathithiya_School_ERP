import mongoose, { Document, Schema } from 'mongoose';

export interface ISchoolSettings extends Document {
  schoolName?: string;
  logoUrl?: string;
  estYear?: string;
  principalName?: string;
  affiliationNo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  showTimetableToStudents: boolean;
  showTimetableToStaff: boolean;
}

const SchoolSettingsSchema: Schema = new Schema({
  schoolName: { type: String, default: 'EduERP International Academy' },
  logoUrl: { type: String, default: '' },
  estYear: { type: String, default: '2005' },
  principalName: { type: String, default: 'Dr. Robert Oppenheimer' },
  affiliationNo: { type: String, default: 'CBSE/AFF/123456' },
  phone: { type: String, default: '+1 (555) 123-4567' },
  email: { type: String, default: 'admin@school.edu' },
  website: { type: String, default: 'www.school.edu' },
  address: { type: String, default: '123 Innovation Drive, Tech Park' },
  city: { type: String, default: 'Metropolis' },
  zipCode: { type: String, default: '10001' },
  showTimetableToStudents: { type: Boolean, default: true },
  showTimetableToStaff: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<ISchoolSettings>('SchoolSettings', SchoolSettingsSchema);
