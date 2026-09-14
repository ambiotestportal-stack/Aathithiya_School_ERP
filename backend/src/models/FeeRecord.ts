import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentTransaction {
  receiptNumber: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Online';
  transactionId?: string;           // UPI UTR / Card Auth / Ref ID
  cashReceived?: number;
  cashChange?: number;
  remainingDueDate?: Date;
  remarks?: string;
  recordedBy?: mongoose.Types.ObjectId;
}

export interface IFeeRecord extends Document {
  student: mongoose.Types.ObjectId; // Ref to StudentProfile
  feeName: string;                  // e.g. "Term Fees 1", "Term Fees 2", "Annual Fee"
  amount: number;                   // Total fee amount
  paidAmount: number;               // Total paid so far
  balanceAmount: number;            // Remaining balance
  dueDate: Date;                    // Initial due date
  remainingDueDate?: Date;          // Due date for remaining fee when partially paid
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  paymentMethod?: string;
  paymentDate?: Date;
  transactionId?: string;
  remarks?: string;
  payments: IPaymentTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema({
  receiptNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Online'], default: 'Cash' },
  transactionId: { type: String },
  cashReceived: { type: Number },
  cashChange: { type: Number },
  remainingDueDate: { type: Date },
  remarks: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: true, timestamps: true });

const FeeRecordSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  feeName: { type: String, default: 'Tuition Fee' },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number },
  dueDate: { type: Date, required: true },
  remainingDueDate: { type: Date },
  status: { type: String, enum: ['Paid', 'Partial', 'Pending', 'Overdue'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Online'] },
  paymentDate: { type: Date },
  transactionId: { type: String },
  remarks: { type: String },
  payments: [PaymentTransactionSchema]
}, {
  timestamps: true
});

// Auto-calculate balance before save
FeeRecordSchema.pre<IFeeRecord>('save', function() {
  if (this.amount !== undefined && this.paidAmount !== undefined) {
    this.balanceAmount = Math.max(0, this.amount - this.paidAmount);
    if (this.paidAmount >= this.amount) {
      this.status = 'Paid';
    } else if (this.paidAmount > 0) {
      this.status = 'Partial';
    } else {
      if (this.dueDate && new Date(this.dueDate) < new Date() && this.status !== 'Paid') {
        this.status = 'Overdue';
      } else {
        this.status = 'Pending';
      }
    }
  }
});

FeeRecordSchema.index({ student: 1 });
FeeRecordSchema.index({ student: 1, status: 1 });

export default mongoose.model<IFeeRecord>('FeeRecord', FeeRecordSchema);

