import { Request, Response } from 'express';
import UserModel, { UserRole } from '../models/User';
import FeeRecordModel from '../models/FeeRecord';
import AttendanceModel from '../models/Attendance';
import StudentProfileModel from '../models/StudentProfile';
import StaffProfileModel from '../models/StaffProfile';

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await StudentProfileModel.countDocuments({ isDeleted: { $ne: true } });
    const totalTeachers = await StaffProfileModel.countDocuments({ isDeleted: { $ne: true } });
    const totalParents = await UserModel.countDocuments({ role: UserRole.PARENT, isDeleted: { $ne: true } });
    
    // Calculate real revenue from all paid amounts
    const allFees = await FeeRecordModel.find().lean();
    const revenue = allFees.reduce((sum, fee: any) => {
      const paid = fee.paidAmount !== undefined ? Number(fee.paidAmount) : (fee.status === 'Paid' ? Number(fee.amount) : 0);
      return sum + (paid || 0);
    }, 0);

    // Revenue Data for Chart (Current Year)
    const currentYear = new Date().getFullYear();
    const feeRecordsThisYear = await FeeRecordModel.find({
      dueDate: { 
        $gte: new Date(currentYear, 0, 1), 
        $lt: new Date(currentYear + 1, 0, 1) 
      }
    }).lean();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = months.map(month => ({ label: month, value: 0, secondaryValue: 0, color: 'bg-emerald-500' }));
    
    feeRecordsThisYear.forEach((record: any) => {
      if (record.dueDate) {
        const monthIndex = new Date(record.dueDate).getMonth();
        const paid = record.paidAmount !== undefined ? Number(record.paidAmount) : (record.status === 'Paid' ? Number(record.amount) : 0);
        const pending = record.balanceAmount !== undefined ? Number(record.balanceAmount) : (record.status !== 'Paid' ? Number(record.amount) : 0);
        revenueData[monthIndex].value += (paid || 0);
        revenueData[monthIndex].secondaryValue += (pending || 0);
      }
    });

    // Trim to current month + 1 to avoid empty future months, or just send all 12. Let's send all 12.

    // Attendance Donut
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendances = await AttendanceModel.find({
      date: { $gte: today, $lt: tomorrow }
    }).lean();

    let present = 0;
    let absent = 0;
    let onLeave = 0;

    attendances.forEach(att => {
      att.records.forEach(r => {
        if (r.status === 'Present' || r.status === 'Half-Day') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'OD') onLeave++;
      });
    });

    const attendanceDonut = [
      { label: 'Present Students', value: present, color: '#10b981' },
      { label: 'Absent Students', value: absent, color: '#ef4444' },
      { label: 'On Leave', value: onLeave, color: '#f59e0b' },
    ];

    // Enrollment Trend (last 6 years)
    const studentProfiles = await StudentProfileModel.find({}, 'createdAt').lean();
    const enrollmentTrendMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      enrollmentTrendMap[(currentYear - i).toString()] = 0;
    }
    
    studentProfiles.forEach(s => {
      const year = s.createdAt.getFullYear().toString();
      if (enrollmentTrendMap[year] !== undefined) {
        enrollmentTrendMap[year]++;
      }
    });

    const enrollmentTrend = Object.keys(enrollmentTrendMap).map(year => ({
      label: year,
      value: enrollmentTrendMap[year]
    }));

    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      revenue,
      revenueData,
      attendanceDonut,
      enrollmentTrend
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
