import { Request, Response } from 'express';
import ExamModel from '../models/Exam';
import ExamResultModel from '../models/ExamResult';
import StudentProfileModel from '../models/StudentProfile';

export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const exams = await ExamModel.find()
      .populate('enrolledClasses', 'name section')
      .populate('schedule.subject', 'name code')
      .sort({ startDate: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isDateRangeValid, isNonNegativeNumber, isPositiveNumber } from '../utils/validation';

export const createExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Exam name is required' });
      return;
    }

    if (!startDate || !endDate || !isDateRangeValid(startDate, endDate)) {
      res.status(400).json({ message: 'Start date must be before or equal to end date' });
      return;
    }

    const newExam = new ExamModel(req.body);
    await newExam.save();
    const populated = await newExam.populate([
      { path: 'enrolledClasses', select: 'name section' },
      { path: 'schedule.subject', select: 'name code' }
    ]);
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      res.status(400).json({ message: 'Exam name is required' });
      return;
    }

    if (startDate && endDate && !isDateRangeValid(startDate, endDate)) {
      res.status(400).json({ message: 'Start date must be before or equal to end date' });
      return;
    }

    const { status, enrolledClasses, schedule } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (status !== undefined) updateData.status = status;
    if (enrolledClasses !== undefined) updateData.enrolledClasses = enrolledClasses;
    if (schedule !== undefined) updateData.schedule = schedule;
    
    const updated = await ExamModel.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('enrolledClasses', 'name section')
      .populate('schedule.subject', 'name code');
    if (!updated) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteExam = async (req: Request, res: Response): Promise<void> => {
  try {
    await ExamModel.findByIdAndDelete(req.params.id);
    await ExamResultModel.deleteMany({ exam: req.params.id });
    res.json({ message: 'Exam and related results deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId, classId, subjectId } = req.query;
    
    // First, find all students in this class
    const students = await StudentProfileModel.find({ enrolledClass: classId } as any)
      .populate('user', 'name')
      .sort({ rollNumber: 1 });
    
    const studentIds = students.map(s => s._id);
    const query: any = {
      exam: examId,
      student: { $in: studentIds }
    };
    if (subjectId) {
      query.subject = subjectId;
    }

    const results = await ExamResultModel.find(query);

    res.json({ students, results });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const saveExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId, subjectId, records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ message: 'No records provided' });
      return;
    }

    const ops = records.map((record: any) => {
      const targetSubject = record.subject || subjectId;
      
      if (record.marksObtained === null || record.marksObtained === '') {
        return {
          deleteOne: {
            filter: { exam: examId, subject: targetSubject, student: record.student }
          }
        };
      }

      return {
        updateOne: {
          filter: { exam: examId, subject: targetSubject, student: record.student },
          update: { 
            $set: { 
              ...record, 
              marksObtained: Number(record.marksObtained),
              totalMarks: Number(record.totalMarks) || 100,
              exam: examId, 
              subject: targetSubject 
            } 
          },
          upsert: true
        }
      };
    });

    if (ops.length > 0) {
      await ExamResultModel.bulkWrite(ops);
    }
    
    res.json({ message: 'Results saved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentResults = async (req: any, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    // M13: Role-based access check — students can only view their own results
    if (req.user?.role === 'STUDENT') {
      const myProfile = await StudentProfileModel.findOne({ user: req.user.id });
      if (!myProfile || myProfile._id.toString() !== studentId) {
        res.status(403).json({ message: 'You can only view your own results' });
        return;
      }
    }
    
    const results = await ExamResultModel.find({ student: studentId })
      .populate('exam', 'name startDate endDate status')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });
      
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
