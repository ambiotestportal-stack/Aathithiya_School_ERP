import { Request, Response } from 'express';
import HomeworkModel from '../models/Homework';

export const getHomework = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.query;
    let query: any = {};
    if (classId) query.enrolledClass = classId;
    
    const homework = await HomeworkModel.find(query).populate("enrolledClass", "name section").populate("subject", "name").populate("assignedBy", "name").sort({ createdAt: -1 }).lean();
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createHomework = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, enrolledClass, subject, dueDate, assignedBy } = req.body;

    const userId = (assignedBy && assignedBy !== '') ? assignedBy : (req as any).user?.id || (req as any).user?._id;

    if (!title || !title.trim()) {
      res.status(400).json({ message: 'Homework Title is required' });
      return;
    }

    if (!enrolledClass || enrolledClass === '') {
      res.status(400).json({ message: 'Class selection is required' });
      return;
    }

    const payload: any = {
      title: title.trim(),
      description: description || '',
      dueDate,
      enrolledClass,
      assignedBy: userId
    };

    if (subject && subject !== '') {
      payload.subject = subject;
    }

    const newHomework = new HomeworkModel(payload);
    await newHomework.save();
    const populated = await newHomework.populate([{ path: "enrolledClass", select: "name section" }, { path: "subject", select: "name" }, { path: "assignedBy", select: "name" }]);
    const io = req.app.get('io');
    if (io) io.emit('homework_created', populated);

    res.status(201).json(populated);
  } catch (error: any) {
    console.error('Error in createHomework:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteHomework = async (req: Request, res: Response): Promise<void> => {
  try {
    await HomeworkModel.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('homework_deleted', req.params.id);

    res.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
