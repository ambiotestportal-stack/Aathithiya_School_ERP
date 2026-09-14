import { Request, Response } from 'express';
import LeaveRequestModel from '../models/LeaveRequest';

export const getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, classIds } = req.query;
    let query: any = {};
    if (studentId) query.student = studentId;
    
    // If classIds are provided, we need to find all students in those classes first
    // For simplicity, we'll populate and then filter if classIds is passed, or better, we modify the DB schema.
    // Wait, since student is populated with enrolledClass, let's just fetch all and filter in JS if it's too complex, or use aggregate.
    // Given small scale, let's just fetch and populate.
    
    const requests = await LeaveRequestModel.find(query).populate({ path: "student", select: "name rollNumber enrolledClass" }).sort({ createdAt: -1 }).lean();
    // Post-filter for teacher's classes
    let finalRequests = requests;
    if (classIds) {
      const classesArray = (classIds as string).split(',');
      finalRequests = requests.filter((r: any) => classesArray.includes(r.student?.enrolledClass?.toString()));
    }
      
    res.json(finalRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isDateRangeValid } from '../utils/validation';

export const createLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, startDate, endDate, reason } = req.body;

    if (!student) {
      res.status(400).json({ message: 'Student ID is required' });
      return;
    }

    if (!startDate || !endDate || !isDateRangeValid(startDate, endDate)) {
      res.status(400).json({ message: 'Leave start date must be before or equal to end date' });
      return;
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      res.status(400).json({ message: 'Reason for leave is required' });
      return;
    }

    const newRequest = new LeaveRequestModel({
      student,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'Pending'
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewedBy } = req.body;
    
    const updated = await LeaveRequestModel.findByIdAndUpdate(
      id,
      { status, reviewedBy },
      { new: true }
    );
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
