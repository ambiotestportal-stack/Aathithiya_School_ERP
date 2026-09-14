import { Request, Response } from 'express';
import AttendanceModel from '../models/Attendance';
import StudentProfileModel from '../models/StudentProfile';

// Get attendance for a specific class on a specific date
export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId, date } = req.query;
    
    if (!classId || !date) {
      res.status(400).json({ message: 'classId and date are required query parameters.' });
      return;
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await AttendanceModel.findOne({
      enrolledClass: classId,
      date: { $gte: startOfDay, $lte: endOfDay }
    } as any).populate('records.student').populate({
      path: 'records.student',
      populate: { path: 'user', select: 'name' }
    });

    const students = await StudentProfileModel.find({ enrolledClass: classId, isDeleted: { $ne: true } } as any).populate('user', 'name');

    if (attendance) {
      res.json({ ...attendance.toJSON(), isNew: false, students });
    } else {
      // If no attendance found for that day, return the list of students in that class
      res.json({ isNew: true, students, records: [] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark or Update attendance
export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId, date, records, markedBy } = req.body;

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const existingAttendance = await AttendanceModel.findOne({
      enrolledClass: classId,
      date: normalizedDate
    });

    if (existingAttendance) {
      await AttendanceModel.findByIdAndUpdate(existingAttendance._id, {
        $set: { records, markedBy }
      });
      
      const io = req.app.get('io');
      if (io) io.emit('attendance_updated', { classId, date });

      res.json({ message: 'Attendance updated successfully' });
    } else {
      const newAttendance = new AttendanceModel({
        enrolledClass: classId,
        date: normalizedDate,
        records,
        markedBy
      });
      await newAttendance.save();

      const io = req.app.get('io');
      if (io) io.emit('attendance_updated', { classId, date });

      res.status(201).json({ message: 'Attendance marked successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    // Find all attendance documents where this student has a record
    const attendanceDocs = await AttendanceModel.find({
      'records.student': studentId
    }).sort({ date: -1 });
    
    const history = attendanceDocs.map(doc => {
      const record = doc.records.find(r => r.student.toString() === studentId);
      return {
        date: doc.date,
        status: record?.status || 'Unknown'
      };
    });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
