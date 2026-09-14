import { Request, Response } from 'express';
import UserModel from '../models/User';
import StudentProfileModel from '../models/StudentProfile';
import StaffProfileModel from '../models/StaffProfile';
import { asyncHandler } from '../utils/asyncHandler';

export const getDeletedRecords = asyncHandler(async (req: Request, res: Response) => {
  const deletedStudents = await StudentProfileModel.find({ isDeleted: true })
    .populate('user', 'name username role')
    .lean();
    
  const deletedStaff = await StaffProfileModel.find({ isDeleted: true })
    .populate('user', 'name username role')
    .lean();

  const formattedStudents = deletedStudents.map((s: any) => ({
    id: s._id,
    userId: s.user?._id || s.user,
    name: s.user?.name || 'Unknown',
    username: s.user?.username || 'Unknown',
    role: 'STUDENT',
    deletedAt: s.deletedAt,
    identifier: s.admissionNumber || s.rollNumber
  }));

  const formattedStaff = deletedStaff.map((s: any) => ({
    id: s._id,
    userId: s.user?._id || s.user,
    name: s.user?.name || 'Unknown',
    username: s.user?.username || 'Unknown',
    role: s.user?.role || 'TEACHER',
    deletedAt: s.deletedAt,
    identifier: s.employeeId
  }));

  res.json([...formattedStudents, ...formattedStaff].sort((a, b) => 
    new Date(b.deletedAt || 0).getTime() - new Date(a.deletedAt || 0).getTime()
  ));
});

export const restoreRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, userId } = req.body;

  if (type === 'STUDENT') {
    await StudentProfileModel.findByIdAndUpdate(id, { $set: { isDeleted: false }, $unset: { deletedAt: "" } });
  } else {
    await StaffProfileModel.findByIdAndUpdate(id, { $set: { isDeleted: false }, $unset: { deletedAt: "" } });
  }

  if (userId) {
    await UserModel.findByIdAndUpdate(userId, { $set: { isDeleted: false }, $unset: { deletedAt: "" } });
  }

  res.json({ message: 'Record restored successfully' });
});

export const hardDeleteRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, userId } = req.query;

  if (type === 'STUDENT') {
    await StudentProfileModel.findByIdAndDelete(id);
  } else {
    await StaffProfileModel.findByIdAndDelete(id);
  }

  if (userId) {
    await UserModel.findByIdAndDelete(userId);
  }

  res.json({ message: 'Record permanently deleted' });
});
