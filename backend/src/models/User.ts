import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import './Role';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export interface IUser extends Document {
  username: string;
  password?: string;
  role: UserRole;
  customRole?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    required: true 
  },
  customRole: { type: Schema.Types.ObjectId, ref: 'Role' },
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true, sparse: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any;
  if (update?.password) {
    const bcrypt = require('bcryptjs');
    update.password = await bcrypt.hash(update.password, 10);
  }
  if (update?.$set?.password) {
    const bcrypt = require('bcryptjs');
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
